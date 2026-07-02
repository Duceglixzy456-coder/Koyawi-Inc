import React, { useEffect, useState, useCallback } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { apiFetch } from "../api/apiFetch";
import { useFocusEffect } from "@react-navigation/native";

export default function SoldListingsScreen({ navigation }) {

  const [soldListings, setSoldListings] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------------- REFRESH ON FOCUS ----------------
  useFocusEffect(
    useCallback(() => {
      fetchSold();
    }, [])
  );

  // ---------------- FETCH SOLD ----------------
  const fetchSold = async () => {
    try {
      setLoading(true);

      const res = await apiFetch("/listings");
      const data = await res.json();

      const list = Array.isArray(data) ? data : [];

      const filtered = list.filter((item) =>
        String(item.status).toLowerCase().trim() === "sold"
      );

      setSoldListings(filtered);
    } catch (err) {
      console.log("SOLD FETCH ERROR:", err);
      setSoldListings([]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------- RENDER ITEM ----------------
  const renderItem = ({ item }) => {
    const image =
      item.images?.[0] ||
      item.image ||
      item.coverImage ||
      "https://via.placeholder.com/300";

    return (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate("ListingDetailScreen", {
            listing: item,
            viewOnly: true,
          })
        }
        activeOpacity={0.9}
        style={{
          backgroundColor: "#fff",
          marginHorizontal: 12,
          marginBottom: 12,
          borderRadius: 18,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOpacity: 0.08,
          shadowRadius: 10,
          elevation: 3,
        }}
      >
        {/* IMAGE */}
        <View style={{ position: "relative" }}>
          <Image source={{ uri: image }} style={{ width: "100%", height: 200 }} />

          <View
            style={{
              position: "absolute",
              top: 10,
              left: 10,
              backgroundColor: "#000",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 12, fontWeight: "700" }}>
              SOLD
            </Text>
          </View>
        </View>

        {/* INFO */}
        <View style={{ padding: 14 }}>
          <Text numberOfLines={1} style={{ fontSize: 16, fontWeight: "800" }}>
            {item.title}
          </Text>

          <Text style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
            Sold for{" "}
            <Text style={{ fontWeight: "700", color: "#111" }}>
              ${item.price}
            </Text>
          </Text>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 10,
            }}
          >
            <Text style={{ fontSize: 12, color: "#999" }}>
              Buyer: {item.sold_to ? "Completed" : "Unknown"}
            </Text>

            <Text style={{ fontSize: 12, color: "#999" }}>
              Tap to view
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ---------------- UI ----------------
  return (
    <View style={{ flex: 1, backgroundColor: "#F6F7FB" }}>

      {/* HEADER */}
      <View
        style={{
          paddingTop: 55,
          paddingBottom: 15,
          paddingHorizontal: 16,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderColor: "#eee",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 10,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f2f2f2",
          }}
        >
          <Text style={{ fontSize: 18 }}>←</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "800", marginLeft: 12 }}>
          Sold Items
        </Text>
      </View>

      {/* LIST */}
      <FlatList
        data={soldListings}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchSold}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 30 }}
        ListEmptyComponent={
          <View style={{ marginTop: 80, alignItems: "center" }}>
            <Text style={{ fontSize: 16, fontWeight: "700" }}>
              No sold items yet
            </Text>
            <Text style={{ color: "#888", marginTop: 6 }}>
              Once you sell items, they will appear here
            </Text>
          </View>
        }
      />
    </View>
  );
}