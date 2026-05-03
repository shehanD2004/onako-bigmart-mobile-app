import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getAddresses,
  addAddress,
  deleteAddress,
  setDefaultAddress,
} from "../../api/authApi";
import CustomButton from "../../components/CustomButton";
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from "../../styles/theme";

export default function AddressesScreen({ navigation }) {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showForm, setShowForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [label, setLabel] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateForm, setStateForm] = useState("");
  const [zip, setZip] = useState("");

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await getAddresses();
      setAddresses(response.data.data || []);
    } catch (error) {
      console.log("Fetch addresses error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!label || !street || !city) {
      return Alert.alert("Error", "Please fill in all required fields.");
    }
    setAdding(true);
    try {
      await addAddress({ label, street, city, state: stateForm, zip, country: "Sri Lanka", isDefault: addresses.length === 0 });
      await fetchAddresses();
      setShowForm(false);
      
      // Reset form
      setLabel("");
      setStreet("");
      setCity("");
      setStateForm("");
      setZip("");
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to add address");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (addresses.length === 1) {
      return Alert.alert("Error", "You cannot delete your only address.");
    }
    Alert.alert("Delete Address", "Are you sure you want to delete this address?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteAddress(id);
            fetchAddresses();
          } catch (err) {
            Alert.alert("Error", "Failed to delete address");
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (id) => {
    try {
      await setDefaultAddress(id);
      fetchAddresses();
    } catch (err) {
      Alert.alert("Error", "Failed to update default address");
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Addresses</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Ionicons name={showForm ? "close" : "add"} size={26} color={COLORS.freshblue} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {showForm && (
          <View style={[styles.formCard, SHADOWS.sm]}>
            <Text style={styles.formTitle}>Add New Address</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Label (e.g. Home, Office) *</Text>
              <TextInput style={styles.input} value={label} onChangeText={setLabel} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Street Address *</Text>
              <TextInput style={styles.input} value={street} onChangeText={setStreet} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>City *</Text>
              <TextInput style={styles.input} value={city} onChangeText={setCity} />
            </View>
            <View style={{ flexDirection: "row", gap: SPACING.md }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>State/Province</Text>
                <TextInput style={styles.input} value={stateForm} onChangeText={setStateForm} />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>ZIP Code</Text>
                <TextInput style={styles.input} value={zip} onChangeText={setZip} keyboardType="number-pad"/>
              </View>
            </View>

            <CustomButton
              title="Save Address"
              onPress={handleAddAddress}
              loading={adding}
              style={{ marginTop: SPACING.md }}
            />
          </View>
        )}

        {!showForm && addresses.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="map-outline" size={60} color={COLORS.border} />
            <Text style={styles.emptyTitle}>No Addresses Saved</Text>
            <Text style={styles.emptySubtitle}>Add an address to breeze through checkout.</Text>
          </View>
        )}

        {!showForm && addresses.map((addr) => (
          <View
            key={addr._id}
            style={[
              styles.addressCard,
              SHADOWS.sm,
              addr.isDefault && styles.addressCardDefault,
            ]}
          >
            {addr.isDefault && (
              <View style={styles.defaultBadge}>
                <Ionicons name="star" size={12} color={COLORS.white} />
                <Text style={styles.defaultText}>Default</Text>
              </View>
            )}

            <Text style={styles.addressLabel}>{addr.label || "Address"}</Text>
            <Text style={styles.addressLine}>{addr.street}</Text>
            <Text style={styles.addressLine}>
              {addr.city}{addr.state ? `, ${addr.state}` : ""}{addr.zip ? ` ${addr.zip}` : ""}
            </Text>

            <View style={styles.actionsBox}>
              {!addr.isDefault ? (
                <TouchableOpacity onPress={() => handleSetDefault(addr._id)}>
                  <Text style={styles.actionTextBlue}>Set as Default</Text>
                </TouchableOpacity>
              ) : (
                <View flex={1} />
              )}
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleDelete(addr._id)}
              >
                <Ionicons name="trash-outline" size={18} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
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
  backButton: { padding: SPACING.xs },
  headerTitle: { ...FONTS.h3 },
  addButton: { padding: SPACING.xs },
  
  formCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.freshblueLight,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: SPACING.lg,
  },
  inputGroup: { marginBottom: SPACING.md },
  label: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    backgroundColor: COLORS.background,
  },

  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
  },
  emptyTitle: {
    ...FONTS.h3,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },

  addressCard: {
    backgroundColor: COLORS.white,
    padding: SPACING.lg,
    borderRadius: RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  addressCardDefault: {
    borderColor: COLORS.freshblue,
  },
  defaultBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
    gap: 4,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: "800",
    color: COLORS.white,
    textTransform: "uppercase",
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  addressLine: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  actionsBox: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.lg,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  actionTextBlue: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.freshblue,
  },
  deleteButton: {
    padding: 6,
  },
});
