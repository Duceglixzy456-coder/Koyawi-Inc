import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { token, loading } = useAuth();

  const socketRef = useRef(null);
  const listenersRef = useRef(new Set()); // 🔥 prevent duplicates
  const queueRef = useRef([]);

  const [connected, setConnected] = useState(false);

  const getUserId = useCallback(() => {
    try {
      return token ? jwtDecode(token).sub : null;
    } catch {
      return null;
    }
  }, [token]);

  const notifyListeners = useCallback((data) => {
    listenersRef.current.forEach((fn) => fn(data));
  }, []);

  const connect = useCallback(() => {
    const userId = getUserId();
    if (!userId) return;

    // 🔥 prevent duplicate connections
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    // 🔥 hard cleanup old socket before reconnecting
    if (socketRef.current) {
      socketRef.current.onopen = null;
      socketRef.current.onmessage = null;
      socketRef.current.onerror = null;
      socketRef.current.onclose = null;
      socketRef.current.close();
      socketRef.current = null;
    }

    console.log("WS CONNECTING →", userId);

    const socket = new WebSocket(
      `ws://192.168.1.194:8000/ws/${userId}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WS CONNECTED ✅");
      setConnected(true);

      while (queueRef.current.length > 0) {
        socket.send(JSON.stringify(queueRef.current.shift()));
      }
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const userId = getUserId();

        const enriched = {
          ...data,
          isMe: data.sender_id === userId,
        };

        notifyListeners(enriched);
      } catch (e) {
        console.log("WS PARSE ERROR", e);
      }
    };

    socket.onerror = (e) => {
      console.log("WS ERROR", e);
    };

    socket.onclose = () => {
      console.log("WS CLOSED ❌");
      setConnected(false);
    };
  }, [getUserId, notifyListeners]);

  // ================= CONNECT ON LOGIN =================
  useEffect(() => {
    if (loading || !token) return;

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, [token, loading, connect]);

  // ================= SEND MESSAGE =================
  const sendMessage = (payload) => {
    const socket = socketRef.current;

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    } else {
      queueRef.current.push(payload);
    }
  };

  // ================= LISTENERS (NO DUPLICATES) =================
  const addMessageListener = (fn) => {
    listenersRef.current.add(fn);

    return () => {
      listenersRef.current.delete(fn);
    };
  };

  return (
    <SocketContext.Provider
      value={{ connected, sendMessage, addMessageListener }}
    >
      {children}
    </SocketContext.Provider>
  );
};