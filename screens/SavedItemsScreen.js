import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SavedItemsScreen({ navigation }) {
  const [saved, setSaved] = useState([]);

  const fetchSaved = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const res = await fetch("http://192.168.1.195:8000/saved", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setSaved(data);
    } catch (err) {
      console.log("SAVED ERROR:", err);
    }
  };

  useEffect(() => {
    fetchSaved();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5", padding: 10 }}>

      {/* 🔙 GLASS BACK BUTTON */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          top: 50,
          left: 15,

          backgroundColor: "rgba(255,255,255,0.25)",
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.4)",
          zIndex: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>←</Text>
      </TouchableOpacity>

      {/* TITLE */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginBottom: 10,
          marginTop: 40,
          textAlign: "center",
        }}
      >
        Saved Items
      </Text>

      {/* LIST */}
      <FlatList
        data={saved}
        numColumns={2}
        keyExtractor={(item) => item._id}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ListingDetailScreen", {
                listing: item,
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