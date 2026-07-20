import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { env } from "../config/env.js";
import { useAuth } from "./AuthContext.jsx";
import { getAccessToken } from "../api/axiosClient.js";

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [socket, setSocket] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      socketRef.current?.disconnect();
      socketRef.current = null;
      setSocket(null);
      return undefined;
    }

    const instance = io(env.socketUrl, {
      auth: { token: getAccessToken() },
      transports: ["websocket"],
    });

    socketRef.current = instance;
    setSocket(instance);

    return () => {
      instance.disconnect();
      socketRef.current = null;
    };
  }, [isAuthenticated]);

  return <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>;
};

export const useSocketContext = () => useContext(SocketContext);

export default SocketContext;
