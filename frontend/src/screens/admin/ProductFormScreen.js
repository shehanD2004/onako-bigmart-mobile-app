import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import {
  getProductById,
  createProduct,
  updateProduct,
  getCategories,
} from "../../api/adminApi";
import CustomButton from "../../components/CustomButton";
import { COLORS, SPACING, RADIUS, SHADOWS, FONTS } from "../../styles/theme";

const API_STORE_URL = "http://192.168.239.245:5000";

export default function ProductFormScreen({ navigation, route }) {
  const { id } = route.params || {};

  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [category, setCategory] = useState("");
  const [sellType, setSellType] = useState("pack");
  const [images, setImages] = useState([]); // array of local URIs or backend strings

  useEffect(() => {
    fetchInitialData();
  }, [id]);

  const fetchInitialData = async () => {
    try {
      const catRes = await getCategories();
      setCategories(catRes.data.data || []);

      if (id) {
        const prodRes = await getProductById(id);
        const p = prodRes.data.data;
        setName(p.name);
        setDescription(p.description);
        setPrice(p.price?.toString());
        setStock(p.stock?.toString());
        setCategory(p.category?._id || p.category);
        setSellType(p.sellType || "pack");
        setImages(p.images ? p.images.map((img) => ({ uri: `${API_STORE_URL}${img}`, isOld: true })) : []);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to fetch initial data");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      const newImages = result.assets.map((ast) => ({
        uri: ast.uri,
        isOld: false,
        asset: ast,
      }));
      setImages((prev) => [...prev, ...newImages]);
    }
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!name || !price || !stock) {
      return Alert.alert("Error", "Please fill all required fields.");
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("stock", stock);
      formData.append("category", category);
      formData.append("sellType", sellType);

      // Handle images (existing string arrays vs new files)
      const existingImages = [];
      images.forEach((img) => {
        if (img.isOld) {
          existingImages.push(img.uri.replace(API_STORE_URL, ""));
        } else {
          const localUri = img.uri;
          const filename = localUri.split("/").pop();
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image`;

          formData.append("images", {
            uri: localUri,
            name: filename,
            type,
          });
        }
      });
      // Backend expects existing images as a stringified array if using multer logic
      formData.append("existingImages", JSON.stringify(existingImages));

      if (id) {
        await updateProduct(id, formData);
        Alert.alert("Success", "Product updated.");
      } else {
        await createProduct(formData);
        Alert.alert("Success", "Product created.");
      }
      navigation.goBack();
    } catch (err) {
      console.log(err);
      Alert.alert("Error", err.response?.data?.message || "Submit failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderBox}>
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
        <Text style={styles.headerTitle}>{id ? "Edit Product" : "New Product"}</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput style={styles.input} value={name} onChangeText={setName} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, { height: 80, textAlignVertical: "top" }]}
              value={description}
              onChangeText={setDescription}
              multiline
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: SPACING.sm }]}>
              <Text style={styles.label}>Price *</Text>
              <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" />
            </View>
            <View style={[styles.inputGroup, { flex: 1, marginLeft: SPACING.sm }]}>
              <Text style={styles.label}>Stock *</Text>
              <TextInput style={styles.input} value={stock} onChangeText={setStock} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Category *</Text>
            <View style={styles.categoryGrid}>
              {categories.map((c) => (
                <TouchableOpacity
                  key={c._id}
                  style={[styles.catChip, category === c._id && styles.catChipActive]}
                  onPress={() => setCategory(c._id)}
                >
                  <Text style={[styles.catChipText, category === c._id && styles.catChipTextActive]}>
                    {c.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Product Type *</Text>
            <View style={styles.row}>
              <TouchableOpacity
                style={[styles.typeBtn, sellType === "pack" && styles.typeBtnActive]}
                onPress={() => setSellType("pack")}
              >
                <Text style={[styles.typeText, sellType === "pack" && styles.typeTextActive]}>Per Item / Pack</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeBtn, sellType === "weight" && styles.typeBtnActive]}
                onPress={() => setSellType("weight")}
              >
                <Text style={[styles.typeText, sellType === "weight" && styles.typeTextActive]}>Weight (kg)</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Images</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
              <TouchableOpacity style={styles.imagePickerBtn} onPress={pickImage}>
                <Ionicons name="camera" size={30} color={COLORS.textMuted} />
              </TouchableOpacity>
              {images.map((img, i) => (
                <View key={i} style={styles.imgPreviewBox}>
                  <Image source={{ uri: img.uri }} style={styles.imgPreview} />
                  <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeImage(i)}>
                    <Ionicons name="close" size={12} color={COLORS.white} />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          </View>

          <CustomButton title="Save Product" onPress={handleSubmit} loading={submitting} />
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: SPACING.lg, backgroundColor: COLORS.background },
  loaderBox: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  saveButton: { padding: SPACING.xs },
  saveText: { fontSize: 15, fontWeight: "700", color: COLORS.freshblue },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontSize: 13, fontWeight: "700", color: COLORS.textSecondary, marginBottom: 8, textTransform: "uppercase" },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: RADIUS.md, padding: SPACING.md, fontSize: 14, backgroundColor: COLORS.background },
  row: { flexDirection: "row" },
  categoryGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  catChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: RADIUS.full, backgroundColor: COLORS.borderLight, borderWidth: 1, borderColor: "transparent" },
  catChipActive: { backgroundColor: COLORS.freshblueLight, borderColor: COLORS.freshblue },
  catChipText: { fontSize: 13, color: COLORS.textSecondary },
  catChipTextActive: { color: COLORS.freshblue, fontWeight: "700" },
  typeBtn: { flex: 1, paddingVertical: SPACING.md, alignItems: "center", backgroundColor: COLORS.borderLight, borderRadius: RADIUS.md, marginHorizontal: 4 },
  typeBtnActive: { backgroundColor: COLORS.success, borderColor: COLORS.success, borderWidth: 0 },
  typeText: { fontSize: 13, fontWeight: "600", color: COLORS.textSecondary },
  typeTextActive: { color: COLORS.white },
  imageScroll: { flexDirection: "row", marginTop: SPACING.xs },
  imagePickerBtn: { width: 80, height: 80, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.border, borderStyle: "dashed", justifyContent: "center", alignItems: "center", marginRight: SPACING.md },
  imgPreviewBox: { width: 80, height: 80, borderRadius: RADIUS.md, marginRight: SPACING.md, overflow: "hidden" },
  imgPreview: { width: "100%", height: "100%" },
  removeImgBtn: { position: "absolute", top: 4, right: 4, backgroundColor: "rgba(0,0,0,0.5)", width: 20, height: 20, borderRadius: 10, justifyContent: "center", alignItems: "center" },
});
