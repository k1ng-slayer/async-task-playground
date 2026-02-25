import { Router } from "express";

import {
  createTask,
  getAllTasks,
  getTaskById,
  runTask,
  cancelTask,
  deleteTask,
} from "../services/task.service";
import { isValidTaskPayload, hasValidTaskId } from "../validation/validation";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const validation = isValidTaskPayload(req.body);
    if (!validation.valid)
      return res.status(400).json({ error: validation.error });

    const { name, duration, shouldFail, priority } = req.body;
    const task = await createTask(name.trim(), duration, shouldFail, priority);

    return res.status(201).json(task);
  } catch (err) {
    if (err instanceof Error && err.message === "ACTIVE_TASK_LIMIT_REACHED") {
      return res.status(429).json({
        error:
          "Active task limit reached. Please wait for running or queued tasks to finish.",
      });
    }

    return res.status(500).json({ error: "Failed to create task." });
  }
});

router.get("/", async (_req, res) => {
  try {
    const tasks = await getAllTasks();
    return res.json(tasks);
  } catch {
    return res.status(500).json({ error: "Failed to retrieve tasks" });
  }
});

router.get("/:id", async (req, res) => {
  if (!hasValidTaskId(req.params.id))
    return res.status(400).json({ error: "Invalid task id." });

  try {
    const task = await getTaskById(req.params.id);
    if (!task) return res.sendStatus(404);

    return res.json(task);
  } catch {
    return res.status(500).json({ error: "Failed to retrieve task" });
  }
});

router.post("/:id/run", async (req, res) => {
  if (!hasValidTaskId(req.params.id))
    return res.status(400).json({ error: "Invalid task id." });

  try {
    await runTask(req.params.id);
    return res.sendStatus(202);
  } catch {
    return res.sendStatus(404);
  }
});

router.post("/:id/cancel", async (req, res) => {
  if (!hasValidTaskId(req.params.id)) {
    return res.status(400).json({ error: "Invalid task id." });
  }

  try {
    await cancelTask(req.params.id);
    return res.sendStatus(200);
  } catch {
    return res.sendStatus(404);
  }
});

router.delete("/:id", async (req, res) => {
  if (!hasValidTaskId(req.params.id)) {
    return res.status(400).json({ error: "Invalid task id." });
  }

  try {
    const deleted = await deleteTask(req.params.id);
    if (!deleted) return res.sendStatus(404);

    return res.sendStatus(204);
  } catch {
    return res.status(500).json({ error: "Failed to delete task" });
  }
});

export default router;
