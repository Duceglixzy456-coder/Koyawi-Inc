import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import  jwtDecode from "jwt-decode";

export default function LoadingScreen({ navigation }) {
  useEffect(() => {
    const loadApp = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");

        if (!token) {
          navigation.replace("Login");
          return;
        }

        let decoded;
        try {
          decoded = jwtDecode(token);
        } catch (e) {
          await AsyncStorage.removeItem("access_token");
          navigation.replace("Login");
          return;
        }

        // ⛔ CHECK EXPIRY
        if (decoded.exp * 1000 < Date.now()) {
          await AsyncStorage.removeItem("access_token");
          navigation.replace("Login");
          return;
        }

        navigation.replace("MainApp");

      } catch (err) {
        console.log("LOADING ERROR:", err);
        navigation.replace("Login");
      }
    };

    loadApp();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text>Loading...</Text>
    </View>
  );
}