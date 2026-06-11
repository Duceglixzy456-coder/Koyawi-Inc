import { Ionicons } from "@expo/vector-icons";

import React from "react";
import { View, Text, StyleSheet, FlatList } from "react-native";


function NotificationsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Ionicons name="notifications-outline" size={24} color="black" />
      <Text style={{ marginTop: 10 }}>No notifications yet</Text>
    </View>
  );
}

export default NotificationsScreen;