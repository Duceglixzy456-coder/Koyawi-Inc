import React from "react";
import { View, Text, ScrollView } from "react-native";
import ScreenHeader from "../components/ScreenHeader";

export default function TermsPoliciesScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f4f5f7" }}>
      
      {/* HEADER */}
      <ScreenHeader 
        title="Terms & Policies" 
        navigation={navigation} 
      />

      {/* CONTENT */}
      <ScrollView
        style={{ paddingHorizontal: 16, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 14, color: "#444", lineHeight: 22 }}>

KOYAWI Terms of Service{"\n\n"}

Last Updated: June 2026{"\n\n"}

1. Acceptance of Terms{"\n"}
By using KOYAWI, you agree to follow these Terms and all applicable laws.

{"\n\n"}

2. Marketplace Rules{"\n"}
You agree NOT to:
- Post illegal, stolen, or prohibited items
- Use fake pricing or misleading listings
- Spam users or manipulate engagement
- Create multiple fake accounts

{"\n\n"}

3. User Responsibility{"\n"}
KOYAWI is a peer-to-peer marketplace.  
We do not own or verify every listing.

Users are responsible for:
- Verifying listings before purchase
- Communicating safely with sellers
- Completing transactions responsibly

{"\n\n"}

4. Prohibited Behavior{"\n"}
- Harassment or abusive behavior
- Fraud or scams
- Exploiting bugs or platform vulnerabilities
- Unauthorized data scraping

{"\n\n"}

5. Account Termination{"\n"}
We reserve the right to suspend or remove accounts that violate these rules.

{"\n\n"}

6. Limitation of Liability{"\n"}
KOYAWI is not responsible for financial losses, disputes, or damages between users.

{"\n\n"}

7. Changes{"\n"}
We may update these terms at any time.

        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}