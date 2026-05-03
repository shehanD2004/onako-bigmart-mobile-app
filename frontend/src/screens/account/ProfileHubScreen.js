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

export default function ProfileHubScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext);

  const menuItems = [
    {
      id: "orders",
      title: "Order History",
      icon: "cube-outline",
      screen: "OrderHistory",
      color: COLORS.freshblue,
      bg: COLORS.freshblueLight,
    },
    {
      id: "addresses",
      title: "Manage Addresses",
      icon: "location-outline",
      screen: "Addresses",
      color: COLORS.warning,
      bg: "#FFF8E1",
    },
    {
      id: "profile",
      title: "Edit Profile Activity",
      icon: "person-outline",
      screen: "EditProfile",
      color: COLORS.success,
      bg: "#E8F5E9",
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Profile Data */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </Text>
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, SHADOWS.sm]}
              onPress={() => navigation.navigate(item.screen)}
              activeOpacity={0.8}
            >
              <View style={[styles.iconWrapper, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={22} color={item.color} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={COLORS.textLight}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutButton, SHADOWS.sm]}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={22} color={COLORS.danger} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
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
    alignItems: "center",
    paddingVertical: 40,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    backgroundColor: COLORS.white,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.freshblueLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.freshblue,
  },
  name: {
    ...FONTS.h2,
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  menuContainer: {
    padding: SPACING.lg,
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    justifyContent: "center",
    alignItems: "center",
    marginRight: SPACING.md,
  },
  menuItemText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginTop: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.danger + "20", // light red border
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.danger,
    marginLeft: SPACING.sm,
  },
});
