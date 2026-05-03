import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAdminOrders } from "../../api/adminApi";
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from "../../styles/theme";

export default function OrdersAdminScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtering & Pagination
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const filters = [
    { id: "all", label: "All Orders" },
    { id: "pending", label: "Pending" },
    { id: "processing", label: "Processing" },
    { id: "shipped", label: "Shipped" },
    { id: "delivered", label: "Delivered" },
  ];

  useEffect(() => {
    // Refresh listener when returning from detail
    const unsubscribe = navigation.addListener("focus", () => {
      fetchOrders(1, true);
    });
    return unsubscribe;
  }, [navigation, activeFilter]);

  const fetchOrders = async (pageNumber = 1, shouldReset = false) => {
    try {
      const params = { page: pageNumber };
      if (activeFilter !== "all") params.status = activeFilter;
      
      const { data } = await getAdminOrders(params);

      // Backend usually returns { orders, pages }
      const items = data.data?.orders || data.data || [];
      const totalPages = data.data?.pages || 1;

      if (shouldReset) {
        setOrders(items);
      } else {
        setOrders((prev) => [...prev, ...items]);
      }
      setHasMore(pageNumber < totalPages);
    } catch (err) {
      console.log("Error fetching admin orders", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
    setPage(1);
    setLoading(true);
    fetchOrders(1, true);
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      setLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
      fetchOrders(nextPage, false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending": return { bg: "#FFE0B2", text: "#E65100" }; 
      case "processing": return { bg: "#BBDEFB", text: "#0D47A1" };
      case "shipped": return { bg: "#D1C4E9", text: "#4A148C" };
      case "delivered": return { bg: "#C8E6C9", text: "#1B5E20" };
      case "cancelled": return { bg: "#FFCDD2", text: "#B71C1C" };
      default: return { bg: COLORS.borderLight, text: COLORS.textSecondary };
    }
  };

  const renderOrder = ({ item }) => {
    const sColors = getStatusColor(item.orderStatus);
    
    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        onPress={() => navigation.navigate("OrderProcessing", { order: item })}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.orderId}>#{item.orderNumber}</Text>
          <View style={[styles.badge, { backgroundColor: sColors.bg }]}>
            <Text style={[styles.badgeText, { color: sColors.text }]}>
              {item.orderStatus}
            </Text>
          </View>
        </View>
        
        <View style={styles.cardBody}>
          <View>
            <Text style={styles.infoLabel}>Customer</Text>
            <Text style={styles.infoValue}>{item.user?.name || "Guest"}</Text>
          </View>
          <View>
             <Text style={styles.infoLabel}>Date</Text>
             <Text style={styles.infoValue}>
               {new Date(item.createdAt).toLocaleDateString()}
             </Text>
          </View>
          <View>
             <Text style={styles.infoLabel}>Total</Text>
             <Text style={[styles.infoValue, { color: COLORS.freshblue, fontWeight: "700" }]}>
               Rs. {item.pricing?.total?.toFixed(2)}
             </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
           <Text style={styles.itemsCount}>{item.items?.length || 0} items</Text>
           <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fulfillment Ledger</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter Chips */}
      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {filters.map((f) => (
            <TouchableOpacity
              key={f.id}
              style={[styles.filterChip, activeFilter === f.id && styles.filterChipActive]}
              onPress={() => handleFilterChange(f.id)}
            >
              <Text style={[styles.filterText, activeFilter === f.id && styles.filterTextActive]}>
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* List */}
      {loading && page === 1 ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={COLORS.freshblue} />
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item._id}
          renderItem={renderOrder}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 60 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loadingMore ? <ActivityIndicator size="small" color={COLORS.freshblue} style={{ marginVertical: SPACING.md }} /> : null
          }
          ListEmptyComponent={
            <View style={styles.loaderBox}>
              <Ionicons name="receipt-outline" size={60} color={COLORS.border} />
              <Text style={styles.emptyText}>No orders found.</Text>
            </View>
          }
        />
      )}
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
  headerTitle: { ...FONTS.h3 },
  backButton: { padding: SPACING.xs },
  
  filterScroll: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  filterChipActive: {
    backgroundColor: COLORS.freshblue,
    borderColor: COLORS.freshblue,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textSecondary,
    textTransform: "capitalize",
  },
  filterTextActive: {
    color: COLORS.white,
  },

  loaderBox: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60 },
  emptyText: { marginTop: SPACING.md, color: COLORS.textSecondary, fontSize: 15 },
  
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  cardBody: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  infoLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: COLORS.textPrimary,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  itemsCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
