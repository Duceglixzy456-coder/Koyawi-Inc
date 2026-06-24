import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function BoostListingDetailScreen({ navigation, route }) {
  const { listing } = route.params;
  const [loading, setLoading] = useState(false);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const handleBoost = async () => {
  if (!selectedPlan) return;

  try {
    setLoading(true);

    const token = await AsyncStorage.getItem("access_token");

    if (!token) {
      console.log("NO TOKEN");
      return;
    }

    const res = await fetch(
      `http://192.168.1.195:8000/boost/${listing._id}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          days: selectedPlan.days,
          price_gnf: selectedPlan.priceGNF,
        }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.log("BOOST ERROR:", data);
      return;
    }

   Alert.alert(
  "Contact Support",
  "Contact KOYAWI support to activate listing promotion.",
  [
    { text: "OK" }
  ]
);

    // go back after success
    navigation.goBack();

  } catch (err) {
    console.log("BOOST FAIL:", err);
  } finally {
    setLoading(false);
  }
};

  const BOOST_OPTIONS = [
    { label: "24 heures", days: 1, priceGNF: 25000, usd: 3 },
    { label: "3 jours", days: 3, priceGNF: 50000, usd: 6 },
    { label: "7 jours", days: 7, priceGNF: 100000, usd: 12 },
    { label: "1 mois", days: 30, priceGNF: 250000, usd: 30 },
  ];

  return (
  <ScrollView
    style={styles.container}
    contentContainerStyle={{ paddingBottom: 40 }}
  >
    {/* BACK BUTTON */}
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={styles.backBtn}
    >
      <Ionicons name="arrow-back" size={20} color="#111" />
    </TouchableOpacity>

    {/* TITLE */}
    <Text style={styles.title}>Boost Listing</Text>

    {/* LISTING PREVIEW */}
    <View style={styles.previewCard}>
      <Image source={{ uri: listing.image }} style={styles.previewImage} />

      <View style={{ flex: 1 }}>
        <Text numberOfLines={1} style={styles.previewTitle}>
          {listing.title}
        </Text>

        <Text style={styles.previewPrice}>
          {listing.price?.toLocaleString?.() || listing.price} GNF ≈ $
          {Math.round(listing.price / 8500)}
        </Text>
      </View>
    </View>

    {/* PLAN SELECTOR */}
    <Text style={styles.sectionTitle}>Choisir une durée</Text>

    {BOOST_OPTIONS.map((plan) => {
      const isSelected = selectedPlan?.label === plan.label;

      return (
        <TouchableOpacity
          key={plan.label}
          onPress={() => setSelectedPlan(plan)}
          style={[
            styles.planCard,
            isSelected && styles.planSelected,
          ]}
        >
          <Text style={styles.planLabel}>{plan.label}</Text>

          <Text style={styles.planPrice}>
            {plan.priceGNF.toLocaleString()} GNF
          </Text>

          <Text style={styles.planUsd}>≈ ${plan.usd}</Text>
        </TouchableOpacity>
      );
    })}

    {/* PAY BUTTON (ONLY ONCE) */}
    <TouchableOpacity
      disabled={!selectedPlan || loading}
      onPress={handleBoost}
      style={[
        styles.payBtn,
        (!selectedPlan || loading) && { opacity: 0.5 },
      ]}
    >
      <Text style={styles.payText}>
        {loading ? "Processing..." : "Payer avec Orange Money"}
      </Text>
    </TouchableOpacity>
  </ScrollView>
);
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F2F7",
    padding: 15,
  },

  backBtn: {
    position: "absolute",
    top: 50,
    left: 15,
    zIndex: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
    padding: 8,
    borderRadius: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 80,
    marginBottom: 20,
  },

  previewCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },

  previewTitle: {
    fontWeight: "600",
  },

  previewPrice: {
    color: "#666",
    marginTop: 4,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },

  planCard: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },

  planSelected: {
    borderWidth: 2,
    borderColor: "#111",
  },

  planLabel: {
    fontSize: 15,
    fontWeight: "600",
  },

  planPrice: {
    marginTop: 5,
    fontSize: 14,
  },

  planUsd: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },

  payBtn: {
    marginTop: 20,
    backgroundColor: "#111",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },

  payText: {
    color: "#fff",
    fontWeight: "600",
  },
});