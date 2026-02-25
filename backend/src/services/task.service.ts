import { v4 as uuid } from "uuid";

import { io } from "../index";
import { redis } from "../redis";
import { Task } from "../models/task.model";
import {
  MAX_CONCURRENT,
  MAX_ACTIVE_TASKS,
  QUEUE_KEY,
  TASK_CLEANUP_INTERVAL_MS,
  TASK_RETENTION_HOURS,
} from "../config/config";

let runningCount: number = 0;

const timeouts = new Map<string, NodeJS.Timeout>();
const progressIntervals = new Map<string, NodeJS.Timeout>();
const retryTimeouts = new Map<string, NodeJS.Timeout>();
let cleanupInterval: NodeJS.Timeout | null = null;

async function saveTask(task: Task) {
  await redis.set(`task:${task.id}`, JSON.stringify(task));
}

async function getTask(id: string): Promise<Task | null> {
  const data = await redis.get(`task:${id}`);
  if (!data) return null;
  const parsed = JSON.parse(data) as Task;
  return {
    ...parsed,
    queued: Boolean(parsed.queued),
  };
}

function emitUpdate(task: Task) {
  io.emit("task:update", {
    ...task,
    progress: calculateProgress(task),
  });
}

function emitDelete(id: string) {
  io.emit("task:delete", { id });
}

function isActiveTask(task: Task): boolean {
  return task.status === "pending" || task.status === "running";
}

function isTerminalTask(task: Task): boolean {
  return (
    task.status === "completed" ||
    task.status === "failed" ||
    task.status === "cancelled"
  );
}

async function processQueue() {
  while (runningCount < MAX_CONCURRENT) {
    const result = await redis.zPopMin(QUEUE_KEY);
    if (!result) return;

    const nextTaskId = result.value;
    if (!nextTaskId) return;

    const task = await getTask(nextTaskId);
    if (!task) continue;

    task.queued = false;
    await startExecution(task);
  }
}

export async function resumeQueueProcessing() {
  await processQueue();
}

function clearTaskRuntime(id: string, wasRunning: boolean) {
  if (wasRunning) {
    const timeout = timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeouts.delete(id);
    }

    const interval = progressIntervals.get(id);
    if (interval) {
      clearInterval(interval);
      progressIntervals.delete(id);
    }

    runningCount = Math.max(0, runningCount - 1);
  }

  const retryTimeout = retryTimeouts.get(id);
  if (retryTimeout) {
    clearTimeout(retryTimeout);
    retryTimeouts.delete(id);
  }
}

async function removeTaskCompletely(
  id: string,
  task?: Task,
  triggerQueue = true,
): Promise<boolean> {
  const targetTask = task ?? (await getTask(id));
  if (!targetTask) return false;

  clearTaskRuntime(id, targetTask.status === "running");

  await redis.zRem(QUEUE_KEY, id);
  await redis.sRem("tasks:all", id);
  await redis.del(`task:${id}`);

  emitDelete(id);

  if (triggerQueue) {
    await processQueue();
  }

  return true;
}

async function startExecution(task: Task) {
  task.queued = false;
  task.status = "running";
  task.startedAt = Date.now();
  await saveTask(task);

  runningCount++;

  await addLog(task, "Task started execution");

  const interval = setInterval(() => {
    if (task.status === "running") {
      emitUpdate(task);
    }
  }, 500);

  progressIntervals.set(task.id, interval);

  const timeout = setTimeout(async () => {
    clearInterval(interval);
    progressIntervals.delete(task.id);

    runningCount--;
    timeouts.delete(task.id);

    if (task.shouldFail) {
      if (task.retryCount < task.maxRetries) {
        task.retryCount++;
        task.status = "pending";

        await addLog(task, `Retry attempt ${task.retryCount}`);

        const delay = Math.pow(2, task.retryCount) * 1000;

        const retryTimeout = setTimeout(async () => {
          retryTimeouts.delete(task.id);
          task.queued = true;
          await saveTask(task);

          await redis.zAdd(QUEUE_KEY, {
            score: task.priority,
            value: task.id,
          });

          await addLog(task, "Requeued after retry delay");
          await processQueue();
        }, delay);

        retryTimeouts.set(task.id, retryTimeout);

        return;
      } else {
        task.status = "failed";
        task.errorMessage = "Task failed after retries";
        task.finishedAt = Date.now();

        await addLog(task, "Task failed after maximum retries");
      }
    } else {
      task.status = "completed";
      task.finishedAt = Date.now();

      await addLog(task, "Task completed successfully");
    }

    await processQueue();
  }, task.duration * 1000);

  timeouts.set(task.id, timeout);
}

