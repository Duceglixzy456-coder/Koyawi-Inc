import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";


import AuthContext from "../Context/AuthContext";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);

  const isFormValid =
    phone.trim().length > 0 &&
    password.trim().length > 0;

  const loginUser = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert(
        "Missing Information",
        "Please enter your phone number and password."
      );
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(
        "http://192.168.1.194:8000/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phone.trim(),
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        Alert.alert(
          "Login Failed",
          data.detail || "Invalid phone number or password."
        );
        return;
      }

      await login(data.access_token);

      navigation.replace("MainApp");
    } catch (err) {
      console.log("LOGIN ERROR:", err);

      Alert.alert(
        "Connection Error",
        "Unable to connect to the server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        padding: 20,
        backgroundColor: "#f2f3f5",
      }}
    >
      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Login
      </Text>

      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
        autoCapitalize="none"
        keyboardType="phone-pad"
        style={{
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 10,
          marginBottom: 20,
        }}
      />

      <TouchableOpacity
  onPress={loginUser}
  disabled={!isFormValid || loading}
  style={{
    backgroundColor: "#000",
    padding: 14,
    borderRadius: 10,
    opacity: !isFormValid || loading ? 0.5 : 1,
  }}
>
  <Text
    style={{
      color: "#fff",
      textAlign: "center",
      fontWeight: "bold",
    }}
  >
    {loading ? "Logging in..." : "Login"}
  </Text>
</TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Signup")}
        style={{
          marginTop: 15,
        }}
      >
        <Text
          style={{
            textAlign: "center",
            color: "#555",
          }}
        >
          Don’t have an account?{" "}
          <Text
            style={{
              fontWeight: "bold",
              color: "#000",
            }}
          >
            Sign up
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}