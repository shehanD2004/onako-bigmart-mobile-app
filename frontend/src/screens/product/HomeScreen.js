import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ImageBackground,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getFeaturedProducts } from "../../api/productApi";
import { getPublicCategories } from "../../api/categoryApi";
import ProductCard from "../../components/ProductCard";
import CategoryCard from "../../components/CategoryCard";
import Loader from "../../components/Loader";
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from "../../styles/theme";

const { width } = Dimensions.get("window");

export default function HomeScreen({ navigation }) {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        getFeaturedProducts(),
        getPublicCategories(),
      ]);
      setFeaturedProducts(prodRes.data?.data || []);
      setCategories(catRes.data?.data || []);
    } catch (err) {
      console.warn("HomeScreen fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) return <Loader message="Loading Bigmart..." />;

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.freshblue]}
          tintColor={COLORS.freshblue}
        />
      }
    >
      {/* ── Hero Banner ── */}
      <View style={styles.hero}>
        <View style={styles.heroContent}>
          <View style={styles.heroBadge}>
            <Ionicons name="pricetag" size={14} color={COLORS.white} />
            <Text style={styles.heroBadgeText}>Fresh produce delivered daily</Text>
          </View>
          <Text style={styles.heroTitle}>
            Fresh Groceries{"\n"}Delivered to{"\n"}Your Door
          </Text>
          <Text style={styles.heroSubtitle}>
            Shop from our wide selection of fresh produce, dairy, meats, and more.
          </Text>
          <TouchableOpacity
            style={styles.heroButton}
            onPress={() => navigation.navigate("ShopTab")}
            activeOpacity={0.8}
          >
            <Text style={styles.heroButtonText}>Shop Now</Text>
            <Ionicons name="arrow-forward" size={18} color={COLORS.freshblue} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Features Strip ── */}
      <View style={styles.featuresStrip}>
        <FeatureItem icon="car-outline" title="Free Delivery" subtitle="Orders over Rs. 5000" />
        <FeatureItem icon="time-outline" title="2-Hour Delivery" subtitle="Fast & convenient" />
        <FeatureItem icon="shield-checkmark-outline" title="100% Fresh" subtitle="Quality guarantee" />
      </View>

      {/* ── Categories ── */}
      {categories.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Shop by Category"
            subtitle="Browse our fresh selection"
            actionText="View All"
            onAction={() => navigation.navigate("Categories")}
          />
          <FlatList
            data={categories.slice(0, 8)}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.categoryList}
            renderItem={({ item }) => (
              <CategoryCard
                category={item}
                onPress={() =>
                  navigation.navigate("ShopTab", {
                    screen: "Shop",
                    params: { categoryId: item._id, categoryName: item.name },
                  })
                }
                size="small"
              />
            )}
          />
        </View>
      )}

      {/* ── Featured Products ── */}
      {featuredProducts.length > 0 && (
        <View style={styles.section}>
          <SectionHeader
            title="Today's Best Deals"
            subtitle="Don't miss these special offers"
            actionText="View All"
            onAction={() => navigation.navigate("ShopTab")}
          />
          <FlatList
            data={featuredProducts}
            numColumns={2}
            scrollEnabled={false}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.productGrid}
            renderItem={({ item }) => (
              <ProductCard
                product={item}
                onPress={() =>
                  navigation.navigate("ProductDetails", { slug: item.slug })
                }
              />
            )}
          />
        </View>
      )}

      {/* Bottom spacer */}
      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

// ── Section Header ──
function SectionHeader({ title, subtitle, actionText, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <View style={{ flex: 1 }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
      </View>
      {actionText && onAction && (
        <TouchableOpacity onPress={onAction} activeOpacity={0.7}>
          <Text style={styles.sectionAction}>{actionText}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ── Feature Item ──
function FeatureItem({ icon, title, subtitle }) {
  return (
    <View style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={icon} size={22} color={COLORS.freshblue} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ── Hero ──
  hero: {
    backgroundColor: COLORS.freshblue,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxxl + 10,
    borderBottomLeftRadius: RADIUS.xl,
    borderBottomRightRadius: RADIUS.xl,
  },
  heroContent: {},
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.xs,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.lg,
  },
  heroBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.white,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: "800",
    color: COLORS.white,
    lineHeight: 38,
    marginBottom: SPACING.md,
  },
  heroSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  heroButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    backgroundColor: COLORS.white,
    alignSelf: "flex-start",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md + 2,
    borderRadius: RADIUS.md,
  },
  heroButtonText: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.freshblue,
  },

  // ── Features Strip ──
  featuresStrip: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    marginTop: -SPACING.xl,
    borderRadius: RADIUS.lg,
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.md,
    ...SHADOWS.md,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.freshblueLight,
    alignItems: "center",
    justifyContent: "center",
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  featureSubtitle: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },

  // ── Sections ──
  section: {
    marginTop: SPACING.xxl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  sectionAction: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.freshblue,
  },

  // ── Lists ──
  categoryList: {
    gap: SPACING.sm,
    paddingRight: SPACING.lg,
  },
  productGrid: {
    gap: SPACING.xs,
  },
});