import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { jwtDecode } from "jwt-decode";
import * as ImagePicker from "expo-image-picker";

export default function SellerProfileScreen({ navigation, route }) {
  const [user, setUser] = useState(null);
  const [localProfileImage, setLocalProfileImage] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [listings, setListings] = useState([]);

  const profileUserId =
    route?.params?.userId ?? route?.params?.id ?? null;

  const profileImage = localProfileImage || user?.profileImage;

  // ================= DEBUG =================
  useEffect(() => {
    console.log("📦 PROFILE PARAMS:", route?.params);
  }, [route?.params]);

  // ================= LOAD PROFILE (FIXED SCOPE) =================
  const fetchSellerListings = async (id) => {
    try {
      const res = await fetch("http://192.168.1.194:8000/listings");
      const data = await res.json();

      const filtered = data.filter((item) => item.owner_id === id);
      setListings(filtered);
    } catch (err) {
      console.log("SELLER LISTINGS ERROR:", err);
    }
  };

  const loadProfile = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!profileUserId || !token) return;

      const res = await fetch(
        `http://192.168.1.194:8000/users/${profileUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) return;

      setUser({
        _id: data.userId || data._id || data.id,
        full_name:
          data.full_name ||
          data.fullName ||
          data.user?.full_name ||
          data.user?.fullName ||
          "No Name",
        city: data.city || data.location || "No Location",
        profileImage:
          data.profileImage ||
          data.profile_image ||
          data.user?.profileImage ||
          null,
      });

      fetchSellerListings(profileUserId);
    } catch (err) {
      console.log("PROFILE LOAD ERROR:", err);
    }
  }, [profileUserId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // ================= OWNER CHECK =================
  useEffect(() => {
    const checkOwner = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token || !profileUserId) return;

        const decoded = jwtDecode(token);
        setIsOwner(decoded.sub === profileUserId);
      } catch (err) {
        console.log("OWNER CHECK ERROR:", err);
      }
    };

    checkOwner();
  }, [profileUserId]);

  // ================= FOLLOW STATUS =================
  const loadFollowStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const res = await fetch(
        `http://192.168.1.194:8000/follow/status/${profileUserId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) return;

      setIsFollowing(data.isFollowing);
      setStats({
        followers: data.followers,
        following: data.following,
      });
    } catch (err) {
      console.log("Follow status error:", err);
    }
  };

  useEffect(() => {
    if (profileUserId) loadFollowStatus();
  }, [profileUserId]);

  // ================= IMAGE PICK =================
  const pickProfileImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (result.canceled) return;

      const imageUri = result.assets[0].uri;

      setLocalProfileImage(imageUri);

      const token = await AsyncStorage.getItem("access_token");

      await fetch(
        `http://192.168.1.194:8000/users/${profileUserId}/profile-image`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profileImage: imageUri,
          }),
        }
      );

      setUser((prev) =>
        prev ? { ...prev, profileImage: imageUri } : prev
      );

      await loadProfile();
    } catch (error) {
      console.log("PROFILE IMAGE ERROR:", error);
    }
  };

  // ================= FOLLOW =================
  const toggleFollow = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const url = isFollowing
        ? `http://192.168.1.194:8000/unfollow/${profileUserId}`
        : `http://192.168.1.194:8000/follow/${profileUserId}`;

      const method = isFollowing ? "DELETE" : "POST";

      await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });

      await loadFollowStatus();
    } catch (err) {
      console.log("Follow toggle error:", err);
    }
  };

  // ================= LOADING STATES =================
  if (!profileUserId) {
    return (
      <View style={styles.center}>
        <Text>No profile ID received</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  // ================= UI =================
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      {/* BACK */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
      >
        <Text style={{ fontSize: 18 }}>←</Text>
      </TouchableOpacity>

      {/* AVATAR */}
      <View style={{ position: "relative", marginTop: 20 }}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text>No Image</Text>
          </View>
        )}

        {isOwner && (
          <TouchableOpacity onPress={pickProfileImage} style={styles.cameraBtn}>
            <Ionicons name="camera" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* NAME */}
      <Text style={styles.name}>{user.full_name}</Text>

      {/* LOCATION */}
      <Text style={styles.location}>{user.city}</Text>

      {/* FOLLOW */}
      {!isOwner && (
        <TouchableOpacity onPress={toggleFollow} style={styles.followBtn}>
          <Text style={styles.followText}>
            {isFollowing ? "Unfollow" : "Follow"}
          </Text>
        </TouchableOpacity>
      )}

      {/* STATS */}
      <View style={styles.statsRow}>
        <Text>Followers: {stats.followers}</Text>
        <Text>Following: {stats.following}</Text>
      </View>

      {/* LISTINGS */}
      <Text style={styles.sectionTitle}>Listings</Text>

      {listings.length === 0 ? (
        <Text style={styles.placeholder}>No listings yet</Text>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item._id}
          numColumns={2}
          scrollEnabled={false}
          columnWrapperStyle={{ justifyContent: "space-between" }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("ListingDetailScreen", {
                    listing: item,
                  })
                }
              >
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                />
              </TouchableOpacity>

              <Text numberOfLines={1}>{item.title}</Text>
              <Text>${item.price}</Text>
            </View>
          )}
        />
      )}
    </ScrollView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: { width: 120, height: 120, borderRadius: 45 },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 24, fontWeight: "700", marginTop: 12 },
  location: { color: "#8E8E93" },
  followBtn: {
    marginTop: 12,
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 20,
  },
  followText: { color: "#fff" },
  statsRow: { flexDirection: "row", gap: 20, marginTop: 10 },
  sectionTitle: { marginTop: 20, fontSize: 20, fontWeight: "600" },
  placeholder: { marginTop: 10, color: "#888" },
  card: {
    backgroundColor: "#fff",
    width: "48%",
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
    padding: 8,
  },
  image: { width: "100%", height: 120 },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 15,
    zIndex: 10,
    backgroundColor: "rgba(255,255,255,0.6)",
    padding: 8,
    borderRadius: 12,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },
 });