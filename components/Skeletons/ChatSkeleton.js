import React, { useEffect, useRef } from "react";
import { View, Animated } from "react-native";
import { Colors } from "../../theme/colors";

const Bubble = ({ align = "left", width = "70%" }) => {
  const fade = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(fade, {
          toValue: 0.7,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(fade, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );

    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View
      style={{
        width: "100%",
        flexDirection: align === "right" ? "row-reverse" : "row",
        marginVertical: 6,
        alignItems: "flex-end",
      }}
    >
      {/* Avatar placeholder */}
      <Animated.View
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          backgroundColor: "#2a2a2a",
          opacity: fade,
          marginHorizontal: 8,
        }}
      />

      {/* Bubble */}
      <Animated.View
        style={{
          width,
          height: 40,
          borderRadius: 16,
          backgroundColor: "#2a2a2a",
          opacity: fade,
        }}
      />
    </View>
  );
};

export default function ChatSkeleton() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Colors.background,
        padding: 10,
        justifyContent: "flex-end",
      }}
    >
      {/* fake chat history */}
      <Bubble align="left" width="65%" />
      <Bubble align="right" width="55%" />
      <Bubble align="left" width="70%" />
      <Bubble align="right" width="60%" />
      <Bubble align="left" width="50%" />
      <Bubble align="right" width="75%" />
    </View>
  );
}