import { type TaskLog } from "../models/task";

export default function TaskLogs({ logs }: { logs: TaskLog[] }) {
  return (
    <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs">
      {logs.map((log, index) => (
        <div
          key={`${log.timestamp}-${index}`}
          className="mb-1 border-b border-slate-200 pb-1 last:mb-0 last:border-b-0 last:pb-0"
        >
          <span className="font-medium text-slate-600">
            {new Date(log.timestamp).toLocaleTimeString()}
          </span>
          <span className="mx-1 text-slate-400">-</span>
          <span className="text-slate-700">{log.message}</span>
        </div>
      ))}
    </div>
  );
}
