import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

export default function ScreenHeader({ title, navigation }) {
  return (
    <View>

      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          top: 50,
          left: 15,
          backgroundColor: "rgba(255,255,255,0.25)",
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 14,
          zIndex: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>←</Text>
      </TouchableOpacity>

      {/* TITLE */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginTop: 60,
          marginBottom: 10,
          textAlign: "center",
        }}
      >
        {title}
      </Text>

    </View>
  );
}