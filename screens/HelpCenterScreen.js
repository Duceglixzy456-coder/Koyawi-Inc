import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";

function HelpCenterScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER */}
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
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Home"); // fallback
            }
          }}
        >
          <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
          Help Center
        </Text>
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>How can we help you?</Text>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F5F7",
  },

  inboxContainer: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  inboxHeader: {
    paddingTop: 50,
    paddingHorizontal: 15,
    paddingBottom: 10,
  },

  inboxHeaderText: {
    fontSize: 22,
    fontWeight: "700",
  },

  inboxCard: {
    flexDirection: "row",
    padding: 14,
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 16,
  },

  inboxAvatar: {
    width: 45,
    height: 45,
    borderRadius: 12,
    marginRight: 12,
  },

  inboxMiddle: {
    flex: 1,
  },

  inboxTitle: {
    fontSize: 15,
    fontWeight: "600",
  },

  inboxMessage: {
    fontSize: 13,
    color: "#777",
  },

  inboxRight: {
    alignItems: "flex-end",
  },

  inboxTime: {
    fontSize: 11,
    color: "#999",
  },

  inboxDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "red",
    marginTop: 6,
  },
});

export default HelpCenterScreen;