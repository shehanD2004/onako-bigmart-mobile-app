import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getAdminProducts,
  toggleProductStatus,
  deleteProduct,
} from "../../api/adminApi";
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from "../../styles/theme";

const API_STORE_URL = "http://192.168.43.229:5000";

export default function ProductsAdminScreen({ navigation }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchProducts(1, true);
  }, [search]);

  const fetchProducts = async (pageNumber = 1, shouldReset = false) => {
    try {
      const { data } = await getAdminProducts({
        page: pageNumber,
        search,
        limit: 15,
      });

      const items = data.data?.products || data.data || [];
      const totalPages = data.data?.pages || 1;

      if (shouldReset) {
        setProducts(items);
      } else {
        setProducts((prev) => [...prev, ...items]);
      }
      setHasMore(pageNumber < totalPages);
    } catch (err) {
      console.log("Error fetching admin products", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchProducts(nextPage, false);
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await toggleProductStatus(id);
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isActive: !currentStatus } : p))
      );
    } catch (err) {
      Alert.alert("Error", "Failed to toggle status");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Product", "Are you sure you want to delete this?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(id);
            setProducts((prev) => prev.filter((p) => p._id !== id));
          } catch (err) {
            Alert.alert(
              "Error",
              err.response?.data?.message || "Failed to delete"
            );
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.imgBox}>
          {item.images?.length > 0 ? (
            <Image
              source={{ uri: `${API_STORE_URL}${item.images[0]}` }}
              style={styles.img}
            />
          ) : (
            <Ionicons name="image-outline" size={24} color={COLORS.border} />
          )}
        </View>

        <View style={styles.infoCol}>
          <Text style={styles.name} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cat}>{item.category?.name || "Uncategorized"}</Text>
          <Text style={styles.price}>
            Rs. {item.price} • Stock: {item.stock}
          </Text>
        </View>

        <View style={styles.actionCol}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleToggleStatus(item._id, item.isActive)}
          >
            <Ionicons
              name={item.isActive ? "eye" : "eye-off"}
              size={20}
              color={item.isActive ? COLORS.success : COLORS.textMuted}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigation.navigate("ProductForm", { id: item._id })}
          >
            <Ionicons name="pencil" size={18} color={COLORS.freshblue} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash" size={18} color={COLORS.danger} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Products Ledger</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search" size={20} color={COLORS.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search items by name..."
          value={search}
          onChangeText={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
      </View>

      {loading && page === 1 ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={COLORS.freshblue} />
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? (
              <ActivityIndicator
                size="small"
                color={COLORS.freshblue}
                style={{ marginVertical: SPACING.md }}
              />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.loaderBox}>
              <Text style={styles.emptyText}>No products found.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, SHADOWS.md]}
        onPress={() => navigation.navigate("ProductForm")}
      >
        <Ionicons name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  backButton: { padding: SPACING.xs },
  headerTitle: { ...FONTS.h3 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    margin: SPACING.lg,
    marginBottom: 0,
    paddingHorizontal: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: { flex: 1, padding: SPACING.md, fontSize: 14 },
  loaderBox: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: COLORS.textSecondary, fontSize: 14 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardRow: { flexDirection: "row", alignItems: "center" },
  imgBox: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
    overflow: "hidden",
  },
  img: { width: "100%", height: "100%" },
  infoCol: { flex: 1, justifyContent: "center" },
  name: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 2 },
  cat: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 4 },
  price: { fontSize: 13, fontWeight: "600", color: COLORS.freshblue },
  actionCol: { flexDirection: "row", gap: SPACING.sm },
  actionBtn: { padding: 8, backgroundColor: COLORS.background, borderRadius: RADIUS.full },
  fab: {
    position: "absolute",
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
});
