import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  SafeAreaView,
  Alert
} from "react-native";

import React, { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {jwtDecode } from "jwt-decode";
import { RefreshControl } from "react-native";


export default function InboxScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // ================= GET USER =================
  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const decoded = jwtDecode(token);
      setCurrentUserId(decoded.sub);
    };

    loadUser();
  }, []);

  // ================= FETCH INBOX =================
 const fetchInbox = async () => {
  try {
    setLoading(true);

    const token = await AsyncStorage.getItem("access_token");
    if (!token) return;

    const decoded = jwtDecode(token);
    const userId = decoded.sub;

    const res = await fetch(
      `http://192.168.1.195:8000/conversations/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    const sorted = data.sort(
      (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
    );

    setConversations(sorted);
  } catch (err) {
    console.log("INBOX ERROR:", err);
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    fetchInbox();
  }, []);

  // ================= REFRESH =================
const onRefresh = async () => {
  setRefreshing(true);
  await fetchInbox();
  setRefreshing(false);
};
  // ================= DELETE CONVERSATION =================
const handleLongPressConversation = (conversationId) => {
  if (!conversationId) {
    console.log("BLOCKED: Missing conversationId");
    return;
  }

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
            const token = await AsyncStorage.getItem("access_token");

            if (!token) {
              console.log("BLOCKED: No token");
              return;
            }

            // prevent double deletion spam
            setConversations((prev) => prev); 

            const res = await fetch(
              `http://192.168.1.195:8000/conversations/${conversationId}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            // safer response handling
            const data = await res.json().catch(() => null);

            if (!res.ok) {
              console.log("DELETE FAILED:", data || res.status);
              Alert.alert("Error", "Could not delete conversation.");
              return;
            }

            // safe UI update
            setConversations((prev) =>
              prev.filter((c) => c._id !== conversationId)
            );

          } catch (err) {
            console.log("DELETE CONVO ERROR:", err);
            Alert.alert("Error", "Network error. Try again.");
          }
        },
      },
    ],
    { cancelable: true }
  );
};
  // ================= RENDER ITEM =================
  const renderItem = ({ item }) => {
  const otherUserId =
    item.buyer_id === currentUserId
      ? item.seller_id
      : item.buyer_id;

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Chat", {
          conversationId: item._id,
          otherUserId,
          listingTitle: item.listing_title,
        })
      }
      onLongPress={() => handleLongPressConversation(item._id)}
      delayLongPress={400}
      style={{
        flexDirection: "row",
        padding: 14,
        marginBottom: 10,
        backgroundColor: "#fff",
        borderRadius: 14,
        alignItems: "center",
      }}
    >
      <Image
        source={{
          uri: item.listing_image || "https://via.placeholder.com/100",
        }}
        style={{
          width: 45,
          height: 45,
          borderRadius: 12,
          marginRight: 12,
        }}
      />

      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 15, fontWeight: "600" }} numberOfLines={1}>
          {item.listing_title || "Untitled Listing"}
        </Text>

        <Text style={{ fontSize: 13, color: "#777" }} numberOfLines={1}>
          {item.last_message || "No messages yet"}
        </Text>
      </View>

      <View style={{ alignItems: "flex-end" }}>
        <Text style={{ fontSize: 11, color: "#999" }}>
          {item.updated_at
            ? new Date(item.updated_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : ""}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
  // ================= UI =================
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F6F7FB" }}>
      {/* HEADER */}
      <View
        style={{
          paddingHorizontal: 15,
          paddingVertical: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "700" }}>
          Inbox
        </Text>
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
  contentContainerStyle={{
    padding: 15,
    paddingBottom: 30,
  }}
  refreshing={refreshing}
  onRefresh={onRefresh}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
    />
  }
/>
      )}
    </SafeAreaView>
  );
}