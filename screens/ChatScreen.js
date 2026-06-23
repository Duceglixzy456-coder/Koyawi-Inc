import React, {
  useState,
  useEffect,
  useRef,
} from "react";
import {
  View,
  Text,
  Alert,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Modal,
  Pressable,
} from "react-native";

import { useSocket } from "../realtime/SocketContext";
import { jwtDecode } from "jwt-decode";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLanguage } from "../Context/LanguageContext";
import { translations } from "../utils/translations";
import { useAuth } from "../Context/AuthContext";

export default function ChatScreen({ route, navigation }) {
  const conversationId = route?.params?.conversationId;
  const otherUserId = route?.params?.otherUserId;
  const listingTitle = route?.params?.listingTitle;
const { sendMessage, addMessageListener } = useSocket();
  const { token } = useAuth();

const currentUserId = token
  ? jwtDecode(token).sub
  : null;
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [replyTo, setReplyTo] = useState(null);

  const [actionVisible, setActionVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const { language } = useLanguage();
  const t = translations[language];

  // ---------------- CHECK PARAMS ----------------
  useEffect(() => {
    if (!conversationId || !otherUserId) {
      console.log("CHAT MISSING PARAMS:", route.params);
    }
  }, []);

  // ---------------- LOAD MESSAGES ----------------
const loadMessages = async () => {
  try {
    if (!conversationId) return;

  

if (!token) {
  Alert.alert("Error", "You are not logged in");
  return;
}

    const res = await fetch(
      `http://192.168.1.195:8000/messages/${conversationId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    const sorted = data.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    setMessages(sorted);
  } catch (err) {
    console.log("LOAD MESSAGES ERROR:", err);
  }
};

// trigger load
useEffect(() => {
  loadMessages();
}, [conversationId]);

useEffect(() => {
  const unsubscribe = addMessageListener((msg) => {
    if (msg.conversation_id === conversationId) {
      setMessages((prev) => [...prev, msg]);
    }
  });

  return unsubscribe;
}, [conversationId]);

  // ---------------- SEND MESSAGE ----------------
 const handleSendMessage = async () => {
  if (!text.trim()) return;

  const msg = text;
  setText("");

  const tempMessage = {
    _id: Date.now().toString(),
    text: msg,
    sender_id: currentUserId,
    created_at: new Date().toISOString(),
  };

  setMessages((prev) => [...prev, tempMessage]);

  try {
    if (!token) {
      Alert.alert("Error", "You are not logged in");
      return;
    }

    // use socket (from useSocket hook)
    sendMessage({
      text: msg,
      receiver_id: otherUserId,
      conversation_id: conversationId,
      sender_id: currentUserId,
    });

  } catch (err) {
    console.log("SEND ERROR:", err);
  }
};
  // ---------------- DELETE MESSAGE ----------------
  const handleDeleteMessage = async (message) => {
  if (!message?._id) return;

  try {
    const previousMessages = messages;

    setMessages((prev) =>
      prev.filter((m) => m._id !== message._id)
    );

    if (!token) {
      Alert.alert("Error", "You are not logged in");
      return;
    }

    const res = await fetch(
      `http://192.168.1.195:8000/messages/${message._id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      setMessages(previousMessages);
      Alert.alert("Error", "Could not delete message.");
    }
  } catch (err) {
    console.log("DELETE ERROR:", err);
  }
};
  // ---------------- MENU ----------------
  const openMessageActions = (message) => {
    setSelectedMessage(message);
    setActionVisible(true);
  };

  // ---------------- RENDER MESSAGE ----------------
  const renderItem = ({ item }) => {
    const isMe =
      String(item.sender_id) === String(currentUserId);

    return (
      <TouchableOpacity
        onLongPress={() => openMessageActions(item)}
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
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f3f5" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* BACK */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            position: "absolute",
            top: 0,
            left: 15,
            padding: 10,
            zIndex: 999,
          }}
        >
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>

        {/* TITLE */}
        <Text
          style={{
            textAlign: "center",
            fontSize: 18,
            fontWeight: "bold",
            marginVertical: 10,
          }}
        >
          {listingTitle || "Chat"}
        </Text>

        {/* MESSAGES */}
        <FlatList
          data={messages}
        keyExtractor={(item, index) => item._id?.toString() || index.toString()}
          renderItem={renderItem}
        />

        {/* INPUT */}
        <View
          style={{
            flexDirection: "row",
            padding: 10,
            backgroundColor: "#fff",
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
            onPress={handleSendMessage}
            style={{
              marginLeft: 10,
              backgroundColor: "#111",
              padding: 10,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "#fff" }}>
              {t.send}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* MODAL */}
      {actionVisible && selectedMessage && (
        <Modal transparent>
          <Pressable
            onPress={() => setActionVisible(false)}
            style={{ flex: 1 }}
          />
        </Modal>
      )}
    </SafeAreaView>
  );
}