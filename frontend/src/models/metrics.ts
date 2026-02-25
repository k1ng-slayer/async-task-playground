export interface Metric {
  totalTasks: number;
  runningTasks: number;
  queuedTasks: number;
  completedTasks: number;
  failedTasks: number;
  cancelledTasks: number;
  retryingTasks: number;
  averageExecutionTime: number;
}
