import useBodyScrollLock from "../utils/useBodyScrollLock";

interface Props {
  open: boolean;
  taskName: string;
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteTaskDialog({
  open,
  taskName,
  loading,
  onCancel,
  onConfirm,
}: Props) {
  useBodyScrollLock(open);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="panel w-full max-w-md">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">
          Delete Task
        </h2>
        <p className="mt-2 text-md text-slate-600">
          Delete{" "}
          <span className="font-semibold text-slate-900">{taskName}</span>?
        </p>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="btn-danger"
          >
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
