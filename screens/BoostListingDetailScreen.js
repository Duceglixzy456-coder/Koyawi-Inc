import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  Alert,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Linking } from "react-native";
import { apiFetch } from "../api/apiClient";

export default function BoostListingDetailScreen({ navigation, route }) {
  const { listing } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const listingImage =
    (Array.isArray(listing?.images) && listing.images[0]) ||
    listing?.image ||
    listing?.coverImage ||
    "https://via.placeholder.com/100";

  const openWhatsApp = (plan) => {
    const phoneNumber = "13472798416";

    const message = `Bonjour l’équipe KOYAWI 👋

Je souhaite booster mon annonce :

📦 Titre : ${listing?.title || ""}
💰 Prix : ${listing?.price || ""}
⏳ Plan : ${plan?.label || ""}
🆔 ID : ${listing?._id || ""}`;

    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
      message
    )}`;

    Alert.alert(
      "Contacter le support",
      "Vous allez être redirigé vers WhatsApp pour finaliser votre demande de boost.",
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Continuer",
          onPress: async () => {
            try {
              const canOpen = await Linking.canOpenURL(url);
              if (canOpen) await Linking.openURL(url);
            } catch (err) {
              console.log("WHATSAPP ERROR:", err);
            }
          },
        },
      ]
    );
  };

  const handleBoost = async () => {
    if (!selectedPlan || !listing?._id) return;

    try {
      setLoading(true);

      const res = await apiFetch(`/boost/${listing._id}`, {
        method: "POST",
        body: JSON.stringify({
          days: selectedPlan.days,
          price_gnf: selectedPlan.priceGNF,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        console.log("BOOST ERROR:", data);
        Alert.alert("Error", "Boost failed");
        return;
      }

      Alert.alert(
        "Activation en cours",
        "Veuillez contacter le support KOYAWI pour activer la promotion de votre annonce.",
        [
          {
            text: "Continuer",
            onPress: () => {
              openWhatsApp(selectedPlan);
              navigation.goBack();
            },
          },
        ]
      );
    } catch (err) {
      console.log("BOOST FAIL:", err);
      Alert.alert("Error", "Network issue");
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

  const price = Number(listing?.price || 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      
      {/* BACK */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={20} color="#111" />
      </TouchableOpacity>

      {/* TITLE */}
      <Text style={styles.title}>Boost Listing</Text>

      {/* PREVIEW */}
      <View style={styles.previewCard}>
        <Image source={{ uri: listingImage }} style={styles.previewImage} />

        <View style={{ flex: 1 }}>
          <Text numberOfLines={1} style={styles.previewTitle}>
            {listing?.title || "Untitled"}
          </Text>

          <Text style={styles.previewPrice}>
            {price.toLocaleString()} GNF ≈ ${Math.round(price / 8500)}
          </Text>
        </View>
      </View>

      {/* PLANS */}
      <Text style={styles.sectionTitle}>Choisir une durée</Text>

      {BOOST_OPTIONS.map((plan) => {
        const isSelected = selectedPlan?.label === plan.label;

        return (
          <TouchableOpacity
            key={plan.label}
            onPress={() => setSelectedPlan(plan)}
            style={[styles.planCard, isSelected && styles.planSelected]}
          >
            <Text style={styles.planLabel}>{plan.label}</Text>

            <Text style={styles.planPrice}>
              {Number(plan.priceGNF).toLocaleString()} GNF
            </Text>

            <Text style={styles.planUsd}>≈ ${plan.usd}</Text>
          </TouchableOpacity>
        );
      })}

      {/* BUTTON */}
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

/* ================= STYLES ================= */

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