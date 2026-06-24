import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function SessionExpiredScreen({ navigation }) {
  return (
    <View style={{
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#fff",
      padding: 20
    }}>
      <Text style={{ fontSize: 22, fontWeight: "700" }}>
        Session Expired
      </Text>

      <Text style={{ marginTop: 10, textAlign: "center", color: "#666" }}>
        Your session has ended. Please log in again to continue.
      </Text>

      <TouchableOpacity
        onPress={() => navigation.replace("Login")}
        style={{
          marginTop: 20,
          backgroundColor: "#111",
          paddingVertical: 12,
          paddingHorizontal: 25,
          borderRadius: 10
        }}
      >
        <Text style={{ color: "#fff" }}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}