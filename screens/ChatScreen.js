import React, { useState, useEffect } from "react";
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

import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { SafeAreaView } from "react-native-safe-area-context";

import { useLanguage } from "../Context/LanguageContext";
import { translations } from "../utils/translations";
import { useAuth } from "../Context/AuthContext";

export default function ChatScreen({ route, navigation }) {
  const conversationId = route?.params?.conversationId;
  const otherUserId = route?.params?.otherUserId;
  const listingTitle = route?.params?.listingTitle;

  const { token } = useAuth();

  const currentUserId = token ? jwtDecode(token).sub : null;

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
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId) return;

      try {
        const res = await fetch(
          `http://192.168.1.195:8000/messages/${conversationId}`
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

    loadMessages();
  }, [conversationId]);

  // ---------------- SEND MESSAGE ----------------
  const sendMessage = async () => {
    if (!text.trim()) return;

    if (!token) {
      Alert.alert("Error", "You are not logged in");
      return;
    }

    const msg = text;
    setText("");

    const newMessage = {
      _id: Date.now().toString(),
      text: msg,
      sender_id: currentUserId,
      created_at: new Date().toISOString(),
      replyTo: replyTo || null,
    };

    setMessages((prev) => [...prev, newMessage]);
    setReplyTo(null);

    try {
      const res = await fetch(
        "http://192.168.1.195:8000/messages",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            text: msg,
            receiver_id: otherUserId,
            conversation_id: conversationId,
          }),
        }
      );

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        console.log("SEND FAILED:", data);
        Alert.alert("Error", "Message failed to send");
      } else {
        console.log("MESSAGE SENT OK:", data);
      }
    } catch (err) {
      console.log("SEND MESSAGE ERROR:", err);
      Alert.alert("Error", "Network error");
    }
  };

  // ---------------- DELETE MESSAGE ----------------
  const handleDeleteMessage = async (message) => {
    if (!message?._id) return;

    try {
      const token = await AsyncStorage.getItem("access_token");

      const previousMessages = messages;

      setMessages((prev) =>
        prev.filter((m) => m._id !== message._id)
      );

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
          keyExtractor={(item) => item._id}
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
            onPress={sendMessage}
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