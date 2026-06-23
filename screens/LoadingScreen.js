import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";

export default function LoadingScreen() {
  const { token } = useAuth();

  const validateToken = async () => {
    try {
      if (!token) {
        await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
        return; // ❌ no navigation
      }

      let decoded;

      try {
        decoded = jwtDecode(token);
      } catch (e) {
        await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
        return; // ❌ no navigation
      }

      // ⛔ CHECK EXPIRY
      if (!decoded?.exp || decoded.exp * 1000 < Date.now()) {
        await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
        return; // ❌ no navigation
      }

      // valid token → do nothing (RootNavigator handles UI)
    } catch (err) {
      console.log("LOADING ERROR:", err);
      await AsyncStorage.multiRemove(["access_token", "refresh_token"]);
    }
  };

  useEffect(() => {
    validateToken();
  }, [token]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text>Loading...</Text>
    </View>
  );
}