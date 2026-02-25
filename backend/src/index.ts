import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";

import app from "./app";
import {
  recoverRunningTasks,
  resumeQueueProcessing,
  startTaskCleanupJob,
} from "./services/task.service";

dotenv.config();

const PORT: number = parseInt(process.env.PORT || "");
const ORIGIN: string = process.env.CLIENT || "";

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535 || ORIGIN === "") {
  throw new Error("Invalid PORT or CLIENT value.");
}

const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: {
    origin: ORIGIN,
  },
});

httpServer.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await recoverRunningTasks();
  await resumeQueueProcessing();
  startTaskCleanupJob();
});
