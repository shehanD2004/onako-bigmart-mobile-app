import React, { useContext } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, ActivityIndicator } from "react-native";

// Auth Context
import { AuthContext } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import { COLORS } from "../styles/theme";

// Auth Screens
import LoginScreen from "../screens/auth/LoginScreen";
import RegisterScreen from "../screens/auth/RegisterScreen";

// App Screens
import HomeScreen from "../screens/product/HomeScreen";
import ShopScreen from "../screens/product/ShopScreen";
import CategoriesScreen from "../screens/product/CategoriesScreen";
import ProductDetailsScreen from "../screens/product/ProductDetailsScreen";
import CartScreen from "../screens/cart/CartScreen";
import CheckoutScreen from "../screens/cart/CheckoutScreen";
import ProfileHubScreen from "../screens/account/ProfileHubScreen";
import EditProfileScreen from "../screens/account/EditProfileScreen";
import OrderHistoryScreen from "../screens/account/OrderHistoryScreen";
import AddressesScreen from "../screens/account/AddressesScreen";

// Admin Screens
import AdminHubScreen from "../screens/admin/AdminHubScreen";
import ProductsAdminScreen from "../screens/admin/ProductsAdminScreen";
import ProductFormScreen from "../screens/admin/ProductFormScreen";
import OrdersAdminScreen from "../screens/admin/OrdersAdminScreen";
import OrderProcessingScreen from "../screens/admin/OrderProcessingScreen";
import SuppliersAdminScreen from "../screens/admin/SuppliersAdminScreen";
import SupplierFormScreen from "../screens/admin/SupplierFormScreen";
import FleetAdminScreen from "../screens/admin/FleetAdminScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// ── Auth Stack ──
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

// ── Home Stack ──
function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Categories" component={CategoriesScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </Stack.Navigator>
  );
}

// ── Shop Stack ──
function ShopStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Shop" component={ShopScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
    </Stack.Navigator>
  );
}

// ── Cart Stack ──
function CartStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Cart" component={CartScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
    </Stack.Navigator>
  );
}

// ── Profile Stack ──
function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ProfileHub" component={ProfileHubScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="Addresses" component={AddressesScreen} />
    </Stack.Navigator>
  );
}

// ── Admin Stack ──
function AdminStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminHub" component={AdminHubScreen} />
      <Stack.Screen name="ProductsAdmin" component={ProductsAdminScreen} />
      <Stack.Screen name="ProductForm" component={ProductFormScreen} />
      <Stack.Screen name="OrdersAdmin" component={OrdersAdminScreen} />
      <Stack.Screen name="OrderProcessing" component={OrderProcessingScreen} />
      <Stack.Screen name="SuppliersAdmin" component={SuppliersAdminScreen} />
      <Stack.Screen name="SupplierForm" component={SupplierFormScreen} />
      <Stack.Screen name="FleetAdmin" component={FleetAdminScreen} />
    </Stack.Navigator>
  );
}

// ── Main Bottom Tabs ──
function MainTabs() {
  const { cartTotalQuantity } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  
  const isAdmin = user?.role === "admin" || user?.role === "staff" || user?.role === "warehouse_mgr";

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "HomeTab") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "ShopTab") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "CartTab") {
            iconName = focused ? "cart" : "cart-outline";
          } else if (route.name === "ProfileTab") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "AdminTab") {
            iconName = focused ? "briefcase" : "briefcase-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.freshblue,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.borderLight,
          elevation: 0,
          shadowOpacity: 0,
          backgroundColor: COLORS.white,
        },
      })}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{ title: "Home" }}
      />
      <Tab.Screen
        name="ShopTab"
        component={ShopStack}
        options={{ title: "Shop" }}
      />
      <Tab.Screen
        name="CartTab"
        component={CartStack}
        options={{
          title: "Cart",
          tabBarBadge: cartTotalQuantity > 0 ? Math.ceil(cartTotalQuantity) : null,
          tabBarBadgeStyle: { backgroundColor: COLORS.danger },
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStack}
        options={{ title: "Account" }}
      />
      {isAdmin && (
        <Tab.Screen
          name="AdminTab"
          component={AdminStack}
          options={{ title: "Admin" }}
        />
      )}
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { token, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={COLORS.freshblue} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {token ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}