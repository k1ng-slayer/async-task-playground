export type TaskStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | "cancelled";

export interface TaskLog {
  timestamp: number;
  message: string;
}

export interface Task {
  id: string;
  name: string;
  createdAt: number;
  duration: number;
  shouldFail: boolean;
  queued: boolean;
  status: TaskStatus;
  retryCount: number;
  maxRetries: number;
  priority: number;
  startedAt?: number;
  finishedAt?: number;
  errorMessage?: string;
  logs: TaskLog[];
}
