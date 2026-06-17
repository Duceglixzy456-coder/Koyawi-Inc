import React from "react";
import { View, Text, ScrollView } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import { useLanguage } from "../Context/LanguageContext";
import { translations } from "../utils/translations";

export default function CommunityGuidelinesScreen({ navigation }) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f5f7" }}>
      
      {/* HEADER */}
      <ScreenHeader
        title={t.policy.community}
        navigation={navigation}
      />

      {/* CONTENT */}
      <ScrollView
        style={{ paddingHorizontal: 16, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 14, color: "#444", lineHeight: 22 }}>
          {t.communityGuidelinesText}
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}