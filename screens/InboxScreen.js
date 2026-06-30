import React, {
  useState,
  useEffect,
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

export default function ChatScreen({ route, navigation }) {
 const conversationId = route?.params?.conversationId;
const otherUserId = route?.params?.otherUserId;
const listingTitle = route?.params?.listingTitle;
const otherUserName = route?.params?.otherUserName;
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
const { token } = useAuth();
  // ================= GET USER =================
  useEffect(() => {
  if (!token) return;

  const decoded = jwtDecode(token);
  setCurrentUserId(decoded.sub);
}, [token]);

  // ================= FETCH INBOX =================
const fetchInbox = async () => {
  try {
    if (!token) return;

    setLoading(true);

    const decoded = jwtDecode(token);
    const userId = decoded.sub;

    const res = await fetch(
      `http://192.168.1.194:8000/conversations/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    const sorted = data.sort(
      (a, b) =>
        new Date(b.updated_at || 0) -
        new Date(a.updated_at || 0)
    );

    setConversations(sorted);
  } catch (err) {
    console.log("INBOX ERROR:", err);
  } finally {
    setLoading(false);
  }
};
useEffect(() => {
  if (!token) return;
  fetchInbox();
}, [token]);
  // ================= REFRESH =================
const onRefresh = async () => {
  setRefreshing(true);
  await fetchInbox();
  setRefreshing(false);
};

useEffect(() => {
  if (!conversationId || !token) return;

  const markAsRead = async () => {
    try {
      await fetch(
        `http://192.168.1.194:8000/conversations/${conversationId}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (err) {
      console.log("READ ERROR:", err);
    }
  };

  markAsRead();
}, [conversationId, token]);

useFocusEffect(
  useCallback(() => {
    fetchInbox();
  }, [fetchInbox])
);
const [now, setNow] = useState(Date.now());

useEffect(() => {
  const interval = setInterval(() => {
    setNow(Date.now());
  }, 60000); // update every 60 seconds

  return () => clearInterval(interval);
}, []);
const getTimeAgo = (dateString) => {
  if (!dateString) return "";

  // 🔥 FIX MICROSECONDS (.124000 → .124)
  const cleaned = dateString.split(".")[0] + "Z";

  const date = new Date(cleaned);

  if (isNaN(date.getTime())) {
    console.log("BAD DATE:", dateString);
    return "";
  }

  const now = Date.now();
  const diff = Math.floor((now - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

  return date.toLocaleDateString();
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
           

           if (!token) return;
if (!token) return;

            // prevent double deletion spam
          

            const res = await fetch(
              `http://192.168.1.194:8000/conversations/${conversationId}`,
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
  const renderItem = ({ item }) => {
  const otherUserId =
    item.buyer_id === currentUserId
      ? item.seller_id
      : item.buyer_id;

  const otherUserName =
    item.buyer_id === currentUserId
      ? item.seller_name
      : item.buyer_name;
const listingImage =
  Array.isArray(item.listing_images) && item.listing_images.length > 0
    ? item.listing_images[0]
    : Array.isArray(item.images) && item.images.length > 0
    ? item.images[0]
    : item.listing_image
    ? item.listing_image
    : item.image
    ? item.image
    : item.coverImage
    ? item.coverImage
    : null;

const unread = item?.unread_counts?.[currentUserId] ?? 0;

return (
  <TouchableOpacity
    onPress={() =>
      navigation.navigate("Chat", {
        conversationId: item._id,
        otherUserId,
        listingTitle: item.listing_title,
        otherUserName,
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
    {/* IMAGE */}
    <Image
      source={{
        uri: listingImage || "https://via.placeholder.com/100",
      }}
      style={{
        width: 45,
        height: 45,
        borderRadius: 12,
        marginRight: 12,
      }}
    />

    {/* TEXT */}
    <View style={{ flex: 1 }}>
      
      {/* TITLE ROW + BLUE DOT */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text
          style={{
            fontSize: 15,
            fontWeight: unread > 0 ? "700" : "600",
          }}
          numberOfLines={1}
        >
          {otherUserName || "Unknown"} • {item.listing_title || "Untitled Listing"}
        </Text>

        {unread > 0 && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#1877F2",
              marginLeft: 6,
            }}
          />
        )}
      </View>

      {/* LAST MESSAGE */}
      <Text
        style={{
          fontSize: 13,
          color: unread > 0 ? "#000" : "#777",
          fontWeight: unread > 0 ? "600" : "400",
        }}
        numberOfLines={1}
      >
        {item.last_message || "No messages yet"}
      </Text>
    </View>

   {/* TIME */}
<View style={{ alignItems: "flex-end" }}>
  <Text style={{ fontSize: 11, color: "#999" }}>
  {item.updated_at ? getTimeAgo(item.updated_at) : ""}
  </Text>
</View>
  </TouchableOpacity>
);
  }
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