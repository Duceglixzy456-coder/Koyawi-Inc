import React, { useEffect } from "react";
import Tabs from "./Tabs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Screens
import ListingDetailScreen from "./ListingDetailScreen";
import SavedItemsScreen from "./SavedItemsScreen";
import TransactionsScreen from "./TransactionsScreen";
import AccountSettingsScreen from "./AccountSettingsScreen";
import SellerProfileScreen from "./SellerProfileScreen";
import HelpCenterScreen from "./HelpCenterScreen";
import InboxScreen from "./InboxScreen";
import ChatScreen from "./ChatScreen";

const Stack = createNativeStackNavigator();

export default function MainApp() {
  useEffect(() => {
    const checkToken = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        console.log("MAIN APP TOKEN:", token);
      } catch (err) {
        console.log("TOKEN CHECK ERROR:", err);
      }
    };

    checkToken();
  }, []);

  return (
    <Stack.Navigator
      initialRouteName="Tabs"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Tabs" component={Tabs} />

 <Stack.Screen name="Chat" component={ChatScreen} />
        
      <Stack.Screen name="SavedItems" component={SavedItemsScreen} />
      <Stack.Screen name="ListingDetailScreen" component={ListingDetailScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="SellerProfile" component={SellerProfileScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
      <Stack.Screen name="Inbox" component={InboxScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
    </Stack.Navigator>
  );
}