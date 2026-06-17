import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "../theme/colors";

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= TIME AGO =================
  const timeAgo = (date) => {
    if (!date) return "";

    const parsed = new Date(date);
    if (isNaN(parsed.getTime())) return "";

    const diff = Math.floor((Date.now() - parsed) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  // ================= FETCH =================
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("access_token");

      const res = await fetch("http://192.168.1.194:8000/notifications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      console.log("NOTIFICATIONS:", data);

      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("NOTIFICATIONS ERROR:", err);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  // ================= LOADING =================
  if (loading) {
    return (
      <View style={styles.empty}>
        <Text>Loading...</Text>
      </View>
    );
  }

  // ================= EMPTY =================
  if (!loading && notifications.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="notifications-outline" size={34} color="#999" />
        <Text style={styles.emptyText}>No recent activity</Text>
      </View>
    );
  }

  // ================= RENDER ITEM =================
  const renderItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Image
          source={{
            uri:
              item.from_profile_image ||
              "https://via.placeholder.com/50",
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
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account Activity</Text>
      </View>

      {/* LIST */}
      <FlatList
        data={notifications}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15, paddingTop: 5 }}
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
  },

  emptyText: {
    marginTop: 10,
    color: "#999",
    fontWeight: "500",
  },
});