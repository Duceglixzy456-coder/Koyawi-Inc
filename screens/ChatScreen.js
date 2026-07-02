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
import * as Clipboard from "expo-clipboard";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import ChatSkeleton from "../components/Skeletons/ChatSkeleton";
import { useAuth } from "../Context/AuthContext";
import { apiFetch } from "../api/apiFetch";
import { api } from "../utils/api";
import { useSocket } from "../realtime/SocketContext";

export default function ChatScreen({ route, navigation }) {
  const { 
  conversationId, 
  otherUserId, 
  listingTitle, 
  listingId,
  prefilledMessage 
} = route?.params || {};
 const { sendMessage, addMessageListener } = useSocket();

const [showScrollButton, setShowScrollButton] = useState(false);
const flatListRef = useRef(null);
const [newMessageCount, setNewMessageCount] = useState(0);

const [isAtBottom, setIsAtBottom] = useState(true);
const [loadingMessages, setLoadingMessages] = useState(true);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState(prefilledMessage || "");
const { token, userId } = useAuth();
const currentUserId = userId;
  const chatTitle =
  route?.params?.otherUserName && listingTitle
    ? `${route.params.otherUserName} • ${listingTitle}`
    : listingTitle || "Chat";



    useEffect(() => {
  const check = async () => {
    const t = await AsyncStorage.getItem("access_token");
    console.log("CHAT SCREEN TOKEN:", t);
  };

  check();
}, []);
  // ---------------- LOAD MESSAGES ----------------
const loadMessages = async () => {
  if (!conversationId) return;

  try {
    setLoadingMessages(true);

    const res = await apiFetch(`/messages/${conversationId}`);

    const data = await res.json(); // 🔥 THIS IS THE MISSING PIECE

    console.log("MESSAGES PARSED:", data);

    if (!Array.isArray(data)) {
      setMessages([]);
      return;
    }

    setMessages(data);
  } catch (err) {
    console.log("LOAD MESSAGES ERROR:", err);
    setMessages([]);
  } finally {
    setLoadingMessages(false);
  }
};
useEffect(() => {
  loadMessages();
}, [conversationId, token]);


// ---------------- MARK AS READ ----------------
useFocusEffect(
  useCallback(() => {
    if (!conversationId || !token) return;

    let isActive = true;

    const markAsRead = async () => {
      try {
        const res = await apiFetch("/messages/read", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation_id: conversationId,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          console.log("MARK READ FAILED:", data);
          return;
        }

        console.log("MARK READ SUCCESS:", data);
      } catch (err) {
        console.log("MARK READ ERROR:", err);
      }
    };

    // delay slightly so messages are already rendered
    const timeout = setTimeout(() => {
      if (isActive) markAsRead();
    }, 500);

    return () => {
      isActive = false;
      clearTimeout(timeout);
    };
  }, [conversationId, token])
);
const formatGuineaTime = (dateString) => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);

    return date.toLocaleTimeString("en-US", {
      timeZone: "Africa/Conakry",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  } catch (err) {
    console.log("GUINEA TIME ERROR:", err);
    return "";
  }
};
// ---------------- SEND MESSAGE ----------------
  
 const handleSendMessage = async () => {
  if (!text.trim()) return;

  const messageToSend = text;
  setText("");

  // 1. optimistic UI update (instant message)
  const tempId = Date.now().toString();

  const optimisticMessage = {
    _id: tempId,
    conversation_id: conversationId,
    sender_id: currentUserId,
    receiver_id: otherUserId,
    text: messageToSend,
    created_at: new Date().toISOString(),
    status: "sent",
  };

  setMessages((prev) => [...prev, optimisticMessage]);
const token = await AsyncStorage.getItem("accessToken");
console.log("SEND TOKEN:", token);
  try {
    const res = await apiFetch("/messages", {
      method: "POST",
     
      body: JSON.stringify({
        conversation_id: conversationId,
        receiver_id: otherUserId,
        text: messageToSend,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.log("SEND FAILED:", errText);

      // rollback optimistic message
      setMessages((prev) =>
        prev.filter((m) => m._id !== tempId)
      );

      return;
    }

    const data = await res.json().catch(() => null);

    // 2. replace temp message with real one (if backend returns id)
    if (data?.message_id) {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === tempId
            ? {
                ...m,
                _id: data.message_id,
                status: "sent",
              }
            : m
        )
      );
    }

    // 3. inbox refresh hook (optional global)
    global?.refreshInbox?.();

  } catch (err) {
    console.log("SEND ERROR:", err);

    // rollback on crash
    setMessages((prev) =>
      prev.filter((m) => m._id !== tempId)
    );
  }
};
const scrollToBottom = () => {
  flatListRef.current?.scrollToEnd({ animated: true });
  setShowScrollButton(false);
};

const prevMessageLength = useRef(0);

useEffect(() => {
  const prev = prevMessageLength.current;
  const current = messages.length;

  if (current > prev) {
    if (isAtBottom) {
      flatListRef.current?.scrollToEnd({ animated: true });
    } else {
      setNewMessageCount((c) => c + (current - prev));
      setShowScrollButton(true);
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

const copyMessage = async (text) => {
  try {
    await Clipboard.setStringAsync(text);
    Alert.alert("Copié", "Message copié dans le presse-papiers.");
  } catch (err) {
    console.log(err);
  }
};

const formatDayLabel = (dateString) => {
  const date = new Date(dateString);

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Aujourd'hui";
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return "Hier";
  }

  return date.toLocaleDateString("fr-FR", {
    timeZone: "Africa/Conakry",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

const shouldShowDaySeparator = (current, previous) => {
  if (!previous) return true;

  const currentDate = new Date(current.created_at).toDateString();
  const prevDate = new Date(previous.created_at).toDateString();

  return currentDate !== prevDate;
};
 // ---------------- RENDER MESSAGE ----------------
const renderItem = ({ item, index }) => {
  const isMe = item.sender_id === currentUserId;

  const previousMessage = messages[index - 1];
  const showSeparator = shouldShowDaySeparator(item, previousMessage);

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
    <>
      {showSeparator && (
        <View style={styles.dateSeparator}>
          <Text style={styles.dateText}>
            {formatDayLabel(item.created_at)}
          </Text>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onLongPress={() => copyMessage(item.text)}
      >
        <View style={isMe ? styles.myMessage : styles.theirMessage}>
          <Text style={styles.messageText}>{item.text}</Text>

          <View style={styles.rowBottom}>
            <Text style={styles.timeText}>
              {formatGuineaTime(item.created_at)}
            </Text>

            {renderStatus()}
          </View>
        </View>
      </TouchableOpacity>
    </>
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
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => {
            if (!listingId) return;

            navigation.navigate("ListingDetailScreen", {
              listingId,
            });
          }}
        >
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
        </TouchableOpacity>
      </View>

      {/* MESSAGES */}
      {loadingMessages ? (
        <ChatSkeleton />
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item._id?.toString()}
          renderItem={renderItem}
          extraData={messages}
          removeClippedSubviews={false}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          maintainVisibleContentPosition={{ minIndexForVisible: 0 }}
        />
      )}

      {/* SCROLL BUTTON */}
      {showScrollButton && (
        <TouchableOpacity
          onPress={() => {
            flatListRef.current?.scrollToEnd({ animated: true });
            setShowScrollButton(false);
            setNewMessageCount(0);
            setIsAtBottom(true);
          }}
          style={{
            position: "absolute",
            bottom: 100,
            alignSelf: "center",
            backgroundColor: "#111",
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 25,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 13 }}>
            {newMessageCount > 0
              ? `New messages (${newMessageCount})`
              : "New messages"}
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
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  listContent: {
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 20,
  },

  messageContainer: {
    width: "100%",
    marginVertical: 9,
  },

  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#b4f1a9a1",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    maxWidth: "75%",
  },

  theirMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#b4f1a91c",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 14,
    maxWidth: "75%",
  },

  messageText: {
    fontSize: 16,
    color: "#000",
    lineHeight: 18,
  },

  rowBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
    gap: 10,
  },

  timeText: {
    fontSize: 12,
    color: "#777777ad",
  },

  check: {
    fontSize: 12,
    fontWeight: "900",
  },

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
    backgroundColor: "#060000",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },

  sendText: {
    color: "#fff",
    fontWeight: "600",
  },

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

  dateSeparator: {
    alignItems: "center",
    marginVertical: 10,
  },

  dateText: {
    fontSize: 12,
    color: "#666",
    backgroundColor: "#f2f2f2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    overflow: "hidden",
  },
};
