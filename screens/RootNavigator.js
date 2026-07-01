import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../Context/AuthContext";

// Screens
import LoadingScreen from "./LoadingScreen";
import LoginScreen from "./LoginScreen";
import SignupScreen from "./SignupScreen";
import MainApp from "./MainApp";
import BoostListingsScreen from "./BoostListingsScreen";
import ListingDetailScreen from "./ListingDetailScreen";
import BoostListingDetailScreen from "./BoostListingDetailScreen";
import HelpCenterScreen from "./HelpCenterScreen";
import PolicyCenterHubScreen from "./PolicyCenterHubScreen";
import CommunityGuidelinesScreen from "./CommunityGuidelinesScreen";
import TermsPoliciesScreen from "./TermsPoliciesScreen";
import PrivacyPolicyScreen from "./PrivacyPolicyScreen";
import SessionExpiredScreen from "./SessionExpiredScreen";
import ChatScreen from "./ChatScreen";
import SelectBuyerScreen from "../screens/SelectBuyerScreen";
import SoldListingsScreen from "../screens/SoldListingsScreen";

import { SocketProvider } from "../realtime/SocketContext";

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Signup" component={SignupScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainApp" component={MainApp} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="PolicyCenter" component={PolicyCenterHubScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsPolicies" component={TermsPoliciesScreen} />
      <Stack.Screen name="CommunityGuidelines" component={CommunityGuidelinesScreen} />
      <Stack.Screen name="BoostListings" component={BoostListingsScreen} />
      <Stack.Screen name="BoostListingDetail" component={BoostListingDetailScreen} />
      <Stack.Screen name="SessionExpired" component={SessionExpiredScreen} />
      <Stack.Screen name="ChatScreen" component={ChatScreen} />
      <Stack.Screen name="SelectBuyer" component={SelectBuyerScreen} />

      {/* ✅ FIXED SOLD + LISTING DETAIL SCREENS */}
      <Stack.Screen
        name="SoldListingsScreen"
        component={SoldListingsScreen}
      />

      <Stack.Screen
        name="ListingDetailScreen"
        component={ListingDetailScreen}
      />
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return <LoadingScreen text="Bienvenue à KOYAWI..." />;
  }

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}