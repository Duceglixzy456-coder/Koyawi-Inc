import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLanguage } from "../Context/LanguageContext";
import { translations } from "../utils/translations";

function FAQItem({ question, answer }) {
  const [open, setOpen] = useState(false);

  return (
    <TouchableOpacity
      style={styles.faqItem}
      onPress={() => setOpen(!open)}
      activeOpacity={0.8}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.question}>{question}</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={18}
          color="#666"
        />
      </View>

      {open && <Text style={styles.answer}>{answer}</Text>}
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

export default function HelpCenterScreen({ navigation }) {
  const { language } = useLanguage();
const t = translations[language];
  return (
    <View style={{ flex: 1, backgroundColor: "#f4f5f7" }}>

      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          top: 50,
          left: 15,
          backgroundColor: "rgba(255,255,255,0.25)",
          paddingVertical: 8,
          paddingHorizontal: 12,
          borderRadius: 14,
          zIndex: 10,
        }}
      >
        <Text style={{ fontSize: 16, fontWeight: "600" }}>←</Text>
      </TouchableOpacity>

      {/* TITLE */}
      <Text
        style={{
          fontSize: 22,
          fontWeight: "bold",
          marginTop: 60,
          marginBottom: 10,
          textAlign: "center",
        }}
      >
       {t.title}
      </Text>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.subtitle}>
  {t.helpCenter.subtitle}
</Text> 

        {/* FAQ */}
       <Section title={t.helpCenter.faqTitle}>
          <FAQItem
            question={t.helpCenter.resetPassword}
           answer={t.helpCenter.resetPasswordAnswer}
          />

          <FAQItem
           question={t.helpCenter.deleteListing}
            answer={t.helpCenter.deleteListingAnswer}
          />

          <FAQItem
            question={t.helpCenter.accountRestricted}
            answer={t.helpCenter.accountRestrictedAnswer}
          />
        </Section>

        {/* ACCOUNT */}
        <Section title={t.helpCenter.accountLoginTitle}>
          <FAQItem
            question={t.helpCenter.cannotLogin}
           answer={t.helpCenter.cannotLoginAnswer}
          />

          <FAQItem
            question={t.helpCenter.changeEmail}
           answer={t.helpCenter.changeEmailAnswer}
          />
        </Section>

        {/* LISTINGS */}
        <Section title={t.helpCenter.marketplaceTitle}>
          <FAQItem
            question="Why was my listing removed?"
            answer={t.helpCenter.listingRemovedAnswer}
          />

          <FAQItem
            question={t.helpCenter.boostListing}
            answer={t.helpCenter.boostListingAnswer}
          />
        </Section>

        {/* SAFETY */}
       <Section title={t.helpCenter.safetyTitle}>
          <FAQItem
           question={t.helpCenter.reportUser}
            answer={t.helpCenter.reportUserAnswer}
          />

          <FAQItem
            question={t.helpCenter.reportAfter}
            answer={t.helpCenter.reportAfterAnswer}
          />
        </Section>

        {/* CONTACT */}
       <Section title={t.helpCenter.contactTitle}>
          <View style={styles.contactBox}>
            <Text style={styles.contactText}>
            {t.helpCenter.contactText}
            </Text>

            <Text style={styles.email}>
             {t.helpCenter.contactEmail}
            </Text>
          </View>
        </Section>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
  },

  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
    textAlign: "center",
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
    borderRadius: 12,
    overflow: "hidden",
  },

  faqItem: {
    padding: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },

  faqHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  question: {
    fontSize: 14,
    fontWeight: "600",
    color: "#222",
    flex: 1,
    paddingRight: 10,
  },

  answer: {
    marginTop: 10,
    fontSize: 13,
    color: "#555",
    lineHeight: 18,
  },

  contactBox: {
    padding: 14,
  },

  contactText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 8,
  },

  email: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2f6fed",
  },
});