import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { config } from "./env.js";

let io = null;

export const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [config.clientUrl, config.adminPanelUrl],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    // Auth is optional at the transport level — an anonymous payer sharing a
    // booking QR link can still join that booking's room without logging in.
    const token = socket.handshake.auth?.token;
    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.accessSecret);
        socket.userId = decoded.id;
      } catch (error) {
        // ignore invalid token — connection proceeds unauthenticated
      }
    }
    next();
  });

  io.on("connection", (socket) => {
    if (socket.userId) {
      socket.join(socket.userId);
    }

    socket.on("booking:join", (bookingId) => {
      if (bookingId) socket.join(`booking:${bookingId}`);
    });

    socket.on("booking:leave", (bookingId) => {
      if (bookingId) socket.leave(`booking:${bookingId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    // eslint-disable-next-line no-console
    console.warn("[socket] getIO() called before initSocket() — realtime events will be dropped");
    return null;
  }
  return io;
};

export default { initSocket, getIO };
