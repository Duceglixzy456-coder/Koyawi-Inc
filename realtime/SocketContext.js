import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";

const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const listenersRef = useRef([]);
  const [connected, setConnected] = useState(false);

  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      socketRef.current?.close();
      socketRef.current = null;
      setConnected(false);
      return;
    }

    const decoded = jwtDecode(token);

    // prevent duplicates
    if (socketRef.current?.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(
      `ws://192.168.1.194:8000/ws/${decoded.sub}`
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WS CONNECTED");
      setConnected(true);
    };

    socket.onclose = () => {
      console.log("WS CLOSED");
      socketRef.current = null;
      setConnected(false);
    };

    socket.onerror = (e) => {
      console.log("WS ERROR", e.message);
    };

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        listenersRef.current.forEach((fn) => fn(msg));
      } catch (err) {
        console.log("WS PARSE ERROR", err);
      }
    };

    return () => {
      socket.close();
    };
  }, [token]);

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