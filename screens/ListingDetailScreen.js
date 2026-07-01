import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Keyboard,
} from "react-native";
 
import { FlatList, Dimensions } from "react-native";

import { useAuth } from "../Context/AuthContext";


const SkeletonBox = ({ width, height, style }) => {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.7,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: "#2a2a2a",
          borderRadius: 10,
          opacity,
        },
        style,
      ]}
    />
  );
};
export default function ListingDetailScreen({ route, navigation }) {
  
  console.log("CHAT PARAMS:", route.params);
  const images =
  Array.isArray(listing?.images) && listing.images.length > 0
    ? listing.images
    : listing?.coverImage
    ? [listing.coverImage]
    : listing?.image
    ? [listing.image]
    : [];
  

  const [undoVisible, setUndoVisible] = useState(false);
const undoRef = useRef(null);
const sellerId = listing?.owner_id;
const { user } = useAuth();
const userId = user?._id;
const { listing: initialListing } = route.params;

const [ setListing] = useState(initialListing);
const [loading, setLoading] = useState(!initialListing);

 
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("actions");

 const screenWidth = Dimensions.get("window").width;
const [views, setViews] = useState(listing?.views || 0);
const hasCountedView = useRef(false);
const { listing } = route.params;
  const isOwner =
  userId && listing?.owner_id
    ? String(userId) === String(listing.owner_id)
    : false;
    

useEffect(() => {
  if (!listing?._id) return;
  if (hasCountedView.current) return;

  hasCountedView.current = true;

  const incrementView = async () => {
    try {
      await fetch(
        `http://192.168.1.194:8000/listings/${listing._id}/view`,
        { method: "POST" }
      );
    } catch (err) {
      console.log("VIEW ERROR:", err);
    }
  };

  incrementView();
}, [listing?._id]);

  
const handleMarkAsSold = async () => {
  try {
    if (!listing?._id || !token || !userId) return;

    const res = await fetch(
      `http://192.168.1.194:8000/listings/${listing._id}/mark-sold`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.log("SOLD FAILED:", data);
      return;
    }

    Alert.alert("Success", "Marked as sold");
    navigation.goBack();
  } catch (err) {
    console.log("SOLD ERROR:", err);
  }
};
const handleShareListing = async () => {
  try {
    if (!listing?._id) return;

    const url = `myapp://listing/${listing._id}`; 
    // or replace with your web link if you have one

    await Share.share({
      message: `${listing.title} - $${listing.price}\n\nCheck it out: ${url}`,
    });

  } catch (err) {
    console.log("SHARE ERROR:", err);
  }
};
const handleReportListing = async () => {
  try {
    if (!listing?._id || !token || !userId) return;

    const res = await fetch(
      `http://192.168.1.194:8000/listings/${listing._id}/report`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          reporter_id: userId,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.log("REPORT FAILED:", data);
      return;
    }

    Alert.alert("Reported", "Listing has been reported");
  } catch (err) {
    console.log("REPORT ERROR:", err);
  }
};
 const createConversation = async (prefilledMessage = "") => {
  try {
    if (!token || !listing?.owner_id || !userId) return;

    const response = await fetch(
      "http://192.168.1.194:8000/conversations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          seller_id: listing.owner_id,
          listing_id: listing._id,
        }),
      }
    );

    const data = await response.json();

    const conversationId =
      data?.conversation_id || data?._id || data?.id;

    if (!conversationId) return;

    navigation.navigate("Chat", {
      conversationId,
      listingId: listing._id,
      otherUserId: listing.owner_id,
      prefilledMessage,
    });

  } catch (err) {
    console.log("CONVO ERROR:", err);
  }
};
const startSellFlow = () => {
  navigation.navigate("SelectBuyerScreen", {
    listing_id: String(listing._id),
  });
};

  const deleteListing = () => {
  Alert.alert(
    "Delete Listing?",
    "This will hide your listing. You can undo this for 5 minutes.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const res = await fetch(
              `http://192.168.1.194:8000/listings/${listing._id}`,
              {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await res.json();

            if (!res.ok) {
              console.log("DELETE FAILED:", data);
              return;
            }

            // ---------------- SHOW UNDO BAR ----------------
            showUndoToast(listing._id);

            navigation.goBack();
          } catch (err) {
            console.log("DELETE ERROR:", err);
          }
        },
      },
    ]
  );
};

