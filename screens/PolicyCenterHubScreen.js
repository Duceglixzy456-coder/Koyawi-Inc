import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenHeader from "../components/ScreenHeader";
import { useLanguage } from "../Context/LanguageContext";
import { translations } from "../utils/translations";
function HubItem({ icon, label, onPress }) {
  
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

export default function PolicyCenterHubScreen({ navigation }) {
      const { language } = useLanguage();
const t = translations[language];
  return (
    <View style={{ flex: 1, backgroundColor: "#f4f5f7" }}>
        <ScreenHeader
  title={t.policy.title}
  navigation={navigation}
/>
      
      {/* HEADER (floating consistent style) */}
   
      {/* CONTENT */}
      <View style={styles.container}>
        
       <Text style={styles.sub}>
  {t.policy.subtitle}
</Text>
        <View style={styles.card}>
        <HubItem
  icon="shield-checkmark-outline"
  label={t.policy.privacy}
  onPress={() => navigation.navigate("PrivacyPolicy")}
/>

<HubItem
  icon="document-text-outline"
  label={t.policy.terms}
  onPress={() => navigation.navigate("TermsPolicies")}
/>

<HubItem
  icon="people-outline"
  label={t.policy.community}
  onPress={() => navigation.navigate("CommunityGuidelines")}
/>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20, // pushes below floating header
  },

  sub: {
    fontSize: 14,
    color: "#777",
    marginBottom: 18,
    textAlign: "center",
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
    paddingVertical: 16,
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
    fontWeight: "500",
    color: "#222",
  },
});