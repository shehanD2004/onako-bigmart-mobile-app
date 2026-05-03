import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { COLORS, RADIUS, SPACING } from "../styles/theme";

/**
 * Quantity selector with +/- buttons.
 * Mirrors web QuantitySelector — supports weight (step 0.25) and pack (step 1).
 *
 * Props:
 *   quantity  – current value
 *   onIncrease – called on "+"
 *   onDecrease – called on "−"
 *   step      – increment (default 1)
 *   min       – minimum value (default 1)
 *   unit      – display label like "kg" (optional)
 *   disabled  – disable controls
 *   compact   – smaller variant for product cards
 */
export default function QuantitySelector({
  quantity = 1,
  onIncrease,
  onDecrease,
  step = 1,
  min = 1,
  unit = "",
  disabled = false,
  compact = false,
}) {
  const isAtMin = quantity <= min;
  const displayValue =
    step < 1 ? `${quantity.toFixed(2)}` : `${quantity}`;

  const btnSize = compact ? 28 : 34;
  const fontSize = compact ? 13 : 15;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={onDecrease}
        disabled={disabled}
        style={[
          styles.button,
          { width: btnSize, height: btnSize, borderRadius: btnSize / 2 },
          disabled && styles.buttonDisabled,
        ]}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonText, { fontSize }]}>−</Text>
      </TouchableOpacity>

      <View style={styles.valueContainer}>
        <Text style={[styles.value, { fontSize }]}>
          {displayValue}
          {unit ? (
            <Text style={styles.unit}> {unit}</Text>
          ) : null}
        </Text>
      </View>

      <TouchableOpacity
        onPress={onIncrease}
        disabled={disabled}
        style={[
          styles.button,
          styles.buttonPlus,
          { width: btnSize, height: btnSize, borderRadius: btnSize / 2 },
          disabled && styles.buttonDisabled,
        ]}
        activeOpacity={0.7}
      >
        <Text style={[styles.buttonPlusText, { fontSize }]}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
  },
  button: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPlus: {
    backgroundColor: COLORS.freshblue,
    borderColor: COLORS.freshblue,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  buttonText: {
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: -1,
  },
  buttonPlusText: {
    fontWeight: "700",
    color: COLORS.white,
    marginTop: -1,
  },
  valueContainer: {
    minWidth: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  value: {
    fontWeight: "700",
    color: COLORS.textPrimary,
    textAlign: "center",
  },
  unit: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.textSecondary,
  },
});
