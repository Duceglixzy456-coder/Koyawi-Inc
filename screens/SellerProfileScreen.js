import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
} from "react-native";
import { api } from "../utils/api";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { jwtDecode } from "jwt-decode";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { useAuth } from "../Context/AuthContext";
import { useLanguage } from "../Context/LanguageContext";
import { translations } from "../utils/translations";

export default function SellerProfileScreen({ navigation, route }) {
  const [user, setUser] = useState(null);
  const [editingBio, setEditingBio] = useState(false);
const [bioText, setBioText] = useState("");
  const [localProfileImage, setLocalProfileImage] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [stats, setStats] = useState({ followers: 0, following: 0 });
  const [listings, setListings] = useState([]);
  const [activeTab, setActiveTab] = useState("listings");
  const profileImage = localProfileImage || user?.profileImage;
  const distance = "5 miles radius • Conakry";
const memberSince = user?.created_at
  ? new Date(user.created_at).toLocaleDateString()
  : "Unknown";
const { token } = useAuth();

const { language } = useLanguage();
const t = translations?.[language]?.sellerProfile ?? {};

const decoded = token ? jwtDecode(token) : null;
const currentUserId = decoded?.sub;

const profileUserId = React.useMemo(() => {
  return (
    route?.params?.sellerId ??
    route?.params?.userId ??
    route?.params?.id ??
    null
  );
}, [route?.params]);

const isOwner =
  !!currentUserId &&
  !!profileUserId &&
  currentUserId === profileUserId;
  

 useEffect(() => {
  if (!profileUserId || !token) return;
  loadProfile();
}, [profileUserId, token]);
const getImages = (item) => {
  if (Array.isArray(item?.images) && item.images.length > 0) return item.images;
  if (typeof item?.images === "string") return [item.images];
  if (item?.coverImage) return [item.coverImage];
  if (item?.image) return [item.image];
  return [];
};
useEffect(() => {
  if (!profileUserId || !token) return;
  loadFollowStatus();
}, [profileUserId, token]);

const fetchSellerListings = async (id) => {
  try {
    const res = await fetch(
  `http://192.168.1.194:8000/listings`
);
    const data = await res.json();

    const normalized = data
      .filter((item) => item?.owner_id && String(item.owner_id) === String(id))
      .map((item) => ({
        ...item,
        images: Array.isArray(item.images)
          ? item.images
          : item.images
          ? [item.images]
          : item.image
          ? [item.image]
          : item.coverImage
          ? [item.coverImage]
          : [],
      }));
console.log("PROFILE USER ID:", id);
console.log("TOTAL LISTINGS:", data.length);
console.log("FILTERED:", normalized.length);
console.log("FIRST RAW:", data[0]);
console.log("FIRST NORMALIZED:", normalized[0]);
    
setListings(normalized);
  } catch (err) {
    console.log("SELLER LISTINGS ERROR:", err);
  }
};

const loadProfile = useCallback(async () => {
  try {
    
    console.log("PROFILE USER:", profileUserId);
    console.log("TOKEN:", token);

    if (!profileUserId) return;
    if (!token) return;

    const res = await fetch(
      `http://192.168.1.194:8000/users/${profileUserId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("STATUS:", res.status);

    const data = await res.json();
    console.log("PROFILE RESPONSE:", data);

    if (!res.ok) {
      console.log("PROFILE FAILED");
      return;
    }

   setUser({
    
  _id: data.userId,
  full_name: data.fullName,
  city: data.city,
  location: data.location,
  bio: data.bio,
  created_at: data.created_at,
  is_verified: data.is_verified,
  profileImage: data.profileImage,
  coverImage: data.coverImage,
});

setBioText(data.bio || "");

  } catch (err) {
    console.log("LOAD PROFILE ERROR:", err);
  }
}, [profileUserId, token]);

  const loadFollowStatus = async () => {
  try {
    if (!token) return;

    console.log("FOLLOW TOKEN:", token);
    console.log("PROFILE USER:", profileUserId);
    console.log("AUTH HEADER:", `Bearer ${token}`);

    const res = await fetch(
      `http://192.168.1.194:8000/follow/status/${profileUserId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  const openImageOptions = () => {
    Alert.alert("Update Image", "Choose option", [
      { text: "Profile Photo", onPress: () => pickImage("profile") },
      { text: "Cover Photo", onPress: () => pickImage("cover") },
      { text: "Cancel", style: "cancel" },
    ]);
  };
const updateBio = async (bio) => {
  try {
    if (!token) return;

    const res = await fetch("http://192.168.1.194:8000/users/bio", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bio }),
    });

    const data = await res.json();
    console.log("BIO UPDATED:", data);
  } catch (err) {
    console.log("BIO ERROR:", err);
  }
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
  if (!token) return;

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

      setUser((prev) => ({
        
        ...prev,
        profileImage: imageUri,
      }));
    }

    if (type === "cover") {
      try {
        const res = await fetch(
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
 
useEffect(() => {
  const unsubscribe = navigation.addListener("focus", () => {
    if (profileUserId) {
      fetchSellerListings(profileUserId);
    }
  });

  return unsubscribe;
}, [navigation, profileUserId, fetchSellerListings]);
 
const markLocalSold = (listingId) => {
  setListings((prev) =>
    prev.map((item) =>
      item._id === listingId
        ? { ...item, status: "sold" }
        : item
    )
  );
};

const toggleFollow = async () => {
  try {
    if (!token) return;

    console.log("FOLLOW BUTTON TOKEN:", token);

    const url = isFollowing
      ? `http://192.168.1.194:8000/unfollow/${profileUserId}`
      : `http://192.168.1.194:8000/follow/${profileUserId}`;

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
  boost: "Boost",
};
 const renderAbout = () => {
  const activeListings = listings?.filter(
    (item) => item?.status === "active"
  )?.length || 0;

  const soldListings = listings?.filter(
    (item) => item?.status === "sold"
  )?.length || 0;

  return (
    <View style={styles.aboutBox}>
      
      <Text style={styles.sectionTitle}>
        {t?.aboutSeller || "About Seller"}
      </Text>

    {/* BIO */}
<View style={styles.bioBox}>
  <Text style={styles.infoLabel}>
    {t?.bio || "Bio"}
  </Text>

  {editingBio ? (
    <>
      <TextInput
        value={bioText}
        onChangeText={(text) => {
          if (text.length <= 50) setBioText(text);
        }}
        autoFocus
        maxLength={50}
        multiline
        style={styles.bioInput}
        placeholder="Write something about yourself..."
      />

      <Text style={styles.bioCounter}>
        {bioText.length}/50
      </Text>

      <TouchableOpacity
        onPress={async () => {
          await updateBio(bioText);
          setUser((prev) => ({ ...prev, bio: bioText }));
          setEditingBio(false);
        }}
        style={styles.bioDoneBtn}
      >
        <Text style={styles.bioDoneText}>Done</Text>
      </TouchableOpacity>
    </>
  ) : (
    <>
     <Text style={styles.infoValue}>
  {user?.bio || "No bio yet"}
</Text>

      <TouchableOpacity
        onPress={() => {
          setBioText(user?.bio || "");
          setEditingBio(true);
        }}
        style={styles.bioEditBtn}
      >
        <Text style={styles.bioEditText}>
          {user?.bio ? "Modifier la bio" : "Ajouter une bio"}
        </Text>
      </TouchableOpacity>
    </>
  )}
</View>
      {/* LOCATION */}
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>{t?.location || "Location"}</Text>
        <Text style={styles.infoValue}>
          {user?.location || "Unknown"}
        </Text>
      </View>

      {/* ACTIVE LISTINGS */}
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>
          {t?.activeListings || "Active Listings"}
        </Text>
        <Text style={styles.infoValue}>
          {activeListings}
        </Text>
      </View>

      {/* SOLD LISTINGS (this makes it feel REAL now) */}
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>
          Sold Listings
        </Text>
        <Text style={styles.infoValue}>
          {soldListings}
        </Text>
      </View>

      {/* MEMBER SINCE */}
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>
          {t?.memberSince || "Member Since"}
        </Text>
        <Text style={styles.infoValue}>
          {memberSince || "Unknown"}
        </Text>
      </View>

      {/* VERIFICATION */}
      <View style={styles.infoSection}>
        <Text style={styles.infoLabel}>
          {t?.verification || "Verification"}
        </Text>
        <Text style={styles.infoValue}>
          {user?.is_verified ? "Verified" : "Not Verified"}
        </Text>
      </View>

    </View>
  );
};

const normalizeImages = (item) => {
  if (Array.isArray(item?.images) && item.images.length > 0) {
    return item.images.filter(Boolean);
  }

  if (typeof item?.images === "string") {
    return [item.images];
  }

  if (item?.coverImage) return [item.coverImage];
  if (item?.image) return [item.image];

  return [];
};


const renderBoost = () => {
 if (!listings || listings.length === 0) {
  return (
    <View style={styles.boostContainer}>
      <Text>No listings to boost</Text>
    </View>
  );
}

return (
  <View style={styles.boostContainer}>
      <Text style={styles.boostTitle}>Boost Your Listings</Text>

      {listings.map((item) => {
        const images = normalizeImages(item);
       const img =
  images?.[0] ||
  item?.image ||
  item?.coverImage ||
  "https://via.placeholder.com/100";

        return (
          <View key={item._id} style={styles.boostCard}>
           <Image
  source={{
    uri:
      typeof profileImage === "string" && profileImage.startsWith("http")
        ? profileImage
        : "https://via.placeholder.com/150",
  }}
  style={styles.avatar}
/>

            <View style={{ flex: 1 }}>
              <Text numberOfLines={1} style={styles.boostItemTitle}>
                {item.title}
              </Text>

              <Text style={styles.boostPrice}>${item.price}</Text>

              <TouchableOpacity
                onPress={() =>
                  navigation.navigate("BoostListingDetail", {
                    listing: item,
                  })
                }
                style={styles.boostActionBtn}
              >
                <Text style={styles.boostActionText}>
                  Boost This Listing
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </View>
  );
};

const filteredListings =
  activeTab === "listings"
    ? listings.filter((item) => item.status !== "deleted")
    : [];

return (
  <FlatList
    key={activeTab}
    data={filteredListings}
    keyExtractor={(item) => item._id}
    numColumns={activeTab === "listings" || activeTab === "sold" ? 2 : 1}
    style={{ flex: 1 }}
    contentContainerStyle={{ paddingBottom: 40 }}
    columnWrapperStyle={
      activeTab === "listings" || activeTab === "sold"
        ? {
            justifyContent: "space-between",
            width: "100%",
            paddingHorizontal: 10,
          }
        : undefined
    }

    ListHeaderComponent={() => (
      <View style={{ width: "100%", alignItems: "center" }}>
        {/* BACK */}
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
              source={{ uri: user.coverImage + "?t=" + Date.now() }}
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
          />
        </View>

        {/* PROFILE */}
<View style={{ marginTop: -60, alignItems: "center" }}>
  <View>
    <Image
      source={{
        uri: profileImage || "https://via.placeholder.com/150",
      }}
      style={styles.avatar}
    />

    {isOwner && (
      <TouchableOpacity
        onPress={() => pickImage("profile")}
        style={styles.profileCameraIcon}
      >
        <Ionicons
          name="camera"
          size={14}
          color="#fff"
        />
      </TouchableOpacity>
    )}
  </View>
</View>

        {/* NAME */}
       <Text style={[styles.name, { textAlign: "center" }]}>
  {user?.full_name || "User"}
</Text>
{isOwner && (
  <TouchableOpacity
    onPress={() =>
      navigation.navigate("SoldListingsScreen", {
        userId: profileUserId,
      })
    }
    style={styles.soldMiniButton}
  >
    <Text style={styles.soldMiniText}>SOLD</Text>
  </TouchableOpacity>
)}
        {/* FOLLOW */}
        {!isOwner && (
          <TouchableOpacity
            onPress={toggleFollow}
            style={styles.followBtn}
          >
            <Text style={styles.followText}>
              {isFollowing ? t?.unfollow : t?.follow}
            </Text>
          </TouchableOpacity>
        )}

        {/* TABS */}
        <View style={styles.tabRow}>
          
          {Object.keys(tabLabels)
            .filter((tab) => !(tab === "boost" && !isOwner))
            .map((tab) => (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
              >
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
    

    renderItem={({ item }) => {
      console.log("TITLE:", item.title);
console.log("IMAGES:", item.images);
      const images =
        Array.isArray(item?.images) && item.images.length > 0
          ? item.images
          : item?.image
          ? [item.image]
          : item?.coverImage
          ? [item.coverImage]
          : [];

      const image = images[0] || "https://via.placeholder.com/300";

      return (
        <TouchableOpacity
          style={styles.listingCard}
          onPress={() =>
            navigation.navigate("ListingDetailScreen", {
              listing: item,
            })
          }
        >
          <Image source={{ uri: image }} style={styles.listingImage} />

          <Text style={styles.listingTitle} numberOfLines={1}>
            {item.title}
          </Text>

          <Text style={styles.listingPrice}>${item.price}</Text>

          {item.status === "sold" && (
            <View
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                backgroundColor: "red",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 6,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 10 }}>
                SOLD
              </Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }}

    ListFooterComponent={() => {
      if (activeTab === "about") return renderAbout();
      if (activeTab === "boost" && isOwner) return renderBoost();
      return null;
    }}
  />
);
}
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F2F2F7",
    
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 50,
  },

  name: {
    fontSize: 18,
    fontWeight: "300",
    marginTop: 5,
  },

  followBtn: {
  backgroundColor: "#111",
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 20,
  marginTop: 10,
  alignSelf: "center", // 🔥 THIS is the key
},
  followText: {
    color: "#fff",
  },

  tabRow: {
  flexDirection: "row",
  justifyContent: "center",
  flexWrap: "wrap",
  marginTop: 30,
},

  tabText: {
    marginHorizontal: 25,
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
  backgroundColor: "rgba(255,255,255,0.85)",
  paddingHorizontal: 10,
  paddingVertical: 6,
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
    fontSize: 12,
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
  bottom: 5,
  right: 5,
  backgroundColor: "rgba(0,0,0,0.6)",
  padding: 6,
  borderRadius: 20,
},

boostContainer: {
  width: "100%",
  padding: 15,
},

boostTitle: {
  fontSize: 18,
  fontWeight: "700",
  marginBottom: 10,
},

boostCard: {
  flexDirection: "row",
  backgroundColor: "#fff",
  padding: 10,
  borderRadius: 10,
  marginBottom: 10,
  alignItems: "center",
},

boostImage: {
  width: 70,
  height: 70,
  borderRadius: 10,
  marginRight: 10,
},

boostItemTitle: {
  fontWeight: "600",
},

boostPrice: {
  color: "#555",
  marginTop: 4,
},

boostActionBtn: {
  marginTop: 8,
  backgroundColor: "#111",
  paddingVertical: 6,
  paddingHorizontal: 10,
  borderRadius: 6,
  alignSelf: "flex-start",
},

boostActionText: {
  color: "#fff",
  fontSize: 12,
},

bioBox: {
  width: "100%",
  paddingHorizontal: 15,
  paddingVertical: 10,
  marginTop: 10,
},

bioInput: {
  height: 80,           // 🔥 change this anytime (50, 100, 120 etc)
  borderWidth: 1,
  borderColor: "#ddd",
  borderRadius: 10,
  padding: 10,
  textAlignVertical: "top",
  backgroundColor: "#fff",
  marginTop: 6,
},

bioCounter: {
  fontSize: 12,
  marginTop: 4,
  color: "#888",
  textAlign: "right",
},

bioDoneBtn: {
  marginTop: 6,
  alignSelf: "flex-end",
},

bioDoneText: {
  color: "#007AFF",
  fontWeight: "600",
},

bioEditBtn: {
  marginTop: 6,
},

bioEditText: {
  color: "#007AFF",
  fontWeight: "600",
},

soldMiniButton: {
  marginTop: 10,
  alignSelf: "center",
  backgroundColor: "#111",
  paddingHorizontal: 14,
  paddingVertical: 0.5,
  borderRadius: 20,
},

soldMiniText: {
  color: "#fff",
  fontSize: 11,
  fontWeight: "700",
},


});
