import React, { useEffect, useState, useCallback } from "react";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  Image,
  StyleSheet,
} from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useFocusEffect } from "@react-navigation/native";

import { saveToken, getToken } from "./auth";
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ScreenHeader({ title, navigation }) {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 50,
        paddingHorizontal: 15,
        paddingBottom: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 0.5,
        borderBottomColor: "#eee",
      }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: 28 }}>←</Text>
      </TouchableOpacity>

      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          marginLeft: 15,
        }}
      >
        {title}
      </Text>
    </View>
  );
}

function LoginScreen({ navigation }) {
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

const login = async () => {
  try {
    setLoading(true);

    console.log("LOGIN START");

    const res = await fetch("http://192.168.1.195:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        password,
      }),
    });

    const data = await res.json();

    console.log("RESPONSE:", res.status);
    console.log("DATA:", data);

    if (!res.ok) {
      Alert.alert("Login failed", data.detail || "Invalid credentials");
      setLoading(false);
      return;
    }

    // ✅ USE YOUR NEW AUTH SYSTEM
    await saveToken(data.access_token);

    console.log("TOKEN SAVED:", data.access_token);

    // 🔍 DEBUG CHECK
    const test = await getToken();
    console.log("TOKEN FROM STORAGE:", test);

    setLoading(false);

    // ✅ IMPORTANT: go directly to MainApp (NO Loading screen anymore)
    navigation.replace("MainApp");

  } catch (err) {
    console.log("LOGIN ERROR:", err);
    setLoading(false);
    Alert.alert("Error", "Network error");
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
        onPress={login}
        style={{
          backgroundColor: "#000",
          padding: 14,
          borderRadius: 10,
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
    </View>
  );
}
/* ================= LOADING ================= */
function LoadingScreen({ navigation }) {
  React.useEffect(() => {
    const loadApp = async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        console.log("LOADING SCREEN TOKEN:", token);

        if (!token) {
          navigation.replace("Login");
          return;
        }

        navigation.replace("MainApp");
      } catch (err) {
        console.log("LOADING ERROR:", err);
        navigation.replace("Login");
      }
    };

    loadApp();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text>Loading...</Text>
    </View>
  );
}
function HomeScreen({ navigation }) {
  const [listings, setListings] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const fetchListings = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://192.168.1.195:8000/listings");
      const data = await res.json();

      setListings(data);
    } catch (err) {
      console.log("ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOAD ON SCREEN OPEN
  React.useEffect(() => {
    fetchListings();
  }, []);

  const filtered = listings.filter(item =>
    item?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER */}
      <View style={{ paddingTop: 50, paddingHorizontal: 15 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold" }}>
          Marketplace
        </Text>

        <TextInput
          placeholder="Search..."
          value={search}
          onChangeText={setSearch}
          style={{
            backgroundColor: "#fff",
            padding: 10,
            borderRadius: 10,
            marginTop: 10,
          }}
        />
      </View>

      {/* LIST */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 15 }}
        refreshing={loading}
        onRefresh={fetchListings}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ListingDetail", { item })
            }
            style={{
              backgroundColor: "#fff",
              marginBottom: 12,
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Image
              source={{
                uri:
                  item.image ||
                  "https://via.placeholder.com/400x250.png?text=No+Image",
              }}
              style={{ width: "100%", height: 200 }}
            />

            <View style={{ padding: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {item.title}
              </Text>

              <Text style={{ fontSize: 16 }}>
                ${item.price}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
/* ================= SELL SCREEN ================= */
function SellScreen({ navigation }) {
  const [token, setToken] = React.useState(null);

  const [title, setTitle] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [image, setImage] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

  // ✅ LOAD TOKEN
  React.useEffect(() => {
    const loadToken = async () => {
      const stored = await AsyncStorage.getItem("token");
      console.log("SELL SCREEN TOKEN:", stored);
      setToken(stored);
    };

    loadToken();
  }, []);

  // ✅ PICK IMAGE FUNCTION (THIS WAS MISSING HEADER IN YOUR CODE)
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // ✅ CREATE LISTING
  const createListing = async () => {
    try {
      console.log("TOKEN BEING SENT:", token);

      if (!token) {
  Alert.alert("No token found. Please login again.");
  return;
}
      setLoading(true);

      const res = await fetch("http://192.168.1.195:8000/listings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          price: Number(price),
          description,
          image,
        }),
      });

      const data = await res.json();

      console.log("LISTING RESPONSE:", data);

      if (!res.ok) {
        Alert.alert("Error", data.detail || "Failed to post listing");
        return;
      }

      Alert.alert("Success", "Listing posted!");

      setTitle("");
      setPrice("");
      setDescription("");
      setImage(null);

     navigation.navigate("Home", { refresh: true });

    } catch (err) {
      console.log("POST ERROR:", err);
      Alert.alert("Error", "Network error");
    } finally {
      setLoading(false);
    }
  };

  return ( 
    <View style={{ flex: 1, backgroundColor: "#f2f3f5", padding: 20 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 10 }}>
        Sell Item
      </Text>

      <TextInput
        placeholder="Title"
        value={title}
        onChangeText={setTitle}
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
          borderRadius: 8,
          backgroundColor: "#fff",
        }}
      />

      <TextInput
        placeholder="Price"
        value={price}
        onChangeText={setPrice}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
          borderRadius: 8,
          backgroundColor: "#fff",
        }}
      />

      <TextInput
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        style={{
          borderWidth: 1,
          marginBottom: 10,
          padding: 10,
          borderRadius: 8,
          backgroundColor: "#fff",
          height: 100,
          textAlignVertical: "top",
        }}
      />

      <TouchableOpacity
        onPress={pickImage}
        style={{
          backgroundColor: "#000",
          padding: 12,
          borderRadius: 10,
          marginBottom: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          Pick Image
        </Text>
      </TouchableOpacity>

      {image && (
        <Image
          source={{ uri: image }}
          style={{
            height: 180,
            borderRadius: 10,
            marginBottom: 10,
          }}
        />
      )}

      <TouchableOpacity
        onPress={createListing}
        style={{
          backgroundColor: "#444",
          padding: 14,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center" }}>
          {loading ? "Posting..." : "Post Listing"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
function InboxScreen({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchInbox = async () => {
    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      console.log("INBOX TOKEN:", token);

      if (!token) return;

      const decoded = jwtDecode(token);
      const userId = decoded.sub;

      console.log("USER ID:", userId);

      const res = await fetch(
        `http://192.168.1.195:8000/conversations/${userId}`
      );

      const data = await res.json();

      console.log("CONVERSATIONS:", data);

      setConversations(data);
    } catch (err) {
      console.log("INBOX ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchInbox();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchInbox();
    }, [])
  );

const renderItem = ({ item }) => {
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate("Chat", {
          conversationId: item._id,
        })
      }
      style={styles.chatCard}
    >
      <View style={styles.row}>
        
        {/* LEFT: avatar */}
        <Image
          source={{
            uri:
              item.listingImage ||
              item.userAvatar ||
              "https://i.imgur.com/placeholder.png",
          }}
          style={styles.avatar}
        />

        {/* MIDDLE */}
        <View style={styles.middle}>
          <Text
            style={[
              styles.name,
              item.unread ? styles.unreadText : null,
            ]}
          >
            {item.listingTitle || item.userName || "Chat"}
          </Text>

          <Text
            numberOfLines={1}
            style={[
              styles.message,
              item.unread ? styles.unreadMessage : null,
            ]}
          >
            {item.last_message
              ? `${item.last_sender === item.userId ? "You" : "Seller"}: ${item.last_message}`
              : "Start the conversation"}
          </Text>
        </View>

        {/* RIGHT */}
        <View style={{ alignItems: "flex-end" }}>
          <Text style={styles.time}>
            {item.updatedAt
              ? new Date(item.updatedAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
          </Text>

          {item.unread && <View style={styles.unreadDot} />}
        </View>

      </View>
    </TouchableOpacity>
  );
};
  return (
  <View style={styles.container}>

    <ScreenHeader title="Inbox" navigation={navigation} />

    {loading && conversations.length === 0 ? (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    ) : conversations.length === 0 ? (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No messages yet</Text>
        <Text style={styles.emptyText}>
          When you message a seller or buyer, your chats will appear here.
        </Text>
      </View>
    ) : (
      <FlatList
        data={conversations}
        keyExtractor={(item) => item._id?.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
        refreshing={refreshing}
        onRefresh={onRefresh}
      />
    )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f3f5",
  },

  chatCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 14,
    marginBottom: 10,

    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,

    elevation: 3,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: "#ddd",
    marginRight: 12,
  },

  middle: {
    flex: 1,
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 2,
    color: "#000",
  },

  message: {
    fontSize: 13,
    color: "#777",
    marginTop: 1,
  },

  time: {
    fontSize: 11,
    color: "#999",
  },

  unreadText: {
    fontWeight: "800",
    color: "#000",
  },

  unreadMessage: {
    color: "#000",
    fontWeight: "500",
  },

  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "red",
    marginTop: 6,
  },

  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },

  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
  },

  emptyText: {
    marginTop: 6,
    color: "#888",
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  }
});

/* ================= CHAT SCREEN ================= */
function ChatScreen({ route, navigation }) {
const conversationId = route?.params?.conversationId;

  const [messages, setMessages] = React.useState([]);
  const [text, setText] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  // 🔄 LOAD MESSAGES
  const loadMessages = async () => {
    try {
      const res = await fetch(
        `http://192.168.1.195:8000/messages/${conversationId}`
      );

      const data = await res.json();
      setMessages(data);
    } catch (err) {
      console.log("LOAD MESSAGES ERROR:", err);
    }
  };

  React.useEffect(() => {
    loadMessages();
  }, []);

  // 📤 SEND MESSAGE
  const sendMessage = async () => {
    try {
      if (!text.trim()) return;

      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      await fetch("http://192.168.1.195:8000/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          text: text,
        }),
      });

      setText("");
      loadMessages(); // refresh chat
    } catch (err) {
      console.log("SEND ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

 return (
  <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

    {/* BACK BUTTON */}
   <TouchableOpacity
  onPress={() => navigation.goBack()}
  style={{
    paddingTop: 50,   // pushes it below status bar
    paddingBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  }}
>
  <Text style={{ fontSize: 16, fontWeight: "600" }}>
    ← Back
  </Text>
</TouchableOpacity>
    {/* MESSAGES */}
    <FlatList
      data={messages}
      keyExtractor={(item) => item._id}
      contentContainerStyle={{
        padding: 15,
        paddingBottom: 30,
      }}
      renderItem={({ item }) => (
        <View
          style={{
            backgroundColor: "#fff",
            padding: 10,
            marginBottom: 8,
            borderRadius: 10,
            alignSelf: item.sender_id ? "flex-end" : "flex-start",
            maxWidth: "80%",
          }}
        >
          <Text>{item.text}</Text>
        </View>
      )}
    />

    {/* INPUT */}
    <View
      style={{
        flexDirection: "row",
        padding: 10,
        backgroundColor: "#fff",
      }}
    >
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Message..."
        style={{
          flex: 1,
          backgroundColor: "#f2f3f5",
          padding: 10,
          borderRadius: 10,
        }}
      />

      <TouchableOpacity
        onPress={sendMessage}
        style={{
          marginLeft: 10,
          backgroundColor: "#000",
          padding: 12,
          borderRadius: 10,
        }}
      >
        <Text style={{ color: "#fff" }}>Send</Text>
      </TouchableOpacity>
    </View>

  </View>
);
}
function ProfileScreen({ navigation }) {
  const handleLogout = async () => {
  try {
    await AsyncStorage.removeItem("token");

    navigation.replace("Login");

  } catch (error) {
    console.log("LOGOUT ERROR:", error);
  }
};
  return (
  <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>
    <TouchableOpacity
  onPress={() => navigation.goBack()}
  style={{ padding: 15, backgroundColor: "#fff" }}
>
  <Text style={{ fontSize: 16, fontWeight: "600" }}>
    ← Back
  </Text>
</TouchableOpacity>

    {/* HEADER */}
    <View style={{
      paddingTop: 50,
      paddingHorizontal: 15,
      backgroundColor: "#fff",
      paddingBottom: 15,
      borderBottomWidth: 0.5,
      borderBottomColor: "#eee",
    }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Account
      </Text>
    </View>

    {/* MENU SECTION */}
    <View style={{ marginTop: 10, paddingHorizontal: 15 }}>

      <MenuItem
        title="Saved Items"
        onPress={() => navigation.navigate("SavedItems")}
      />

      <MenuItem
        title="Transactions"
        onPress={() => navigation.navigate("Transactions")}
      />

      <MenuItem
        title="Account Settings"
        onPress={() => navigation.navigate("AccountSettings")}
      />

      <MenuItem
        title="Help Center"
        onPress={() => navigation.navigate("HelpCenter")}
      />

      {/* LOGOUT BUTTON */}
      <TouchableOpacity
        onPress={handleLogout}
        style={{
          marginTop: 30,
          backgroundColor: "#111",
          paddingVertical: 14,
          borderRadius: 12,
          alignItems: "center",
          marginHorizontal: 15,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          Logout
        </Text>
      </TouchableOpacity>

    </View>

   </View>
 );
}

/* ================= MENU ITEM ================= */
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
function AccountSettingsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingHorizontal: 15,
          paddingBottom: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Profile"); // fallback
            }
          }}
        >
          <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
          Account Settings
        </Text>
      </View>

      {/* CONTENT */}
      <View style={{ padding: 20 }}>
        <Text>Email: user@example.com</Text>
        <Text style={{ marginTop: 10 }}>Phone: +224 XXX XXX</Text>
      </View>

    </View>
  );
}
/* ================= NOTIFICATIONS ================= */
function NotificationsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Ionicons name="notifications-outline" size={24} color="black" />
      <Text style={{ marginTop: 10 }}>No notifications yet</Text>
    </View>
  );
}
/* ================= SAVED ITEMS ================= */
function SavedItemsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingHorizontal: 15,
          paddingBottom: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Home"); // fallback
            }
          }}
        >
          <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
          Saved Items
        </Text>
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No saved items ❤️</Text>
      </View>

    </View>
  );
}
/* ================= TRANSACTIONS ================= */
function TransactionsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingHorizontal: 15,
          paddingBottom: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Home"); // fallback
            }
          }}
        >
          <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
          Transactions
        </Text>
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>No transactions yet</Text>
      </View>

    </View>
  );
}

