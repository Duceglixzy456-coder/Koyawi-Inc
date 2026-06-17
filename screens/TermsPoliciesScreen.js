import React from "react";
import { View, Text, ScrollView } from "react-native";
import ScreenHeader from "../components/ScreenHeader";
import { useLanguage } from "../Context/LanguageContext";
import { translations } from "../utils/translations";

export default function TermsPoliciesScreen({ navigation }) {
  const { language } = useLanguage();
  const t = translations[language];

  return (
    <View style={{ flex: 1, backgroundColor: "#f4f5f7" }}>
      
      <ScreenHeader
        title={t.policy.terms}
        navigation={navigation}
      />

      <ScrollView
        style={{ paddingHorizontal: 16, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 14, color: "#444", lineHeight: 22 }}>
          {t.termsText}
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}