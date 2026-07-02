// realtime/socketClient.js
let socket = null;

export const getSocket = (userId) => {
  if (socket && socket.readyState === 1) {
    return socket;
  }

  socket = new WebSocket(`ws://192.168.1.194:8000/ws/${userId}`);

  socket.onopen = () => console.log("WS CONNECTED ✅");
  socket.onclose = () => console.log("WS CLOSED ❌");
  socket.onerror = (e) => console.log("WS ERROR", e);

  return socket;
};