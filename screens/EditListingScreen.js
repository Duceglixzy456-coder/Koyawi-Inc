import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";

import ScreenHeader from "../components/ScreenHeader";
import { apiFetch } from "../api/apiClient";

export default function EditListingScreen({ route, navigation }) {
  const { listing } = route.params;

  const [title, setTitle] = useState(listing.title);
  const [price, setPrice] = useState(String(listing.price || ""));
  const [description, setDescription] = useState(listing.description || "");
  const [loading, setLoading] = useState(false);

  // ---------------- UPDATE LISTING ----------------
  const updateListing = async () => {
    try {
      setLoading(true);

      const res = await apiFetch(`/listings/${listing._id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: title.trim(),
          price: Number(price),
          description: description.trim(),
        }),
      });

      let data = null;

      try {
        data = await res.json();
      } catch (e) {
        data = null;
      }

      if (!res.ok) {
        Alert.alert("Error", data?.detail || "Update failed");
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
    <View style={{ flex: 1, backgroundColor: "#f4f5f7" }}>
      
      {/* HEADER */}
      <ScreenHeader title="Edit Listing" navigation={navigation} />

      {/* CONTENT */}
      <ScrollView
        style={{ paddingHorizontal: 16, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
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
            opacity: loading ? 0.6 : 1,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            {loading ? "Updating..." : "Save Changes"}
          </Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}