import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { useAuth } from "../Context/AuthContext";

import LoginScreen from "./LoginScreen";
import SignupScreen from "./SignupScreen";
import MainApp from "./MainApp";

import HelpCenterScreen from "./HelpCenterScreen";
import PolicyCenterHubScreen from "./PolicyCenterHubScreen";
import CommunityGuidelinesScreen from "./CommunityGuidelinesScreen";
import TermsPoliciesScreen from "./TermsPoliciesScreen";
import PrivacyPolicyScreen from "./PrivacyPolicyScreen";
import { getTokenOrLogout } from "../utils/auth";
import SessionExpiredScreen from "../screens/SessionExpiredScreen";
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
    <Stack.Screen name="SessionExpired"component={SessionExpiredScreen}/>
    </Stack.Navigator>
  );
}

export default function RootNavigator() {
  const { token, loading } = useAuth();

  if (loading) {
    return null; // or splash screen later
  }

  return (
    <NavigationContainer>
      {token ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}