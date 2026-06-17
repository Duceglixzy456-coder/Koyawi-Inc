import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

function MenuItem({ icon, label, onPress }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress}>
      <View style={styles.left}>
        <Ionicons name={icon} size={18} color="#444" style={{ width: 28 }} />
        <Text style={styles.label}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#bbb" />
    </TouchableOpacity>
  );
}

function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem("token");
            navigation.replace("Login");
          } catch (err) {
            console.log("Logout error:", err);
          }
        },
      },
    ]);
  };

  const handleDeactivate = () => {
    Alert.alert(
      "Deactivate Account",
      "This will disable your account. You can contact support to restore it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: async () => {
            try {
              // Optional backend call later
              // await fetch(`${API_URL}/deactivate`, { method: "POST" });

              await AsyncStorage.removeItem("token");
              navigation.replace("Login");
            } catch (err) {
              console.log("Deactivate error:", err);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account</Text>
        <Text style={styles.headerSub}>Manage your settings and privacy</Text>
      </View>

      {/* ACTIVITY */}
      <Section title="Activity">
        <MenuItem
          icon="bookmark-outline"
          label="Saved Items"
          onPress={() => navigation.navigate("SavedItems")}
        />
        <MenuItem icon="people-outline" label="Followers" />
        <MenuItem icon="person-add-outline" label="Following" />
      </Section>

      {/* SETTINGS */}
      <Section title="Settings">
        <MenuItem icon="notifications-outline" label="Notifications Settings" />
        <MenuItem icon="lock-closed-outline" label="Private Account" />
        <MenuItem icon="shield-checkmark-outline" label="Security & Permissions" />
      </Section>

      {/* SUPPORT & LEGAL */}
      <Section title="Support & Legal">
        <MenuItem icon="help-circle-outline"label="Help Center"onPress={() => navigation.navigate("HelpCenter")}/>
        <MenuItem icon="alert-circle-outline" label="Report a Problem" />

      <MenuItem icon="document-text-outline"label="Policy Center"onPress={() => navigation.navigate("PolicyCenter")}/>
      </Section>

      {/* DANGER ZONE */}
      <View style={styles.dangerZone}>
        <TouchableOpacity
          style={styles.dangerItem}
          onPress={handleDeactivate}
        >
          <Text style={styles.dangerText}>Deactivate Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f5f7",
    paddingHorizontal: 16,
  },

  header: {
    paddingTop: 60,
    paddingBottom: 20,
  },

  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111",
  },

  headerSub: {
    fontSize: 14,
    color: "#777",
    marginTop: 4,
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    marginBottom: 8,
    marginLeft: 4,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
  },

  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
  },

  label: {
    fontSize: 15,
    color: "#222",
    fontWeight: "500",
  },

  dangerZone: {
    marginTop: 10,
  },

  dangerItem: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
  },

  dangerText: {
    color: "#d93025",
    fontWeight: "600",
  },

  logout: {
    backgroundColor: "#d93025",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },

  logoutText: {
    color: "#fff",
    fontWeight: "700",
  },
});