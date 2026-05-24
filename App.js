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
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

function BackButton({ navigation }) {
  return (
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      style={{
        padding: 10,
        alignSelf: "flex-start",
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>
        {"←"}
      </Text>
    </TouchableOpacity>
  );
}
const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function InboxScreen({ navigation }) {
  const [conversations, setConversations] = React.useState([]);

  React.useEffect(() => {
    fetch("http://192.168.1.195:8000/conversations")
      .then(res => res.json())
      .then(data => {
        setConversations(Array.isArray(data) ? data : []);
      })
      .catch(console.log);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingHorizontal: 15,
          marginBottom: 10,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold" }}>
          Inbox
        </Text>
      </View>

      {/* CONTENT */}
      <View style={{ flex: 1, padding: 10 }}>
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate("Chat", {
                  conversationId: item.id,
                  title: item.listingTitle,
                })
              }
              style={{
                padding: 15,
                backgroundColor: "#fff",
                marginBottom: 10,
                borderRadius: 12,
              }}
            >
              <Text style={{ fontWeight: "bold", fontSize: 16 }}>
                {item.listingTitle}
              </Text>

              <Text style={{ color: "#666", marginTop: 5 }}>
                {item.lastMessage || "No messages yet"}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

    </View>
  );
}
function ChatScreen({ route, navigation }) {
  const { conversationId } = route.params;

  const [messages, setMessages] = React.useState([]);
  const [text, setText] = React.useState("");

  const quickReplies = [
    "Hi, is this still available?",
    "Hey, I'm interested in this item.",
    "Salut, je suis intéressé par cet article."
  ];

  const loadMessages = () => {
    fetch(`http://192.168.1.195:8000/messages/${conversationId}`)
      .then(res => res.json())
      .then(data => setMessages(Array.isArray(data) ? data : []))
      .catch(console.log);
  };

  React.useEffect(() => {
    loadMessages();
  }, []);

  const sendMessage = async (msgText) => {
    const finalText = (msgText ?? text).trim();
    if (!finalText) return;

    await fetch("http://192.168.1.195:8000/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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

      {/* HEADER + BACK BUTTON */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingHorizontal: 15,
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 34, fontWeight: "bold" }}>
            {"<"}
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 10 }}>
          Chat
        </Text>
      </View>

      {/* MESSAGES */}
      <View style={{ flex: 1, padding: 10 }}>
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
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
      </View>

      {/* QUICK REPLIES */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 10 }}>
        {quickReplies.map((msg, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => sendMessage(msg)}
            style={{
              backgroundColor: "#eee",
              padding: 8,
              borderRadius: 20,
              margin: 5,
            }}
          >
            <Text style={{ fontSize: 12 }}>{msg}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* INPUT */}
      <View style={{ flexDirection: "row", marginTop: 10, padding: 10 }}>
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="Message..."
          style={{
            flex: 1,
            borderWidth: 1,
            padding: 10,
            borderRadius: 8,
            backgroundColor: "#fff",
          }}
        />

        <Button title="Send" onPress={() => sendMessage()} />
      </View>

    </View>
  );
}
/* ================= NOTIFICATIONS ================= */
function NotificationsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER */}
      <View
        style={{
          paddingTop: 50,
          paddingHorizontal: 15,
          marginBottom: 20,
        }}
      >
        <Text style={{ fontSize: 28, fontWeight: "bold" }}>
          Notifications
        </Text>
      </View>

      {/* EMPTY STATE */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="notifications-outline" size={80} color="#999" />
        <Text style={{ marginTop: 10, color: "#777" }}>
          No notifications yet
        </Text>
      </View>

    </View>
  );
}
function LoginScreen({ navigation }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");

  const login = async () => {
    try {
      const res = await fetch("http://192.168.1.195:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Login failed");
        return;
      }

      navigation.replace("Loading", { token: data.access_token });
    } catch (err) {
      alert("Network error");
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", padding: 40 }}>
      <TextInput
        placeholder="Username"
        value={username}
        onChangeText={setUsername}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, marginBottom: 10, padding: 8 }}
      />
      <Button title="Login" onPress={login} />
    </View>
  );
}
/* ================= LOADING ================= */
function LoadingScreen({ navigation, route }) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("MainApp", { token: route.params.token });
    }, 1000);

    return () => clearTimeout(timer);
  }, [navigation, route]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f2f3f5",
      }}
    >
      <ActivityIndicator size="large" />
      <Text style={{ marginTop: 10, color: "#777" }}>
        Loading...
      </Text>
    </View>
  );
}
function HomeScreen({ token, navigation }) {
  const [listings, setListings] = React.useState([]);
  const [search, setSearch] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("All");
  const [showCategories, setShowCategories] = React.useState(false);
 React.useEffect(() => {
  fetch("http://192.168.1.195:8000/listings", {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(res => res.json())
    .then(data => setListings(data.listings || []))
    .catch(err => console.log(err));
}, [token]);

const startChat = async (item) => {
  try {
    const res = await fetch("http://192.168.1.195:8000/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        buyer_id: "me",
        seller_id: item.owner || "seller",
        listing_title: item.title,
      }),
    });

    const convo = await res.json();

    navigation.navigate("Chat", {
      conversationId: convo.id,
    });

  } catch (err) {
    console.log("chat error:", err);
  }
};
     
  const categories = ["All", "Cars", "Phones", "Electronics", "Clothes", "Shoes"];

  const filtered = listings.filter(item => {
    const matchesSearch =
      item?.title?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      selectedCategory === "All" || item?.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  
  return (
  <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

    {/* TOP HEADER */}
    <View
      style={{
        paddingTop: 50,
        paddingHorizontal: 15,
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "bold" }}>
        Marketplace
      </Text>

      {/* SEARCH */}
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

    {/* CATEGORY MENU BUTTON */}
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        marginTop: 10,
      }}
    >
      <TouchableOpacity onPress={() => setShowCategories(!showCategories)}>
        <Text style={{ fontSize: 34 }}>☰</Text>
      </TouchableOpacity>
    </View>

    {/* DROPDOWN */}
    {showCategories && (
      <View
        style={{
          backgroundColor: "#fff",
          marginHorizontal: 15,
          borderRadius: 12,
          padding: 10,
        }}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => {
              setSelectedCategory(cat);
              setShowCategories(false);
            }}
            style={{
              paddingVertical: 10,
              borderBottomWidth: 0.5,
              borderBottomColor: "#ddd",
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: selectedCategory === cat ? "bold" : "normal",
              }}
            >
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    )}

    {/* LISTINGS */}
    <FlatList
      data={filtered}
      keyExtractor={(item, index) => index.toString()}
      contentContainerStyle={{ padding: 15, paddingBottom: 40 }}
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => navigation.navigate("ListingDetail", { item })}
        >
          <View
            style={{
              backgroundColor: "#fff",
              marginBottom: 12,
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            <Image
              source={{
                uri:
                  item.image ||
                  "https://via.placeholder.com/400x250.png?text=No+Image",
              }}
              style={{ width: "100%", height: 220 }}
            />

            <View style={{ padding: 12 }}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {item.title}
              </Text>

              <Text style={{ fontSize: 20, fontWeight: "bold" }}>
                ${item.price}
              </Text>

              <Text numberOfLines={2} style={{ color: "#666" }}>
                {item.description || "No description"}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      )}
    />
  </View>
);
}
/* ================= SELL ================= */
function SellScreen({ token, navigation }) {
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

      await fetch("http://192.168.1.195:8000/listings", {
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

      alert("Posted!");
      setTitle("");
      setPrice("");
      setDescription("");
      setImage(null);
    } catch (err) {
      alert("Error posting listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingBottom: 15,
          paddingHorizontal: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        {/* BACK BUTTON (BUBBLE STYLE SAME AS DETAIL SCREEN) */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#f0f0f0",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>{"←"}</Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 12 }}>
          Sell Item
        </Text>
      </View>

      {/* FORM (NOT CENTERED ANYMORE) */}
      <View style={{ flex: 1, padding: 20 }}>

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
            marginTop: 5,
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
              height: 200,
              marginTop: 10,
              borderRadius: 10,
            }}
          />
        )}

        <TouchableOpacity
          onPress={createListing}
          style={{
            backgroundColor: "#444",
            padding: 14,
            borderRadius: 10,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            {loading ? "Posting..." : "Post Listing"}
          </Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}
/* ================= PROFILE ================= */
function ProfileScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER (NO BACK BUTTON — THIS IS CORRECT FOR TAB SCREEN) */}
      <View
        style={{
          paddingTop: 50,
          paddingBottom: 15,
          paddingHorizontal: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        <Text style={{ fontSize: 22, fontWeight: "bold" }}>
          Account
        </Text>
      </View>

      {/* MENU */}
      <View style={{ marginTop: 10 }}>

        <MenuItem
          title="Saved items"
          onPress={() => navigation.navigate("SavedItems")}
        />

        <MenuItem
          title="Transactions"
          onPress={() => navigation.navigate("Transactions")}
        />

        <MenuItem
          title="Account settings"
          onPress={() => navigation.navigate("AccountSettings")}
        />

        <MenuItem
          title="Help center"
          onPress={() => navigation.navigate("HelpCenter")}
        />

      </View>

    </View>
  );
}
function ListingDetailScreen({ route, navigation }) {
  const { item } = route.params;
  const [loading, setLoading] = React.useState(false);

  const sendQuickMessage = async (text) => {
    try {
      setLoading(true);

      const res = await fetch("http://192.168.1.195:8000/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          buyer_id: "me",
          seller_id: item.owner || "seller",
          listing_title: item.title,
        }),
      });

      const convo = await res.json();

      await fetch("http://192.168.1.195:8000/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_id: convo.id,
          sender_id: "me",
          text,
        }),
      });

      alert("Message sent ✅");
    } catch (err) {
      console.log(err);
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER (CLEAN + MODERN) */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingBottom: 15,
          paddingHorizontal: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        {/* BACK BUTTON (BUBBLE STYLE) */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#f0f0f0",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>{"←"}</Text>
        </TouchableOpacity>

        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            marginLeft: 12,
          }}
        >
          Listing Details
        </Text>
      </View>

      {/* CONTENT */}
      <View style={{ padding: 20 }}>

        <Image
          source={{ uri: item.image }}
          style={{
            width: "100%",
            height: 250,
            borderRadius: 12,
          }}
        />

        <Text style={{ fontSize: 24, fontWeight: "bold", marginTop: 15 }}>
          {item.title}
        </Text>

        <Text style={{ fontSize: 20, marginTop: 5 }}>
          ${item.price}
        </Text>

        <Text style={{ color: "#555", marginTop: 10 }}>
          {item.description}
        </Text>

        {/* ACTION BUTTONS */}
        <TouchableOpacity
          onPress={() => sendQuickMessage("Hi, is this still available?")}
          style={{
            backgroundColor: "#000",
            padding: 12,
            borderRadius: 10,
            marginTop: 20,
          }}
        >
          <Text style={{ color: "#fff" }}>Is this available?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => sendQuickMessage("I'm interested in this item.")}
          style={{
            backgroundColor: "#444",
            padding: 12,
            borderRadius: 10,
            marginTop: 10,
          }}
        >
          <Text style={{ color: "#fff" }}>I'm interested</Text>
        </TouchableOpacity>

      </View>

      {loading && (
        <Text style={{ textAlign: "center", marginBottom: 10 }}>
          Sending message...
        </Text>
      )}

    </View>
  );
}
function MenuItem({ title, subtitle, onPress, highlight }) {
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
      <Text
        style={{
          fontSize: 16,
          fontWeight: "600",
          color: highlight ? "#000" : "#111",
        }}
      >
        {title}
      </Text>

      {subtitle && (
        <Text
          style={{
            fontSize: 12,
            color: "#777",
            marginTop: 2,
          }}
        >
          {subtitle}
        </Text>
      )}
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
          paddingBottom: 15,
          paddingHorizontal: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#f0f0f0",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>
            {"←"}
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 12 }}>
          Account Settings
        </Text>
      </View>

      {/* CONTENT */}
      <View style={{ padding: 20 }}>
        <Text>Email: user@example.com</Text>

        <Text style={{ marginTop: 10 }}>
          Phone: +224 XXX XXX
        </Text>

        <TouchableOpacity
          style={{
            marginTop: 20,
            backgroundColor: "#000",
            padding: 12,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center" }}>
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>

    </View>
  );
}

