import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../Context/AuthContext";

export default function LoadingScreen() {
  const { token, logout } = useAuth();

  const validateToken = async () => {
    try {
      if (!token) {
        logout();
        return;
      }

      let decoded;

      try {
        decoded = jwtDecode(token);
      } catch (e) {
        logout();
        return;
      }

      if (!decoded?.exp || decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }
    } catch (err) {
      console.log("LOADING ERROR:", err);
      logout();
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