import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

export default function ListingDetailScreen({ route, navigation }) {
  const { listing } = route.params;
  const [myUserId, setMyUserId] = React.useState(null);

  console.log("OWNER DEBUG:", listing.owner_id, listing.owner);

  React.useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) return;

      const decoded = jwtDecode(token);
      setMyUserId(decoded.sub);
    };

    loadUser();
  }, []);

  const createConversation = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");
      if (!token) {
        console.log("NO TOKEN");
        return;
      }

      const decoded = jwtDecode(token);
      const buyerId = decoded.sub;

      const sellerId = listing.owner_id || listing.owner;

      if (!sellerId) {
        console.log("MISSING SELLER ID");
        return;
      }

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

      console.log("NEW CONVERSATION:", data);

      navigation.navigate("Chat", {
        conversationId: data.conversation_id,
      });
    } catch (err) {
      console.log("CONVERSATION ERROR:", err);
    }
  };

  const goToSellerProfile = () => {
    const sellerId = listing.owner_id || listing.owner;

    console.log("OWNER DEBUG:", sellerId);

    if (!sellerId) {
      console.log("BLOCKED: Missing seller ID");
      return;
    }

    navigation.navigate("SellerProfile", {
      userId: sellerId,
    });
  };

  const deleteListing = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const response = await fetch(
        `http://192.168.1.195:8000/listings/${listing._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      console.log("DELETE RESULT:", data);

      navigation.goBack();
    } catch (err) {
      console.log("DELETE ERROR:", err);
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* IMAGE */}
      <Image source={{ uri: listing.image }} style={styles.image} />

      {/* TITLE */}
      <Text style={styles.title}>{listing.title}</Text>

      {/* PRICE */}
      <Text style={styles.price}>${listing.price}</Text>

      {/* DESCRIPTION */}
      <Text style={styles.description}>{listing.description}</Text>

      {/* MESSAGE BUTTON */}
      <TouchableOpacity onPress={createConversation} style={styles.messageBtn}>
        <Text style={styles.messageText}>Message Seller</Text>
      </TouchableOpacity>

      {/* PROFILE BUTTON */}
      <TouchableOpacity onPress={goToSellerProfile} style={styles.profileBtn}>
        <Text style={styles.profileText}>View Seller Profile</Text>
      </TouchableOpacity>

      {/* DELETE BUTTON */}
      {listing.owner_id === myUserId && (
        <TouchableOpacity onPress={deleteListing} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>Delete Listing</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f3f5",
    padding: 15,
  },

  header: {
    paddingTop: 50,
    paddingBottom: 10,
  },

  back: {
    fontSize: 18,
    fontWeight: "600",
  },

  image: {
    width: "100%",
    height: 250,
    borderRadius: 12,
  },

  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 12,
  },

  price: {
    fontSize: 18,
    marginTop: 5,
    fontWeight: "600",
  },

  description: {
    marginTop: 10,
    color: "#555",
  },

  messageBtn: {
    backgroundColor: "#000",
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },

  messageText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  profileBtn: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },

  profileText: {
    color: "#111",
    textAlign: "center",
    fontWeight: "600",
  },

  deleteBtn: {
    backgroundColor: "red",
    padding: 15,
    borderRadius: 10,
    marginTop: 12,
  },

  deleteText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});