import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

export default function SignupScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isFormValid =
    fullName.trim().length > 0 &&
    phone.trim().length > 0 &&
    password.trim().length > 0;

  const register = async () => {
    if (!isFormValid) {
      Alert.alert("Missing Info", "Please fill all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://192.168.1.194:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          password: password,
        }),
      });

      const data = await res.json();

      console.log("REGISTER:", data);

      if (!res.ok) {
        Alert.alert("Error", data.detail || "Signup failed");
        return;
      }

      if (data.user_id) {
        navigation.replace("Login");
      }
    } catch (err) {
      console.log("REGISTER ERROR:", err);
      Alert.alert("Error", "Server connection failed");
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
      {/* BACK BUTTON */}
     {/* BACK BUTTON (MATCH CHAT SCREEN) */}
<TouchableOpacity
  onPress={() => navigation.goBack()}
  style={{
    position: "absolute",
    top: 30,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
  }}
>
  <Text style={{ fontSize: 16, fontWeight: "600" }}>←</Text>
</TouchableOpacity>

      <Text
        style={{
          fontSize: 28,
          fontWeight: "bold",
          marginBottom: 20,
          textAlign: "center",
        }}
      >
        Create Account
      </Text>

      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={{
          backgroundColor: "#fff",
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
        }}
      />

      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
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
        onPress={register}
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
          {loading ? "Creating account..." : "Create Account"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.replace("Login")}
        style={{ marginTop: 15 }}
      >
        <Text style={{ textAlign: "center", color: "#555" }}>
          Already have an account?{" "}
          <Text style={{ fontWeight: "bold", color: "#000" }}>
            Login
          </Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}