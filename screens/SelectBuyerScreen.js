import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { useAuth } from "../Context/AuthContext";

export default function SelectBuyerScreen({ route, navigation }) {
  const { listingId } = route.params;
  const { token } = useAuth();

  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [confirmVisible, setConfirmVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          `http://192.168.1.194:8000/conversations/listing/${listingId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await res.json();
        setConvos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("FETCH ERROR:", err);
        setConvos([]);
      } finally {
        setLoading(false);
      }
    };

    if (listingId && token) load();
  }, [listingId, token]);

  const markAsSold = async () => {
    if (!selected?._id) return;

    try {
      const res = await fetch(
        `http://192.168.1.194:8000/listings/${listingId}/mark-sold`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            conversation_id: selected._id,
          }),
        }
      );

      if (!res.ok) {
        console.log("MARK SOLD FAILED:", await res.text());
        return;
      }

      setConfirmVisible(false);
      navigation.goBack();
    } catch (err) {
      console.log("MARK SOLD ERROR:", err);
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const formatTime = (t) => {
    if (!t) return "";
    try {
      return new Date(t).toLocaleDateString();
    } catch {
      return "";
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Loading buyers...</Text>
      </View>
    );
  }

  if (!convos.length) {
    return (
      <View style={styles.center}>
        <Text style={{ fontSize: 16, fontWeight: "600" }}>
          No buyers yet
        </Text>
        <Text style={{ color: "#888", marginTop: 6, textAlign: "center" }}>
          Buyers will appear here once they message your listing
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 18 }}>‹ Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Select Buyer</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 12 }}>
        {convos.map((c) => (
          <TouchableOpacity
            key={c._id}
            onPress={() => {
              setSelected(c);
              setConfirmVisible(true);
            }}
            style={[
              styles.card,
              selected?._id === c._id && styles.cardSelected,
            ]}
          >
            <View style={styles.row}>
              {c.buyer?.image ? (
                <Image source={{ uri: c.buyer.image }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={{ color: "#fff", fontWeight: "700" }}>
                    {getInitials(c.buyer?.name || c.buyer_id)}
                  </Text>
                </View>
              )}

              <View style={{ flex: 1 }}>
                <Text style={styles.buyerText}>
                  {c.buyer?.name || "Unknown Buyer"}
                </Text>

                <Text style={styles.message} numberOfLines={1}>
                  {c.last_message || "No messages yet"}
                </Text>
              </View>

              <Text style={styles.time}>
                {formatTime(c.last_message_time)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {confirmVisible && selected && (
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>Confirm Sale</Text>

          <Text style={styles.sheetText}>
            Mark as sold to {selected.buyer?.name || "this buyer"}?
          </Text>

          <View style={styles.sheetActions}>
            <TouchableOpacity
              onPress={() => setConfirmVisible(false)}
              style={[styles.btn, styles.cancelBtn]}
            >
              <Text>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={markAsSold}
              style={[styles.btn, styles.confirmBtn]}
            >
              <Text style={{ color: "#fff", fontWeight: "700" }}>
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f6f8" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  title: { fontSize: 18, fontWeight: "700", marginLeft: 12 },

  card: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 14,
    marginBottom: 10,
  },

  cardSelected: { borderWidth: 2, borderColor: "#000" },

  row: { flexDirection: "row", alignItems: "center" },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatarImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },

  buyerText: { fontWeight: "700", fontSize: 14 },
  message: { color: "#666", marginTop: 2 },
  time: { fontSize: 11, color: "#999" },

  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderTopWidth: 1,
    borderColor: "#eee",
  },

  sheetTitle: { fontSize: 16, fontWeight: "700" },
  sheetText: { color: "#666", marginTop: 6 },

  sheetActions: { flexDirection: "row", marginTop: 14 },

  btn: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  cancelBtn: { backgroundColor: "#eee", marginRight: 8 },
  confirmBtn: { backgroundColor: "#000" },
});