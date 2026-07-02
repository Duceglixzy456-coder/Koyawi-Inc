import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useAuth } from "../Context/AuthContext";

const SocketContext = createContext(null);
export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const { token, userId, loading } = useAuth();

  const socketRef = useRef(null);
  const listenersRef = useRef(new Set());
  const queueRef = useRef([]);

  const [connected, setConnected] = useState(false);

  // ---------------- LISTENERS ----------------
  const addMessageListener = useCallback((fn) => {
    listenersRef.current.add(fn);
    return () => listenersRef.current.delete(fn);
  }, []);

  const notifyListeners = useCallback((data) => {
    listenersRef.current.forEach((fn) => fn(data));
  }, []);

  // ---------------- CONNECT (SINGLE SAFE VERSION) ----------------
  useEffect(() => {
    if (loading || !token || !userId) return;

    // prevent duplicate sockets
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    // close old socket if exists
    if (socketRef.current) {
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

        notifyListeners({
          ...data,
          isMe: data.sender_id === userId,
        });
      } catch (e) {
        console.log("WS PARSE ERROR:", e);
      }
    };

    socket.onerror = (e) => {
      console.log("WS ERROR:", e?.message || e);
    };

    socket.onclose = () => {
      console.log("WS CLOSED ❌");
      setConnected(false);
      socketRef.current = null;
    };

    // cleanup ONLY on unmount or logout
    return () => {
      console.log("WS CLEANUP");
      socket.close();
      socketRef.current = null;
    };
  }, [token, userId, loading]);

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = useCallback((payload) => {
    const socket = socketRef.current;

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    } else {
      queueRef.current.push(payload);
    }
  }, []);

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