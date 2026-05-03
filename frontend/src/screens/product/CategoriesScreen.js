import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { getPublicCategories } from "../../api/categoryApi";
import CategoryCard from "../../components/CategoryCard";
import Loader from "../../components/Loader";
import { COLORS, SPACING, RADIUS } from "../../styles/theme";

/**
 * CategoriesScreen — grid display of all categories.
 * Mirrors web Categories.jsx
 */
export default function CategoriesScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await getPublicCategories();
      setCategories(res.data?.data || []);
    } catch (err) {
      console.warn("CategoriesScreen error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  if (loading) return <Loader message="Loading categories..." />;

  return (
    <FlatList
      data={categories}
      numColumns={2}
      keyExtractor={(item) => item._id}
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      columnWrapperStyle={styles.row}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>All Categories</Text>
          <Text style={styles.subtitle}>
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          </Text>
        </View>
      }
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[COLORS.freshblue]}
          tintColor={COLORS.freshblue}
        />
      }
      renderItem={({ item }) => (
        <CategoryCard
          category={item}
          size="medium"
          onPress={() =>
            navigation.navigate("ShopTab", {
              screen: "Shop",
              params: { categoryId: item._id, categoryName: item.name },
            })
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
  content: {
    padding: SPACING.lg,
  },
  row: {
    gap: SPACING.md,
    marginBottom: SPACING.md,
  },
  header: {
    marginBottom: SPACING.xl,
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
  },
});
