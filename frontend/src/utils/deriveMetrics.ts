import { type Task } from "../models/task";

export function deriveMetrics(tasks: Task[]) {
  const completed = tasks.filter((t) => t.status === "completed");
  const failed = tasks.filter((t) => t.status === "failed");
  const cancelled = tasks.filter((t) => t.status === "cancelled");
  const running = tasks.filter((t) => t.status === "running");
  const pending = tasks.filter((t) => t.status === "pending");

  const totalExecutionTime = completed.reduce((acc, task) => {
    if (task.startedAt && task.finishedAt) {
      return acc + (task.finishedAt - task.startedAt);
    }
    return acc;
  }, 0);

  const averageExecutionTime =
    completed.length > 0 ? totalExecutionTime / completed.length : 0;

  return {
    totalTasks: tasks.length,
    runningTasks: running.length,
    queuedTasks: pending.filter((t) => t.queued).length,
    completedTasks: completed.length,
    failedTasks: failed.length,
    cancelledTasks: cancelled.length,
    retryingTasks: tasks.filter(
      (t) => t.retryCount > 0 && t.status !== "completed",
    ).length,
    averageExecutionTime,
  };
}
