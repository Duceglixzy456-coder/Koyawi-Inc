import React, { useContext } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import AuthContext from "../Context/AuthContext";

function MenuItem({ title, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: "#fff",
        padding: 15,
        borderBottomWidth: 0.5,
        borderBottomColor: "#eee",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600" }}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

export default function ProfileScreen({ navigation }) {
  const { logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await logout();

      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5", paddingTop: 50 }}>
      
      <View
        style={{
          paddingHorizontal: 15,
          paddingBottom: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>
          Profile
        </Text>
      </View>

      <MenuItem title="Saved Items" onPress={() => navigation.navigate("SavedItems")} />
      <MenuItem title="Transactions" onPress={() => navigation.navigate("Transactions")} />
      <MenuItem title="Account Settings" onPress={() => navigation.navigate("AccountSettings")} />
      <MenuItem title="Help Center" onPress={() => navigation.navigate("HelpCenter")} />

      <View style={{ marginTop: 20 }}>
        <MenuItem title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
}

