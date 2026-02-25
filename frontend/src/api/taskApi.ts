import axiosClient from "./axiosClient";

import type { Task } from "../models/task";

export async function fetchTasks(): Promise<Task[]> {
  const res = await axiosClient.get<Task[]>("/tasks");
  return res.data;
}

export async function createTask(
  name: string,
  duration: number,
  shouldFail: boolean,
  priority?: number,
): Promise<Task> {
  const res = await axiosClient.post<Task>("/tasks", {
    name,
    duration,
    shouldFail,
    priority,
  });

  return res.data;
}

export async function runTask(id: string): Promise<void> {
  await axiosClient.post(`/tasks/${id}/run`);
}

export async function cancelTask(id: string): Promise<void> {
  await axiosClient.post(`/tasks/${id}/cancel`);
}

export async function deleteTask(id: string): Promise<void> {
  await axiosClient.delete(`/tasks/${id}`);
}
