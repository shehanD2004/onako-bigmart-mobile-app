import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING, SHADOWS } from "../styles/theme";

/**
 * Category card used on Home and Categories screens.
 * Mirrors web CategoryCard component.
 *
 * Props:
 *   category   – { _id, name, slug, icon?, image? }
 *   onPress    – navigation handler
 *   size       – "small" | "medium" (default "small")
 */

// Map category names to Ionicons icon names
const CATEGORY_ICONS = {
  fruits: "nutrition-outline",
  vegetables: "leaf-outline",
  dairy: "water-outline",
  meat: "restaurant-outline",
  bakery: "bread-slice-outline",
  beverages: "cafe-outline",
  snacks: "fast-food-outline",
  frozen: "snow-outline",
  household: "home-outline",
  personal: "body-outline",
  default: "grid-outline",
};

const getCategoryIcon = (name = "") => {
  const lower = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
};

export default function CategoryCard({
  category,
  onPress,
  size = "small",
}) {
  const isSmall = size === "small";
  const iconSize = isSmall ? 28 : 36;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, isSmall ? styles.cardSmall : styles.cardMedium, SHADOWS.sm]}
    >
      <View
        style={[
          styles.iconContainer,
          isSmall ? styles.iconSmall : styles.iconMedium,
        ]}
      >
        <Ionicons
          name={getCategoryIcon(category.name)}
          size={iconSize}
          color={COLORS.freshblue}
        />
      </View>
      <Text
        style={[styles.name, isSmall && styles.nameSmall]}
        numberOfLines={2}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardSmall: {
    width: 100,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  cardMedium: {
    flex: 1,
    paddingVertical: SPACING.xl,
    paddingHorizontal: SPACING.md,
    minHeight: 120,
  },
  iconContainer: {
    backgroundColor: COLORS.freshblueLight,
    borderRadius: RADIUS.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  iconSmall: {
    width: 48,
    height: 48,
  },
  iconMedium: {
    width: 64,
    height: 64,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  nameSmall: {
    fontSize: 11,
  },
});
