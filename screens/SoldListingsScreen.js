import React, { useEffect, useState } from "react";
import { View, Text, FlatList, Image, TouchableOpacity } from "react-native";
import { useAuth } from "../Context/AuthContext";

export default function SoldListingsScreen({ navigation, route }) {
  const { token } = useAuth();
  const userId = route.params?.userId;

  const [soldListings, setSoldListings] = useState([]);

  useEffect(() => {
    fetchSold();
  }, []);

  const fetchSold = async () => {
    try {
      const res = await fetch("http://192.168.1.194:8000/listings");
      const data = await res.json();

      const filtered = data.filter(
        (item) =>
          String(item.owner_id) === String(userId) &&
          item.status === "sold"
      );

      setSoldListings(filtered);
    } catch (err) {
      console.log("SOLD FETCH ERROR:", err);
    }
  };

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
    viewOnly: true
  })
}
        style={{
          backgroundColor: "#fff",
          margin: 10,
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <Image
          source={{ uri: image }}
          style={{ width: "100%", height: 180 }}
        />

        <View style={{ padding: 10 }}>
          <Text numberOfLines={1} style={{ fontWeight: "600" }}>
            {item.title}
          </Text>

          <Text style={{ color: "#444", marginTop: 4 }}>
            ${item.price}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F2F2F7" }}>
      <FlatList
        data={soldListings}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", marginTop: 50 }}>
            No sold items yet
          </Text>
        }
      />
    </View>
  );
}