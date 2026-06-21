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
import { Alert } from "react-native";
export default function SellerProfileScreen({ navigation, route }) {
  const [user, setUser] = useState(null);
  const [localProfileImage, setLocalProfileImage] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [listings, setListings] = useState([]);
const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  // const [imageMode, setImageMode] = useState(null);
// "profile" | "cover"tabs
  const [activeTab, setActiveTab] = useState("listings");
  const [about, setAbout] = useState("No bio yet");
  const [distance] = useState("5 miles radius • Conakry");

  const profileUserId =
    route?.params?.userId ?? route?.params?.id ?? null;

  const profileImage = localProfileImage || user?.profileImage;

  useEffect(() => {
    console.log("📦 PROFILE PARAMS:", route?.params);
  }, [route?.params]);

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
          headers: { Authorization: `Bearer ${token}` },
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

  coverImage: data.coverImage || null, // ✅ THIS IS REQUIRED
});

      fetchSellerListings(profileUserId);
    } catch (err) {
      console.log("PROFILE LOAD ERROR:", err);
    }
  }, [profileUserId]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

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
const openImageOptions = () => {
  Alert.alert(
    "Update Image",
    "Choose what you want to change",
    [
      {
        text: "Profile Photo",
        onPress: () => pickImage("profile"),
      },
      {
        text: "Cover Photo",
        onPress: () => pickImage("cover"),
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ],
    { cancelable: true }
  );
};
const pickImage = async (type) => {
  try {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === "cover" ? [16, 9] : [1, 1],
      quality: 0.7,
    });

    if (result.canceled) return;

    const imageUri = result.assets[0].uri;
    const token = await AsyncStorage.getItem("access_token");

    // ================= PROFILE IMAGE =================
    if (type === "profile") {
      setLocalProfileImage(imageUri);

      await fetch(
        `http://192.168.1.194:8000/users/${profileUserId}/profile-image`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profileImage: imageUri }),
        }
      );

      setUser((prev) =>
        prev ? { ...prev, profileImage: imageUri } : prev
      );
    }

    // ================= COVER IMAGE =================
    if (type === "cover") {
      setUser((prev) =>
        prev ? { ...prev, coverImage: imageUri } : prev
      );

      await fetch(
        `http://192.168.1.194:8000/users/${profileUserId}/cover-image`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ coverImage: imageUri }),
        }
      );
    }

    // 🔥 SINGLE REFRESH ONLY (IMPORTANT)
    await loadProfile();

  } catch (error) {
    console.log("IMAGE PICK ERROR:", error);
  }
};

  const toggleFollow = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const url = isFollowing
        ? `http://192.168.1.194:8000/unfollow/${profileUserId}`
        : `http://192.168.1.194:8000/follow/${profileUserId}`;

      await fetch(url, {
        method: isFollowing ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      setIsFollowing(!isFollowing);
    } catch (err) {
      console.log("Follow toggle error:", err);
    }
  };

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

  const renderListings = () => (
    listings.length === 0 ? (
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
            <Image source={{ uri: item.image }} style={styles.image} />
            <Text numberOfLines={1}>{item.title}</Text>
            <Text>${item.price}</Text>
          </View>
        )}
      />
    )
  );

  const renderAbout = () => (
  <View style={styles.aboutBox}>
    <Text style={styles.sectionTitle}>About Seller</Text>

    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>Bio</Text>
      <Text style={styles.infoValue}>
        {user.about || "No bio yet"}
      </Text>
    </View>

    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>Location</Text>
      <Text style={styles.infoValue}>
        {user.city} • {distance}
      </Text>
    </View>

    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>Seller Rating</Text>
      <Text style={styles.infoValue}>4.8 / 5.0</Text>
    </View>

    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>Response Time</Text>
      <Text style={styles.infoValue}>
        Usually responds within 1 hour
      </Text>
    </View>

    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>Active Listings</Text>
      <Text style={styles.infoValue}>
        {listings.length} Listings
      </Text>
    </View>

    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>Member Since</Text>
      <Text style={styles.infoValue}>June 2026</Text>
    </View>

    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>Verification</Text>
      <Text style={styles.infoValue}>Not Verified</Text>
    </View>

    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>Recent Reviews</Text>
      <Text style={styles.infoValue}>
        "Great seller, smooth transaction."
      </Text>
      <Text style={styles.infoValue}>
        "Fast communication."
      </Text>
    </View>
  </View>
);
  const renderMore = () => (
    <View style={styles.aboutBox}>
      <Text style={styles.sectionTitle}>More</Text>
      <Text style={styles.aboutText}>Report user</Text>
      <Text style={styles.aboutText}>Share profile</Text>
      <Text style={styles.aboutText}>Block user</Text>
    </View>
  );

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
        <View style={styles.coverPhoto}>
