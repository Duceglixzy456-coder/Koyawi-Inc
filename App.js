import "react-native-gesture-handler";

import React from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AuthProvider } from "./Context/AuthContext";


import HelpCenterScreen from "./screens/HelpCenterScreen";
import PolicyCenterHubScreen from "./screens/PolicyCenterHubScreen";
import CommunityGuidelinesScreen from "./screens/CommunityGuidelinesScreen";
import TermsPoliciesScreen from "./screens/TermsPoliciesScreen";
import { SafeAreaProvider } from "react-native-safe-area-context";
import PrivacyPolicyScreen from "./screens/PrivacyPolicyScreen";
import LoadingScreen from "./screens/LoadingScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import MainApp from "./screens/MainApp";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          
            <NavigationContainer>
              <Stack.Navigator screenOptions={{ headerShown: false }}>
                <Stack.Screen name="Loading" component={LoadingScreen} />
                <Stack.Screen name="Login" component={LoginScreen} />
                <Stack.Screen name="Signup" component={SignupScreen} />
                <Stack.Screen name="MainApp" component={MainApp} />
               <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
               <Stack.Screen
  name="PolicyCenter"
  component={PolicyCenterHubScreen}
/>

<Stack.Screen
  name="PrivacyPolicy"
  component={PrivacyPolicyScreen}
/>

<Stack.Screen
  name="TermsPolicies"
  component={TermsPoliciesScreen}
/>

<Stack.Screen
  name="CommunityGuidelines"
  component={CommunityGuidelinesScreen}
/>
              </Stack.Navigator>
            </NavigationContainer>
         
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}