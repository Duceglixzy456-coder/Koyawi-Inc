import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://your-api-url.com"; // replace with real backend or ngrok

const FollowersScreen = ({ route, navigation }) => {
  const { userId } = route.params;

  const [tab, setTab] = useState("followers");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);

    try {
      const token = await AsyncStorage.getItem("token");

      const endpoint =
        tab === "followers"
          ? `${API_URL}/followers/${userId}`
          : `${API_URL}/following/${userId}`;

      const res = await fetch(endpoint, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("STATUS:", res.status);

      const text = await res.text();
      console.log("RAW RESPONSE:", text);

      let parsed = null;

      try {
        parsed = JSON.parse(text);
      } catch (e) {
        console.log("JSON PARSE FAILED");
      }

      let finalData = [];

      if (Array.isArray(parsed)) {
        finalData = parsed;
      } else if (Array.isArray(parsed?.data)) {
        finalData = parsed.data;
      } else if (Array.isArray(parsed?.followers)) {
        finalData = parsed.followers;
      } else if (Array.isArray(parsed?.following)) {
        finalData = parsed.following;
      }

      setData(finalData);
    } catch (err) {
      console.log("FOLLOW ERROR:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [tab, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderItem = ({ item }) => {
    const user = item.user || item.follower || item.following || item;

    return (
      <TouchableOpacity
        style={styles.userCard}
        onPress={() =>
          navigation.navigate("ProfileView", {
            userId: user._id,
          })
        }
      >
        <Image
          source={{
            uri: user.profileImage || "https://via.placeholder.com/100",
          }}
          style={styles.avatar}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {user.name || "Unknown User"}
          </Text>

          <Text style={styles.username}>
            @{user.username || "user"}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.title}>Connections</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[
            styles.tab,
            tab === "followers" && styles.activeTab,
          ]}
          onPress={() => setTab("followers")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "followers" && styles.activeText,
            ]}
          >
            Followers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            tab === "following" && styles.activeTab,
          ]}
          onPress={() => setTab("following")}
        >
          <Text
            style={[
              styles.tabText,
              tab === "following" && styles.activeText,
            ]}
          >
            Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      {loading ? (
        <ActivityIndicator
          size="large"
          color="#999"
          style={{ marginTop: 30 }}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item, index) =>
            item._id?.toString() || index.toString()
          }
          renderItem={renderItem}
          contentContainerStyle={{
            paddingTop: 10,
            paddingBottom: 40,
          }}
          ListEmptyComponent={
            <Text style={styles.empty}>
              No {tab} found
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
};

export default FollowersScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  header: {
    paddingHorizontal: 15,
    paddingTop: 10,
    paddingBottom: 10,
  },

  title: {
    fontSize: 22,
    fontWeight: "700",
  },

  tabRow: {
    flexDirection: "row",
    marginHorizontal: 12,
    backgroundColor: "#f2f2f2",
    borderRadius: 10,
    overflow: "hidden",
  },

  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },

  activeTab: {
    backgroundColor: "#000",
  },

  tabText: {
    color: "#555",
    fontWeight: "600",
  },

  activeText: {
    color: "#fff",
  },

  userCard: {
    flexDirection: "row",
    padding: 12,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
    alignItems: "center",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
    marginRight: 10,
    backgroundColor: "#ddd",
  },

  name: {
    fontSize: 15,
    fontWeight: "600",
  },

  username: {
    fontSize: 13,
    color: "#777",
  },

  empty: {
    textAlign: "center",
    marginTop: 30,
    color: "#888",
  },
});