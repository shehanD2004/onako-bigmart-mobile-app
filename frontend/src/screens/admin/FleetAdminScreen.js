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
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  getAdminVehicles,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  getAdminStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../../api/adminApi";
import CustomButton from "../../components/CustomButton";
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from "../../styles/theme";

export default function FleetAdminScreen({ navigation }) {
  const [activeTab, setActiveTab] = useState("vehicles");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal Form State
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Vehicle Fields
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [plate, setPlate] = useState("");
  const [capacity, setCapacity] = useState("");

  // Staff Fields
  const [staffName, setStaffName] = useState("");
  const [staffRole, setStaffRole] = useState("Driver");
  const [staffPhone, setStaffPhone] = useState("");
  const [staffLicense, setStaffLicense] = useState("");

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

  const validatePhone = (num) => {
    const cleanNum = num.replace(/[\s\-()]/g, "");
    const localRegex = /^(07[0-9]{8}|0[1-9][0-9]{8})$/;
    const internationalRegex = /^\+[1-9]\d{6,14}$/;
    return localRegex.test(cleanNum) || internationalRegex.test(cleanNum);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "vehicles") {
        const res = await getAdminVehicles();
        setData(res.data.data?.vehicles || res.data.data || []);
      } else {
        const res = await getAdminStaff();
        setData(res.data.data?.staff || res.data.data || []);
      }
    } catch (err) {
      console.log("Error fetching fleet data", err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (item = null) => {
    setIsEditing(!!item);
    setEditingId(item?._id || null);

    if (activeTab === "vehicles") {
      setMake(item?.make || "");
      setModel(item?.model || "");
      setPlate(item?.plateNumber || "");
      setCapacity(item?.capacityVolume?.toString() || "");
    } else {
      setStaffName(item?.user?.name || item?.name || "");
      setStaffRole(item?.role || "Driver");
      setStaffPhone(formatPhoneNumber(item?.phone || ""));
      setStaffLicense(item?.licenseNumber || "");
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    try {
      if (activeTab === "vehicles") {
        if (!make || !model || !plate) return Alert.alert("Error", "Missing vehicle fields.");
        const payload = { make, model, plateNumber: plate, capacityVolume: capacity, status: "available" };
        if (isEditing) await updateVehicle(editingId, payload);
        else await createVehicle(payload);
      } else {
        if (!staffName || !staffPhone) return Alert.alert("Error", "Missing staff fields.");
        if (!validatePhone(staffPhone)) {
          return Alert.alert("Error", "Please enter a valid phone number.");
        }
        const payload = { name: staffName, role: staffRole, phone: staffPhone, licenseNumber: staffLicense, isAvailable: true };
        if (isEditing) await updateStaff(editingId, payload);
        else await createStaff(payload);
      }
      setModalVisible(false);
      fetchData();
    } catch (err) {
      Alert.alert("Error", err.response?.data?.message || "Failed to save");
    }
  };

  const handleDelete = (id) => {
    Alert.alert("Confirm Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (activeTab === "vehicles") await deleteVehicle(id);
            else await deleteStaff(id);
            setData(data.filter((i) => i._id !== id));
          } catch (err) {
            Alert.alert("Error", "Failed to delete");
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Fleet Operations</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "vehicles" && styles.tabActive]}
          onPress={() => setActiveTab("vehicles")}
        >
          <Text style={[styles.tabText, activeTab === "vehicles" && styles.tabTextActive]}>
            Vehicles
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "staff" && styles.tabActive]}
          onPress={() => setActiveTab("staff")}
        >
          <Text style={[styles.tabText, activeTab === "staff" && styles.tabTextActive]}>
            Delivery Staff
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loaderBox}>
          <ActivityIndicator size="large" color={COLORS.freshblue} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.listContent}>
          {data.length === 0 ? (
            <View style={styles.loaderBox}>
              <Ionicons name={activeTab === "vehicles" ? "car-outline" : "people-outline"} size={40} color={COLORS.border} />
              <Text style={styles.emptyText}>No {activeTab} found.</Text>
            </View>
          ) : (
            data.map((item) => (
              <View key={item._id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.iconBox}>
                    <Ionicons name={activeTab === "vehicles" ? "car" : "person"} size={24} color={COLORS.freshblue} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle} numberOfLines={1}>
                      {activeTab === "vehicles" ? `${item.make} ${item.model}` : item.user?.name || item.name || "Unnamed"}
                    </Text>
                    <Text style={styles.cardSub}>
                      {activeTab === "vehicles" ? `Plate: ${item.plateNumber}` : `${item.role} • ${item.phone}`}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", gap: 10 }}>
                     <TouchableOpacity onPress={() => openModal(item)}>
                       <Ionicons name="pencil" size={20} color={COLORS.textSecondary} />
                     </TouchableOpacity>
                     <TouchableOpacity onPress={() => handleDelete(item._id)}>
                       <Ionicons name="trash" size={20} color={COLORS.danger} />
                     </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* FAB */}
      <TouchableOpacity style={[styles.fab, SHADOWS.md]} onPress={() => openModal(null)}>
        <Ionicons name="add" size={30} color={COLORS.white} />
      </TouchableOpacity>

      {/* Form Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
             <View style={styles.modalHeader}>
               <Text style={styles.modalTitle}>{isEditing ? "Edit" : "Add"} {activeTab === "vehicles" ? "Vehicle" : "Staff"}</Text>
               <TouchableOpacity onPress={() => setModalVisible(false)}>
                 <Ionicons name="close" size={24} color={COLORS.textPrimary} />
               </TouchableOpacity>
             </View>

             <ScrollView>
               {activeTab === "vehicles" ? (
                 <>
                   <TextInput style={styles.input} placeholder="Make (e.g. Toyota)" value={make} onChangeText={setMake} />
                   <TextInput style={styles.input} placeholder="Model (e.g. Hilux)" value={model} onChangeText={setModel} />
                   <TextInput style={styles.input} placeholder="Plate Number" value={plate} onChangeText={setPlate} />
                   <TextInput style={styles.input} placeholder="Capacity (Volume m³)" value={capacity} onChangeText={setCapacity} keyboardType="numeric" />
                 </>
               ) : (
                 <>
                   <TextInput style={styles.input} placeholder="Staff Name" value={staffName} onChangeText={setStaffName} />
                   <TextInput style={styles.input} placeholder="Role (e.g. Driver, Helper)" value={staffRole} onChangeText={setStaffRole} />
                   <TextInput style={styles.input} placeholder="(XXX) XXX-XXXX" value={staffPhone} onChangeText={(text) => setStaffPhone(formatPhoneNumber(text))} keyboardType="phone-pad" />
                   <TextInput style={styles.input} placeholder="License Number (Optional)" value={staffLicense} onChangeText={setStaffLicense} />
                 </>
               )}
               <CustomButton title="Save" onPress={handleSave} style={{ marginTop: SPACING.md }} />
             </ScrollView>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingTop: 60, paddingBottom: SPACING.md, paddingHorizontal: SPACING.lg, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  backButton: { padding: SPACING.xs },
  headerTitle: { ...FONTS.h3 },
  tabsContainer: { flexDirection: "row", backgroundColor: COLORS.white, paddingHorizontal: SPACING.lg, borderBottomWidth: 1, borderBottomColor: COLORS.borderLight },
  tab: { flex: 1, paddingVertical: SPACING.md, alignItems: "center", borderBottomWidth: 2, borderBottomColor: "transparent" },
  tabActive: { borderBottomColor: COLORS.freshblue },
  tabText: { fontSize: 14, fontWeight: "600", color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.freshblue },
  listContent: { padding: SPACING.lg },
  loaderBox: { flex: 1, justifyContent: "center", alignItems: "center", marginTop: 40 },
  emptyText: { color: COLORS.textSecondary, marginTop: SPACING.sm },
  card: { backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: RADIUS.md, marginBottom: SPACING.md, borderWidth: 1, borderColor: COLORS.borderLight },
  cardRow: { flexDirection: "row", alignItems: "center" },
  iconBox: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.freshblueLight, justifyContent: "center", alignItems: "center", marginRight: SPACING.md },
  cardTitle: { fontSize: 14, fontWeight: "700", color: COLORS.textPrimary },
  cardSub: { fontSize: 13, color: COLORS.textSecondary },
  fab: { position: "absolute", bottom: SPACING.xl, right: SPACING.xl, width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: COLORS.white, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl, padding: SPACING.xl, maxHeight: "80%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: SPACING.lg },
  modalTitle: { ...FONTS.h3 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, marginBottom: SPACING.md, fontSize: 14, backgroundColor: COLORS.background },
});
