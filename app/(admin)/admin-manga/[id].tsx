import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Switch,
  ActivityIndicator,
  useColorScheme,
  Alert,
  Image,
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import {
  getMangaByIdAdmin,
  createManga,
  updateManga,
  Manga,
  uploadSingleImage,
} from "../../../services/api";
import { Colors } from "../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function MangaFormScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === "new";
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Manga>>({
    title: "",
    description: "",
    coverUrl: "",
    status: "Ongoing",
    year: new Date().getFullYear(),
    genres: [],
    isDisplayed: true,
  });

  const [localImageUri, setLocalImageUri] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew) {
      const fetchManga = async () => {
        try {
          const data = await getMangaByIdAdmin(id);
          setFormData(data);
        } catch (error) {
          console.error(error);
          Alert.alert("Error", "Failed to fetch manga details");
        } finally {
          setLoading(false);
        }
      };
      fetchManga();
    }
  }, [id]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false, // Don't force a crop
      quality: 0.8,
    });

    if (!result.canceled) {
      setLocalImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!formData.title || (!formData.coverUrl && !localImageUri)) {
      Alert.alert("Error", "Title and Cover are required");
      return;
    }

    setSaving(true);
    try {
      let finalCoverUrl = formData.coverUrl;

      if (localImageUri) {
        finalCoverUrl = await uploadSingleImage(localImageUri);
      }

      const payload = { ...formData, coverUrl: finalCoverUrl };

      if (isNew) {
        await createManga(payload);
        Alert.alert("Success", "Manga created successfully");
      } else {
        await updateManga(id, payload);
        Alert.alert("Success", "Manga updated successfully");
      }
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save manga");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View
        style={[
          styles.header,
          { backgroundColor: theme.surface, borderBottomColor: theme.border },
        ]}
      >
        <Pressable
          onPress={() => router.replace("/(admin)/admin-manga" as any)}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isNew ? "New Manga" : "Edit Manga"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.text }]}>Title</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Manga Title"
            placeholderTextColor={theme.icon}
          />

          <Text style={[styles.label, { color: theme.text }]}>Description</Text>
          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.description}
            onChangeText={(text) =>
              setFormData({ ...formData, description: text })
            }
            placeholder="Description"
            placeholderTextColor={theme.icon}
            multiline
            numberOfLines={4}
          />

          <Text style={[styles.label, { color: theme.text }]}>Cover Image</Text>
          <Pressable
            style={[
              styles.imagePicker,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
            onPress={pickImage}
          >
            {localImageUri || formData.coverUrl ? (
              <View style={styles.previewContainer}>
                <Image
                  source={{ uri: localImageUri || formData.coverUrl }}
                  style={styles.coverPreview}
                  resizeMode="cover"
                />
                <View style={styles.changeImageOverlay}>
                  <Ionicons name="camera" size={24} color="#fff" />
                  <Text style={styles.changeImageText}>Change Image</Text>
                </View>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Ionicons name="image-outline" size={40} color={theme.icon} />
                <Text style={[styles.placeholderText, { color: theme.icon }]}>
                  Select Cover Image
                </Text>
              </View>
            )}
          </Pressable>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.label, { color: theme.text }]}>Status</Text>
              <View style={styles.statusButtons}>
                {["Ongoing", "Completed"].map((s) => (
                  <Pressable
                    key={s}
                    style={[
                      styles.statusButton,
                      { borderColor: theme.tint },
                      formData.status?.toLowerCase() === s.toLowerCase() && {
                        backgroundColor: theme.tint,
                      },
                    ]}
                    onPress={() => setFormData({ ...formData, status: s })}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        { color: theme.tint },
                        formData.status?.toLowerCase() === s.toLowerCase() && {
                          color: "#fff",
                        },
                      ]}
                    >
                      {s}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.label, { color: theme.text }]}>Year</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: theme.surface,
                    color: theme.text,
                    borderColor: theme.border,
                  },
                ]}
                value={formData.year?.toString()}
                onChangeText={(text) =>
                  setFormData({ ...formData, year: parseInt(text) || 0 })
                }
                keyboardType="numeric"
                placeholder="2024"
                placeholderTextColor={theme.icon}
              />
            </View>
          </View>

          <View style={styles.switchRow}>
            <Text
              style={[styles.label, { color: theme.text, marginBottom: 0 }]}
            >
              Visible to Users
            </Text>
            <Switch
              value={formData.isDisplayed}
              onValueChange={(value) =>
                setFormData({ ...formData, isDisplayed: value })
              }
              trackColor={{ false: theme.border, true: theme.tint }}
            />
          </View>

          <Pressable
            style={[styles.saveButton, { backgroundColor: theme.tint }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isNew ? "Create Manga" : "Save Changes"}
              </Text>
            )}
          </Pressable>

          {!isNew && (
            <Pressable
              style={[styles.chaptersButton, { borderColor: theme.tint }]}
              onPress={() =>
                router.push(`/(admin)/admin-manga/${id}/chapters` as any)
              }
            >
              <Ionicons
                name="documents-outline"
                size={20}
                color={theme.tint}
                style={{ marginRight: 8 }}
              />
              <Text style={[styles.chaptersButtonText, { color: theme.tint }]}>
                Manage Chapters
              </Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backButton: { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  scrollContent: { flex: 1 },
  form: { padding: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 8 },
  input: {
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 20,
    fontSize: 15,
  },
  textArea: { height: 100, textAlignVertical: "top" },
  imagePicker: {
    height: 250,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    marginBottom: 20,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  previewContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  coverPreview: {
    width: "100%",
    height: "100%",
  },
  changeImageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  changeImageText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  imagePlaceholder: {
    alignItems: "center",
    gap: 8,
  },
  placeholderText: {
    fontSize: 14,
  },
  row: { flexDirection: "row", marginBottom: 20 },
  statusButtons: { flexDirection: "row", gap: 8 },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    alignItems: "center",
  },
  statusButtonText: { fontSize: 12, fontWeight: "600" },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  chaptersButton: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    marginTop: 10,
    marginBottom: 40,
  },
  chaptersButtonText: { fontSize: 16, fontWeight: "600" },
});
