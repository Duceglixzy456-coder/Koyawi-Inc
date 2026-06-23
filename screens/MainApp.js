import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Navigation
import Tabs from "./Tabs";

// Screens
import ListingDetailScreen from "./ListingDetailScreen";
import SavedItemsScreen from "./SavedItemsScreen";
import TransactionsScreen from "./TransactionsScreen";
import AccountSettingsScreen from "./AccountSettingsScreen";
import SellerProfileScreen from "./SellerProfileScreen";
import HelpCenterScreen from "./HelpCenterScreen";
import InboxScreen from "./InboxScreen";
import ChatScreen from "./ChatScreen";
import FollowersScreen from "./FollowersScreen";

import { useAuth } from "../Context/AuthContext";

const Stack = createNativeStackNavigator();

export default function MainApp() {
  const { token } = useAuth();

  useEffect(() => {
    // purely debug (safe)
    console.log("MAIN APP TOKEN:", token);
  }, [token]);

  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* Main Tabs */}
      <Stack.Screen name="Tabs" component={Tabs} />

      {/* Chat Flow */}
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="Inbox" component={InboxScreen} />

      {/* Listings */}
      <Stack.Screen
        name="ListingDetailScreen"
        component={ListingDetailScreen}
      />

      {/* User / Social */}
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} />
      <Stack.Screen name="FollowersScreen" component={FollowersScreen} />

      {/* Account */}
      <Stack.Screen name="SavedItems" component={SavedItemsScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />

      {/* Support */}
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
    </Stack.Navigator>
  );
}