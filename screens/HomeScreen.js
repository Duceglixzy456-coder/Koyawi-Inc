import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import  {jwtDecode } from "jwt-decode";
import { Colors } from "../theme/colors";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../Context/AuthContext";
import { getTokenOrLogout } from "../utils/auth";
export default function HomeScreen({ navigation }) {
  const [search, setSearch] = useState("");
  const [listings, setListings] = useState([]);
  const [sortBy, setSortBy] = useState("newest");
  const [showCategories, setShowCategories] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [savedMap, setSavedMap] = useState({});
 const { token: contextToken } = useAuth();
  // ✅ CATEGORIES (FIXED)
  const categories = [
  "All",
  "Cars",
  "Electronics",
  "Clothes",
  "Sneakers",
  "Essentials",
];

  const [selectedCategory, setSelectedCategory] = useState("All");

  // ---------------- SAVE ----------------
  const toggleSave = async (listingId) => {
    try {
     const token = await getTokenOrLogout(navigation);
if (!token) return;

      const isSaved = savedMap?.[listingId];

      const url = `http://192.168.1.195:8000/save/${listingId}`;
      const method = isSaved ? "DELETE" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
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

  // ---------------- FETCH ----------------
  const fetchListings = async () => {
    try {
      const res = await fetch("http://192.168.1.195:8000/listings");
      const data = await res.json();
      setListings(data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useFocusEffect(
    useCallback(() => {
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
    const token = await getTokenOrLogout(navigation);
    if (!token) return;

    const decoded = jwtDecode(token);

    navigation.navigate("SellerProfile", {
      userId: decoded.sub,
    });
  } catch (err) {
    console.log(err);
  }
};
  // ---------------- FILTERS ----------------
const applyFilters = (data, sortBy, search, selectedCategory) => {
    let result = [...(data || [])];

    if (search?.trim()) {
      result = result.filter((item) =>
        item?.title?.toLowerCase().includes(search.toLowerCase())
      );
    }
if (selectedCategory !== "All") {
  result = result.filter((item) => {
    const text = `${item?.title || ""} ${item?.category || ""}`.toLowerCase();

    if (selectedCategory === "Cars") {
      return text.includes("car") || text.includes("bmw") || text.includes("benz") || text.includes("toyota");
    }

    if (selectedCategory === "Electronics") {
      return text.includes("phone") || text.includes("iphone") || text.includes("laptop") || text.includes("tv");
    }

    if (selectedCategory === "Sneakers") {
      return text.includes("nike") || text.includes("jordan") || text.includes("yeezy");
    }

    if (selectedCategory === "Clothes") {
      return text.includes("shirt") || text.includes("hoodie") || text.includes("jeans");
    }

    if (selectedCategory === "Essentials") {
      return true; // fallback
    }

    return false;
  });
}
    if (sortBy === "newest") {
      result.sort(
        (a, b) =>
          new Date(b?.created_at || 0) - new Date(a?.created_at || 0)
      );
    }

    if (sortBy === "oldest") {
      result.sort(
        (a, b) =>
          new Date(a?.created_at || 0) - new Date(b?.created_at || 0)
      );
    }

    if (sortBy === "price_high") {
      result.sort((a, b) => (b?.price || 0) - (a?.price || 0));
    }

    if (sortBy === "price_low") {
      result.sort((a, b) => (a?.price || 0) - (b?.price || 0));
    }

    return result;
  };

 const filteredData = applyFilters(listings, sortBy, search, selectedCategory);

  const formatTitle = (title) => {
    if (!title) return "";
    return title.toUpperCase() + ", INC";
  };

  // ---------------- UI ----------------
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* TOP BAR */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          paddingTop: 50,
          paddingHorizontal: 15,
          paddingBottom: 10,
        }}
      >
        <TouchableOpacity onPress={() => setShowCategories(true)}>
          <Ionicons name="menu" size={26} color={Colors.text} />
        </TouchableOpacity>

        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.text }}>
          Koyawi
        </Text>

        <TouchableOpacity onPress={openMyProfile}>
          <Ionicons
            name="person-circle-outline"
            size={28}
            color={Colors.text}
          />
        </TouchableOpacity>
      </View>

      {/* SEARCH */}
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

      {/* FILTER BUTTON */}
      <View style={{ paddingHorizontal: 15, marginTop: 10 }}>
        <TouchableOpacity
          onPress={() => setShowFilters(true)}
          style={{
            padding: 12,
            borderRadius: 10,
            backgroundColor: Colors.surface,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: Colors.text }}>Filters</Text>
          <Ionicons name="options-outline" size={18} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* CATEGORY BAR (FIXED UI) */}
      <View style={{ paddingHorizontal: 10, marginTop: 10 }}>
        <FlatList
          data={categories}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          renderItem={({ item }) => {
            const active = selectedCategory === item;

            return (
              <TouchableOpacity
                onPress={() => setSelectedCategory(item)}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 20,
                  marginRight: 10,
                  backgroundColor: active ? "#111" : Colors.card,
                }}
              >
                <Text
                  style={{
                    color: active ? "#fff" : Colors.text,
                    fontWeight: "600",
                  }}
                >
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* LISTINGS */}
      <FlatList
        data={filteredData}
        keyExtractor={(item) => item._id?.toString()}
        numColumns={2}
        refreshing={refreshing}
        onRefresh={onRefresh}
        contentContainerStyle={{ padding: 10 }}
        columnWrapperStyle={{ justifyContent: "space-between" }}
       renderItem={({ item }) => {
  

  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("ListingDetailScreen", { listing: item })
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
      {/* HEART */}
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
          color={savedMap?.[item._id] ? "#ff3b30" : "#000"}
        />
      </TouchableOpacity>

      <Image
        source={{
          uri:
            item.image && item.image.startsWith("http")
              ? item.image
              : "https://via.placeholder.com/300",
        }}
        style={{ width: "100%", height: 140 }}
      />

      <View style={{ padding: 10 }}>
        <Text numberOfLines={1}>{formatTitle(item.title)}</Text>
        <Text>${item.price}</Text>
      </View>
    </TouchableOpacity>
  );
}}
      />
{showCategories && (
  <View
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: Colors.background,
      padding: 20,
    }}
  >
    {/* HEADER */}
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 40,
        marginBottom: 20,
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "700", color: Colors.text }}>
        Categories
      </Text>

      <TouchableOpacity onPress={() => setShowCategories(false)}>
        <Ionicons name="close" size={28} color={Colors.text} />
      </TouchableOpacity>
    </View>

    {/* CATEGORY LIST */}
    {categories.map((item) => (
      <TouchableOpacity
        key={item}
        onPress={() => {
          setSelectedCategory(item);
          setShowCategories(false);
        }}
        style={{
          padding: 16,
          borderRadius: 12,
          marginBottom: 10,
          backgroundColor:
            selectedCategory === item ? "#ddd" : Colors.card,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600", color: Colors.text }}>
          {item}
        </Text>
      </TouchableOpacity>
    ))}
  </View>
)}

      {/* FILTERS */}
      {showFilters && (
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: Colors.background,
            padding: 25,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 40,
              marginBottom: 30,
            }}
          >
            <Text style={{ fontSize: 24, fontWeight: "700", color: Colors.text }}>
              Filters
            </Text>

            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <Ionicons name="close" size={32} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {["newest", "oldest", "price_high", "price_low"].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() => {
                setSortBy(type);
                setShowFilters(false);
              }}
              style={{
                padding: 18,
                borderRadius: 12,
                marginBottom: 12,
                backgroundColor: sortBy === type ? "#ddd" : Colors.card,
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600" }}>
                {type.replace("_", " ").toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}