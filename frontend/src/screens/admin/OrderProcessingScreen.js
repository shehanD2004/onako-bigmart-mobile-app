import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { updateOrderStatus } from "../../api/adminApi";
import CustomButton from "../../components/CustomButton";
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from "../../styles/theme";

const API_STORE_URL = "http://192.168.43.229:5000";

const STATUS_FLOW = ["pending", "processing", "shipped", "delivered"];

export default function OrderProcessingScreen({ navigation, route }) {
  // We pass the full order object from OrdersAdminScreen
  const { order: initialOrder } = route.params;
  const [order, setOrder] = useState(initialOrder);
  const [updating, setUpdating] = useState(false);

  const handleAdvanceStatus = async () => {
    const currentIndex = STATUS_FLOW.indexOf(order.orderStatus);
    if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) return;
    
    const nextStatus = STATUS_FLOW[currentIndex + 1];
    Alert.alert(
      "Update Status",
      `Are you sure you want to change status to ${nextStatus.toUpperCase()}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Confirm",
          onPress: async () => {
            setUpdating(true);
            try {
              await updateOrderStatus(order._id, nextStatus);
              setOrder({ ...order, orderStatus: nextStatus });
              Alert.alert("Success", "Order updated");
            } catch (err) {
              Alert.alert("Error", "Failed to update status");
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleCancelOrder = () => {
    Alert.alert(
      "Cancel Order",
      "Are you sure you want to CANCEL this order?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setUpdating(true);
            try {
              await updateOrderStatus(order._id, "cancelled");
              setOrder({ ...order, orderStatus: "cancelled" });
              Alert.alert("Success", "Order cancelled");
            } catch (err) {
              Alert.alert("Error", "Failed to cancel order");
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
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

  const sColor = getStatusColor(order.orderStatus);
  const currentIndex = STATUS_FLOW.indexOf(order.orderStatus);
  const canAdvance = currentIndex !== -1 && currentIndex < STATUS_FLOW.length - 1;
  const isCancelled = order.orderStatus === "cancelled";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.orderNumber}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Status Tracker Box */}
        <View style={[styles.card, SHADOWS.sm]}>
          <Text style={styles.sectionTitle}>Fulfillment Status</Text>
          <View style={[styles.statusBadge, { backgroundColor: sColor.bg }]}>
            <Text style={[styles.statusText, { color: sColor.text }]}>{order.orderStatus}</Text>
          </View>
          
          <View style={styles.actionRow}>
            <CustomButton
              title={canAdvance ? `Advance to ${STATUS_FLOW[currentIndex + 1]}` : (isCancelled ? "Order Cancelled" : "Order Completed")}
              onPress={handleAdvanceStatus}
              disabled={!canAdvance || isCancelled}
              loading={updating}
              style={{ flex: 1, marginRight: SPACING.md }}
            />
            {!isCancelled && canAdvance && (
              <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelOrder}>
                <Ionicons name="close-circle" size={24} color={COLORS.danger} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Customer & Shipping */}
        <View style={[styles.card, SHADOWS.sm]}>
          <Text style={styles.sectionTitle}>Customer & Shipping</Text>
          <View style={styles.infoRow}>
            <Ionicons name="person" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{order.user?.name || "Guest"}</Text>
          </View>
          <View style={styles.infoRow}>
            <Ionicons name="mail" size={16} color={COLORS.textMuted} />
            <Text style={styles.infoText}>{order.user?.email || "No Email"}</Text>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Ionicons name="map" size={16} color={COLORS.freshblue} />
            <Text style={[styles.infoText, { fontWeight: "700" }]}>Delivery Address</Text>
          </View>
          <View style={styles.addressBox}>
             <Text style={styles.addressLine}>{order.shippingAddress?.street}</Text>
             <Text style={styles.addressLine}>{order.shippingAddress?.city}, {order.shippingAddress?.state}</Text>
             <Text style={[styles.addressLine, { marginTop: 4, fontWeight: "700" }]}>{order.shippingAddress?.phone}</Text>
          </View>
        </View>

        {/* Line Items */}
        <View style={[styles.card, SHADOWS.sm]}>
          <Text style={styles.sectionTitle}>Line Items</Text>
          {order.items.map((item) => (
             <View key={item._id} style={styles.itemRow}>
               <View style={styles.imgBox}>
                 {item.image ? (
                   <Image source={{ uri: `${API_STORE_URL}${item.image}` }} style={styles.img} />
                 ) : (
                   <Ionicons name="cube" size={20} color={COLORS.border} />
                 )}
               </View>
               <View style={styles.itemContent}>
                 <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                 <Text style={styles.itemMeta}>Qty: {item.quantity}  •  Rs. {item.pricePerUnit}</Text>
               </View>
               <Text style={styles.itemSubtotal}>Rs. {item.subtotal}</Text>
             </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
             <Text style={styles.totalLabel}>Total Paid</Text>
             <Text style={styles.totalValue}>Rs. {order.pricing?.total?.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
             <Text style={styles.totalLabel}>Payment Method</Text>
             <Text style={styles.totalMethod}>{order.paymentStatus}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  
  content: { padding: SPACING.lg },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: SPACING.md,
  },
  
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
    marginBottom: SPACING.xl,
  },
  statusText: { fontSize: 13, fontWeight: "800", textTransform: "uppercase" },
  actionRow: { flexDirection: "row", alignItems: "center" },
  cancelBtn: {
    width: 50,
    height: 50,
    backgroundColor: COLORS.danger + "20",
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
  },
  
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.sm, gap: SPACING.sm },
  infoText: { fontSize: 14, color: COLORS.textPrimary },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: SPACING.md },
  addressBox: { backgroundColor: COLORS.background, padding: SPACING.md, borderRadius: RADIUS.md, marginTop: SPACING.xs },
  addressLine: { fontSize: 14, color: COLORS.textSecondary, marginBottom: 2 },
  
  itemRow: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md },
  imgBox: { width: 44, height: 44, borderRadius: RADIUS.sm, backgroundColor: COLORS.borderLight, justifyContent: "center", alignItems: "center", marginRight: SPACING.md, overflow: "hidden" },
  img: { width: "100%", height: "100%" },
  itemContent: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary, marginBottom: 2 },
  itemMeta: { fontSize: 13, color: COLORS.textSecondary },
  itemSubtotal: { fontSize: 14, fontWeight: "800", color: COLORS.freshblue },
  
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.xs },
  totalLabel: { fontSize: 14, fontWeight: "800", color: COLORS.textPrimary },
  totalValue: { fontSize: 18, fontWeight: "800", color: COLORS.success },
  totalMethod: { fontSize: 14, fontWeight: "700", color: COLORS.textSecondary, textTransform: "uppercase" },
});
