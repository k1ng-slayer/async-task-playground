import type { Metric } from "../models/metrics";

export default function MetricsPanel({ metrics }: { metrics: Metric }) {
  const cards: Array<{ label: string; value: string | number; tone: string }> =
    [
      {
        label: "Total Tasks",
        value: metrics.totalTasks,
        tone: "text-slate-900",
      },
      { label: "Running", value: metrics.runningTasks, tone: "text-cyan-700" },
      { label: "Queued", value: metrics.queuedTasks, tone: "text-amber-700" },
      {
        label: "Completed",
        value: metrics.completedTasks,
        tone: "text-emerald-700",
      },
      { label: "Failed", value: metrics.failedTasks, tone: "text-rose-700" },
      {
        label: "Cancelled",
        value: metrics.cancelledTasks,
        tone: "text-slate-600",
      },
      {
        label: "Retrying",
        value: metrics.retryingTasks,
        tone: "text-orange-700",
      },
      {
        label: "Avg Time",
        value: `${(metrics.averageExecutionTime / 1000).toFixed(1)}s`,
        tone: "text-sky-800",
      },
    ];

  const Card = ({
    label,
    value,
    tone,
  }: {
    label: string;
    value: string | number;
    tone: string;
  }) => (
    <div className="panel p-4">
      <p className="text-xs uppercase tracking-[0.15em] text-slate-500">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${tone}`}>{value}</p>
    </div>
  );

  return (
    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <Card
          key={card.label}
          label={card.label}
          value={card.value}
          tone={card.tone}
        />
      ))}
    </div>
  );
}
