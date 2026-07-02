import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";

import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import NotificationSkeleton from "../components/Skeletons/NotificationSkeleton";
import { Colors } from "../theme/colors";
import { useAuth } from "../Context/AuthContext";
import { apiFetch } from "../api/apiClient";

export default function NotificationsScreen({ navigation }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const { token } = useAuth();
  const hasLoadedOnce = useRef(false);

  // ================= TIME AGO =================
const timeAgo = (dateString) => {
  if (!dateString) return "";

  const cleaned = dateString?.split(".")[0] + "Z";
  const date = new Date(cleaned);

  if (isNaN(date.getTime())) return "";

  const diff = Math.floor((Date.now() - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return `${Math.floor(diff / 86400)} days ago`;
};
  // ================= FETCH =================
const fetchNotifications = async (silent = false) => {
  try {
    if (!silent) setLoading(true);

    const res = await apiFetch("/notifications");

    // 🔥 IMPORTANT: handle auth failure cleanly
    if (res.status === 401) {
      console.log("Unauthorized - token issue");
      setNotifications([]);
      return;
    }

    if (!res.ok) {
      const errText = await res.text();
      console.log("NOTIFICATIONS ERROR:", errText);
      return;
    }

    const data = await res.json();

    setNotifications(Array.isArray(data) ? data : []);
    hasLoadedOnce.current = true;

  } catch (err) {
    console.log("Notifications error:", err);
    setNotifications([]);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
};
  // ================= FOCUS LOAD =================
  useFocusEffect(
    useCallback(() => {
      if (token) {
        fetchNotifications();
      }
    }, [token])
  );

  // ================= RENDER ITEM =================
  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Image
          source={{
            uri: item.from_profile_image || "https://via.placeholder.com/50",
          }}
          style={styles.avatar}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {item.from_name || "User"}
          </Text>

          <Text style={styles.text}>
            {item.text || "New activity"}
          </Text>

          <Text style={styles.time}>
  {timeAgo(item.created_at)}
</Text>
        </View>

        <Ionicons name="notifications" size={18} color="#999" />
      </View>
    );
  };

  // ================= UI =================
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Account Activity</Text>
        </View>

        <NotificationSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Activity</Text>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15, paddingTop: 5 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="notifications-outline" size={34} color="#999" />
            <Text style={styles.emptyText}>No recent activity</Text>
          </View>
        }
      />
    </View>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  header: {
    paddingTop: 70,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: Colors.text,
  },

  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },

  name: {
    fontWeight: "700",
    fontSize: 14,
  },

  text: {
    color: "#444",
    marginTop: 2,
  },

  time: {
    marginTop: 4,
    fontSize: 11,
    color: "#999",
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 100,
  },

  emptyText: {
    marginTop: 10,
    color: "#999",
    fontWeight: "500",
  },
});