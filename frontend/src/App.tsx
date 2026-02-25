import { useCallback, useEffect, useMemo, useState } from "react";

import { socket } from "./socket";
import { fetchTasks } from "./api/taskApi";
import { deriveMetrics } from "./utils/deriveMetrics";
import { type Task } from "./models/task";
import DashboardLayout from "./components/DashboardLayout";
import CreateTaskModal from "./components/CreateTaskModal";
import TaskTable from "./components/TaskTable";
import MetricsPanel from "./components/MetricsPanel";
import { useToast } from "./components/ui/useToast";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const { toast } = useToast();

  const refreshTasks = useCallback(async () => {
    try {
      const tasksRes = await fetchTasks();
      setTasks(tasksRes);
    } catch {
      toast({
        title: "Failed to refresh tasks",
        description: "Please check backend connection and try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const metrics = useMemo(() => deriveMetrics(tasks), [tasks]);

  useEffect(() => {
    let active = true;

    async function loadInitialTasks() {
      try {
        const tasksRes = await fetchTasks();
        if (active) {
          setTasks(tasksRes);
        }
      } catch {
        toast({
          title: "Failed to load tasks",
          description: "Could not load task list from the server.",
          variant: "destructive",
        });
      }
    }

    void loadInitialTasks();

    socket.on("task:update", (updatedTask: Task) => {
      setTasks((prev) => {
        let found = false;

        const next = prev.map((t) => {
          if (t.id === updatedTask.id) {
            found = true;
            return updatedTask;
          }
          return t;
        });

        return found ? next : [updatedTask, ...prev];
      });
    });

    socket.on("task:delete", ({ id }: { id: string }) => {
      setTasks((prev) => prev.filter((task) => task.id !== id));
    });

    socket.on("connect", refreshTasks);

    return () => {
      active = false;
      socket.off("task:update");
      socket.off("task:delete");
      socket.off("connect");
    };
  }, [refreshTasks, toast]);

  return (
    <DashboardLayout onCreateClick={() => setModalOpen(true)}>
      <MetricsPanel metrics={metrics} />
      <TaskTable tasks={tasks} />

      <CreateTaskModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={refreshTasks}
      />
    </DashboardLayout>
  );
}
