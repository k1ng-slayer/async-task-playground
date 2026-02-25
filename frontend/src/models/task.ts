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
  duration: number;
  shouldFail: boolean;
  queued: boolean;
  priority: number;
  status: TaskStatus;
  retryCount: number;
  maxRetries: number;
  startedAt?: number;
  finishedAt?: number;
  errorMessage?: string;
  logs: TaskLog[];
  progress?: number;
}
