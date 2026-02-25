import { type Task } from "../models/task";
import TaskRow from "./TaskRow";

export default function TaskTable({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <div className="panel flex min-h-44 items-center justify-center">
        <p className="text-md text-slate-500">
          No tasks available. Create one to start the queue simulation.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <TaskRow key={task.id} task={task} />
      ))}
    </div>
  );
}
