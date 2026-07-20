import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext.jsx";

// Subscribes to a socket event for the lifetime of the component. Safe to
// call even when the socket isn't connected yet (e.g. still authenticating).
export const useSocketEvent = (event, handler, deps = []) => {
  const socket = useSocketContext();

  useEffect(() => {
    if (!socket || !event) return undefined;
    socket.on(event, handler);
    return () => socket.off(event, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, event, ...deps]);
};

// Joins/leaves a booking's realtime room (for the shareable-QR payment flow,
// where an anonymous payer's tab also needs live status updates).
export const useBookingRoom = (bookingId) => {
  const socket = useSocketContext();

  useEffect(() => {
    if (!socket || !bookingId) return undefined;
    socket.emit("booking:join", bookingId);
    return () => socket.emit("booking:leave", bookingId);
  }, [socket, bookingId]);
};

export const useSocket = () => useSocketContext();

export default useSocket;
