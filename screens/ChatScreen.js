import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

import { useAuth } from "../Context/AuthContext";
import { api } from "../utils/api";
import { useSocket } from "../realtime/SocketContext";

export default function ChatScreen({ route, navigation }) {
  const { conversationId, otherUserId, listingTitle, prefilledMessage } =
    route?.params || {};

 const { sendMessage, addMessageListener } = useSocket();

const [showScrollButton, setShowScrollButton] = useState(false);
const flatListRef = useRef(null);
const [newMessageCount, setNewMessageCount] = useState(0);
const { token } = useAuth();
const [isAtBottom, setIsAtBottom] = useState(true);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState(prefilledMessage || "");
  const [currentUserId, setCurrentUserId] = useState(null);
  const chatTitle =
  route?.params?.otherUserName && listingTitle
    ? `${route.params.otherUserName} • ${listingTitle}`
    : listingTitle || "Chat";


useEffect(() => {
  if (!conversationId || !currentUserId) return;

  fetch(
    `http://192.168.1.194:8000/messages/read/${conversationId}?user_id=${currentUserId}`,
    {
      method: "PUT",
    }
  );
}, []);
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


const API_URL = "http://192.168.1.194:8000";

// ---------------- MARK AS READ ----------------
const markAsRead = async () => {
  try {
    await fetch(`${API_URL}/messages/read`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        conversation_id: conversationId,
      }),
    });
  } catch (err) {
    console.log("MARK READ ERROR:", err);
  }
};

// run once when screen opens
useEffect(() => {
  if (!conversationId || !token) return;
  markAsRead();
}, [conversationId, token]);

const formatGuineaTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleTimeString("en-GB", {
    timeZone: "Africa/Conakry", // 🇬🇳 Guinea
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, // 24-hour format
  });
};


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

const scrollToBottom = () => {
  flatListRef.current?.scrollToEnd({ animated: true });
  setShowScrollButton(false);
};
useEffect(() => {
  if (isAtBottom) {
    flatListRef.current?.scrollToEnd({ animated: true });
    setNewMessageCount(0);
  }
}, [messages]);
const prevMessageLength = useRef(0);

useEffect(() => {
  const prev = prevMessageLength.current;
  const current = messages.length;

  if (current > prev) {
    const newMessages = current - prev;

    if (!isAtBottom) {
      setNewMessageCount((c) => c + newMessages);
      setShowScrollButton(true);
    } else {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
  }

  prevMessageLength.current = current;
}, [messages]);
useEffect(() => {
  const removeListener = addMessageListener((data) => {
    
    // =========================
    // 1. NEW MESSAGE
    // =========================
    if (data._id && data.text) {
      setMessages((prev) => {
        if (data.conversation_id !== conversationId) return prev;
        if (prev.some((m) => m._id === data._id)) return prev;

        const updated = [...prev, data];

        if (isAtBottom) {
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 50);
        } else {
          setShowScrollButton(true);
        }

        return updated;
      });
    }

    // =========================
    // 2. READ RECEIPTS
    // =========================
    if (data.type === "messages_read") {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.conversation_id === data.conversation_id &&
          msg.sender_id === currentUserId
            ? { ...msg, status: "read" }
            : msg
        )
      );
    }
  });

  return removeListener;
}, [addMessageListener, conversationId, isAtBottom]);
 // ---------------- RENDER MESSAGE ----------------
const renderItem = ({ item }) => {
  const isMe = item.sender_id === currentUserId;

  const renderStatus = () => {
    if (!isMe) return null;

    const status = item.status || "sent";

    if (status === "sent") {
      return <Text style={[styles.check, { color: "gray" }]}>✓</Text>;
    }

    if (status === "delivered") {
      return <Text style={[styles.check, { color: "gray" }]}>✓✓</Text>;
    }

    if (status === "read") {
      return <Text style={[styles.check, { color: "#4aa3ff" }]}>✓✓</Text>;
    }

    return null;
  };

  return (
    <View style={isMe ? styles.myMessage : styles.theirMessage}>
      <Text style={styles.messageText}>{item.text}</Text>

      <View style={styles.rowBottom}>
        <Text style={styles.timeText}>
          {formatGuineaTime(item.created_at)}
        </Text>

        {renderStatus()}
      </View>
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

  // ✅ STEP 6 ADDITIONS (SMOOTH + STABLE CHAT)
  maintainVisibleContentPosition={{
    minIndexForVisible: 0,
  }}
  keyboardShouldPersistTaps="handled"

  // ================= WHATSAPP SCROLL DETECTION =================
  onScroll={(event) => {
    const { layoutMeasurement, contentOffset, contentSize } =
      event.nativeEvent;

    const paddingToBottom = 70;

    const distanceFromBottom =
      contentSize.height -
      (layoutMeasurement.height + contentOffset.y);

    const atBottom = distanceFromBottom < paddingToBottom;

    setIsAtBottom(atBottom);

    if (atBottom) {
      setShowScrollButton(false);
      setNewMessageCount(0);
    }
  }}
  scrollEventThrottle={16}
/>
{showScrollButton && (
  <TouchableOpacity
    onPress={() => {
      flatListRef.current?.scrollToEnd({ animated: true });
      setShowScrollButton(false);
      setNewMessageCount(0);
      setIsAtBottom(true);
      
    }}
    activeOpacity={0.85}
    style={{
      position: "absolute",
      bottom: 100,
      alignSelf: "center",

      flexDirection: "row",
      alignItems: "center",

      backgroundColor: "#111",
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 25,

      shadowColor: "#000",
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 6,
    }}
  >
    <Text style={{ color: "#fff", fontSize: 13, fontWeight: "600" }}>
      {newMessageCount > 0
        ? `New messages (${newMessageCount})`
        : "New messages"}
    </Text>

    {/* clean arrow (no emoji) */}
    <Text
      style={{
        color: "#fff",
        fontSize: 16,
        marginLeft: 8,
        transform: [{ rotate: "180deg" }],
      }}
    >
      ˄
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
const styles = {
  // ================= CONTAINER =================
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  // ================= MESSAGE LIST WRAPPER =================
  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 20,
  },

  // ================= MESSAGE WRAPPER =================
  messageContainer: {
    width: "100%",
    marginVertical: 2,
  },

  // ================= MY MESSAGE (RIGHT SIDE) =================
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#DCF8C6",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,

    maxWidth: "75%",
  },

  // ================= THEIR MESSAGE (LEFT SIDE) =================
  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F2F2F2",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,

    maxWidth: "75%",
  },

  // ================= MESSAGE TEXT =================
  messageText: {
    fontSize: 15,
    color: "#111",
    lineHeight: 20,
  },

  // ================= TIME + CHECK ROW =================
  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 6,
  },

  // ================= TIME TEXT =================
  timeText: {
    fontSize: 11,
    color: "#777",
  },

  // ================= CHECK MARKS =================
  check: {
    fontSize: 11,
    fontWeight: "600",
  },

  // ================= INPUT AREA =================
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    alignItems: "center",
    backgroundColor: "#fff",
  },

  textInput: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 20,
    fontSize: 14,
  },

  sendButton: {
    marginLeft: 10,
    backgroundColor: "#2b2b2b",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },

  sendText: {
    color: "#fff",
    fontWeight: "600",
  },

  // ================= SCROLL BUTTON =================
  scrollButton: {
    position: "absolute",
    bottom: 100,
    alignSelf: "center",
    backgroundColor: "#111",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
  },

  scrollText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
};