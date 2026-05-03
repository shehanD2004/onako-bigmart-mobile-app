import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getPublicProducts } from "../../api/productApi";
import ProductCard from "../../components/ProductCard";
import Loader from "../../components/Loader";
import { COLORS, SPACING, RADIUS, SHADOWS } from "../../styles/theme";

/**
 * ShopScreen — mirrors web Shop.jsx
 * Search bar + 2-column product grid with loading / empty states.
 */
export default function ShopScreen({ navigation, route }) {
  const categoryId = route?.params?.categoryId || "";
  const categoryName = route?.params?.categoryName || "";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search with debounce
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await getPublicProducts({
        category: categoryId,
        search: debouncedSearch,
      });
      setProducts(res.data?.data || []);
    } catch (err) {
      console.warn("ShopScreen fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryId, debouncedSearch]);

  useEffect(() => {
    setLoading(true);
    fetchProducts();
  }, [fetchProducts]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setDebouncedSearch("");
    if (route?.params?.categoryId) {
      navigation.setParams({ categoryId: "", categoryName: "" });
    }
  };

  // ── Header component (shown above the grid) ──
  const ListHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>
        {categoryName || "All Products"}
      </Text>
      <Text style={styles.subtitle}>
        Showing {products.length} product{products.length !== 1 ? "s" : ""}
      </Text>

      {/* Search bar */}
      <View style={[styles.searchContainer, SHADOWS.sm]}>
        <Ionicons name="search-outline" size={18} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search products..."
          placeholderTextColor={COLORS.textMuted}
          value={searchTerm}
          onChangeText={setSearchTerm}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchTerm.length > 0 && (
          <TouchableOpacity onPress={() => setSearchTerm("")}>
            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  // ── Empty state ──
  const EmptyState = () => (
    <View style={styles.empty}>
      <Ionicons name="filter-outline" size={56} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>No products found</Text>
      <Text style={styles.emptySubtitle}>Try adjusting your search</Text>
      <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
        <Text style={styles.clearButtonText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) return <Loader message="Loading products..." />;

  return (
    <FlatList
      data={products}
      numColumns={2}
      keyExtractor={(item) => item._id}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={<ListHeader />}
      ListEmptyComponent={<EmptyState />}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.freshblue]}
          tintColor={COLORS.freshblue}
        />
      }
      renderItem={({ item }) => (
        <ProductCard
          product={item}
          onPress={() =>
            navigation.navigate("ProductDetails", { slug: item.slug })
          }
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.md,
  },

  // Header
  header: {
    marginBottom: SPACING.lg,
    paddingHorizontal: SPACING.xs,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    height: 44,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: COLORS.textPrimary,
    paddingVertical: 0,
  },

  // Empty state
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
  },
  clearButton: {
    backgroundColor: COLORS.freshblue,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.md,
  },
  clearButtonText: {
    color: COLORS.white,
    fontWeight: "700",
    fontSize: 14,
  },
});
