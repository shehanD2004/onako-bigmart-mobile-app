import React, { useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from "../../styles/theme";

export default function AdminHubScreen({ navigation }) {
  const { user } = useContext(AuthContext);

  const modules = [
    {
      id: "inventory",
      title: "Inventory",
      subtitle: "Products & Warehouses",
      icon: "cube",
      screen: "ProductsAdmin",
      color: COLORS.freshblue,
      bg: COLORS.freshblueLight,
    },
    {
      id: "orders",
      title: "Orders",
      subtitle: "Processing & Fulfillment",
      icon: "cart",
      screen: "OrdersAdmin",
      color: COLORS.success,
      bg: "#E8F5E9",
    },
    {
      id: "suppliers",
      title: "Suppliers",
      subtitle: "Supplier Contacts",
      icon: "business",
      screen: "SuppliersAdmin",
      color: COLORS.warning,
      bg: "#FFF8E1",
    },
    {
      id: "fleet",
      title: "Fleet & Staff",
      subtitle: "Vehicles & Drivers",
      icon: "car",
      screen: "FleetAdmin", // Or VehiclesAdmin etc.
      color: "#9C27B0",
      bg: "#F3E5F5",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Admin Dashboard</Text>
          <Text style={styles.subGreeting}>Welcome back, {user?.name}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>ADMIN</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Management Modules</Text>
        
        <View style={styles.grid}>
          {modules.map((mod) => (
            <TouchableOpacity
              key={mod.id}
              style={[styles.card, SHADOWS.sm]}
              activeOpacity={0.8}
              onPress={() => {
                // Ignore navigation for now if screen doesn't exist to prevent crash
                if (mod.screen) {
                  navigation.navigate(mod.screen);
                }
              }}
            >
              <View style={[styles.iconBox, { backgroundColor: mod.bg }]}>
                <Ionicons name={mod.icon} size={28} color={mod.color} />
              </View>
              <Text style={styles.cardTitle}>{mod.title}</Text>
              <Text style={styles.cardSubtitle}>{mod.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    paddingTop: 60,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  greeting: {
    ...FONTS.h2,
    color: COLORS.textPrimary,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    marginBottom: SPACING.md,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: "center",
  },
  iconBox: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 4,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
