import React from "react";
import { View, StyleSheet } from "react-native";

const Row = () => (
  <View style={styles.card}>
    <View style={styles.avatar} />

    <View style={{ flex: 1 }}>
      <View style={styles.name} />
      <View style={styles.message} />
      <View style={styles.time} />
    </View>
  </View>
);

export default function NotificationSkeleton() {
  return (
    <View style={{ padding: 15, paddingTop: 5 }}>
      <Row />
      <Row />
      <Row />
      <Row />
      <Row />
      <Row />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 14,
    marginBottom: 10,
  },

  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#E6E6E6",
    marginRight: 10,
  },

  name: {
    width: "45%",
    height: 14,
    borderRadius: 5,
    backgroundColor: "#E6E6E6",
    marginBottom: 8,
  },

  message: {
    width: "85%",
    height: 12,
    borderRadius: 5,
    backgroundColor: "#EFEFEF",
    marginBottom: 8,
  },

  time: {
    width: 70,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F3F3F3",
  },
});