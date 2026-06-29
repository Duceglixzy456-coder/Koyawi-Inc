import React, { useState } from "react";
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

import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../Context/AuthContext";
import { Colors } from "../theme/colors";

function SellScreen({ navigation }) {
  const { token } = useAuth();

  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("Cars");

  const categories = [
    "Cars",
    "Electronics",
    "Clothes",
    "Sneakers",
    "Essentials",
  ];

  // ---------------- PICK IMAGE ----------------
 const pickImage = async () => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,   // ✅ THIS IS THE KEY
      selectionLimit: 5,               // ✅ max 5 photos
      quality: 1,
    });

    if (!result.canceled) {
      const uris = result.assets.map((asset) => asset.uri);

      setImages((prev) => {
        const combined = [...prev, ...uris];
        return combined.slice(0, 5); // hard cap at 5
      });
    }
  } catch (err) {
    console.log("IMAGE PICK ERROR:", err);
  }
};
  // ---------------- REMOVE IMAGE ----------------
  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  // ---------------- CREATE LISTING ----------------
  const createListing = async () => {
    try {
      if (!token) return alert("Please login again");

      if (!title || !price || !description || !images?.length) {
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
      formData.append("price", cleanPrice);
      formData.append("description", description);
      formData.append("category", category);

      images.forEach((img, index) => {
        formData.append("files", {
          uri: img,
          type: "image/jpeg",
          name: `photo_${index}.jpg`,
        });
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
      setImages([]);
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

        {/* IMAGE UPLOADER */}
        <View
          style={{
            height: 190,
            borderRadius: 16,
            backgroundColor: Colors.card,
            marginBottom: 15,
            overflow: "hidden",
          }}
        >
          {/* TAP AREA */}
          <TouchableOpacity
            onPress={pickImage}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: "center",
              alignItems: "center",
              zIndex: images.length === 0 ? 10 : 0,
            }}
          >
            {images.length === 0 && (
              <Text>Tap to add photo</Text>
            )}
          </TouchableOpacity>

          {/* IMAGE SCROLLER */}
          {images.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              {images.map((img, index) => (
                <View key={index} style={{ position: "relative" }}>
                  <Image
                    source={{ uri: img }}
                    style={{
                      width: 160,
                      height: 160,
                      borderRadius: 12,
                      margin: 10,
                    }}
                  />

                  {/* REMOVE */}
                  <TouchableOpacity
                    onPress={() => removeImage(index)}
                    style={{
                      position: "absolute",
                      top: 15,
                      right: 15,
                      backgroundColor: "rgba(0,0,0,0.6)",
                      borderRadius: 20,
                      padding: 5,
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12 }}>
                      X
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}
        </View>

        {/* INPUTS */}
        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={setTitle}
          style={inputStyle}
        />

        <TextInput
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          style={inputStyle}
        />

        <TextInput
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
          style={[inputStyle, { height: 120 }]}
          multiline
        />

        {/* CATEGORY */}
        <Text style={{ fontWeight: "600", marginBottom: 8 }}>
          Category
        </Text>

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
                <Text
                  style={{
                    color: active ? "#fff" : "#333",
                    fontWeight: "600",
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SUBMIT */}
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