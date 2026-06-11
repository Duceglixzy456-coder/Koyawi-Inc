import React, { useEffect, useState } from "react";
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
import jwtDecode from "jwt-decode";

export default function SellerProfileScreen({ navigation, route }) {
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [listings, setListings] = useState([]);

  const profileUserId =
    route?.params?.userId ?? route?.params?.id ?? null;

  // ================= DEBUG =================
  useEffect(() => {
    console.log("📦 PROFILE PARAMS:", route?.params);
  }, [route?.params]);

  // ================= OWNER DETECT (NEW) =================
  useEffect(() => {
    const checkOwner = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token || !profileUserId) return;

        const decoded = jwtDecode(token);

        const currentUserId = decoded.sub;

        setIsOwner(currentUserId === profileUserId);
      } catch (err) {
        console.log("OWNER CHECK ERROR:", err);
      }
    };

    checkOwner();
  }, [profileUserId]);

  // ================= LISTINGS =================
  const fetchSellerListings = async () => {
    try {
      const res = await fetch("http://192.168.1.195:8000/listings");
      const data = await res.json();

      const filtered = data.filter(
        (item) => item.owner_id === profileUserId
      );

      setListings(filtered);
    } catch (err) {
      console.log("SELLER LISTINGS ERROR:", err);
    }
  };

  // ================= PROFILE LOAD =================
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");

        if (!profileUserId) return;

        const res = await fetch(
          `http://192.168.1.195:8000/users/${profileUserId}`,
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

        fetchSellerListings();
      } catch (err) {
        console.log("PROFILE LOAD ERROR:", err);
      }
    };

    loadProfile();
  }, [profileUserId]);

  // ================= FOLLOW STATUS =================
  const loadFollowStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const res = await fetch(
        `http://192.168.1.195:8000/follow/status/${profileUserId}`,
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
    if (profileUserId) {
      loadFollowStatus();
    }
  }, [profileUserId]);

  const toggleFollow = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const url = isFollowing
        ? `http://192.168.1.195:8000/unfollow/${profileUserId}`
        : `http://192.168.1.195:8000/follow/${profileUserId}`;

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

  // ================= LOADING =================
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
    <ScrollView
  style={{ flex: 1 }}
  contentContainerStyle={[
    styles.container,
    { alignItems: "center" }
  ]}
>

      {/* BACK BUTTON */}
      <TouchableOpacity
  onPress={() => navigation.goBack()}
  style={{
    position: "absolute",
    top: 55,
    left: 15,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    zIndex: 20,
  }}
>
  <Text style={{ fontSize: 16, fontWeight: "600", color: "#000" }}>
    ←
  </Text>
</TouchableOpacity>

      {/* AVATAR */}
      <View style={styles.avatarWrapper}>
        {user?.profileImage ? (
          <Image source={{ uri: user.profileImage }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={40} color="#8E8E93" />
          </View>
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
        <Text style={styles.stat}>Followers: {stats.followers}</Text>
        <Text style={styles.stat}>Following: {stats.following}</Text>
      </View>

      {/* LISTINGS */}
      <Text style={styles.sectionTitle}>Listings For Sale</Text>

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
                <Image source={{ uri: item.image }} style={styles.image} />
              </TouchableOpacity>

              <View style={{ padding: 8 }}>
                <Text numberOfLines={1} style={{ fontWeight: "600" }}>
                  {item.title}
                </Text>

                <Text>${item.price}</Text>

                {isOwner && (
                  <TouchableOpacity
                    onPress={() =>
                      navigation.navigate("EditListingScreen", {
                        listing: item,
                      })
                    }
                    style={styles.editBtn}
                  >
                    <Text>Edit</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      <View style={styles.miniTabs}>
        <Text style={styles.miniTab}>Saved</Text>
        <Text style={styles.miniTab}>Settings</Text>
        <Text style={styles.miniTab}>Help</Text>
      </View>

    </ScrollView>
  );
}

// ================= STYLES =================
const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#F2F2F7",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarWrapper: { marginTop: 25 },
  avatar: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
  },
  name: { fontSize: 20, fontWeight: "700", marginTop: 12 },
  location: { color: "#8E8E93", marginTop: 4 },
  followBtn: {
    marginTop: 12,
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 20,
  },
  followText: { color: "#fff" },
  statsRow: { flexDirection: "row", marginTop: 16, gap: 20 },
  sectionTitle: { marginTop: 25, fontSize: 16, fontWeight: "600" },
  placeholder: { color: "#8E8E93", marginTop: 6 },
  card: {
    backgroundColor: "#fff",
    width: "48%",
    marginTop: 10,
    borderRadius: 12,
    overflow: "hidden",
  },
  image: { width: "100%", height: 120 },
  editBtn: {
    marginTop: 6,
    backgroundColor: "#eee",
    padding: 6,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  miniTabs: {
    marginTop: 30,
    alignItems: "center",
    gap: 10,
  },
  miniTab: {
    fontSize: 12,
    color: "#8E8E93",
    padding: 6,
    borderWidth: 1,
    borderColor: "#D1D1D6",
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  backBtn: {
    position: "absolute",
    top: 55,
    left: 15,
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  backIcon: { fontSize: 26 },
});