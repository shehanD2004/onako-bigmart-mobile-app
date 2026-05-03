import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { updateProfile, updatePassword } from "../../api/authApi";
import { AuthContext } from "../../context/AuthContext";
import CustomButton from "../../components/CustomButton";
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from "../../styles/theme";

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfileContext } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [loadingProfile, setLoadingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  const handleProfileSubmit = async () => {
    if (!name) return Alert.alert("Error", "Name cannot be empty");

    setLoadingProfile(true);
    try {
      const response = await updateProfile({ name, phone });
      updateProfileContext(response.data.data);
      Alert.alert("Success", "Profile updated successfully");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!currentPassword || !newPassword) {
      return Alert.alert("Error", "Please fill in all password fields");
    }
    if (newPassword.length < 6) {
      return Alert.alert("Error", "New password must be at least 6 characters");
    }

    setLoadingPassword(true);
    try {
      await updatePassword({ currentPassword, newPassword });
      Alert.alert("Success", "Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      Alert.alert(
        "Error",
        err.response?.data?.message || "Incorrect current password"
      );
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Basic Info */}
        <View style={[styles.card, SHADOWS.sm]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="person" size={20} color={COLORS.freshblue} />
            <Text style={styles.sectionTitle}>Basic Information</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email (Read Only)</Text>
            <TextInput
              style={[styles.input, styles.disabledInput]}
              value={user?.email || ""}
              editable={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>

          <CustomButton
            title="Save Changes"
            onPress={handleProfileSubmit}
            loading={loadingProfile}
            style={{ marginTop: SPACING.md }}
          />
        </View>

        {/* Change Password */}
        <View style={[styles.card, SHADOWS.sm]}>
          <View style={styles.sectionHeader}>
            <Ionicons name="lock-closed" size={20} color={COLORS.freshblue} />
            <Text style={styles.sectionTitle}>Change Password</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={20}
                  color={COLORS.textMuted}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showPassword}
              />
            </View>
          </View>

          <CustomButton
            title="Update Password"
            onPress={handlePasswordSubmit}
            loading={loadingPassword}
            variant="outline"
            style={{ marginTop: SPACING.md }}
          />
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingBottom: SPACING.lg,
  },
  backButton: {
    padding: SPACING.xs,
  },
  headerTitle: {
    ...FONTS.h3,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  inputGroup: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginBottom: 6,
    textTransform: "uppercase",
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: 14,
    color: COLORS.textPrimary,
    backgroundColor: COLORS.background,
  },
  disabledInput: {
    backgroundColor: COLORS.borderLight,
    color: COLORS.textSecondary,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.background,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: 14,
    color: COLORS.textPrimary,
  },
  eyeBtn: {
    padding: SPACING.md,
  },
});
