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
  const { token, loading } = useAuth();

  const socketRef = useRef(null);
  const listenersRef = useRef([]);
  const queueRef = useRef([]);

  

  const [connected, setConnected] = useState(false);

  const getUserId = () => {
    try {
      return token ? jwtDecode(token).sub : null;
    } catch {
      return null;
    }
  };

  const connect = () => {
  const userId = getUserId();
  if (!userId) return;

  // 🚨 STEP 3 FIX: prevent duplicate socket recreation
  if (socketRef.current?.readyState === WebSocket.OPEN) {
    return;
  }

  // only close if socket exists but is dead
  if (
    socketRef.current &&
    socketRef.current.readyState !== WebSocket.OPEN
  ) {
    socketRef.current.close();
    socketRef.current = null;
  }

  console.log("WS CONNECTING →", userId);

  const socket = new WebSocket(`ws://192.168.1.194:8000/ws/${userId}`);

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

        if (data.type === "pong") return;

        listenersRef.current.forEach((fn) => fn(data));
      } catch (e) {
        console.log("WS PARSE ERROR:", e);
      }
    };

    socket.onclose = () => {
      console.log("WS CLOSED ❌");
      setConnected(false);
    };

    socket.onerror = (e) => {
      console.log("WS ERROR", e);
    };
  };

  useEffect(() => {
  if (loading || !token) return;

  const userId = getUserId();
  if (!userId) return;

  // if already connected with same socket → do nothing
  if (
    socketRef.current &&
    socketRef.current.readyState === WebSocket.OPEN
  ) {
    return;
  }

  connect();

  return () => {
    // IMPORTANT: do NOT aggressively close on every rerender
    // only close on real logout/unmount
  };
}, [token, loading]);

  const sendMessage = (payload) => {
    const socket = socketRef.current;

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    } else {
      queueRef.current.push(payload);
    }
  };

  const addMessageListener = (fn) => {
    listenersRef.current.push(fn);
    return () => {
      listenersRef.current = listenersRef.current.filter((f) => f !== fn);
    };
  };

  return (
    <SocketContext.Provider value={{ connected, sendMessage, addMessageListener }}>
      {children}
    </SocketContext.Provider>
  );
};