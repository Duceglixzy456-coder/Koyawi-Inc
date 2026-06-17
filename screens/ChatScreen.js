import React, { useState, useEffect, useRef } from "react";
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
import * as Clipboard from "expo-clipboard";

import { useLanguage } from "../Context/LanguageContext"; // ✅ FIXED
import { translations } from "../utils/translations";

export default function ChatScreen({ route, navigation }) {
  const conversationId = route?.params?.conversationId;
  const otherUserId = route?.params?.otherUserId;
  const listingTitle = route?.params?.listingTitle;
 

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  const [replyTo, setReplyTo] = useState(null);

  const [actionVisible, setActionVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const { language, toggleLanguage } = useLanguage();
  const t = translations[language];
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
  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationId) return;

      const res = await fetch(
        `http://192.168.1.194:8000/messages/${conversationId}`
      );

      const data = await res.json();

      const sorted = data.sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );

      setMessages(sorted);
    };

    loadMessages();
  }, [conversationId]);

  // ---------------- DELETE ----------------
  const handleDeleteMessage = async (message) => {
  if (!message?._id) return;

  Alert.alert(
    "Delete Message",
    "Are you sure you want to delete this message?",
    [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("access_token");

            // Save current messages for rollback
            const previousMessages = messages;

            // Remove immediately from UI
            setMessages((prev) =>
              prev.filter((m) => m._id !== message._id)
            );

            const res = await fetch(
              `http://192.168.1.194:8000/messages/${message._id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!res.ok) {
              // Restore if backend fails
              setMessages(previousMessages);

              Alert.alert(
                "Error",
                "Could not delete message."
              );

              return;
            }
          } catch (err) {
            console.log("DELETE ERROR:", err);

            Alert.alert(
              "Error",
              "Network error while deleting."
            );
          }
        },
      },
    ]
  );
};
  // ---------------- OPEN MENU ----------------
  const openMessageActions = (message, event) => {
    const { pageX, pageY } = event.nativeEvent;

    setSelectedMessage(message);
    setMenuPosition({ x: pageX, y: pageY });
    setActionVisible(true);
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
      replyTo: replyTo || null,
    };

    setMessages((prev) => [...prev, newMessage]);
    setReplyTo(null);

    ws.current?.send(
      JSON.stringify({
        text: msg,
        receiver_id: otherUserId,
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
        `ws://192.168.1.194:8000/ws/${decoded.sub}`
      );

      ws.current = socket;

      socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        const newMessage = {
          _id: Date.now().toString(),
          text: msg.text || msg,
          sender_id: msg.sender_id,
          created_at: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMessage]);
      };
    };

    connect();

    return () => ws.current?.close();
  }, []);

  // ---------------- RENDER ----------------
  const renderItem = ({ item }) => {
    const isMe = item.sender_id === currentUserId;

    return (
      <TouchableOpacity
        onLongPress={(e) => openMessageActions(item, e)}
        style={{
          alignSelf: isMe ? "flex-end" : "flex-start",
          backgroundColor: isMe ? "#111" : "#fff",
          padding: 12,
          marginVertical: 4,
          borderRadius: 18,
          maxWidth: "80%",
        }}
      >
        {item.replyTo && (
          <View
            style={{
              backgroundColor: "#eee",
              padding: 6,
              borderRadius: 8,
              marginBottom: 6,
            }}
          >
            <Text style={{ fontSize: 11 }}>Replying to:</Text>
            <Text numberOfLines={1}>{item.replyTo.text}</Text>
          </View>
        )}

        <Text style={{ color: isMe ? "#fff" : "#000" }}>
          {item.text}
        </Text>
      </TouchableOpacity>
    );
  };

  // ---------------- UI ----------------
return (
  <SafeAreaView style={{ flex: 1, backgroundColor: "#f2f3f5" }}>
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          top: 0,
          left: 15,
          backgroundColor: "rgba(255,255,255,0.25)",
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 14,
          zIndex: 999,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>←</Text>
      </TouchableOpacity>

      {/* TITLE */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "bold",
          textAlign: "center",
          marginTop: 0,
          marginBottom: 10,
        }}
      >
       {listingTitle || t.chat}
      </Text>

      {/* MESSAGES */}
      <FlatList
        data={messages}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 10,
          paddingBottom: 10,
        }}
      />

      {/* REPLY BAR */}
      {replyTo && (
        <View
          style={{
            padding: 8,
            backgroundColor: "#eee",
            marginHorizontal: 10,
            borderRadius: 10,
          }}
        >
          <Text>Replying to: {replyTo.text}</Text>

          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Text style={{ color: "red", marginTop: 4 }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

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
        <Text style={{ color: "#fff" }}>{t.send}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>

    {/* MESSAGE ACTION MODAL */}
    {actionVisible && selectedMessage && (
      <Modal transparent animationType="fade">
        <Pressable
          onPress={() => {
            setActionVisible(false);
            setSelectedMessage(null);
          }}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.3)",
          }}
        >
          <View
            style={{
              position: "absolute",
              top: Math.max(menuPosition.y - 100, 60),
              left: Math.max(menuPosition.x - 80, 20),
              backgroundColor: "#fff",
              borderRadius: 10,
              width: 150,
              overflow: "hidden",
            }}
          >
            <TouchableOpacity
              onPress={async () => {
                try {
                  await Clipboard.setStringAsync(
                    selectedMessage.text || ""
                  );
                  Alert.alert("Copied", "Message copied");
                } catch (err) {
                  Alert.alert("Error", "Could not copy");
                }
                setActionVisible(false);
                setSelectedMessage(null);
              }}
              style={{ padding: 12 }}
            >
              <Text>Copy</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setReplyTo(selectedMessage);
                setActionVisible(false);
                setSelectedMessage(null);
              }}
              style={{ padding: 12 }}
            >
              <Text>Reply</Text>
            </TouchableOpacity>

            {selectedMessage?.sender_id === currentUserId && (
              <TouchableOpacity
                onPress={() => {
                  handleDeleteMessage(selectedMessage);
                  setActionVisible(false);
                  setSelectedMessage(null);
                }}
                style={{ padding: 12 }}
              >
                <Text style={{ color: "red" }}>Delete</Text>
              </TouchableOpacity>
            )}
          </View>
        </Pressable>
      </Modal>
    )}
  </SafeAreaView>
);
}