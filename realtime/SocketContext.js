import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const listenersRef = useRef([]);
  const [connected, setConnected] = useState(false);

  const { token, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    if (!token) {
      setConnected(false);
      console.log("NO TOKEN → WS OFF");
      return;
    }

    let isActive = true;

    const decoded = jwtDecode(token);
    const userId = decoded.sub;

    const socket = new WebSocket(
      `ws://192.168.1.195:8000/ws/${userId}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      if (!isActive) return;
      console.log("WS CONNECTED");
      setConnected(true);
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      listenersRef.current.forEach((fn) => fn(data));
    };

    socket.onclose = () => {
      console.log("WS CLOSED");
      setConnected(false);
      socketRef.current = null;
    };

    socket.onerror = (e) => {
      console.log("WS ERROR", e.message);
    };

    return () => {
      isActive = false;
      socket.close();
    };
  }, [token, loading]);

  const sendMessage = (payload) => {
    if (socketRef.current?.readyState !== WebSocket.OPEN) return;
    socketRef.current.send(JSON.stringify(payload));
  };

  const addMessageListener = (fn) => {
    listenersRef.current.push(fn);

    return () => {
      listenersRef.current = listenersRef.current.filter((f) => f !== fn);
    };
  };

  return (
    <SocketContext.Provider
      value={{
        connected,
        sendMessage,
        addMessageListener,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};