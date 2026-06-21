import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";

import { useAuth } from "../Context/AuthContext";

export default function LoginScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

const { login } = useAuth();

  const isFormValid =
    phone.trim().length > 0 &&
    password.trim().length > 0;

  const loginUser = async () => {
    if (!phone.trim() || !password.trim()) {
      Alert.alert("Missing Information", "Please enter phone and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("http://192.168.1.194:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: phone.trim(),
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        Alert.alert("Login Failed", data.detail || "Invalid credentials");
        return;
      }

      await login(data.access_token);
      navigation.replace("MainApp");
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>

      {/* HEADER */}
      <View style={styles.header}>
        <Image
          source={require("../assets/koyawi-logo.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* FORM */}
      <View style={styles.form}>

        <TextInput
          placeholder="Phone Number"
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          style={styles.input}
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />

        <TouchableOpacity
          onPress={loginUser}
          disabled={!isFormValid || loading}
          style={[
            styles.button,
            (!isFormValid || loading) && { opacity: 0.5 },
          ]}
        >
          <Text style={styles.buttonText}>
            {loading ? "Logging in..." : "Login"}
          </Text>
        </TouchableOpacity>

        {/* SIGNUP */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Signup")}
          style={{ marginTop: 20, marginBottom: 10 }}
        >
          <Text style={{ textAlign: "center", color: "#555" }}>
            Don’t have an account?{" "}
            <Text style={{ fontWeight: "bold", color: "#000" }}>
              Sign up
            </Text>
          </Text>
        </TouchableOpacity>

        {/* LEGAL */}
        <View style={styles.legalWrapper}>
          <Text style={styles.legalText}>
            By continuing, you agree to our{" "}
            <Text style={{ fontWeight: "bold", color: "#000" }}>
              Terms of Service
            </Text>{" "}
            and{" "}
            <Text style={{ fontWeight: "bold", color: "#000" }}>
              Privacy Policy
            </Text>.
          </Text>
        </View>

      </View>

    </View>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    flex: 1,
    backgroundColor: "#f2f3f5",
  },

  header: {
    height: "45%",
    width: "100%",
    backgroundColor: "#2B2B2E",
    justifyContent: "center",
    alignItems: "center",
    borderBottomLeftRadius: 200,
    borderBottomRightRadius: 13,
    overflow: "hidden",
  },

  logo: {
    width: "100%",
    height: "100%",
    resizeMode: "contain",
    marginTop: 0,
  },

  form: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#080809",
    padding: 14,
    borderRadius: 10,
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },

  legalWrapper: {
    marginTop: 25,
  },

  legalText: {
    textAlign: "center",
    fontSize: 11,
    color: "#999",
    paddingHorizontal: 25,
    lineHeight: 16,
  },
};