import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";

import { useAuth } from "../Context/AuthContext";
import { apiFetch } from "../api/apiClient";

export default function SavedItemsScreen({ navigation }) {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSaved = async () => {
    try {
      setLoading(true);

      const res = await apiFetch("/saved");

      if (!res.ok) {
        const err = await res.text();
        console.log("SAVED ERROR:", err);
        setSaved([]);
        return;
      }

      const data = await res.json();

      console.log("SAVED RAW:", data);

      setSaved(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("SAVED ERROR:", err);
      setSaved([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>
      
      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          top: 50,
          left: 15,
          padding: 8,
          backgroundColor: "#fff",
          borderRadius: 12,
          zIndex: 10,
        }}
      >
        <Text style={{ fontSize: 16 }}>←</Text>
      </TouchableOpacity>

      {/* TITLE */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginTop: 60,
          textAlign: "center",
        }}
      >
        Saved Items
      </Text>

      {/* EMPTY STATE */}
      {!loading && saved.length === 0 && (
        <Text style={{ textAlign: "center", marginTop: 40, color: "#666" }}>
          No saved items yet
        </Text>
      )}

      {/* LIST */}
      <FlatList
        data={saved}
        keyExtractor={(item) => item._id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        contentContainerStyle={{
          padding: 10,
          paddingBottom: 100,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ListingDetailScreen", {
                listingId: item.listing_id,
              })
            }
            style={{
              backgroundColor: "#fff",
              width: "48%",
              marginBottom: 12,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Image
              source={{ uri: item.image }}
              style={{ width: "100%", height: 120 }}
            />

            <View style={{ padding: 8 }}>
              <Text numberOfLines={1} style={{ fontWeight: "600" }}>
                {item.title}
              </Text>
              <Text>${item.price}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}