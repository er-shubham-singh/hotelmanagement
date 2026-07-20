import { useEffect } from "react";
import { useSocketContext } from "../context/SocketContext.jsx";

export const useSocketEvent = (event, handler, deps = []) => {
  const socket = useSocketContext();

  useEffect(() => {
    if (!socket || !event) return undefined;
    socket.on(event, handler);
    return () => socket.off(event, handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, event, ...deps]);
};

export const useSocket = () => useSocketContext();

export default useSocket;
