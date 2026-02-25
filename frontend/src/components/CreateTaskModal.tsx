import { useEffect, useState } from "react";
import { AxiosError } from "axios";

import type { Task } from "../models/task";
import { createTask } from "../api/taskApi";
import useBodyScrollLock from "../utils/useBodyScrollLock";
import SelectField from "./SelectField";
import { useToast } from "./ui/useToast";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: (task: Task) => void;
}

export default function CreateTaskModal({ open, onClose, onCreated }: Props) {
  const MAX_DURATION_SECONDS = 600;

  const [name, setName] = useState("");
  const [durationInput, setDurationInput] = useState("");
  const [shouldFail, setShouldFail] = useState(false);
  const [priority, setPriority] = useState(2);
  const [loading, setLoading] = useState(false);
  const [durationError, setDurationError] = useState("");
  const [nameError, setNameError] = useState("");
  const { toast } = useToast();

  useBodyScrollLock(open);

  function resetForm() {
    setName("");
    setDurationInput("");
    setNameError("");
    setDurationError("");
    setShouldFail(false);
    setPriority(2);
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  if (!open) return null;

  const priorityOptions = [
    { value: 1, label: "High" },
    { value: 2, label: "Medium" },
    { value: 3, label: "Low" },
  ];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError("Task name is required.");
      return;
    }
    if (trimmedName.length > 15) {
      setNameError("Task name must be 15 characters or less.");
      return;
    }

    const duration = Number.parseInt(durationInput, 10);
    if (Number.isNaN(duration) || duration < 1) {
      setDurationError("Duration must be at least 1 second.");
      return;
    }
    if (duration > MAX_DURATION_SECONDS) {
      setDurationError("Duration cannot exceed 10 minutes (600 seconds).");
      return;
    }

    setLoading(true);

    try {
      const res = await createTask(trimmedName, duration, shouldFail, priority);

      onCreated(res);
      toast({
        title: "Task created",
        description: `"${trimmedName}" was added successfully.`,
        variant: "success",
      });
      handleClose();
    } catch (err) {
      const apiError =
        err instanceof AxiosError
          ? (err.response?.data as { error?: string } | undefined)?.error
          : undefined;

      toast({
        title: "Failed to create task",
        description: apiError || "Please try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="panel w-full max-w-lg">
        <h2 className="text-2xl font-semibold text-slate-900">Create Task</h2>
        <p className="mt-1 text-sm text-slate-600">
          Define task runtime behavior and queue priority.
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <input
            className="field"
            placeholder="Task Name"
            value={name}
            maxLength={15}
            onChange={(e) => {
              setName(e.target.value);
              if (nameError) setNameError("");
            }}
            required
          />
          {nameError && <p className="text-xs text-rose-600">{nameError}</p>}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs tracking-[0.12em] text-slate-500">
                Duration (s)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                className="field"
                value={durationInput}
                placeholder="e.g. 10 (max 600)"
                onChange={(e) => {
                  setDurationInput(e.target.value.replace(/\D/g, ""));
                  if (durationError) setDurationError("");
                }}
              />
              {durationError && (
                <p className="mt-1 text-xs text-rose-600">{durationError}</p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-xs tracking-[0.12em] text-slate-500">
                Priority
              </label>
              <SelectField
                value={priority}
                onChange={setPriority}
                options={priorityOptions}
                disabled={loading}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-md text-slate-700">
            <input
              className="h-4 w-4 rounded border-slate-300 accent-[var(--brand)]"
              type="checkbox"
              checked={shouldFail}
              onChange={(e) => setShouldFail(e.target.checked)}
            />
            Force failure to test retries
          </label>

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleClose}
              className="btn-secondary"
            >
              Cancel
            </button>

            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
