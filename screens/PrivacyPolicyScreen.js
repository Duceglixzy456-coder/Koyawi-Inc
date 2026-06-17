import React from "react";
import { View, Text, ScrollView } from "react-native";
import ScreenHeader from "../components/ScreenHeader";

export default function PrivacyPolicyScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f4f5f7" }}>
      
      {/* HEADER */}
      <ScreenHeader 
        title="Privacy Policy" 
        navigation={navigation} 
      />

      {/* CONTENT */}
      <ScrollView
        style={{ paddingHorizontal: 16, paddingTop: 10 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 14, color: "#444", lineHeight: 22 }}>

KOYAWI Privacy Policy{"\n\n"}

Last Updated: June 2026{"\n\n"}

1. Information We Collect{"\n"}
We collect information to provide a safe and functional marketplace experience:
- Account information (name, email, password)
- Profile data (username, profile image)
- User-generated content (listings, messages, images)
- Device and usage data (app activity, logs)

{"\n\n"}

2. How We Use Your Information{"\n"}
Your data is used to:
- Enable marketplace listings and messaging
- Improve app performance and user experience
- Detect fraud, spam, or policy violations
- Send notifications related to activity

{"\n\n"}

3. Data Sharing{"\n"}
We do NOT sell your personal data.  
We only share data when:
- Required by law enforcement
- Required for platform safety/security
- Necessary for app functionality (e.g. messaging delivery)

{"\n\n"}

4. Data Storage{"\n"}
Your data is stored securely using cloud infrastructure and encrypted databases where possible.

{"\n\n"}

5. Your Rights{"\n"}
You may:
- Access your data
- Request deletion of your account
- Update your profile information
- Disable notifications

{"\n\n"}

6. Security{"\n"}
We implement standard security practices but cannot guarantee absolute protection.

{"\n\n"}

7. Contact{"\n"}
For privacy concerns, contact KOYAWI Support.

        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}