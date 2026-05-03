import React, { useContext, useEffect } from "react";
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CartContext } from "../../context/CartContext";
import QuantitySelector from "../../components/QuantitySelector";
import CustomButton from "../../components/CustomButton";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../styles/theme";

/**
 * CartScreen — mirrors web Cart.jsx
 * Cart items list, quantity controls, order summary, checkout CTA.
 */
export default function CartScreen({ navigation }) {
  const {
    cartItems,
    cartTotalAmount,
    addToCart,
    decreaseCart,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useContext(CartContext);

  const deliveryFee = cartTotalAmount > 5000 ? 0 : 250;
  const finalTotal = cartTotalAmount + deliveryFee;

  // ── Empty Cart ──
  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bag-outline" size={80} color={COLORS.textLight} />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>Add items to get started</Text>
        <CustomButton
          title="Continue Shopping"
          onPress={() => navigation.navigate("HomeTab")}
          icon={<Ionicons name="arrow-back" size={18} color={COLORS.white} />}
        />
      </View>
    );
  }

  // ── Cart Item Row ──
  const renderCartItem = ({ item }) => {
    const isWeight = item.sellingType === "weight";
    const step = isWeight ? 0.25 : 1;
    const min = isWeight ? 0.25 : 1;
    const itemTotal = (item.pricePerUnit * item.cartQuantity).toFixed(2);

    return (
      <View style={styles.cartItem}>
        {/* Image */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("ProductDetails", { slug: item.slug })
          }
          style={styles.itemImageContainer}
        >
          {item.images?.[0]?.url ? (
            <Image
              source={{ uri: item.images[0].url }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.itemImagePlaceholder}>
              <Ionicons name="image-outline" size={20} color={COLORS.textLight} />
            </View>
          )}
        </TouchableOpacity>

        {/* Info */}
        <View style={styles.itemInfo}>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("ProductDetails", { slug: item.slug })
            }
          >
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
          </TouchableOpacity>
          <Text style={styles.itemUnit}>
            Rs. {item.pricePerUnit?.toFixed(2)} / {item.unit || "pack"}
          </Text>

          {/* Quantity + Price + Remove */}
          <View style={styles.itemActions}>
            <QuantitySelector
              quantity={item.cartQuantity}
              onIncrease={() => addToCart(item)}
              onDecrease={() => decreaseCart(item)}
              step={step}
              min={min}
              compact
            />

            <View style={styles.itemPriceCol}>
              <Text style={styles.itemTotal}>Rs. {itemTotal}</Text>
              <Text style={styles.itemCalc}>
                Rs. {item.pricePerUnit?.toFixed(2)} × {item.cartQuantity}
                {item.unit || "pack"}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => removeFromCart(item)}
              style={styles.removeButton}
              activeOpacity={0.7}
            >
              <Ionicons name="trash-outline" size={16} color={COLORS.danger} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // ── Order Summary Footer ──
  const OrderSummary = () => (
    <View style={[styles.summaryCard, SHADOWS.md]}>
      <Text style={styles.summaryTitle}>Order Summary</Text>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Subtotal</Text>
        <Text style={styles.summaryValue}>Rs. {cartTotalAmount.toFixed(2)}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Text style={styles.summaryLabel}>Delivery Fee</Text>
        {deliveryFee === 0 ? (
          <Text style={[styles.summaryValue, { color: COLORS.freshblue }]}>
            FREE
          </Text>
        ) : (
          <Text style={styles.summaryValue}>Rs. {deliveryFee.toFixed(2)}</Text>
        )}
      </View>

      {deliveryFee > 0 && (
        <Text style={styles.freeDeliveryHint}>
          Free delivery on orders over Rs. 5,000
        </Text>
      )}

      <View style={styles.summaryDivider} />

      <View style={styles.summaryRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>Rs. {finalTotal.toFixed(2)}</Text>
      </View>

      <CustomButton
        title="Proceed to Checkout"
        onPress={() => navigation.navigate("Checkout")}
        size="lg"
        style={{ marginTop: SPACING.lg }}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <TouchableOpacity
          onPress={() =>
            Alert.alert("Clear Cart", "Remove all items?", [
              { text: "Cancel", style: "cancel" },
              { text: "Clear", style: "destructive", onPress: clearCart },
            ])
          }
        >
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.itemCount}>
        {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} in cart
      </Text>

      <FlatList
        data={cartItems}
        keyExtractor={(item) => item._id}
        renderItem={renderCartItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<OrderSummary />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  clearText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.danger,
  },
  itemCount: {
    fontSize: 13,
    color: COLORS.textSecondary,
    paddingHorizontal: SPACING.xl,
    marginBottom: SPACING.md,
  },

  // List
  listContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },

  // Cart item
  cartItem: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    gap: SPACING.md,
    ...SHADOWS.sm,
  },
  itemImageContainer: {
    width: 72,
    height: 72,
    borderRadius: RADIUS.md,
    overflow: "hidden",
    backgroundColor: COLORS.borderLight,
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemImagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
    lineHeight: 18,
  },
  itemUnit: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: SPACING.sm,
  },
  itemActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  itemPriceCol: {
    alignItems: "flex-end",
    flex: 1,
    marginHorizontal: SPACING.sm,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.freshblue,
  },
  itemCalc: {
    fontSize: 9,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  removeButton: {
    padding: SPACING.sm,
    borderRadius: RADIUS.md,
  },

  // Summary
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginTop: SPACING.lg,
  },
  summaryTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
    paddingBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  freeDeliveryHint: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.freshblue,
  },

  // Empty
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.xxl,
    gap: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
});
