import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import { Colors } from "../theme/colors";

function SellScreen({ navigation }) {
  const [token, setToken] = useState(null);

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("Cars");

  const categories = [
    "Cars",
    "Electronics",
    "Clothes",
    "Sneakers",
    "Essentials",
  ];

  useEffect(() => {
    const loadToken = async () => {
      const stored = await AsyncStorage.getItem("access_token");
      setToken(stored);
    };

    loadToken();
  }, []);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setImage(result.assets[0].uri);
      }
    } catch (err) {
      console.log("IMAGE PICK ERROR:", err);
    }
  };

  const createListing = async () => {
    try {
      if (!token) return alert("Please login again");

      if (!title || !price || !description || !image) {
        alert("Please fill all fields and add an image.");
        return;
      }

      const cleanPrice = Number(price.replace(/[$,]/g, ""));
      if (isNaN(cleanPrice) || cleanPrice <= 0) {
        alert("Enter a valid price.");
        return;
      }

      setLoading(true);

      const formData = new FormData();

      formData.append("title", title);
      formData.append("price", price);
      formData.append("description", description);
      formData.append("category", category);

      formData.append("file", {
        uri: image,
        type: "image/jpeg",
        name: "photo.jpg",
      });

      const res = await fetch("http://192.168.1.194:8000/listings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("UPLOAD ERROR:", data);
        alert(data.detail || "Failed to post listing");
        return;
      }

      setTitle("");
      setPrice("");
      setDescription("");
      setImage(null);
      setCategory("Cars");

      navigation.navigate("Home");
    } catch (err) {
      console.log("NETWORK ERROR:", err);
      alert("Network error");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    backgroundColor: Colors.card,
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    marginBottom: 10,
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: Colors.background }}
    >
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 100 }}>
        <Text style={{ fontSize: 28, fontWeight: "700", marginBottom: 18 }}>
          Sell your item
        </Text>

        {/* IMAGE */}
        <TouchableOpacity
          onPress={pickImage}
          style={{
            height: 190,
            borderRadius: 16,
            backgroundColor: Colors.card,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 15,
            overflow: "hidden",
          }}
        >
          {image ? (
            <Image source={{ uri: image }} style={{ width: "100%", height: "100%" }} />
          ) : (
            <Text>Tap to add photo</Text>
          )}
        </TouchableOpacity>

        {/* INPUTS */}
        <TextInput placeholder="Title" value={title} onChangeText={setTitle} style={inputStyle} />

        <TextInput placeholder="Price" value={price} onChangeText={setPrice} style={inputStyle} />

        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={[inputStyle, { height: 120 }]}
          multiline
        />

        {/* CATEGORY PICKER */}
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>Category</Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 15 }}>
          {categories.map((item) => {
            const active = category === item;

            return (
              <TouchableOpacity
                key={item}
                onPress={() => setCategory(item)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  margin: 5,
                  backgroundColor: active ? "#111" : "#eee",
                }}
              >
                <Text style={{ color: active ? "#fff" : "#333", fontWeight: "600" }}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* BUTTON */}
        <TouchableOpacity
          onPress={createListing}
          style={{
            marginTop: 10,
            backgroundColor: Colors.primary,
            padding: 15,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={{ color: "#fff", fontWeight: "600" }}>
              Post Listing
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default SellScreen;