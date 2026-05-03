import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getAdminSuppliers, deleteSupplier } from "../../api/adminApi";
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from "../../styles/theme";

export default function SuppliersAdminScreen({ navigation }) {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchSuppliers);
    return unsubscribe;
  }, [navigation]);

  const fetchSuppliers = async () => {
    try {
      const { data } = await getAdminSuppliers();
      // Usually supplier endpoints return an array or { suppliers, pages } depending on Bigmart
      // Assuming it's matching adminApiSlice.js `data.data.suppliers` or `data.data`
      const items = data.data?.suppliers || data.data || [];
      setSuppliers(items);
    } catch (err) {
      console.log("Error fetching suppliers", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Delete Supplier", "Are you sure you want to remove this supplier?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Yes, Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteSupplier(id);
            setSuppliers((prev) => prev.filter((s) => s._id !== id));
          } catch (err) {
            Alert.alert("Error", err.response?.data?.message || "Failed to delete");
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={[styles.card, SHADOWS.sm]}>
      <View style={styles.cardHeader}>
        <View style={styles.avatarBox}>
           <Text style={styles.avatarLetter}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.contactPerson}>{item.contactPerson || "No contact person"}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.isActive ? "ACTIVE" : "INACTIVE"}</Text>
        </View>
      </View>

      <View style={styles.infoRow}>
        <Ionicons name="mail" size={14} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>{item.email}</Text>
      </View>
      <View style={styles.infoRow}>
        <Ionicons name="call" size={14} color={COLORS.textSecondary} />
        <Text style={styles.infoText}>{item.phone}</Text>
      </View>

      <View style={styles.actionsBox}>
        <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate("SupplierForm", { id: item._id, supplier: item })}>
          <Ionicons name="pencil" size={16} color={COLORS.freshblue} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { borderLeftWidth: 1, borderColor: COLORS.borderLight }]} onPress={() => handleDelete(item._id)}>
          <Ionicons name="trash" size={16} color={COLORS.danger} />
          <Text style={[styles.actionText, { color: COLORS.danger }]}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Suppliers Directory</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={COLORS.freshblue} />
        </View>
      ) : (
        <FlatList
          data={suppliers}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: SPACING.lg, paddingBottom: 100 }}
          ListEmptyComponent={
            <View style={styles.loaderBox}>
               <Ionicons name="business-outline" size={60} color={COLORS.border} />
               <Text style={styles.emptyText}>No suppliers found.</Text>
            </View>
          }
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, SHADOWS.md]} onPress={() => navigation.navigate("SupplierForm")}>
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
  headerTitle: { ...FONTS.h3 },
  backButton: { padding: SPACING.xs },
  
  loaderBox: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 60 },
  emptyText: { color: COLORS.textSecondary, fontSize: 14, marginTop: SPACING.md },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    padding: SPACING.md,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: SPACING.md },
  avatarBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.freshblueLight, justifyContent: "center", alignItems: "center", marginRight: SPACING.sm },
  avatarLetter: { fontSize: 18, fontWeight: "800", color: COLORS.freshblue },
  name: { fontSize: 15, fontWeight: "700", color: COLORS.textPrimary },
  contactPerson: { fontSize: 12, color: COLORS.textSecondary },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: RADIUS.sm, backgroundColor: COLORS.success + "20" },
  badgeText: { fontSize: 10, fontWeight: "800", color: COLORS.success },

  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 },
  infoText: { fontSize: 13, color: COLORS.textSecondary },

  actionsBox: { flexDirection: "row", marginTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: SPACING.sm },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 4 },
  actionText: { fontSize: 13, fontWeight: "700", color: COLORS.freshblue },

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
