import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

import { useAuth } from "../Context/AuthContext";
import { jwtDecode } from "jwt-decode";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { translations } from "../utils/translations";
import { useLanguage } from "../Context/LanguageContext";

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
  const { language, toggleLanguage } = useLanguage();
  const { token, logout } = useAuth();

  const t = translations[language] || {};

  const userId = (() => {
    try {
      return token ? jwtDecode(token)?.sub : null;
    } catch {
      return null;
    }
  })();

  const clearAuth = async () => {
    logout();
  };

  const handleLogout = () => {
    Alert.alert(
      t.logoutConfirmTitle || "Logout",
      t.logoutConfirmMessage || "Are you sure you want to logout?",
      [
        { text: t.cancel || "Cancel", style: "cancel" },
        {
          text: t.logout || "Logout",
          style: "destructive",
          onPress: clearAuth,
        },
      ]
    );
  };

  const handleDeactivate = () => {
    Alert.alert(
      "Deactivate Account",
      "This will disable your account. You can restore it later.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deactivate",
          style: "destructive",
          onPress: clearAuth,
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.account}</Text>
        <Text style={styles.headerSub}>{t.manage}</Text>
      </View>

      {/* ACTIVITY */}
      <Section title={t.activity}>
        <MenuItem
          icon="bookmark-outline"
          label={t.savedItems}
          onPress={() => navigation.navigate("SavedItems")}
        />

        <MenuItem
          icon="people-outline"
          label={t.followers}
          onPress={() =>
            navigation.navigate("FollowersScreen", {
              userId,
            })
          }
        />
      </Section>

      {/* SETTINGS */}
      <Section title={t.settings}>
        <MenuItem icon="notifications-outline" label={t.notifications} />
        <MenuItem icon="lock-closed-outline" label={t.privateAccount} />
        <MenuItem icon="shield-checkmark-outline" label={t.security} />

        <MenuItem
          icon="language-outline"
          label={language === "en" ? "Language: English" : "Langue: Français"}
          onPress={toggleLanguage}
        />
      </Section>

      {/* SUPPORT */}
      <Section title={t.support}>
        <MenuItem
          icon="help-circle-outline"
          label={t.helpCenter?.title || "Help Center"}
          onPress={() => navigation.navigate("HelpCenter")}
        />

        <MenuItem
          icon="alert-circle-outline"
          label={t.reportProblem}
          onPress={() => navigation.navigate("HelpCenter")}
        />

        <MenuItem
          icon="document-text-outline"
          label={t.policy?.title || "Policy Center"}
          onPress={() => navigation.navigate("PolicyCenter")}
        />
      </Section>

      {/* DANGER ZONE */}
      <View style={styles.dangerZone}>
        <TouchableOpacity style={styles.dangerItem} onPress={handleDeactivate}>
          <Text style={styles.dangerText}>{t.deactivate}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logout} onPress={handleLogout}>
          <Text style={styles.logoutText}>{t.logout}</Text>
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