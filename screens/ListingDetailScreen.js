import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";

import ScreenHeader from "../components/ScreenHeader";
import { useAuth } from "../Context/AuthContext";
import { jwtDecode } from "jwt-decode";
import { getTokenOrLogout } from "../utils/auth";

export default function ListingDetailScreen({ route, navigation }) {
  const { listing } = route.params;

  const { token } = useAuth();
  const [myUserId, setMyUserId] = React.useState(null);

  // ---------------- GET USER ----------------
  React.useEffect(() => {
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      setMyUserId(decoded.sub);
    } catch (err) {
      console.log("JWT ERROR:", err);
    }
  }, [token]);

  // ---------------- MESSAGE SELLER ----------------
  const createConversation = async () => {
    try {
      const token = await getTokenOrLogout(navigation);
      if (!token) return;

      const sellerId = listing?.owner_id;

      if (!sellerId) return;

      const response = await fetch(
        "http://192.168.1.195:8000/conversations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            seller_id: sellerId,
            listing_id: listing._id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) return;

      navigation.navigate("Chat", {
        conversationId: data.conversation_id,
        otherUserId: sellerId,
      });
    } catch (err) {
      console.log("CONVERSATION ERROR:", err);
    }
  };

  // ---------------- DELETE LISTING ----------------
  const deleteListing = async () => {
    try {
      const token = await getTokenOrLogout(navigation);
      if (!token) return;

      await fetch(
        `http://192.168.1.195:8000/listings/${listing._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      navigation.goBack();
    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  };

  const goToSellerProfile = () => {
    navigation.navigate("SellerProfile", {
      sellerId: listing.owner_id,
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f5f7" }}>
      <ScreenHeader title="Listing" navigation={navigation} />

      <ScrollView style={{ paddingHorizontal: 16, paddingTop: 10 }}>
        <Image source={{ uri: listing.image }} style={styles.image} />

        <Text style={styles.title}>{listing.title}</Text>
        <Text style={styles.price}>${listing.price}</Text>
        <Text style={styles.description}>{listing.description}</Text>

        <TouchableOpacity onPress={createConversation} style={styles.messageBtn}>
          <Text style={styles.messageText}>Message Seller</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={goToSellerProfile} style={styles.profileBtn}>
          <Text style={styles.profileText}>View Seller Profile</Text>
        </TouchableOpacity>

        {myUserId && listing.owner_id === myUserId && (
          <TouchableOpacity onPress={deleteListing} style={styles.deleteBtn}>
            <Text style={styles.deleteText}>Delete Listing</Text>
          </TouchableOpacity>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { width: "100%", height: 260, borderRadius: 12 },
  title: { fontSize: 24, fontWeight: "bold", marginTop: 12 },
  price: { fontSize: 18, marginTop: 6, fontWeight: "600" },
  description: { marginTop: 10, color: "#555", lineHeight: 20 },

  messageBtn: { backgroundColor: "#000", padding: 15, borderRadius: 10, marginTop: 20 },
  messageText: { color: "#fff", textAlign: "center", fontWeight: "bold" },

  profileBtn: { backgroundColor: "#fff", padding: 15, borderRadius: 10, marginTop: 12, borderWidth: 1 },
  profileText: { textAlign: "center", fontWeight: "600" },

  deleteBtn: { backgroundColor: "red", padding: 15, borderRadius: 10, marginTop: 12 },
  deleteText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});