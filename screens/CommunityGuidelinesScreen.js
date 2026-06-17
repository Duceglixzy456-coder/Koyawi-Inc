import React from "react";
import { View, Text, ScrollView } from "react-native";
import ScreenHeader from "../components/ScreenHeader";

export default function CommunityGuidelinesScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f4f5f7" }}>
      
      {/* HEADER */}
      <ScreenHeader 
        title="Community Guidelines" 
        navigation={navigation} 
      />

      {/* CONTENT */}
      <ScrollView
        style={{ paddingHorizontal: 16, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 14, color: "#444", lineHeight: 22 }}>

KOYAWI Community Guidelines{"\n\n"}

Last Updated: June 2026{"\n\n"}

1. Respect Others{"\n"}
Treat all users with respect. Harassment, hate speech, or abusive language is not allowed.

{"\n\n"}

2. Honest Listings{"\n"}
All listings must be accurate. Do not:
- Misrepresent products
- Use fake images
- Post misleading pricing

{"\n\n"}

3. Safety First{"\n"}
Meet in safe locations when completing transactions. KOYAWI is not responsible for in-person exchanges.

{"\n\n"}

4. Spam & Fraud{"\n"}
Spam, scams, or attempts to manipulate users or listings will result in removal.

{"\n\n"}

5. Content Rules{"\n"}
Do not post:
- Illegal items
- Harmful content
- Explicit or inappropriate material
- Anything violating local laws

{"\n\n"}

6. Enforcement{"\n"}
Violations may lead to:
- Content removal
- Account suspension
- Permanent ban

{"\n\n"}

7. Community Integrity{"\n"}
KOYAWI is built on trust between buyers and sellers. Maintain honesty at all times.

        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}