import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getMyOrders } from "../../api/orderApi";
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from "../../styles/theme";

const API_STORE_URL = "https://onako-bigmart-mobile-app-production.up.railway.app";

export default function OrderHistoryScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getMyOrders();
      setOrders(response.data.data || []);
    } catch (error) {
      console.log("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return { bg: "#FFE0B2", text: "#E65100" }; // Orange
      case "processing":
      case "reviewing":
        return { bg: "#BBDEFB", text: "#0D47A1" }; // Blue
      case "shipped":
        return { bg: "#D1C4E9", text: "#4A148C" }; // Purple
      case "delivered":
      case "approved":
        return { bg: "#C8E6C9", text: "#1B5E20" }; // Green
      case "cancelled":
      case "rejected":
        return { bg: "#FFCDD2", text: "#B71C1C" }; // Red
      default:
        return { bg: COLORS.borderLight, text: COLORS.textSecondary };
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.freshblue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 24 }} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.centerContainer}>
          <Ionicons name="cube-outline" size={60} color={COLORS.textLight} />
          <Text style={styles.emptyTitle}>No Orders Yet</Text>
          <Text style={styles.emptySubtitle}>
            When you place an order, it will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        >
          {orders.map((order) => {
            const isExpanded = expandedOrder === order._id;
            const statusConfig = getStatusColor(order.orderStatus);

            return (
              <View key={order._id} style={[styles.orderCard, SHADOWS.sm]}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.orderHeader}
                  onPress={() =>
                    setExpandedOrder(isExpanded ? null : order._id)
                  }
                >
                  <View style={styles.orderMeta}>
                    <Text style={styles.orderId}>#{order.orderNumber}</Text>
                    <Text style={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </Text>
                    <Text style={styles.orderTotal}>
                      Rs. {order.pricing?.total?.toFixed(2)}
                    </Text>
                  </View>

                  <View style={styles.orderActions}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusConfig.bg },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: statusConfig.text },
                        ]}
                      >
                        {order.orderStatus.replace(/_/g, " ")}
                      </Text>
                    </View>
                    <Ionicons
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      size={20}
                      color={COLORS.textSecondary}
                      style={{ marginLeft: 8 }}
                    />
                  </View>
                </TouchableOpacity>

                {isExpanded && (
                  <View style={styles.orderDetails}>
                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Items Ordered</Text>
                    {order.items.map((item) => (
                      <View key={item._id} style={styles.itemRow}>
                        <View style={styles.itemImageContainer}>
                          {item.image ? (
                            <Image
                              source={{ uri: `${API_STORE_URL}${item.image}` }}
                              style={styles.itemImage}
                            />
                          ) : (
                            <Ionicons
                              name="cube"
                              size={20}
                              color={COLORS.textLight}
                            />
                          )}
                        </View>
                        <View style={styles.itemInfo}>
                          <Text style={styles.itemName} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={styles.itemPriceQty}>
                            Qty: {item.quantity} • Rs.{" "}
                            {item.pricePerUnit?.toFixed(2)}
                          </Text>
                        </View>
                        <Text style={styles.itemSubtotal}>
                          Rs. {item.subtotal?.toFixed(2)}
                        </Text>
                      </View>
                    ))}

                    <View style={styles.divider} />
                    <Text style={styles.sectionTitle}>Shipping Address</Text>
                    {order.shippingAddress ? (
                      <View style={styles.addressBox}>
                        <Text style={styles.addressText}>
                          {order.shippingAddress.street}
                        </Text>
                        <Text style={styles.addressText}>
                          {order.shippingAddress.city}
                        </Text>
                        {order.shippingAddress.phone && (
                          <Text style={[styles.addressText, { marginTop: 4 }]}>
                            {order.shippingAddress.phone}
                          </Text>
                        )}
                      </View>
                    ) : (
                      <Text style={styles.addressText}>No address provided.</Text>
                    )}
                  </View>
                )}
              </View>
            );
          })}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
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
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...FONTS.h3,
  },
  emptyTitle: {
    ...FONTS.h3,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
  listContainer: {
    padding: SPACING.lg,
  },
  orderCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    overflow: "hidden",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.white,
  },
  orderMeta: {
    flex: 1,
  },
  orderId: {
    fontSize: 14,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.freshblue,
  },
  orderActions: {
    alignItems: "flex-end",
    flexDirection: "row",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  orderDetails: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.lg,
    backgroundColor: COLORS.background + "40", // slight tint
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: SPACING.md,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  itemImageContainer: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.borderLight,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: SPACING.sm,
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 2,
  },
  itemPriceQty: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  addressBox: {
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  addressText: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
});
