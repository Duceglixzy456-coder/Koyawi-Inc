import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function SelectBuyerScreen({ route, navigation }) {
  const { listing_id } = route.params;

  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const token = await AsyncStorage.getItem("access_token");

      const res = await fetch(
        `http://192.168.1.194:8000/conversations/listing/${listing_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();

      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("ERROR loading conversations:", err);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate("ConfirmSaleScreen", {
          conversation: item,
          listing_id,
        })
      }
    >
      <Text style={styles.title}>Acheteur: {item.buyer_id}</Text>

      <Text style={styles.message}>
        {item.last_message || "Aucun message"}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (conversations.length === 0) {
    return (
      <View style={styles.center}>
        <Text>Aucun acheteur pour cette annonce</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sélectionner un acheteur</Text>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 16 },
  header: { fontSize: 20, fontWeight: "bold", marginBottom: 12 },
  card: { padding: 14, borderBottomWidth: 1, borderColor: "#eee" },
  title: { fontSize: 16, fontWeight: "600" },
  message: { color: "#666", marginTop: 4 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});