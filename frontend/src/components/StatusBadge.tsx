import { type TaskStatus } from "../models/task";

export default function StatusBadge({
  status,
  queued,
}: {
  status?: TaskStatus;
  queued?: boolean;
}) {
  if (!status) return null;

  if (status === "pending" && queued) {
    return (
      <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-medium text-amber-800">
        QUEUED
      </span>
    );
  }

  const colors: Record<TaskStatus, string> = {
    pending: "bg-slate-100 text-slate-700",
    running: "bg-cyan-100 text-cyan-800",
    completed: "bg-emerald-100 text-emerald-800",
    failed: "bg-rose-100 text-rose-800",
    cancelled: "bg-slate-200 text-slate-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-medium ${colors[status]}`}
    >
      {status.toUpperCase()}
    </span>
  );
}
