import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

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
        Help Center
      </Text>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
      >

        <Text style={styles.subtitle}>
          Find answers to common questions about KOYAWI
        </Text>

        {/* FAQ */}
        <Section title="Frequently Asked Questions">
          <FAQItem
            question="How do I reset my password?"
            answer="Go to Settings > Security & Permissions > Reset Password. You will receive a verification email or SMS."
          />

          <FAQItem
            question="How do I delete a listing?"
            answer="Open your listing, tap the options menu, and select Delete."
          />

          <FAQItem
            question="Why is my account restricted?"
            answer="Restrictions may happen due to policy violations or user reports."
          />
        </Section>

        {/* ACCOUNT */}
        <Section title="Account & Login">
          <FAQItem
            question="I can’t log into my account"
            answer="Check credentials or use password reset."
          />

          <FAQItem
            question="How do I change my email or phone?"
            answer="Go to Profile > Security & Permissions."
          />
        </Section>

        {/* LISTINGS */}
        <Section title="Listings & Marketplace">
          <FAQItem
            question="Why was my listing removed?"
            answer="It may violate marketplace rules or be reported."
          />

          <FAQItem
            question="How do I boost my listing?"
            answer="Boosting is coming soon as a premium feature."
          />
        </Section>

        {/* SAFETY */}
        <Section title="Safety & Reporting">
          <FAQItem
            question="How do I report a user?"
            answer="Open profile/chat and tap Report."
          />

          <FAQItem
            question="What happens after I report someone?"
            answer="Reports are reviewed and action may be taken within 24–48h."
          />
        </Section>

        {/* CONTACT */}
        <Section title="Contact Support">
          <View style={styles.contactBox}>
            <Text style={styles.contactText}>
              Need more help? Contact us directly.
            </Text>

            <Text style={styles.email}>
              support@koyawi.com
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