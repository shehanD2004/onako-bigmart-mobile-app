import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CartContext } from "../../context/CartContext";
import { AuthContext } from "../../context/AuthContext";
import { createOrder } from "../../api/orderApi";
import CustomButton from "../../components/CustomButton";
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from "../../styles/theme";

export default function CheckoutScreen({ navigation }) {
  const { cartItems, cartTotalAmount, clearCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);

  const formatPhoneNumber = (text) => {
    if (!text) return "";
    let cleaned = text.replace(/[^0-9+\-() ]/g, "");
    if (!cleaned.startsWith('+')) {
      const digits = cleaned.replace(/\D/g, '');
      if (digits.length > 0) {
        if (digits.length <= 3) {
          cleaned = `(${digits}`;
        } else if (digits.length <= 6) {
          cleaned = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else {
          cleaned = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        }
      } else {
        cleaned = '';
      }
    }
    return cleaned;
  };

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState(() => formatPhoneNumber(user?.phone || ""));
  const [payMethod, setPayMethod] = useState("cod");
  const [loading, setLoading] = useState(false);

  const shippingCost = cartTotalAmount > 5000 ? 0 : 250;
  const finalTotal = cartTotalAmount + shippingCost;

  // Protect against empty cart
  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      navigation.goBack();
    }
  }, [cartItems, loading, navigation]);

  const validatePhone = (num) => {
    const cleanNum = num.replace(/[\s\-()]/g, "");
    const localRegex = /^(07[0-9]{8}|0[1-9][0-9]{8})$/;
    const internationalRegex = /^\+[1-9]\d{6,14}$/;
    return localRegex.test(cleanNum) || internationalRegex.test(cleanNum);
  };

  const handleCheckout = async () => {
    // 1. Validation
    if (!street.trim()) {
      return Alert.alert("Error", "Street address is required.");
    }
    if (!city.trim()) {
      return Alert.alert("Error", "City is required.");
    }
    if (!phone.trim() || !validatePhone(phone)) {
      return Alert.alert(
        "Error",
        "Invalid phone number. Please use only numbers and valid formatting."
      );
    }
    if (payMethod === "card") {
      return Alert.alert(
        "Not Supported",
        "Card payments require native Stripe SDK setup. Please use Cash on Delivery."
      );
    }

    setLoading(true);

    try {
      const payload = {
        items: cartItems.map((item) => ({
          product: item._id,
          sellingType: item.sellingType || "pack",
          unit: item.unit || "pack",
          quantity: item.cartQuantity || 1,
          pricePerUnit: item.pricePerUnit,
          name: item.name,
          subtotal: item.pricePerUnit * (item.cartQuantity || 1),
        })),
        shippingAddress: { street, city, phone },
        pricing: {
          total: finalTotal,
          subtotal: cartTotalAmount,
          tax: 0,
          shippingCost,
        },
        paymentMethod: payMethod,
        paymentStatus: payMethod === "card" ? "paid" : "pending",
        orderStatus: "pending",
      };

      const result = await createOrder(payload);

      if (result.status === 201 || result.data?.success) {
        clearCart();
        Alert.alert("Success!", "Your order has been placed successfully.", [
          {
            text: "OK",
            onPress: () => navigation.navigate("HomeTab", { screen: "Home" }),
          },
        ]);
      }
    } catch (err) {
      Alert.alert("Order Failed", err.message || "Failed to place order.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={[styles.card, SHADOWS.sm]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="location" size={20} color={COLORS.freshblue} />
            <Text style={styles.sectionTitle}>Shipping Details</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>House No / Street Name</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. 123 Main Street"
              placeholderTextColor={COLORS.textLight}
              value={street}
              onChangeText={setStreet}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>City</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Colombo"
              placeholderTextColor={COLORS.textLight}
              value={city}
              onChangeText={setCity}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Number</Text>
            <TextInput
              style={styles.input}
              placeholder="(XXX) XXX-XXXX"
              placeholderTextColor={COLORS.textLight}
              value={phone}
              onChangeText={(text) => setPhone(formatPhoneNumber(text))}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <View style={[styles.card, SHADOWS.sm]}>
          <View style={styles.sectionTitleRow}>
            <Ionicons name="card" size={20} color={COLORS.freshblue} />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          <View style={styles.paymentMethods}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.payOption,
                payMethod === "cod" && styles.payOptionActive,
              ]}
              onPress={() => setPayMethod("cod")}
            >
              <Text
                style={[
                  styles.payOptionText,
                  payMethod === "cod" && styles.payOptionTextActive,
                ]}
              >
                Cash on Delivery
              </Text>
              {payMethod === "cod" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.freshblue}
                />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.payOption,
                payMethod === "card" && styles.payOptionActive,
              ]}
              onPress={() => setPayMethod("card")}
            >
              <Text
                style={[
                  styles.payOptionText,
                  payMethod === "card" && styles.payOptionTextActive,
                ]}
              >
                Card Transaction
              </Text>
              {payMethod === "card" && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.freshblue}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.card, SHADOWS.sm, { marginBottom: SPACING.xl }]}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>Rs. {cartTotalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Delivery Fee</Text>
            <Text style={styles.summaryValue}>Rs. {shippingCost.toFixed(2)}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Total to Pay</Text>
            <Text style={styles.totalValue}>Rs. {finalTotal.toFixed(2)}</Text>
          </View>

          <CustomButton
            title={`Place Order (Rs. ${finalTotal.toFixed(2)})`}
            onPress={handleCheckout}
            loading={loading}
            size="lg"
            style={{ marginTop: SPACING.xl }}
            icon={<Ionicons name="shield-checkmark" size={18} color={COLORS.white} />}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...FONTS.h3,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  paymentMethods: {
    gap: SPACING.md,
  },
  payOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  payOptionActive: {
    borderColor: COLORS.freshblue,
    backgroundColor: COLORS.freshblueLight,
  },
  payOptionText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  payOptionTextActive: {
    color: COLORS.freshblue,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 22,
    fontWeight: "800",
    color: COLORS.freshblue,
  },
});
