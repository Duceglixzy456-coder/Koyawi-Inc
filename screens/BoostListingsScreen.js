import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { api } from "../utils/api";
import { useAuth } from "../Context/AuthContext";

export default function BoostListingScreen({ navigation }) {
  const { token } = useAuth();

  const [listings, setListings] = useState([]);
  const [selected, setSelected] = useState({});
  const [duration, setDuration] = useState("7d");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://192.168.1.194:8000/listings");
        const data = await res.json();
        setListings(data);
      } catch (err) {
        console.log("BOOST LOAD ERROR:", err);
      }
    };

    load();
  }, []);

  const toggleSelect = (id) => {
    setSelected((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const getPrice = () => {
    const count = Object.values(selected).filter(Boolean).length;

    if (duration === "24h") return count * 5;
    if (duration === "7d") return count * 20;
    if (duration === "30d") return count * 50;

    return 0;
  };

  const payNow = () => {
    const selectedIds = Object.keys(selected).filter((id) => selected[id]);

    if (selectedIds.length === 0) {
      alert("Select at least one listing");
      return;
    }

    console.log("PAYLOAD:", {
      listings: selectedIds,
      duration,
      price: getPrice(),
    });

    // later: Orange Money redirect here
    alert("Redirecting to Orange Money...");
  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Boost Your Listings</Text>

      {/* DURATION SELECTOR */}
      <View style={styles.row}>
        {["24h", "7d", "30d"].map((d) => (
          <TouchableOpacity
            key={d}
            onPress={() => setDuration(d)}
            style={[
              styles.durationBtn,
              duration === d && styles.durationActive,
            ]}
          >
            <Text
              style={{
                color: duration === d ? "#fff" : "#000",
              }}
            >
              {d}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LISTINGS */}
      <FlatList
        data={listings}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => {
          const isSelected = selected[item._id];

          return (
            <TouchableOpacity
              onPress={() => toggleSelect(item._id)}
              style={[
                styles.card,
                isSelected && styles.cardSelected,
              ]}
            >
              <Image source={{ uri: item.image }} style={styles.img} />

              <View style={{ flex: 1 }}>
                <Text numberOfLines={1}>{item.title}</Text>
                <Text>${item.price}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />

      {/* FOOTER */}
      <View style={styles.footer}>
        <Text style={styles.priceText}>
          Total: ${getPrice()}
        </Text>

        <TouchableOpacity onPress={payNow} style={styles.payBtn}>
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Pay with Orange Money
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    padding: 15,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    marginBottom: 15,
  },

  durationBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    marginRight: 10,
  },

  durationActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 10,
    marginBottom: 10,
    borderRadius: 10,
    alignItems: "center",
  },

  cardSelected: {
    borderWidth: 2,
    borderColor: "#111",
  },

  img: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },

  footer: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },

  priceText: {
    fontSize: 16,
    marginBottom: 10,
  },

  payBtn: {
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});