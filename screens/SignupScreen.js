import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";

import { apiFetch } from "../api/apiClient";

export default function SignupScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptPrivacy, setAcceptPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  const cities = ["Conakry", "Labé", "Kankan", "Nzérékoré"];

  const isValid =
    phone.trim() &&
    password.trim() &&
    confirmPassword.trim() &&
    password === confirmPassword &&
    fullName.trim() &&
    city &&
    acceptTerms &&
    acceptPrivacy;

  const signupUser = async () => {
    if (!isValid) {
      Alert.alert("Missing Info", "Please complete all fields.");
      return;
    }

    try {
      setLoading(true);

      const res = await apiFetch("/register", {
        method: "POST",
        body: JSON.stringify({
          full_name: fullName.trim(),
          phone: phone.trim(),
          password,
          city,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Signup Failed", data.detail || "Error creating account");
        return;
      }

      Alert.alert("Success", "Account created!");
      navigation.replace("Login");

    } catch (err) {
      console.log("SIGNUP ERROR:", err);
      Alert.alert("Error", "Server connection failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.topSection}>
        <View style={styles.logoBubble}>
          <Image
            source={require("../assets/koyawi-logo.png")}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>
      </View>

      {/* FORM */}
      <View style={styles.form}>

        <TextInput
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
        />

        <TextInput
          placeholder="Full Name"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
        />

        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          style={styles.input}
        />

        {/* CITY SELECT */}
        <Text style={{ marginTop: 10, fontWeight: "600" }}>
          Select City
        </Text>

        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 10 }}>
          {cities.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setCity(c)}
              style={{
                padding: 10,
                borderRadius: 8,
                marginRight: 8,
                marginBottom: 8,
                backgroundColor: city === c ? "#2B2B2E" : "#fff",
              }}
            >
              <Text style={{ color: city === c ? "#fff" : "#000" }}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* TERMS */}
        <TouchableOpacity
          onPress={() => setAcceptTerms(!acceptTerms)}
          style={styles.checkboxRow}
        >
          <View style={[styles.checkbox, acceptTerms && styles.checkboxActive]} />
          <Text style={styles.checkboxText}>I agree to Terms</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setAcceptPrivacy(!acceptPrivacy)}
          style={styles.checkboxRow}
        >
          <View style={[styles.checkbox, acceptPrivacy && styles.checkboxActive]} />
          <Text style={styles.checkboxText}>I agree to Privacy Policy</Text>
        </TouchableOpacity>

        {/* BUTTON */}
        <TouchableOpacity
          onPress={signupUser}
          disabled={!isValid || loading}
          style={[styles.button, (!isValid || loading) && { opacity: 0.5 }]}
        >
          <Text style={styles.buttonText}>
            {loading ? "Creating..." : "Create Account"}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}
const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f2f3f5",
    padding: 20,
  },

  topSection: {
    height: 280,
    justifyContent: "center",
    alignItems: "center",
  },

  logoBubble: {
    width: 250,
    height: 200,
    borderRadius: 140,
    backgroundColor: "#2B2B2E",
    justifyContent: "center",
    alignItems: "center",
  },

  logoImage: {
    width: 220,
    height: 220,
  },

  form: {
    flex: 1,
    paddingTop: 10,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 3,
  },

  checkboxActive: {
    backgroundColor: "#2B2B2E",
  },

  checkboxText: {
    marginLeft: 10,
    fontSize: 12,
    color: "#444",
  },

  button: {
    backgroundColor: "#080809",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
};