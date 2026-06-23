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
import { useAuth } from "../Context/AuthContext";
import { useLanguage } from "../Context/LanguageContext";
import { translations } from "../utils/translations";
import { getTokenOrLogout } from "../utils/auth";

export default function SellerProfileScreen({ navigation, route }) {
  const [user, setUser] = useState(null);
  const [localProfileImage, setLocalProfileImage] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState("listings");

const { token } = useAuth();
  const { language } = useLanguage();
  const t = translations[language]?.sellerProfile;

  const distance = "5 miles radius • Conakry";

  const profileUserId = React.useMemo(() => {
    return (
      route?.params?.sellerId ??
      route?.params?.userId ??
      route?.params?.id ??
      null
    );
  }, [route?.params]);

  const profileImage = localProfileImage || user?.profileImage;

  useEffect(() => {
    if (profileUserId) {
      console.log("PROFILE OPENED:", profileUserId);
    }
  }, [profileUserId]);

  const fetchSellerListings = async (id) => {
    try {
      const res = await fetch("http://192.168.1.195:8000/listings");
      const data = await res.json();
      const filtered = data.filter((item) => item.owner_id === id);
      setListings(filtered);
    } catch (err) {
      console.log("SELLER LISTINGS ERROR:", err);
    }
  };
const loadProfile = useCallback(async () => {
  if (!profileUserId) return;

  try {
    const token = await getTokenOrLogout(navigation);
    if (!token) return;

    const res = await fetch(
      `http://192.168.1.195:8000/users/${profileUserId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    console.log("SELLER RESPONSE:", data);

    if (!res.ok) return;

    setUser({
  _id: data.userId || data._id || data.id,

  full_name:
    data.fullName ||
    data.full_name ||
    data.name ||
    data.username ||
    "No Name",

  city: data.city || "No Location",
  profileImage: data.profileImage || null,
  coverImage: data.coverImage || null,
  about: data.about || "",
});

    fetchSellerListings(profileUserId);
  } catch (err) {
    console.log("PROFILE LOAD ERROR:", err);
  }
}, [profileUserId, navigation]);

useEffect(() => {
  loadProfile();
}, [loadProfile]);
 

  const loadFollowStatus = async () => {
    try {
      const token = await getTokenOrLogout(navigation);
if (!token) return;

console.log("FOLLOW TOKEN:", token);
console.log("PROFILE USER:", profileUserId);
console.log("AUTH HEADER:", `Bearer ${token}`);
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
    if (profileUserId) loadFollowStatus();
  }, [profileUserId]);

  const openImageOptions = () => {
    Alert.alert("Update Image", "Choose option", [
      { text: "Profile Photo", onPress: () => pickImage("profile") },
      { text: "Cover Photo", onPress: () => pickImage("cover") },
      { text: "Cancel", style: "cancel" },
    ]);
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
const token = await getTokenOrLogout(navigation);
if (!token) return;

    if (type === "profile") {
      setLocalProfileImage(imageUri);

      await fetch(
        `http://192.168.1.195:8000/users/${profileUserId}/profile-image`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ profileImage: imageUri }),
        }
      );

      setUser((prev) => ({
        ...prev,
        profileImage: imageUri,
      }));
    }

    if (type === "cover") {
      try {
        const res = await fetch(
          `http://192.168.1.195:8000/users/${profileUserId}/cover-image`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ coverImage: imageUri }),
          }
        );

        const data = await res.json();

        setUser((prev) => ({
          ...prev,
          coverImage: data.coverImage || imageUri,
        }));
      } catch (err) {
        console.log("COVER UPDATE ERROR:", err);
      }
    }
  } catch (err) {
    console.log("IMAGE PICK ERROR:", err);
  }
};

 const toggleFollow = async () => {
  try {
   const token = await getTokenOrLogout(navigation);
if (!token) return;

    console.log("FOLLOW BUTTON TOKEN:", token);

    if (!token) {
      console.log("NO TOKEN FOUND");
      return;
    }

    const url = isFollowing
      ? `http://192.168.1.195:8000/unfollow/${profileUserId}`
      : `http://192.168.1.195:8000/follow/${profileUserId}`;

    const res = await fetch(url, {
      method: isFollowing ? "DELETE" : "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const text = await res.text();

    console.log("FOLLOW STATUS:", res.status, text);

    if (!res.ok) {
      console.log("FOLLOW FAILED — CHECK BACKEND AUTH");
      return;
    }

    setIsFollowing(!isFollowing);
  } catch (err) {
    console.log("Follow toggle error:", err);
  }
};

  if (!profileUserId) {
    return (
      <View style={styles.center}>
        <Text>{t?.noProfileId || "No profile ID received"}</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.center}>
        <Text>{t?.loadingProfile || "Loading profile..."}</Text>
      </View>
    );
  }

  const tabLabels = {
    listings: t?.listings || "Listings",
    about: t?.about || "About",
    more: t?.more || "More",
  };
  
 const renderAbout = () => (
  <View style={styles.aboutBox}>
    <Text style={styles.sectionTitle}>
      {t?.aboutSeller || "About Seller"}
    </Text>

    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>{t?.bio || "Bio"}</Text>
      <Text style={styles.infoValue}>
        {user.about || t?.noBio || "No bio yet"}
      </Text>
    </View>

    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>{t?.location || "Location"}</Text>
      <Text style={styles.infoValue}>
        {user.city} • {distance}
      </Text>
    </View>

    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>
        {t?.activeListings || "Active Listings"}
      </Text>
      <Text style={styles.infoValue}>{listings.length}</Text>
    </View>

    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>{t?.memberSince || "Member Since"}</Text>
      <Text style={styles.infoValue}>June 2026</Text>
    </View>

    <View style={styles.infoSection}>
      <Text style={styles.infoLabel}>{t?.verification || "Verification"}</Text>
      <Text style={styles.infoValue}>
        {t?.notVerified || "Not Verified"}
      </Text>
    </View>
  </View>
);

return (
 <FlatList
  key={activeTab === "listings" ? "grid" : "single"}

    data={listings}
    keyExtractor={(item) => item._id}
    numColumns={activeTab === "listings" ? 2 : 1}
    style={{ flex: 1 }}
    contentContainerStyle={{
      alignItems: "center",
      paddingBottom: 40,
    }}
    columnWrapperStyle={
      activeTab === "listings"
        ? {
            justifyContent: "space-between",
            width: "100%",
            paddingHorizontal: 10,
          }
        : undefined
    }
    ListHeaderComponent={() => (
      <View style={{ width: "100%", alignItems: "center" }}>

        {/* BACK BUTTON */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={{ fontSize: 18, color: "#111" }}>←</Text>
        </TouchableOpacity>

        {/* COVER */}
        <View style={styles.coverPhoto}>
          {user?.coverImage ? (
          <Image
  source={{
    uri: user?.coverImage
      ? user.coverImage + "?t=" + Date.now()
      : "https://via.placeholder.com/600x300",
  }}
  style={styles.coverImage}
/>
          ) : (
            <View style={styles.emptyCover}>
              <Ionicons name="image-outline" size={30} color="#999" />
              <Text style={styles.emptyCoverText}>
                {t?.addCoverPhoto || "Add cover photo"}
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => pickImage("cover")}
            style={styles.cameraIcon}
          >
            <Ionicons name="camera" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* PROFILE */}
        <View style={{ marginTop: -60, alignItems: "center" }}>
          <View>
           <Image
  source={{
    uri: profileImage
      ? profileImage + "?t=" + Date.now()
      : "https://via.placeholder.com/150",
  }}
  style={styles.avatar}
/>

            <TouchableOpacity
              onPress={() => pickImage("profile")}
              style={styles.profileCameraIcon}
            >
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.name}>{user.full_name}</Text>

        {!isOwner && (
          <TouchableOpacity onPress={toggleFollow} style={styles.followBtn}>
            <Text style={styles.followText}>
              {isFollowing ? t?.unfollow : t?.follow}
            </Text>
          </TouchableOpacity>
        )}

        {/* TABS */}
        <View style={styles.tabRow}>
          {Object.keys(tabLabels).map((tab) => (
            <TouchableOpacity key={tab} onPress={() => setActiveTab(tab)}>
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabActive,
                ]}
              >
                {tabLabels[tab]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      </View>
    )}

    renderItem={({ item }) =>
      activeTab === "listings" ? (
        <View style={styles.listingCard}>
          <Image source={{ uri: item.image }} style={styles.listingImage} />

          <Text style={styles.listingTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <Text style={styles.listingPrice}>${item.price}</Text>
        </View>
      ) : null
    }

    ListFooterComponent={
      activeTab === "about" ? renderAbout() : null
    }
  />
);
}
    
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F2F2F7",
    alignItems: "center",
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },

  name: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
  },

  followBtn: {
    backgroundColor: "#111",
    padding: 10,
    borderRadius: 20,
    marginTop: 10,
  },

  followText: {
    color: "#fff",
  },

  tabRow: {
    flexDirection: "row",
    marginTop: 20,
  },

  tabText: {
    marginHorizontal: 10,
    color: "#888",
  },

  tabActive: {
    color: "#000",
    fontWeight: "700",
  },

  aboutBox: {
    width: "100%",
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 20,
  },

  infoSection: {
    marginBottom: 15,
  },

  infoLabel: {
    color: "#888",
    fontSize: 12,
  },

  infoValue: {
    fontSize: 15,
  },

  coverPhoto: {
    width: "100%",
    height: 180,
  },

  coverImage: {
    width: "100%",
    height: "100%",
  },

  emptyCover: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  emptyCoverText: {
    color: "#999",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  backBtn: {
    position: "absolute",
    top: 50,
    left: 15,
    zIndex: 999,
    elevation: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },

  listingCard: {
    backgroundColor: "#fff",
    marginTop: 10,
    width: "48%",
    borderRadius: 12,
    overflow: "hidden",
    paddingBottom: 10,
  },

  listingImage: {
    width: "100%",
    height: 140,
  },

  listingTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
    paddingHorizontal: 6,
  },

  listingPrice: {
    marginTop: 4,
    fontSize: 13,
    color: "#444",
    paddingHorizontal: 6,
  },

  cameraIcon: {
    position: "absolute",
    right: 10,
    bottom: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 20,
  },

  profileCameraIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 6,
    borderRadius: 20,
  },
});
    