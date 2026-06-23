import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "../Context/AuthContext";

export default function SessionExpiredScreen() {
  const { logout } = useAuth();

  const handleLogin = () => {
    logout?.(); // this should redirect you via auth state change
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Session Expired</Text>

      <Text style={styles.subtitle}>
        Your session has expired. Please log in again to continue.
      </Text>

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Go to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 10,
  },
  subtitle: {
    textAlign: "center",
    color: "#666",
    marginBottom: 20,
  },
  button: {
    backgroundColor: "#111",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
});