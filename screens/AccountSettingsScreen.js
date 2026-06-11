import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

function AccountSettingsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* BACK BUTTON (GLASS STYLE - consistent across app) */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          top: 50,
          left: 20,
          backgroundColor: "rgba(255,255,255,0.25)",
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.4)",
          zIndex: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>←</Text>
      </TouchableOpacity>

      {/* HEADER */}
      <View
        style={{
          paddingTop: 50,
          paddingHorizontal: 15,
          paddingBottom: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 40 }}>
          Account Settings
        </Text>
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Account settings coming soon! ❤️</Text>
      </View>

    </View>
  );
}

export default AccountSettingsScreen;