/* ================= HELP CENTER ================= */
function HelpCenterScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingHorizontal: 15,
          paddingBottom: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        <TouchableOpacity
          onPress={() => {
            if (navigation.canGoBack()) {
              navigation.goBack();
            } else {
              navigation.navigate("Home"); // fallback
            }
          }}
        >
          <Text style={{ fontSize: 22 }}>←</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
          Help Center
        </Text>
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>How can we help you?</Text>
      </View>

    </View>
  );
}
/* ================= LISTING DETAIL ================= */
function ListingDetailScreen({ route, navigation }) {
  const { item, token } = route.params;

 const createConversation = async () => {
  try {
    const token = await AsyncStorage.getItem("token");
    const decoded = jwtDecode(token);
    const userId = decoded.sub;

    const response = await fetch(
      "http://192.168.1.195:8000/conversations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          buyer_id: userId, // ✅ FIXED (no hardcode)
          seller_id: item.owner_id || item.owner,
          listing_id: item._id,
        }),
      }
    );

    const data = await response.json();

    console.log("NEW CONVERSATION:", data);

    navigation.navigate("Chat", {
      conversationId: data.conversation_id,
      token,
    });

  } catch (err) {
    console.log("CONVERSATION ERROR:", err);
  }
};

  return (
  <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

    {/* BACK HEADER */}
    <View
      style={{
        paddingTop: 50,
        paddingBottom: 12,
        paddingHorizontal: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#ddd",
      }}
    >
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: 18, fontWeight: "600" }}>
          ← Back
        </Text>
      </TouchableOpacity>
    </View>

    {/* CONTENT */}
    <View style={{ padding: 20 }}>

      <Image
        source={{ uri: item.image }}
        style={{ width: "100%", height: 250, borderRadius: 12 }}
      />

      <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 10 }}>
        {item.title}
      </Text>

      <Text style={{ fontSize: 18 }}>
        ${item.price}
      </Text>

      <Text style={{ marginTop: 10 }}>
        {item.description}
      </Text>

      <TouchableOpacity
        onPress={createConversation}
        style={{
          backgroundColor: "#000",
          padding: 15,
          borderRadius: 10,
          marginTop: 20,
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontWeight: "bold" }}>
          Message Seller
        </Text>
      </TouchableOpacity>

    </View>
  </View>
);
}
function Tabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Sell" component={SellScreen} />
      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
function MainApp() {
  React.useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem("token");
      console.log("MAIN APP TOKEN:", token);
    };

    checkToken();
  }, []);

  return (
   <Stack.Navigator
  initialRouteName="Tabs"
  screenOptions={{ headerShown: false }}
>

      {/* TABS */}
      <Stack.Screen name="Tabs" component={Tabs} />

      {/* IN-APP SCREENS */}
      <Stack.Screen name="Chat" component={ChatScreen} />
      <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />
      <Stack.Screen name="SavedItems" component={SavedItemsScreen} />
      <Stack.Screen name="Transactions" component={TransactionsScreen} />
      <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
      <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />

    </Stack.Navigator>
  );
}
/* ================= ROOT APP ================= */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Loading"
        screenOptions={{ headerShown: false }}
      >

        <Stack.Screen name="Loading" component={LoadingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />

        <Stack.Screen name="MainApp" component={MainApp} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}
