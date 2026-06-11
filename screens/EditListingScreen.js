import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function EditListingScreen({ route, navigation }) {
  const { listing } = route.params;

  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(String(listing.price));
  const [description, setDescription] = useState(listing.description || "");
  const [loading, setLoading] = useState(false);

  const updateListing = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("access_token");

      const res = await fetch(
        `http://192.168.1.195:8000/listings/${listing._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            price: parseFloat(price),
            description,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Error", data.detail || "Update failed");
        return;
      }

      Alert.alert("Success", "Listing updated");

      navigation.goBack();

    } catch (err) {
      console.log("UPDATE ERROR:", err);
      Alert.alert("Error", "Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#f2f3f5" }}>

      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
        Edit Listing
      </Text>

      <TextInput
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        style={{
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
        }}
      />

      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="Price"
        keyboardType="numeric"
        style={{
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
        }}
      />

      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Description"
        multiline
        style={{
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 10,
          height: 120,
        }}
      />

      <TouchableOpacity
        onPress={updateListing}
        disabled={loading}
        style={{
          marginTop: 20,
          backgroundColor: "#000",
          padding: 14,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          {loading ? "Updating..." : "Save Changes"}
        </Text>
      </TouchableOpacity>

    </View>
  );
}