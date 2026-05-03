import React, { useContext } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { CartContext } from "../context/CartContext";
import QuantitySelector from "./QuantitySelector";
import { COLORS, RADIUS, SPACING, SHADOWS, FONTS } from "../styles/theme";

/**
 * Product card matching the web ProductCard component.
 * Shows image, discount badge, category, name, price, unit,
 * and add-to-cart / inline quantity selector.
 *
 * Props:
 *   product – full product object from API
 *   onPress – navigates to product detail
 */
export default function ProductCard({ product, onPress }) {
  const { cartItems, addToCart, decreaseCart } = useContext(CartContext);

  const cartItem = cartItems.find((item) => item._id === product._id);
  const isWeight = product.sellingType === "weight";
  const step = isWeight ? 0.25 : 1;
  const min = isWeight ? 0.25 : 1;

  const hasDiscount = product.compareAtPrice > product.pricePerUnit;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice - product.pricePerUnit) /
          product.compareAtPrice) *
          100
      )
    : 0;
  const isOutOfStock = product.stock === 0;

  const handleAddToCart = () => {
    addToCart({ ...product, selectedQuantity: min });
    Alert.alert("Added!", `${product.name} added to cart`);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.card, SHADOWS.md]}
    >
      {/* ── Image ── */}
      <View style={styles.imageContainer}>
        {product.images?.[0]?.url ? (
          <Image
            source={{ uri: product.images[0].url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={COLORS.textLight} />
          </View>
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          </View>
        )}
      </View>

      {/* ── Info ── */}
      <View style={styles.info}>
        {/* Category */}
        {product.category?.name ? (
          <Text style={styles.category} numberOfLines={1}>
            {product.category.name}
          </Text>
        ) : null}

        {/* Product name */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price row */}
        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            {hasDiscount ? (
              <View style={styles.priceGroup}>
                <Text style={styles.price}>
                  Rs. {product.pricePerUnit?.toFixed(2)}
                </Text>
                <Text style={styles.comparePrice}>
                  Rs. {product.compareAtPrice?.toFixed(2)}
                </Text>
              </View>
            ) : (
              <Text style={styles.price}>
                Rs. {product.pricePerUnit?.toFixed(2)}
              </Text>
            )}
            <Text style={styles.unit}>
              / {product.unit || "pack"}
            </Text>
          </View>

          {/* Cart action */}
          <View>
            {cartItem ? (
              <QuantitySelector
                quantity={cartItem.cartQuantity}
                onIncrease={() => addToCart(product)}
                onDecrease={() => decreaseCart(product)}
                step={step}
                min={min}
                compact
              />
            ) : (
              <TouchableOpacity
                onPress={(e) => {
                  handleAddToCart();
                }}
                disabled={isOutOfStock}
                style={[
                  styles.addButton,
                  isOutOfStock && styles.addButtonDisabled,
                ]}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="cart-outline"
                  size={20}
                  color={COLORS.freshblue}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    flex: 1,
    margin: SPACING.xs,
  },

  // ── Image ──
  imageContainer: {
    aspectRatio: 1,
    backgroundColor: COLORS.background,
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.borderLight,
  },
  discountBadge: {
    position: "absolute",
    top: SPACING.sm,
    left: SPACING.sm,
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: "800",
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
    alignItems: "center",
    justifyContent: "center",
  },
  outOfStockBadge: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.full,
  },
  outOfStockText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },

  // ── Info ──
  info: {
    padding: SPACING.md,
  },
  category: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.freshblue,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textPrimary,
    lineHeight: 18,
    minHeight: 36,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.sm,
  },
  priceCol: {
    flex: 1,
  },
  priceGroup: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACING.xs,
  },
  price: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.freshblue,
  },
  comparePrice: {
    fontSize: 11,
    color: COLORS.textMuted,
    textDecorationLine: "line-through",
  },
  unit: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginTop: 1,
  },

  // ── Add to cart ──
  addButton: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.freshblue,
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonDisabled: {
    opacity: 0.4,
  },
});