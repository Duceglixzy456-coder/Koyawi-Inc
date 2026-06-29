import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import { useAuth } from "../Context/AuthContext";
import { api } from "../utils/api";
import { useSocket } from "../realtime/SocketContext";
import { jwtDecode } from "jwt-decode";

export default function ChatScreen({ route, navigation }) {
  const { conversationId, otherUserId, listingTitle, prefilledMessage } =
    route?.params || {};

 const { sendMessage, addMessageListener } = useSocket();
const flatListRef = useRef(null);
const { token } = useAuth();
const [isAtBottom, setIsAtBottom] = useState(true);
const [showNewMessageBtn, setShowNewMessageBtn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState(prefilledMessage || "");
  const [currentUserId, setCurrentUserId] = useState(null);
  const chatTitle =
  route?.params?.otherUserName && listingTitle
    ? `${route.params.otherUserName} • ${listingTitle}`
    : listingTitle || "Chat";



// ---------------- USER ID ----------------
useEffect(() => {
  if (!token) return;

  setCurrentUserId(jwtDecode(token).sub);
}, [token]);
  // ---------------- LOAD MESSAGES ----------------
const loadMessages = async () => {
  if (!conversationId || !token) return;

  try {
    const res = await api(
      `/messages/${conversationId}`,
      { method: "GET" },
      navigation
    );

    const data = await res.json();

    console.log("MESSAGES FROM API:");
    console.log(JSON.stringify(data, null, 2));
    console.log("IS ARRAY:", Array.isArray(data));

    if (!Array.isArray(data)) {
      console.log("INVALID MESSAGE RESPONSE:", data);
      setMessages([]);
      return;
    }

    setMessages(data);

  } catch (err) {
    console.log("LOAD MESSAGES ERROR:", err);
  }
};

useEffect(() => {
  loadMessages();
}, [conversationId, token]);
  // ---------------- SEND MESSAGE ----------------
  
 const handleSendMessage = async () => {
  if (!text.trim()) return;

  const messageToSend = text;
  setText(""); // clear immediately (prevents double send feel)

  try {
    const res = await fetch(
      "http://192.168.1.194:8000/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          receiver_id: otherUserId,
          text: messageToSend,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.log("SEND FAILED", data);
      return;
    }

    // OPTIONAL: only add if socket is NOT reliable
    setMessages((prev) => {
      if (prev.some(m => m._id === data.message_id)) return prev;

      return [
        ...prev,
        {
          _id: data.message_id,
          conversation_id: conversationId,
          sender_id: currentUserId,
          receiver_id: otherUserId,
          text: messageToSend,
          created_at: new Date().toISOString(),
        },
      ];
    });

  } catch (err) {
    console.log("SEND ERROR:", err);
  }
};
useEffect(() => {
  const removeListener = addMessageListener((message) => {
    setMessages((prev) => {
      if (!message?._id) return prev;

      if (message.conversation_id !== conversationId) return prev;

      if (prev.some((m) => m._id === message._id)) return prev;

      const updated = [...prev, message];

      if (isAtBottom) {
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 50);
      } else {
        setShowNewMessageBtn(true);
      }

      return updated;
    });
  });

  return removeListener;
}, [addMessageListener, conversationId, isAtBottom]);
 // ---------------- RENDER MESSAGE ----------------
const renderItem = ({ item }) => {
  const isMe = item.sender_id === currentUserId;

  return (
    <View
      style={{
        alignSelf: isMe ? "flex-end" : "flex-start",
        backgroundColor: isMe ? (item.pending ? "#333" : "#111") : "#fff",
        padding: 12,
        marginVertical: 4,
        borderRadius: 16,
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
  <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* HEADER */}
      <View
        style={{
          paddingTop: 10,
          paddingBottom: 8,
          alignItems: "center",
          borderBottomWidth: 0.5,
          borderBottomColor: "#ddd",
          backgroundColor: "#fff",
        }}
      >
        {/* BACK BUTTON */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            left: 15,
            top: 10,
            padding: 5,
          }}
        >
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>

        {/* TITLE */}
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#111",
          }}
          numberOfLines={1}
        >
          {chatTitle}
        </Text>
      </View>

      {/* MESSAGES */}
     <FlatList
  ref={flatListRef}
  data={messages}
  keyExtractor={(item) => item._id?.toString()}
  renderItem={renderItem}
  extraData={messages}
  removeClippedSubviews={false}
  showsVerticalScrollIndicator={false}

  // ================= WHATSAPP SCROLL DETECTION =================
  onScroll={(event) => {
  const { layoutMeasurement, contentOffset, contentSize } =
    event.nativeEvent;

  const paddingToBottom = 80;

  const isBottom =
    layoutMeasurement.height + contentOffset.y >=
    contentSize.height - paddingToBottom;

  setIsAtBottom(isBottom);

  if (isBottom) {
    setShowNewMessageBtn(false);
  }
}}
scrollEventThrottle={16}
/>
{showNewMessageBtn && (
  <TouchableOpacity
    onPress={() => {
      flatListRef.current?.scrollToEnd({ animated: true });
      setShowNewMessageBtn(false);
      setIsAtBottom(true);
    }}
    style={{
      position: "absolute",
      bottom: 90,
      alignSelf: "center",
      backgroundColor: "#111",
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
    }}
  >
    <Text style={{ color: "#fff", fontSize: 12 }}>
      New messages ↓
    </Text>
  </TouchableOpacity>
)}

      {/* INPUT */}
      <View
        style={{
          flexDirection: "row",
          padding: 10,
          borderTopWidth: 1,
          borderColor: "#eee",
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          style={{
            flex: 1,
            backgroundColor: "#f2f2f2",
            padding: 10,
            borderRadius: 20,
          }}
        />

        <TouchableOpacity
         onPress={handleSendMessage}
          style={{
            marginLeft: 10,
            backgroundColor: "#2b2b2b",
            paddingHorizontal: 16,
            justifyContent: "center",
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