function SavedItemsScreen({ navigation }) {
  const [saved] = React.useState([]);

  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingBottom: 15,
          paddingHorizontal: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#f0f0f0",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>
            {"←"}
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 12 }}>
          Saved Items
        </Text>
      </View>

      {/* CONTENT */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text style={{ fontSize: 18 }}>
          No saved items yet ❤️
        </Text>
      </View>

    </View>
  );
}

function TransactionsScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingBottom: 15,
          paddingHorizontal: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#f0f0f0",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>
            {"←"}
          </Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 12 }}>
          Transactions
        </Text>
      </View>

      {/* CONTENT */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text>No transactions yet</Text>
      </View>

    </View>
  );
}

function HelpCenterScreen({ navigation }) {
  return (
    <View style={{ flex: 1, backgroundColor: "#f2f3f5" }}>

      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingTop: 50,
          paddingBottom: 15,
          paddingHorizontal: 15,
          backgroundColor: "#fff",
          borderBottomWidth: 0.5,
          borderBottomColor: "#eee",
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 38,
            height: 38,
            borderRadius: 19,
            backgroundColor: "#f0f0f0",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 22, fontWeight: "bold" }}>
            {"←"}
          </Text>
        </TouchableOpacity>

        <Text style={{ fontSize: 18, fontWeight: "bold", marginLeft: 12 }}>
          Help Center
        </Text>
      </View>

      {/* CONTENT */}
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            textAlign: "center",
          }}
        >
          How can we help you?
        </Text>
      </View>

    </View>
  );
}
/* ================= MAIN APP ================= */
function MainApp({ route }) {
  const { token } = route.params;

  return (
    <Tab.Navigator>
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
/* ================= ROOT ================= */
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>

        {/* AUTH FLOW */}
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Loading" component={LoadingScreen} />

        {/* MAIN APP */}
        <Stack.Screen name="MainApp" component={MainApp} />

        {/* DETAIL SCREENS */}
        <Stack.Screen
          name="ListingDetail"
          component={ListingDetailScreen}
        />

        <Stack.Screen
          name="Chat"
          component={ChatScreen}
        />

        {/* PROFILE SCREENS */}
        <Stack.Screen
          name="AccountSettings"
          component={AccountSettingsScreen}
        />

        <Stack.Screen
          name="SavedItems"
          component={SavedItemsScreen}
        />

        <Stack.Screen
          name="Transactions"
          component={TransactionsScreen}
        />

        <Stack.Screen
          name="HelpCenter"
          component={HelpCenterScreen}
        />

      </Stack.Navigator>
    </NavigationContainer>
  );
}