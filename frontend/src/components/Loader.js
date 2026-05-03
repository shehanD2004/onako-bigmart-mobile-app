import React from "react";
import { View, ActivityIndicator, StyleSheet, Text } from "react-native";
import { COLORS } from "../styles/theme";

/**
 * Full-screen centered loader.
 *
 * Props:
 *   message – optional text below spinner
 *   size    – "small" | "large" (default "large")
 *   color   – spinner color (default brand blue)
 */
export default function Loader({
  message = "",
  size = "large",
  color = COLORS.freshblue,
}) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: 20,
  },
  message: {
    marginTop: 12,
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
