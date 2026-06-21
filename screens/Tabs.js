import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "./HomeScreen";
import SellScreen from "./SellScreen";
import InboxScreen from "./InboxScreen";
import NotificationsScreen from "./NotificationsScreen";
import ProfileScreen from "./ProfileScreen";
import FollowersScreen from "./FollowersScreen";

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
  screenOptions={({ route }) => ({
    headerShown: false,

    tabBarShowLabel: true,

    tabBarActiveTintColor: "#000",
    tabBarInactiveTintColor: "#B0B0B0",

    tabBarStyle: {
      height: 62,
      paddingBottom: 6,
      paddingTop: 6,
      borderTopWidth: 0.5,
      borderTopColor: "#E5E5E5",
      backgroundColor: "#fff",
    },

    tabBarItemStyle: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },

    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: "500",
    },

    tabBarIcon: ({ color, size, focused }) => {
      let iconName;

      if (route.name === "Home") iconName = focused ? "home" : "home-outline";
      else if (route.name === "Sell") iconName = focused ? "add-circle" : "add-circle-outline";
      else if (route.name === "Inbox") iconName = focused ? "chatbubble" : "chatbubble-outline";
      else if (route.name === "Notifications") iconName = focused ? "notifications" : "notifications-outline";
      else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";

      return <Ionicons name={iconName} size={size} color={color} />;
    },
  })}
>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Sell" component={SellScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />



      <Tab.Screen name="Profile" component={ProfileScreen} />

    </Tab.Navigator>
  );
}