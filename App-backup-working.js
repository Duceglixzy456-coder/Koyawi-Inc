import React from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function LoginScreen({ navigation }) {
  const [phone, setPhone] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const login = async () => {
    try {
      setLoading(true);

      console.log("LOGIN START");

      const res = await fetch("http://192.168.1.194:8000/login", {
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

      setLoading(false);

      if (!res.ok) {
        Alert.alert("Login failed", data.detail || "Invalid credentials");
        return;
      }

      navigation.reset({
        index: 0,
        routes: [
          {
            name: "MainApp",
            params: { token: data.access_token },
          },
        ],
      });

    } catch (err) {
      setLoading(false);
      console.log("LOGIN ERROR:", err);
      Alert.alert("Error", err.message);
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
function LoadingScreen({ navigation, route }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("MainApp", {
        token: route?.params?.token,
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" />
      <Text>Loading...</Text>
    </View>
  );
}
function HomeScreen({ navigation, route }) {
  const token = route?.params?.token;
  const [listings, setListings] = React.useState([]);
  const [search, setSearch] = React.useState("");

  React.useEffect(() => {
    fetch("http://192.168.1.194:8000/listings", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setListings(data.listings || []))
      .catch(console.log);
  }, [token]);

  const filtered = listings.filter(item =>
    item?.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

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

      <FlatList
        data={filtered}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ padding: 15 }}
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
function SellScreen({ navigation, route }) {
  const token = route?.params?.token;

  const [title, setTitle] = React.useState("");
  const [price, setPrice] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [image, setImage] = React.useState(null);
  const [loading, setLoading] = React.useState(false);

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

  const createListing = async () => {
    try {
      setLoading(true);

      const res = await fetch("http://192.168.1.194:8000/listings", {
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

      if (!res.ok) {
        Alert.alert("Error", data.detail || "Failed to post");
        setLoading(false);
        return;
      }

      Alert.alert("Success", "Listing posted!");

      setTitle("");
      setPrice("");
      setDescription("");
      setImage(null);

    } catch (err) {
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
          style={{ height: 180, borderRadius: 10, marginBottom: 10 }}
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
  const [conversations, setConversations] = React.useState([]);
React.useEffect(() => {
  fetch("http://192.168.1.194:8000/conversations")
    .then(res => res.json())
    .then(data => setConversations(Array.isArray(data) ? data : []))
    .catch(console.log);
}, []);
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      <View style={{ paddingTop: 50, paddingHorizontal: 15 }}>
        <Text style={{ fontSize: 28, fontWeight: "bold" }}>
          Inbox
        </Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ padding: 15 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              
              navigation.navigate("Chat", {
                conversationId: item.id,
                listingId: item.listing_id,
                console.log("LISTING OBJECT:", item);
              })
            }
            style={{
              backgroundColor: "#fff",
              padding: 15,
              marginBottom: 10,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontWeight: "bold" }}>
              {item.listingTitle || "Chat"}
            </Text>

            <Text style={{ color: "#666", marginTop: 5 }}>
              {item.lastMessage || "No messages yet"}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

/* ================= CHAT SCREEN ================= */
function ChatScreen({ route }) {
  const { conversationId } = route.params;

  const [messages, setMessages] = React.useState([]);
  const [text, setText] = React.useState("");

  const loadMessages = () => {
    fetch(`http://192.168.1.194:8000/${conversationId}`)
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(console.log);
  };

  React.useEffect(() => {
    loadMessages();
  }, []);

  const handleSendMessage = async () => {
    const finalText = msg || text;
    if (!finalText) return;

   await fetch("http://192.168.1.194:8000/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        conversation_id: conversationId,
        sender_id: "me",
        text: finalText,
      }),
    });

    setText("");
    loadMessages();
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* MESSAGES */}
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        contentContainerStyle={{ padding: 10 }}
        renderItem={({ item }) => (
          <View
            style={{
              padding: 10,
              marginVertical: 5,
              backgroundColor: item.senderId === "me" ? "#DCF8C6" : "#fff",
              alignSelf: item.senderId === "me" ? "flex-end" : "flex-start",
              borderRadius: 10,
              maxWidth: "80%",
            }}
          >
            <Text>{item.text}</Text>
          </View>
        )}
      />

      {/* INPUT */}
      <View style={{ flexDirection: "row", padding: 10 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          style={{
            flex: 1,
            borderWidth: 1,
            borderRadius: 8,
            padding: 10,
            backgroundColor: "#fff",
          }}
        />

        <Button title="Send" onPress={() => sendMessage()} />
      </View>

    </View>
  );
}
function ProfileScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

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

      <View style={{ marginTop: 10 }}>

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
      <View style={{
        flexDirection: "row",
        alignItems: "center",
        paddingTop: 50,
        paddingHorizontal: 15,
        paddingBottom: 15,
        backgroundColor: "#fff",
        borderBottomWidth: 0.5,
        borderBottomColor: "#eee",
      }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 28 }}>←</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 10 }}>
          Account Settings
        </Text>
      </View>

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
      <Ionicons name="notifications-outline" size={70} color="#999" />
      <Text style={{ marginTop: 10 }}>No notifications yet</Text>
    </View>
  );
}
/* ================= SAVED ITEMS ================= */
function SavedItemsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>No saved items ❤️</Text>
    </View>
  );
}

/* ================= TRANSACTIONS ================= */
function TransactionsScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>No transactions yet</Text>
    </View>
  );
}

/* ================= HELP CENTER ================= */
function HelpCenterScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>How can we help you?</Text>
    </View>
  );
}

/* ================= LISTING DETAIL ================= */
function ListingDetailScreen({ route, navigation }) {
  const { item } = route.params;

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5", padding: 20 }}>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={{ fontSize: 28 }}>←</Text>
      </TouchableOpacity>

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

    </View>
  );
}
function MainApp({ route }) {
  const token = route?.params?.token;

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Home">
        {props => <HomeScreen {...props} token={token} />}
      </Tab.Screen>

      <Tab.Screen name="Sell">
        {props => <SellScreen {...props} token={token} />}
      </Tab.Screen>

      <Tab.Screen name="Inbox" component={InboxScreen} />
      <Tab.Screen name="Notifications" component={NotificationsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
/* ================= ROOT APP ================= */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* AUTH */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} />

        {/* MAIN APP */}
        <Stack.Screen name="MainApp" component={MainApp} />

        {/* DETAIL SCREENS */}
        <Stack.Screen name="Chat" component={ChatScreen} />
        <Stack.Screen name="ListingDetail" component={ListingDetailScreen} />

        {/* PROFILE STACK SCREENS */}
        <Stack.Screen name="SavedItems" component={SavedItemsScreen} />
        <Stack.Screen name="Transactions" component={TransactionsScreen} />
        <Stack.Screen name="AccountSettings" component={AccountSettingsScreen} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}