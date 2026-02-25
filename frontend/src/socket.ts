import { io } from "socket.io-client";

const SERVER = import.meta.env.VITE_BACKEND_URL || "";

export const socket = io(SERVER, {
  transports: ["websocket"],
  reconnection: true,
  reconnectionAttempts: 5,
});
