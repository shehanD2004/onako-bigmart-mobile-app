import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getProductBySlug } from "../../api/productApi";
import { CartContext } from "../../context/CartContext";
import QuantitySelector from "../../components/QuantitySelector";
import CustomButton from "../../components/CustomButton";
import Loader from "../../components/Loader";
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from "../../styles/theme";

const { width } = Dimensions.get("window");

/**
 * ProductDetailsScreen — mirrors web ProductDetail.jsx
 * Full product view with image, price, discount, quantity selector, and add-to-cart.
 */
export default function ProductDetailsScreen({ route, navigation }) {
  const { slug } = route.params;
  const { addToCart } = useContext(CartContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await getProductBySlug(slug);
        const p = res.data?.data;
        setProduct(p);
        if (p) {
          setQuantity(p.sellingType === "weight" ? 0.25 : 1);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [slug]);

  if (loading) return <Loader message="Loading product..." />;

  if (error || !product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={56} color={COLORS.textLight} />
        <Text style={styles.errorTitle}>Product Not Found</Text>
        <Text style={styles.errorSubtitle}>
          The product you're looking for doesn't exist.
        </Text>
        <CustomButton
          title="Back to Products"
          onPress={() => navigation.goBack()}
          icon={<Ionicons name="arrow-back" size={18} color={COLORS.white} />}
        />
      </View>
    );
  }

  const hasDiscount = product.compareAtPrice > product.pricePerUnit;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice - product.pricePerUnit) /
          product.compareAtPrice) *
          100
      )
    : 0;
  const isOutOfStock = product.stock === 0;
  const isWeight = product.sellingType === "weight";
  const step = isWeight ? 0.25 : 1;
  const min = isWeight ? 0.25 : 1;
  const totalPrice = (product.pricePerUnit * quantity).toFixed(2);

  const handleAddToCart = () => {
    addToCart({ ...product, selectedQuantity: quantity });
    Alert.alert("Added to Cart!", `${product.name} has been added to your cart.`);
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigation.navigate("CartTab");
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* ── Product Image ── */}
      <View style={styles.imageContainer}>
        {product.images?.[0]?.url ? (
          <Image
            source={{ uri: product.images[0].url }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPercent}% OFF</Text>
          </View>
        )}

        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Out of Stock</Text>
            </View>
          </View>
        )}
      </View>

      {/* ── Product Info ── */}
      <View style={styles.infoContainer}>
        {/* Category */}
        {product.category?.name && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category.name}</Text>
          </View>
        )}

        {/* Name */}
        <Text style={styles.productName}>{product.name}</Text>

        {/* Price */}
        <View style={styles.priceSection}>
          {hasDiscount ? (
            <View>
              <View style={styles.priceRow}>
                <Text style={styles.mainPrice}>
                  Rs. {product.pricePerUnit?.toFixed(2)}
                </Text>
                <Text style={styles.comparePrice}>
                  Rs. {product.compareAtPrice?.toFixed(2)}
                </Text>
              </View>
              <View style={styles.saveBadge}>
                <Text style={styles.saveText}>
                  Save Rs. {(product.compareAtPrice - product.pricePerUnit).toFixed(2)}
                </Text>
              </View>
            </View>
          ) : (
            <Text style={styles.mainPrice}>
              Rs. {product.pricePerUnit?.toFixed(2)}
            </Text>
          )}
          <Text style={styles.unitLabel}>/ {product.unit || "pack"}</Text>
        </View>

        {/* Dynamic total */}
        {quantity > min && (
          <Text style={styles.totalPrice}>Total: Rs. {totalPrice}</Text>
        )}

        {/* Description */}
        {product.description ? (
          <Text style={styles.description}>{product.description}</Text>
        ) : null}

        {/* Features */}
        <View style={styles.features}>
          <FeatureRow icon="cube-outline" text="Fresh and high quality" />
          <FeatureRow icon="car-outline" text="Free delivery on orders over Rs. 5000" />
          <FeatureRow icon="shield-checkmark-outline" text="100% satisfaction guarantee" />
        </View>

        {/* ── Quantity & Cart ── */}
        <View style={styles.cartSection}>
          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity(Number((quantity + step).toFixed(2)))}
              onDecrease={() => setQuantity(Math.max(min, Number((quantity - step).toFixed(2))))}
              step={step}
              min={min}
              unit={product.unit || "pack"}
              disabled={isOutOfStock}
            />
          </View>

          <View style={styles.buttonRow}>
            <CustomButton
              title="Add to Cart"
              onPress={handleAddToCart}
              disabled={isOutOfStock}
              icon={<Ionicons name="cart-outline" size={20} color={COLORS.white} />}
              style={{ flex: 1 }}
              size="lg"
            />
            <CustomButton
              title="Buy Now"
              onPress={handleBuyNow}
              disabled={isOutOfStock}
              variant="secondary"
              icon={<Ionicons name="flash-outline" size={20} color={COLORS.textPrimary} />}
              style={{ flex: 1 }}
              size="lg"
            />
          </View>

          {isOutOfStock && (
            <Text style={styles.outOfStockMsg}>
              This product is currently out of stock
            </Text>
          )}
        </View>

        {/* Attributes / Specifications */}
        {product.attributes?.length > 0 && (
          <View style={styles.attributes}>
            <Text style={styles.attrTitle}>Specifications</Text>
            <View style={styles.attrGrid}>
              {product.attributes.map((attr, idx) => (
                <View key={idx} style={styles.attrItem}>
                  <Text style={styles.attrName}>{attr.name}</Text>
                  <Text style={styles.attrValue}>{attr.value}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ── Feature Row ──
function FeatureRow({ icon, text }) {
  return (
    <View style={styles.featureRow}>
      <Ionicons name={icon} size={20} color={COLORS.freshblue} />
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Error
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.xxl,
    gap: SPACING.md,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  errorSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
    marginBottom: SPACING.md,
  },

  // Image
  imageContainer: {
    width: width,
    height: width * 0.85,
    backgroundColor: COLORS.borderLight,
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
  },
  placeholderText: {
    fontSize: 14,
    color: COLORS.textLight,
    marginTop: SPACING.sm,
  },
  discountBadge: {
    position: "absolute",
    top: SPACING.lg,
    left: SPACING.lg,
    backgroundColor: COLORS.danger,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
  },
  discountText: {
    color: COLORS.white,
    fontSize: 14,
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.full,
  },
  outOfStockText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  // Info
  infoContainer: {
    padding: SPACING.xl,
  },
  categoryBadge: {
    borderWidth: 1,
    borderColor: COLORS.border,
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.md,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: "600",
    color: COLORS.textSecondary,
  },
  productName: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    lineHeight: 30,
    marginBottom: SPACING.lg,
  },

  // Price
  priceSection: {
    marginBottom: SPACING.lg,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: SPACING.md,
  },
  mainPrice: {
    fontSize: 28,
    fontWeight: "800",
    color: COLORS.freshblue,
  },
  comparePrice: {
    fontSize: 18,
    color: COLORS.textMuted,
    textDecorationLine: "line-through",
  },
  saveBadge: {
    backgroundColor: COLORS.dangerLight,
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xs,
  },
  saveText: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.danger,
  },
  unitLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  totalPrice: {
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.xl,
  },

  // Features
  features: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.lg,
    marginBottom: SPACING.xl,
    gap: SPACING.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  featureText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },

  // Cart section
  cartSection: {
    gap: SPACING.lg,
  },
  quantityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.lg,
  },
  quantityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
  buttonRow: {
    flexDirection: "row",
    gap: SPACING.md,
  },
  outOfStockMsg: {
    fontSize: 13,
    color: COLORS.danger,
    textAlign: "center",
  },

  // Attributes
  attributes: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xl,
    marginTop: SPACING.xxl,
  },
  attrTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  attrGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.md,
  },
  attrItem: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
    width: "48%",
  },
  attrName: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  attrValue: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
  },
});
