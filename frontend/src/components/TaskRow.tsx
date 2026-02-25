import { useState } from "react";

import { cancelTask, deleteTask, runTask } from "../api/taskApi";
import { type Task } from "../models/task";
import DeleteTaskDialog from "./DeleteTaskDialog";
import StatusBadge from "./StatusBadge";
import TaskLogs from "./TaskLogs";
import { useToast } from "./ui/useToast";

export default function TaskRow({ task }: { task: Task }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [acting, setActing] = useState<"run" | "cancel" | null>(null);
  const { toast } = useToast();
  const priorityLabel = task.priority === 1 ? "High" : task.priority === 2 ? "Medium" : "Low";

  async function cancel() {
    try {
      setActing("cancel");
      await cancelTask(task.id);
      toast({
        title: "Task cancelled",
        description: `"${task.name}" was cancelled.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Cancel failed",
        description: "Could not cancel this task.",
        variant: "destructive",
      });
    } finally {
      setActing(null);
    }
  }

  async function run() {
    try {
      setActing("run");
      await runTask(task.id);
      toast({
        title: "Task queued",
        description: `"${task.name}" was sent to queue.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Run failed",
        description: "Could not queue this task.",
        variant: "destructive",
      });
    } finally {
      setActing(null);
    }
  }

  async function confirmDelete() {
    try {
      setDeleting(true);
      await deleteTask(task.id);
      toast({
        title: "Task deleted",
        description: `"${task.name}" was removed.`,
        variant: "success",
      });
    } catch {
      toast({
        title: "Delete failed",
        description: "Could not delete this task.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  }

  return (
    <article className="panel">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{task.name}</h3>
          <p className="mt-1 text-sm text-slate-600">
            Priority: <span className="font-medium">{priorityLabel}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={task.status} queued={task.queued} />

          {task.status === "pending" && !task.queued && (
            <button
              onClick={run}
              disabled={acting !== null || deleting}
              className="btn-primary !rounded-lg !px-3 !py-1.5 !text-sm"
            >
              {acting === "run" ? "Queueing..." : "Run"}
            </button>
          )}

          {task.status === "running" && (
            <button
              onClick={cancel}
              disabled={acting !== null || deleting}
              className="btn-danger !rounded-lg !px-3 !py-1.5 !text-sm"
            >
              {acting === "cancel" ? "Cancelling..." : "Cancel"}
            </button>
          )}

          <button
            onClick={() => setDeleteDialogOpen(true)}
            disabled={deleting || acting !== null}
            className="btn-secondary !rounded-lg !px-3 !py-1.5 !text-sm"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>

      {task.status === "running" && (
        <div className="mt-4 h-2 w-full rounded-full bg-slate-200">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all"
            style={{ width: `${task.progress || 0}%` }}
          />
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-3 text-xs font-medium uppercase tracking-[0.12em] text-slate-500"
      >
        {expanded ? "Hide Logs" : "Show Logs"}
      </button>

      {expanded && <TaskLogs logs={task.logs} />}

      <DeleteTaskDialog
        open={deleteDialogOpen}
        taskName={task.name}
        loading={deleting}
        onCancel={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
      />
    </article>
  );
}
