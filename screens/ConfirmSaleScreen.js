import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
export default function ConfirmSaleScreen({ route, navigation }) {
  const { conversation, listing_id } = route.params;

  const [loading, setLoading] = useState(false);

  const confirmSale = async () => {
  try {
    setLoading(true);

    const token = await AsyncStorage.getItem("token");

    const res = await fetch(
      `http://192.168.1.194:8000/listings/${listing_id}/mark-sold`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversation._id,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.log("SALE FAILED:", data);
      setLoading(false);
      return;
    }

    console.log("SALE SUCCESS:", data);

    // 🔥 STEP 1: show success alert
    Alert.alert("Success", "Listing marked as sold");

    // 🔥 STEP 2: go back ONLY ONE SCREEN
   navigation.pop(2);

  } catch (err) {
    console.log("CONFIRM SALE ERROR:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Confirm Sale</Text>

      <Text style={styles.label}>Buyer:</Text>
      <Text style={styles.value}>{conversation.buyer_id}</Text>

      <Text style={styles.label}>Last Message:</Text>
      <Text style={styles.value}>
        {conversation.last_message || "No message"}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={confirmSale}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Mark as Sold</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 16,
    justifyContent: "center",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: "#666",
    marginTop: 10,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
  button: {
    marginTop: 30,
    backgroundColor: "green",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});