const showUndoToast = (listingId) => {
  setUndoVisible(true);

  // auto hide after 5 min (server window)
  undoRef.current = setTimeout(() => {
    setUndoVisible(false);
  }, 300000);
};

const undoDelete = async (listingId) => {
  try {
    const res = await fetch(
      `http://192.168.1.194:8000/listings/${listingId}/undo`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.ok) {
      setUndoVisible(false);
      clearTimeout(undoRef.current);
    }
  } catch (err) {
    console.log("UNDO ERROR:", err);
  }
};
 const goToSellerProfile = () => {
  if (!listing?.owner_id) return;

  navigation.navigate("SellerProfile", {
    userId: listing.owner_id,
  });
};
const ListingSkeleton = () => {
  return (
    <View style={{ padding: 15 }}>

      {/* BIG IMAGE */}
      <SkeletonBox width="100%" height={250} style={{ marginBottom: 15 }} />

      {/* TITLE */}
      <SkeletonBox width="70%" height={20} style={{ marginBottom: 10 }} />

      {/* PRICE */}
      <SkeletonBox width="40%" height={18} style={{ marginBottom: 20 }} />

      {/* SELLER ROW */}
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20 }}>
        <SkeletonBox width={45} height={45} style={{ borderRadius: 25 }} />
        <View style={{ marginLeft: 10 }}>
          <SkeletonBox width={120} height={14} style={{ marginBottom: 6 }} />
          <SkeletonBox width={80} height={12} />
        </View>
      </View>

      {/* DESCRIPTION */}
      <SkeletonBox width="100%" height={12} style={{ marginBottom: 8 }} />
      <SkeletonBox width="95%" height={12} style={{ marginBottom: 8 }} />
      <SkeletonBox width="90%" height={12} style={{ marginBottom: 20 }} />

      {/* BUTTON */}
      <SkeletonBox width="100%" height={45} style={{ borderRadius: 12 }} />
    </View>
  );
};
// ---------------- LOADING STATE ----------------
if (loading) {
  return <ListingSkeleton />;
}

// ---------------- MAIN UI ----------------
return (
  <View style={styles.container}>

    {/* BACK BUTTON LAYER (MUST BE FIRST) */}
    <View style={styles.backLayer}>
      <TouchableOpacity
        onPress={() => {
          if (navigation.canGoBack()) navigation.goBack();
          else navigation.navigate("MainApp");
        }}
        activeOpacity={0.7}
        style={styles.backBtn}
      >
        <Text style={styles.backIcon}>‹</Text>
      </TouchableOpacity>
    </View>

    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* IMAGE */}
   <ScrollView
  horizontal
  pagingEnabled
  showsHorizontalScrollIndicator={false}
  style={{ width: "100%", height: 320 }}
  onMomentumScrollEnd={(event) => {
    const index = Math.round(
     event.nativeEvent.contentOffset.x / screenWidth
    );
    setActiveIndex(index);
  }}
>
  {images.map((img, index) => (
   <Image
  key={index}
  source={{ uri: img }}
  style={{
    width: screenWidth,
    height: 320,
    resizeMode: "cover",
  }}
/>
  ))}
</ScrollView>
<View
  style={{
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
  }}
>
  {images.map((_, index) => {
    const active = index === activeIndex;

    return (
      <View
        key={index}
        style={{
          width: active ? 10 : 6,
          height: active ? 10 : 6,
          borderRadius: 5,
          marginHorizontal: 4,
          backgroundColor: active ? "#000" : "#bbb",
        }}
      />
    );
  })}
</View>
      {/* INFO CARD */}
      <View style={styles.card}>
  <Text style={styles.title}>{listing.title}</Text>

  {/* PRICE + VIEWS ROW */}
  <View style={styles.priceRow}>
    <Text style={styles.price}>${listing.price}</Text>

    <Text style={styles.views}>
      VUES {views}
    </Text>
  </View>
</View>

      {/* DESCRIPTION */}
      <View style={styles.section}>
       <Text style={styles.sectionText}>
  {listing.description || "No description provided by seller"}
