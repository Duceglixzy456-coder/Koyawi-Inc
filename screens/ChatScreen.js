import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from "react-native";

import React, { useState, useEffect, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatScreen({ route, navigation }) {
  const conversationId = route?.params?.conversationId;
  const otherUserId = route?.params?.otherUserId;
const listingTitle = route?.params?.listingTitle;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  const ws = useRef(null);

  // ---------------- USER ----------------
  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const decoded = jwtDecode(token);
      setCurrentUserId(decoded.sub);
    };

    loadUser();
  }, []);

  // ---------------- LOAD MESSAGES ----------------
  const loadMessages = async () => {
    if (!conversationId) return;

    const res = await fetch(
      `http://192.168.1.195:8000/messages/${conversationId}`
    );

    const data = await res.json();

    const sorted = data.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    setMessages(sorted);
  };

  useEffect(() => {
    loadMessages();
  }, [conversationId]);

  // ---------------- REFRESH ----------------
  const refreshMessages = async () => {
    await loadMessages();
  };

  // ---------------- SEND ----------------
  const sendMessage = () => {
    if (!text.trim()) return;

    const msg = text;
    setText("");

    const newMessage = {
      _id: Date.now().toString(),
      text: msg,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, newMessage]);

    ws.current?.send(
      JSON.stringify({
        receiver_id: otherUserId,
        text: msg,
        conversation_id: conversationId,
        sender_id: currentUserId,
      })
    );
  };

  // ---------------- WEBSOCKET ----------------
  useEffect(() => {
    const connect = async () => {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const decoded = jwtDecode(token);

      const socket = new WebSocket(
        `ws://192.168.1.195:8000/ws/${decoded.sub}`
      );

      ws.current = socket;

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        const newMessage = {
          _id: msg._id || Date.now().toString(),
          text: msg.text,
          sender_id: msg.sender_id,
          created_at: msg.created_at || new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMessage]);
      };
    };

    connect();

    return () => ws.current?.close();
  }, [conversationId]);

  // ---------------- RENDER ----------------
  const renderItem = ({ item }) => {
    const isMe = item.sender_id === currentUserId;

    return (
      <View
        style={{
          alignSelf: isMe ? "flex-end" : "flex-start",
          backgroundColor: isMe ? "#111" : "#fff",
          padding: 12,
          marginVertical: 4,
          borderRadius: 18,
          maxWidth: "80%",
        }}
      >
        <Text style={{ color: isMe ? "#fff" : "#000" }}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f3f5" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >

        {/* FLOATING BACK BUTTON */}
<View
  style={{
    position: "absolute",
    top: 0,
    left: 15,
    zIndex: 999,
  }}
>
  <TouchableOpacity
    onPress={() => navigation.goBack()}
    style={{
      backgroundColor: "rgba(255,255,255,0.25)",
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.4)",
      backdropFilter: "blur(10px)", // iOS only visual support
    }}
  >
    <Text style={{ fontSize: 16, fontWeight: "600" }}>←</Text>
  </TouchableOpacity>
</View>

{/* CHAT TITLE (MINIMAL HEADER) */}
<View
  style={{
    position: "absolute",
    top: 5,
    alignSelf: "center",
    width: "100%",
    alignItems: "center",
    zIndex: 500,
  }}
>
  <Text
    numberOfLines={1}
    style={{
      fontSize: 14,
      fontWeight: "600",
      color: "#333",
      backgroundColor: "rgba(255,255,255,0.6)",
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 10,
      overflow: "hidden",
    }}
  >
    {listingTitle || "Chat"}
  </Text>
</View>
        {/* MESSAGES */}
        <FlatList
          data={messages}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          inverted   // 🔥 THIS IS THE FIX
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 10,
          }}
        />

        {/* INPUT */}
        <View
          style={{
            flexDirection: "row",
            padding: 10,
            backgroundColor: "#fff",
            alignItems: "center",
          }}
        >
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message..."
            style={{
              flex: 1,
              backgroundColor: "#f2f3f5",
              padding: 10,
              borderRadius: 20,
            }}
          />

          <TouchableOpacity
            onPress={sendMessage}
            style={{
              marginLeft: 10,
              backgroundColor: "#111",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "#fff" }}>Send</Text>
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}