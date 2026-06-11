import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { Colors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
export default function HomeScreen({ navigation }) {
 const [search, setSearch] = React.useState("");
const [listings, setListings] = React.useState([]);
const [showCategories, setShowCategories] = React.useState(false);
const [refreshing, setRefreshing] = React.useState(false);
const [showFilters, setShowFilters] = React.useState(false);
const [savedMap, setSavedMap] = React.useState({});
const toggleSave = async (listingId) => {
  try {
    const token = await AsyncStorage.getItem("access_token");

    const isSaved = savedMap?.[listingId];

    const url = isSaved
      ? `http://192.168.1.195:8000/save/${listingId}`
      : `http://192.168.1.195:8000/save/${listingId}`;

    const method = isSaved ? "DELETE" : "POST";

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return;

    setSavedMap((prev) => ({
      ...prev,
      [listingId]: !isSaved,
    }));
  } catch (err) {
    console.log("SAVE ERROR:", err);
  }
};


const fetchListings = async () => {
  try {
    const res = await fetch("http://192.168.1.195:8000/listings");
    const data = await res.json();

    console.log("FIRST ITEM:", data?.[0]);

    console.log(
      "HOME LISTINGS:",
      JSON.stringify(data, null, 2)
    );

    setListings(data);
  } catch (err) {
    console.log(err);
  }
};

useFocusEffect(
  React.useCallback(() => {
    fetchListings();
  }, [])
);
const onRefresh = async () => {
  setRefreshing(true);

  await fetchListings();

  setRefreshing(false);
};

const openMyProfile = async () => {
  try {
    const token = await AsyncStorage.getItem("access_token");

    if (!token) {
      console.log("NO TOKEN");
      return;
    }

    const decoded = jwtDecode(token);

    console.log("MY USER ID:", decoded.sub);

    navigation.navigate("SellerProfile", {
      userId: decoded.sub,
    });
  } catch (err) {
    console.log("PROFILE NAV ERROR:", err);
  }
};


  // 🧠 FORMAT TITLE
  const formatTitle = (title) => {
    if (!title) return "";
    return title.toUpperCase() + ", INC";
  };

  const filtered = listings
  .filter((item) => item?.title && item.title.trim().length > 0)
  .filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

 return (
  <View style={{ flex: 1, backgroundColor: Colors.background }}>
    
    {/* 🟦 TOP BAR */}
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingTop: 50,
        paddingHorizontal: 15,
        paddingBottom: 10,
      }}
    >
      <TouchableOpacity onPress={() => setShowCategories(true)}>
        <Ionicons name="menu" size={26} color={Colors.text} />
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: Colors.text,
          letterSpacing: 1,
        }}
      >
        Koyawi
      </Text><TouchableOpacity onPress={openMyProfile}>
  <Ionicons
    name="person-circle-outline"
    size={28}
    color={Colors.text}
  />
</TouchableOpacity>
    </View>

    {/* 🔍 SEARCH BAR */}
    <View style={{ paddingHorizontal: 15 }}>
      <TextInput
        placeholder="Search Koyawi"
        value={search}
        onChangeText={setSearch}
        style={{
          backgroundColor: Colors.card,
          padding: 12,
          borderRadius: 10,
          color: Colors.text,
        }}
      />
    </View>

    {/* 🧠 FILTER BUTTON */}
    <View style={{ paddingHorizontal: 15, marginTop: 10 }}>
      <TouchableOpacity
        onPress={() => setShowFilters(true)}
        style={{
          padding: 12,
          borderRadius: 10,
          backgroundColor: Colors.surface,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ color: Colors.text }}>Filters</Text>
        <Ionicons name="options-outline" size={18} color={Colors.text} />
      </TouchableOpacity>
    </View>

    {/* 🧱 LISTINGS GRID */}
    <FlatList
      data={filtered}
      keyExtractor={(item) => item._id?.toString()}
      numColumns={2}
      refreshing={refreshing}
      onRefresh={onRefresh}
      contentContainerStyle={{ padding: 10 }}
      columnWrapperStyle={{ justifyContent: "space-between" }}
      renderItem={({ item }) => (
        <TouchableOpacity
  onPress={() =>
    navigation.navigate("ListingDetailScreen", {
      listing: item,
    })
  }
  style={{
    backgroundColor: Colors.card,
    width: "48%",
    marginBottom: 12,
    borderRadius: 14,
    overflow: "hidden",
    position: "relative",
  }}
>

  {/* ❤️ HEART GOES HERE */}
  <TouchableOpacity
    onPress={() => toggleSave(item._id)}
    style={{
      position: "absolute",
      top: 8,
      right: 8,
      zIndex: 10,
      backgroundColor: "rgba(255,255,255,0.7)",
      padding: 6,
      borderRadius: 20,
    }}
  >
   <Ionicons
  name={savedMap?.[item._id] ? "heart" : "heart-outline"}
  size={24}
  color={savedMap?.[item._id] ? "#ff3b30" : "rgba(0,0,0,0.75)"}
/>
  </TouchableOpacity>
          <Image
            source={{
              uri:
                item.image && item.image.startsWith("http")
                  ? item.image
                  : "https://via.placeholder.com/300",
            }}
            style={{
              width: "100%",
              height: 140,
              resizeMode: "cover",
            }}
          />

          <View style={{ padding: 10 }}>
            <Text numberOfLines={1}>
              {formatTitle(item.title)}
            </Text>
            <Text>${item.price}</Text>
          </View>
        </TouchableOpacity>
      )}
    />

    {/* 🧾 CATEGORIES OVERLAY */}
    {showCategories && (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: Colors.background,
          paddingTop: 60,
          paddingHorizontal: 20,
          zIndex: 999,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <Text style={{ fontSize: 18, fontWeight: "600", color: Colors.text }}>
            Categories
          </Text>

          <TouchableOpacity onPress={() => setShowCategories(false)}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
        </View>

        {[
          "Cars",
          "Phones",
          "Clothing",
          "Electronics",
          "Rentals",
          "Services",
          "Property",
          "More",
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={{
              paddingVertical: 15,
              borderBottomWidth: 1,
              borderBottomColor: Colors.border,
            }}
          >
            <Text style={{ fontSize: 16, color: Colors.text }}>
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/* 🧠 FILTERS OVERLAY */}
    {showFilters && (
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: Colors.background,
          padding: 20,
          zIndex: 1000,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 40,
          }}
        >
          <Text style={{ fontSize: 18, color: Colors.text }}>
            Filters (coming next step)
          </Text>

          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Ionicons name="close" size={28} color={Colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    )}
  </View>
);
}