async function addLog(task: Task, message: string) {
  task.logs.push({
    timestamp: Date.now(),
    message,
  });

  await saveTask(task);
  emitUpdate(task);
}

function calculateProgress(task: Task): number {
  if (
    task.status === "completed" ||
    task.status === "failed" ||
    task.status === "cancelled"
  ) {
    return 100;
  }

  if (task.status === "running" && task.startedAt) {
    const elapsed = Date.now() - task.startedAt;
    const total = task.duration * 1000;
    return Math.min(100, Math.floor((elapsed / total) * 100));
  }

  return 0;
}

export async function getAllTasks(): Promise<Task[]> {
  const ids = await redis.sMembers("tasks:all");
  const tasks = await Promise.all(ids.map((id) => getTask(id)));
  return tasks.filter(Boolean) as Task[];
}

export async function recoverRunningTasks() {
  const allTasks = await getAllTasks();
  for (const task of allTasks) {
    if (task.status === "running") {
      task.status = "pending";
      task.queued = true;
      await saveTask(task);
      await redis.zAdd(QUEUE_KEY, {
        score: task.priority,
        value: task.id,
      });
    }
  }
}

export async function createTask(
  name: string,
  duration: number,
  shouldFail: boolean,
  priority?: number,
): Promise<Task> {
  const allTasks = await getAllTasks();
  const activeTaskCount = allTasks.filter(isActiveTask).length;

  if (activeTaskCount >= MAX_ACTIVE_TASKS) {
    throw new Error("ACTIVE_TASK_LIMIT_REACHED");
  }

  const task: Task = {
    id: uuid(),
    name,
    createdAt: Date.now(),
    duration,
    shouldFail,
    priority: priority ?? 2,
    queued: false,
    status: "pending",
    retryCount: 0,
    maxRetries: 3,
    logs: [
      {
        timestamp: Date.now(),
        message: "Task created",
      },
    ],
  };

  await redis.set(`task:${task.id}`, JSON.stringify(task));
  await redis.sAdd("tasks:all", task.id);
  emitUpdate(task);

  return task;
}

export async function getTaskById(id: string): Promise<Task | null> {
  return await getTask(id);
}

export async function runTask(id: string) {
  const task = await getTask(id);

  if (!task) throw new Error("Task not found");
  if (task.status !== "pending" || task.queued) return;

  const queueScore = await redis.zScore(QUEUE_KEY, id);
  if (queueScore !== null) {
    task.queued = true;
    await saveTask(task);
    emitUpdate(task);
    return;
  }

  task.queued = true;

  await addLog(
    task,
    `Task added to Redis queue with priority ${task.priority}`,
  );

  await redis.zAdd(QUEUE_KEY, {
    score: task.priority,
    value: id,
  });
  await processQueue();
}

export async function cancelTask(id: string) {
  const task = await getTask(id);
  if (!task) return;

  clearTaskRuntime(id, task.status === "running");

  await redis.zRem(QUEUE_KEY, id);

  task.queued = false;
  task.status = "cancelled";
  task.finishedAt = Date.now();

  await addLog(task, "Task cancelled");

  await processQueue();
}

export async function deleteTask(id: string): Promise<boolean> {
  return removeTaskCompletely(id, undefined, true);
}

async function cleanupExpiredTasks() {
  const retentionMs = TASK_RETENTION_HOURS * 60 * 60 * 1000;
  const now = Date.now();
  const allTasks = await getAllTasks();

  for (const task of allTasks) {
    if (!isTerminalTask(task)) continue;

    const terminalTimestamp = task.finishedAt ?? task.createdAt;
    if (now - terminalTimestamp < retentionMs) continue;

    await removeTaskCompletely(task.id, task, false);
  }
}

export function startTaskCleanupJob() {
  if (cleanupInterval) return;

  cleanupInterval = setInterval(() => {
    void cleanupExpiredTasks();
  }, TASK_CLEANUP_INTERVAL_MS);

  void cleanupExpiredTasks();
}

