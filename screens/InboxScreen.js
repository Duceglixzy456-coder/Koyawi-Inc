import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  RefreshControl,
} from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import { useSocket } from "../realtime/SocketContext";
import { useAuth } from "../Context/AuthContext";
import { apiFetch } from "../api/apiFetch";

export default function InboxScreen({ navigation }) {
  // ================= STATE =================
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { addMessageListener } = useSocket();
  const { user, token } = useAuth();
  const currentUserId = user?.id;

  // ================= FETCH INBOX =================
  const fetchInbox = useCallback(async () => {
    try {
      if (!token || !currentUserId) return;

      setLoading(true);

      const res = await apiFetch(`/conversations/${currentUserId}`);

      if (!res.ok) {
        const errText = await res.text();
        console.log("INBOX API ERROR:", errText);
        setConversations([]);
        return;
      }

      const data = await res.json().catch(() => {
        console.log("INBOX JSON PARSE FAILED");
        return [];
      });

      const sorted = (Array.isArray(data) ? data : []).sort((a, b) => {
        const aTime = new Date(a.updated_at || 0).getTime();
        const bTime = new Date(b.updated_at || 0).getTime();
        return bTime - aTime;
      });

      setConversations(sorted);
    } catch (err) {
      console.log("INBOX ERROR:", err);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  }, [token, currentUserId]);

  // ================= REFRESH =================
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInbox();
    setRefreshing(false);
  };

  // ================= FOCUS LOAD =================
  useFocusEffect(
    useCallback(() => {
      fetchInbox();
    }, [fetchInbox])
  );

  // ================= SOCKET UPDATES =================
  useEffect(() => {
    if (!addMessageListener || !currentUserId) return;

    const unsub = addMessageListener((msg) => {
      if (!msg?.conversation_id) return;

      setConversations((prev) =>
        prev.map((conv) =>
          conv._id === msg.conversation_id
            ? {
                ...conv,
                last_message: msg.text || "",
                last_sender_id: msg.sender_id,
                updated_at: msg.created_at || new Date().toISOString(),
              }
            : conv
        )
      );
    });

    return unsub;
  }, [addMessageListener, currentUserId]);

  // ================= TIME AGO =================
  const getTimeAgo = (dateString) => {
    if (!dateString) return "";

    try {
      const cleaned = dateString.split(".")[0] + "Z";
      const date = new Date(cleaned);

      if (isNaN(date.getTime())) return "";

      const diff = Math.floor((Date.now() - date.getTime()) / 1000);

      if (diff < 60) return "just now";
      if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
      if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

      return date.toLocaleDateString();
    } catch {
      return "";
    }
  };

  // ================= DELETE =================
  const handleLongPressConversation = (conversationId) => {
    if (!conversationId) return;

    Alert.alert(
      "Delete Conversation",
      "This will permanently remove this chat for you.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const res = await apiFetch(`/conversations/${conversationId}`, {
                method: "DELETE",
              });

              if (!res.ok) {
                const text = await res.text();
                console.log("DELETE FAILED:", text);
                return;
              }

              setConversations((prev) =>
                prev.filter((c) => c._id !== conversationId)
              );
            } catch (err) {
              console.log("DELETE ERROR:", err);
            }
          },
        },
      ]
    );
  };

  // ================= RENDER ITEM =================
  const renderItem = ({ item }) => {
    const isMine = item.last_sender_id === currentUserId;

    const unread = Number(item.unread_count || 0);

    return (
      <TouchableOpacity
        onPress={() => {
          if (!item?._id) return;

          navigation.navigate("Chat", {
            conversationId: item._id,
            listingId: item.listing_id,
            otherUserId:
              item.buyer_id === currentUserId
                ? item.seller_id
                : item.buyer_id,
          });
        }}
        onLongPress={() => handleLongPressConversation(item._id)}
        style={{
          flexDirection: "row",
          padding: 14,
          marginBottom: 10,
          backgroundColor: "#fff",
          borderRadius: 14,
          alignItems: "center",
        }}
      >
        {/* IMAGE */}
        <Image
          source={{
            uri:
              item.image ||
              item.listing_image ||
              item.coverImage ||
              "https://via.placeholder.com/50",
          }}
          style={{
            width: 50,
            height: 50,
            borderRadius: 10,
            marginRight: 10,
            backgroundColor: "#eee",
          }}
        />

        {/* TEXT */}
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "600" }}>
            {item.buyer_id === currentUserId
              ? item.seller_name
              : item.buyer_name}{" "}
            • {item.listing_title}
          </Text>

          <Text
            numberOfLines={1}
            style={{
              fontSize: 13,
              color: unread ? "#000" : "#777",
              fontWeight: unread ? "600" : "400",
            }}
          >
            {isMine
              ? `You: ${item.last_message || ""}`
              : item.last_message || "No messages yet"}
          </Text>
        </View>

        {/* TIME */}
        <Text style={{ fontSize: 11, color: "#999" }}>
          {getTimeAgo(item.updated_at)}
        </Text>
      </TouchableOpacity>
    );
  };

  // ================= UI =================
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
      {/* HEADER */}
      <View
        style={{
          padding: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700" }}>Inbox</Text>
      </View>

      {/* BODY */}
      {loading && conversations.length === 0 ? (
        <View style={{ flex: 1, justifyContent: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: 15 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
}
const styles = {
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  header: {
    padding: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
  },

  card: {
    flexDirection: "row",
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 14,
    alignItems: "center",
  },

  image: {
    width: 50,
    height: 50,
    borderRadius: 10,
    marginRight: 10,
    backgroundColor: "#eee",
  },

  title: {
    fontSize: 15,
    fontWeight: "600",
  },

  message: {
    fontSize: 13,
  },

  messageUnread: {
    color: "#000",
    fontWeight: "600",
  },

  messageRead: {
    color: "#777",
    fontWeight: "400",
  },

  time: {
    fontSize: 11,
    color: "#999",
  },
};