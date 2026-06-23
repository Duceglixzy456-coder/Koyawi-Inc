import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";


export default function SignupScreen({ navigation }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("Guinea");
  const [city, setCity] = useState("");
  const [accepted, setAccepted] = useState(false);
const [acceptTerms, setAcceptTerms] = useState(false);
const [acceptPrivacy, setAcceptPrivacy] = useState(false);
 
const [fullName, setFullName] = useState("");

const [confirmPassword, setConfirmPassword] = useState("");


 const isValid =
  phone.trim().length > 0 &&
  password.trim().length > 0 &&
  confirmPassword.trim().length > 0 &&
  password === confirmPassword &&
  fullName.trim().length > 0 &&
  acceptTerms &&
  acceptPrivacy;


 const signupUser = async () => {
  console.log("SIGNUP BUTTON PRESSED");

  if (!isValid) {
    Alert.alert("Missing Info", "Please complete all fields and accept terms.");
    return;
  }

  if (password !== confirmPassword) {
    Alert.alert("Error", "Passwords do not match");
    return;
  }

  try {
    const res = await fetch("http://192.168.1.195:8000/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        full_name: fullName.trim(),
        phone: phone.trim(),
        password,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      Alert.alert("Error", data.detail || "Signup failed");
      return;
    }

    Alert.alert("Success", "Account created!");

    // ✅ CLEAN FLOW
    navigation.replace("Login");

  } catch (err) {
    console.log(err);
    Alert.alert("Error", "Server connection failed");
  }
};
  return (
    <View style={styles.container}>

     <View style={styles.container}>
{/* BACK BUTTON */}
<TouchableOpacity
  onPress={() => navigation.goBack()}
  style={{
    position: "absolute",
    top: 0,
    left: 15,
    backgroundColor: "rgba(255,255,255,0.25)",
    paddingVertical: 8,
    paddingHorizontal: 0,
    borderRadius: 14,
    zIndex: 999,
  }}
>
  <Text style={{ color: "#000", fontSize: 16, fontWeight: "600" }}>
    ←
  </Text>
</TouchableOpacity>

  {/* TOP AREA (LOGO) */}
  <View style={styles.topSection}>
    <View style={styles.logoBubble}>
      <Image
        source={require("../assets/koyawi-logo.png")}
        style={styles.logoImage}
        resizeMode="contain"
      />
    </View>
  </View>

  {/* FORM AREA */}
  <View style={styles.form}>
    {/* all inputs here */}
  </View>

</View>

      <Text style={styles.title}>Create Account</Text>

      <TextInput
        placeholder="Phone Number"
        value={phone}
        onChangeText={setPhone}
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
      <TextInput
  placeholder="Full Name"
  value={fullName}
  onChangeText={setFullName}
  style={styles.input}
/>




      {/* TERMS CHECKBOX */}
      <TouchableOpacity
  onPress={() => setAcceptTerms(!acceptTerms)}
  style={styles.checkboxRow}
>
  <View style={[styles.checkbox, acceptTerms && styles.checkboxActive]} />
  <Text style={styles.checkboxText}>
    I agree to Terms of Service
  </Text>
</TouchableOpacity>

<TouchableOpacity
  onPress={() => setAcceptPrivacy(!acceptPrivacy)}
  style={styles.checkboxRow}
>
  <View style={[styles.checkbox, acceptPrivacy && styles.checkboxActive]} />
  <Text style={styles.checkboxText}>
    I agree to Privacy Policy
  </Text>
</TouchableOpacity>
<Text>
  {JSON.stringify({
    phone: phone.trim().length > 0,
    password: password.trim().length > 0,
    confirmPassword: confirmPassword.trim().length > 0,
    match: password === confirmPassword,
    fullName: fullName.trim().length > 0,
    acceptTerms,
    acceptPrivacy,
  })}
</Text>
      {/* BUTTON */}
      <TouchableOpacity
        onPress={signupUser}
        disabled={!isValid}
        style={[
          styles.button,
          !isValid && { opacity: 0.5 },
        ]}
      >
        <Text style={styles.buttonText}>Create Account</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = {
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 70,
    backgroundColor: "#f2f3f5",
  },

  topSection: {
  height: "80%",   // 👈 THIS pushes everything down automatically
  justifyContent: "center",
  alignItems: "center",
},

form: {
  flex: 1,
  padding: 20,
  paddingTop: 80,
},

logoBubble: {
  width: 300,
  height: 250,
  borderRadius: 180,
  backgroundColor: "#2B2B2E",
  justifyContent: "center",
  alignItems: "center",
  alignSelf: "center",
  marginBottom: 40,
  overflow: "hidden",
},
logoImage: {
  width: 300,
  height: 300,
},

form: {
  flex: 1,
  padding: 20,
    justifyContent: "flex-start",
},

  logoText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2B2B2E",
    textAlign: "center",
    marginBottom: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },

  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
  },

  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },

  option: {
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },

  optionActive: {
    backgroundColor: "#2B2B2E",
    color: "#fff",
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: "#999",
  },

  checkboxActive: {
    backgroundColor: "#2B2B2E",
  },

  button: {
    backgroundColor: "#080809",
    padding: 14,
    borderRadius: 10,
    marginTop: 20,
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
backButton: {
  position: "absolute",
  top: 100,
  left: 15,
  width: 38,
  height: 100,
  borderRadius: 19,
  backgroundColor: "#2B2B2E",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 999,
},

checkboxText: {
  marginLeft: 10,
  color: "#444",
  fontSize: 12,
},

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
};