<View style={styles.coverPhoto}>
  {user?.coverImage ? (
    <Image
      source={{ uri: user.coverImage }}
      style={styles.coverImage}
    />
  ) : (
    <TouchableOpacity
      style={styles.emptyCover}
      onPress={openImageOptions}
      activeOpacity={0.7}
    >
      <Ionicons name="image-outline" size={30} color="#999" />
      <Text style={styles.emptyCoverText}>
        Add cover photo
      </Text>
    </TouchableOpacity>
  )}
</View>
</View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={{ fontSize: 18 }}>←</Text>
      </TouchableOpacity>

      <View style={{ position: "relative", marginTop: -60, zIndex: 10 }}>
  {profileImage ? (
    <Image source={{ uri: profileImage }} style={styles.avatar} />
  ) : (
    <View style={styles.avatarPlaceholder}>
      <Text>No Image</Text>
    </View>
  )}

  {/* ✅ ADD THIS BACK */}
  {isOwner && (
    <TouchableOpacity
    onPress={openImageOptions}
    
      style={styles.cameraBtn}
    >
      <Ionicons name="camera" size={16} color="#fff" />
    </TouchableOpacity>
  )}
</View>

<Text style={styles.name}>{user.full_name}</Text>

{!isOwner && (
  <TouchableOpacity onPress={toggleFollow} style={styles.followBtn}>
    <Text style={styles.followText}>
      {isFollowing ? "Unfollow" : "Follow"}
    </Text>
  </TouchableOpacity>
)}

      <View style={styles.statsRow}>
        <Text>Followers: {stats.followers}</Text>
        <Text>Following: {stats.following}</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabRow}>
        {["listings", "about", "more"].map((tab) => (
          <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
            <Text style={[
              styles.tabText,
              activeTab === tab && styles.tabActive
            ]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === "listings" && renderListings()}
      {activeTab === "about" && renderAbout()}
      {activeTab === "more" && renderMore()}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

avatar: {
  width: 120,
  height: 120,
  borderRadius: 60,
  borderWidth: 4,
  borderColor: "#fff",
},
coverPhoto: {
  width: "100%",
  height: 180,
  backgroundColor: "#eee",
  justifyContent: "center",
  alignItems: "center",
  overflow: "hidden",
},
coverImage: {
  width: "100%",
  height: "180%",
},
emptyCover: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "#eee",
},
emptyCoverText: {
  marginTop: 6,
  color: "#999",
  fontWeight: "500",
},
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 60,
    backgroundColor: "#E5E5EA",
    justifyContent: "center",
    alignItems: "center",
  },

  name: { fontSize: 24, fontWeight: "700", marginTop: 12 },

  followBtn: {
    marginTop: 12,
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 20,
  },
  followText: { color: "#fff" },

  statsRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 10,
  },

 tabRow: {
  flexDirection: "row",
  justifyContent: "space-evenly",
  width: "100%",
  marginTop: 25,
  paddingVertical: 16,
  borderTopWidth: 1,
  borderBottomWidth: 1,
  borderColor: "#E5E5EA",
},

tabText: {
  fontSize: 17,
  fontWeight: "700",
  color: "#8E8E93",
  paddingBottom: 10,
},

tabActive: {
  color: "#111",
  borderBottomWidth: 3,
  borderBottomColor: "#111",
},

 aboutBox: {
  width: "100%",
  marginTop: 20,
  padding: 24,
  backgroundColor: "#fff",
  borderRadius: 16,
},

infoSection: {
  marginTop: 4,
  paddingBottom: 20,
  borderBottomWidth: 1,
  borderBottomColor: "#EFEFEF",
},

infoLabel: {
  fontSize: 13,
  color: "#8E8E93",
  marginBottom: 12,
  fontWeight: "600",
},

infoValue: {
  fontSize: 15,
  color: "#111",
  lineHeight: 22,
},

aboutText: {
  marginTop: 5,
  color: "#555",
},

location: {
  marginTop: 8,
  color: "#8E8E93",
},

  aboutText: {
    marginTop: 5,
    color: "#555",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
photoMenu: {
  position: "absolute",
  top: 180,
  backgroundColor: "#fff",
  width: 200,
  borderRadius: 12,
  padding: 10,
  elevation: 5,
  zIndex: 999,
},

photoMenuText: {
  paddingVertical: 10,
  fontSize: 15,
  fontWeight: "500",
},
  card: {
    backgroundColor: "#fff",
    width: "48%",
    marginTop: 10,
    borderRadius: 12,
    padding: 8,
  },

  image: { width: "100%", height: 120 },

  backBtn: {
    position: "absolute",
    top: 50,
    left: 15,
    zIndex: 10,
  },
});