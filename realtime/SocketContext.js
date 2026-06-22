import React, { createContext, useContext, useEffect, useRef, useState } from "react";
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

  // IMPORTANT: always close before reconnect
  socketRef.current?.close();
  socketRef.current = null;

  if (!token) {
    setConnected(false);
    console.log("NO TOKEN → WS OFF");
    return;
  }

  const decoded = jwtDecode(token);
  const userId = decoded.sub;

  const socket = new WebSocket(
    `ws://192.168.1.195:8000/ws/${userId}`
  );

  socketRef.current = socket;

  socket.onopen = () => {
    console.log("WS CONNECTED");
    setConnected(true);
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
      value={{ connected, sendMessage, addMessageListener }}
    >
      {children}
    </SocketContext.Provider>
  );
};