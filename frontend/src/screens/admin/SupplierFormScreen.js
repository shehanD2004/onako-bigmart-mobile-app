import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { createSupplier, updateSupplier } from "../../api/adminApi";
import CustomButton from "../../components/CustomButton";
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from "../../styles/theme";

export default function SupplierFormScreen({ navigation, route }) {
  const { id, supplier } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(supplier?.name || "");
  const [contactPerson, setContactPerson] = useState(supplier?.contactPerson || "");
  const [email, setEmail] = useState(supplier?.email || "");
  
  const formatPhoneNumber = (text) => {
    if (!text) return "";
    let cleaned = text.replace(/[^0-9+\-() ]/g, "");
    if (!cleaned.startsWith('+')) {
      const digits = cleaned.replace(/\D/g, '');
      if (digits.length > 0) {
        if (digits.length <= 3) {
          cleaned = `(${digits}`;
        } else if (digits.length <= 6) {
          cleaned = `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        } else {
          cleaned = `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
        }
      } else {
        cleaned = '';
      }
    }
    return cleaned;
  };

  const [phone, setPhone] = useState(() => formatPhoneNumber(supplier?.phone || ""));
  const [address, setAddress] = useState(supplier?.address || "");

  const validatePhone = (num) => {
    const cleanNum = num.replace(/[\s\-()]/g, "");
    const localRegex = /^(07[0-9]{8}|0[1-9][0-9]{8})$/;
    const internationalRegex = /^\+[1-9]\d{6,14}$/;
    return localRegex.test(cleanNum) || internationalRegex.test(cleanNum);
  };

  const handleSubmit = async () => {
    if (!name || !email || !phone) {
      return Alert.alert("Error", "Name, Email, and Phone are required.");
    }
    if (!validatePhone(phone)) {
      return Alert.alert("Error", "Please enter a valid phone number.");
    }
    
    setLoading(true);
    try {
      const payload = { name, contactPerson, email, phone, address };
      if (id) {
        await updateSupplier(id, payload);
        Alert.alert("Success", "Supplier updated.");
      } else {
        await createSupplier(payload);
        Alert.alert("Success", "Supplier added.");
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to save supplier");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{id ? "Edit Supplier" : "New Supplier"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, SHADOWS.sm]}>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Company/Supplier Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact Person</Text>
            <TextInput style={styles.input} value={contactPerson} onChangeText={setContactPerson} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address *</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput 
              style={styles.input} 
              placeholder="(XXX) XXX-XXXX" 
              value={phone} 
              onChangeText={(text) => setPhone(formatPhoneNumber(text))} 
              keyboardType="phone-pad" 
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Physical Address</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              value={address}
              onChangeText={setAddress}
              multiline
            />
          </View>

          <CustomButton
            title="Save Supplier"
            onPress={handleSubmit}
            loading={loading}
            style={{ marginTop: SPACING.md }}
          />

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: SPACING.lg, backgroundColor: COLORS.background },
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
  
  card: {
    backgroundColor: COLORS.white,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  inputGroup: { marginBottom: SPACING.md },
  label: { fontSize: 12, fontWeight: "700", color: COLORS.textSecondary, textTransform: "uppercase", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    fontSize: 14,
    backgroundColor: COLORS.background,
  },
});
