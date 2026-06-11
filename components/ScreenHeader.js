import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

function ScreenHeader({ title, navigation }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 50,
        paddingHorizontal: 15,
        paddingBottom: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 0.5,
        borderBottomColor: "#eee",
      }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: 28 }}>←</Text>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginLeft: 15,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

export default ScreenHeader;