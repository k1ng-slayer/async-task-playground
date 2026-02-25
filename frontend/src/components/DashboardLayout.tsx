interface Props {
  children: React.ReactNode;
  onCreateClick: () => void;
}

export default function DashboardLayout({ children, onCreateClick }: Props) {
  return (
    <div className="min-h-screen px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="panel mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900">
              Async Task Playground
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Observe queue behavior, retries, cancellation, and live task
              progress.
            </p>
          </div>

          <button onClick={onCreateClick} className="btn-primary">
            Create Task
          </button>
        </header>

        {children}
      </div>
    </div>
  );
}
