import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { COLORS, RADIUS, SPACING, SHADOWS } from "../styles/theme";

/**
 * Reusable button with variants.
 *
 * Props:
 *   title     – button label
 *   onPress   – press handler
 *   variant   – "primary" | "outline" | "danger" | "secondary" (default: "primary")
 *   loading   – show spinner
 *   disabled  – disable button
 *   icon      – optional icon element rendered before title
 *   style     – extra styles
 *   textStyle – extra text styles
 *   size      – "sm" | "md" | "lg" (default: "md")
 */
export default function CustomButton({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon = null,
  style,
  textStyle,
  size = "md",
}) {
  const isDisabled = disabled || loading;
  const variantStyle = variantStyles[variant] || variantStyles.primary;
  const sizeStyle = sizeStyles[size] || sizeStyles.md;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        sizeStyle.button,
        variantStyle.button,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variantStyle.spinnerColor || COLORS.white}
        />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.baseText,
              sizeStyle.text,
              variantStyle.text,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: SPACING.sm,
    borderRadius: RADIUS.md,
  },
  baseText: {
    fontWeight: "700",
  },
  disabled: {
    opacity: 0.55,
  },
});

const sizeStyles = {
  sm: {
    button: { paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg },
    text: { fontSize: 13 },
  },
  md: {
    button: {
      paddingVertical: SPACING.md + 2,
      paddingHorizontal: SPACING.xl,
    },
    text: { fontSize: 15 },
  },
  lg: {
    button: { paddingVertical: SPACING.lg, paddingHorizontal: SPACING.xxl },
    text: { fontSize: 16 },
  },
};

const variantStyles = {
  primary: {
    button: { backgroundColor: COLORS.freshblue },
    text: { color: COLORS.white },
    spinnerColor: COLORS.white,
  },
  outline: {
    button: {
      backgroundColor: "transparent",
      borderWidth: 1.5,
      borderColor: COLORS.freshblue,
    },
    text: { color: COLORS.freshblue },
    spinnerColor: COLORS.freshblue,
  },
  secondary: {
    button: {
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    text: { color: COLORS.textPrimary },
    spinnerColor: COLORS.textPrimary,
  },
  danger: {
    button: { backgroundColor: COLORS.danger },
    text: { color: COLORS.white },
    spinnerColor: COLORS.white,
  },
};