</Text>
      </View>

      {/* ================= ACTION BAR ================= */}
      <View style={styles.actionBar}>

        <TouchableOpacity
          onPress={goToSellerProfile}
          style={styles.actionItem}
        >
          <Text style={styles.actionText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setActiveTab(activeTab === "message" ? "actions" : "message")
          }
          style={styles.actionItem}
        >
          <Text style={styles.actionText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            setActiveTab(activeTab === "more" ? "actions" : "more")
          }
          style={styles.actionItem}
        >
          <Text style={styles.actionText}>More</Text>
        </TouchableOpacity>

      </View>

      {/* ================= MESSAGE TAB ================= */}
      {activeTab === "message" && (
        <View style={styles.tabBox}>

          <Text style={styles.tabTitle}>Messages rapides</Text>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              createConversation("Bonjour 👋 Je suis intéressé")
            }
          >
            <Text>Bonjour 👋 Je suis intéressé</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              createConversation("Est-ce toujours disponible ?")
            }
          >
            <Text>Est-ce toujours disponible ?</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, { borderBottomWidth: 0 }]}
            onPress={() =>
              createConversation("Où êtes-vous situé ?")
            }
          >
            <Text>Où êtes-vous situé ?</Text>
          </TouchableOpacity>

        </View>
      )}

     {/* MORE TAB */}
     {activeTab === "more" && (
  <View style={styles.tabBox}>
    <Text style={styles.tabTitle}>More Options</Text>

    {userId && listing?.owner_id === userId ? (
      <>
        <TouchableOpacity
          style={[styles.menuItem, { opacity: 0.85 }]}
          onPress={handleMarkAsSold}
        >
          <Text style={{ fontWeight: "600" }}>Mark as sold</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem} onPress={handleEditListing}>
          <Text>Edit Listing</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomWidth: 0 }]}
          onPress={deleteListing}
        >
          <Text style={{ color: "red" }}>Delete Listing</Text>
        </TouchableOpacity>
      </>
    ) : (
      <>
        <TouchableOpacity style={styles.menuItem} onPress={handleReportListing}>
          <Text>Report Listing</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuItem, { borderBottomWidth: 0 }]}
          onPress={handleShareListing}
        >
          <Text>Share Listing</Text>
        </TouchableOpacity>
      </>
    )}
  </View>
)}

      <View style={{ height: 40 }} />
    </ScrollView>

    {/* ================= UNDO BANNER (GLOBAL OVERLAY) ================= */}
    {undoVisible && (
      <View
        style={{
          position: "absolute",
          bottom: 20,
          left: 20,
          right: 20,
          backgroundColor: "#111",
          paddingVertical: 12,
          paddingHorizontal: 14,
          borderRadius: 12,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 999,
          elevation: 10,
        }}
      >
        <Text style={{ color: "#fff", fontSize: 14 }}>
          Listing will be deleted
        </Text>

        <TouchableOpacity onPress={undoDelete}>
          <Text style={{ color: "#00ff99", fontWeight: "700" }}>
            UNDO
          </Text>
        </TouchableOpacity>
      </View>
    )}

  </View>
);
}
/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f5f7",
  },

  image: {
    width: "100%",
    height: 320,
  },

  card: {
    backgroundColor: "#fff",
    marginTop: -15,
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },

  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
  },

  price: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
    color: "#111",
  },

  section: {
    backgroundColor: "#fff",
    padding: 16,
    marginTop: 0,
    minHeight: 160,
  },

  sectionText: {
    color: "#444",
    fontSize: 14,
    lineHeight: 21,
  },

  /* ================= ACTION BAR ================= */
  actionBar: {
    flexDirection: "row",
    marginTop: 14,
    marginHorizontal: 12,
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 16,

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },

  actionItem: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    alignItems: "center",
  },

  actionText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111",
  },

  primaryItem: {
    backgroundColor: "#000",
    borderColor: "#000",
  },

  primaryText: {
    color: "#fff",
  },

  /* ================= TAB BOX ================= */
  tabBox: {
    backgroundColor: "#fff",
    marginTop: 12,
    marginHorizontal: 12,
    padding: 14,
    borderRadius: 14,
  },

  menuItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  tabTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },

  /* ================= HEADER ================= */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },

  headerTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },

  /* ================= BACK BUTTON ================= */
  backLayer: {
    position: "absolute",
    top: 50,
    left: 15,
    zIndex: 9999,
    elevation: 9999,
  },

  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.06)",
    justifyContent: "center",
    alignItems: "center",
  },

  backIcon: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000",
  },

  priceRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 6,
},

views: {
  fontSize: 16,
  fontWeight: "600",
  color: "#666",
  letterSpacing: 2.5,
},
});