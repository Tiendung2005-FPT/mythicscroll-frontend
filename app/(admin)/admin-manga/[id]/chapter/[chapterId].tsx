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
  getChapterByIdAdmin,
  createChapter,
  updateChapter,
  Chapter,
  uploadMultipleImages,
} from "../../../../../services/api";
import { Colors } from "../../../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

export default function ChapterFormScreen() {
  const { id, chapterId } = useLocalSearchParams<{
    id: string;
    chapterId: string;
  }>();
  const isNew = chapterId === "new";
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState<Partial<Chapter>>({
    mangaId: id,
    title: "",
    chapterNumber: 1,
    pages: [],
    isDisplayed: true,
  });

  const [pagesText, setPagesText] = useState("");
  const [localPageUris, setLocalPageUris] = useState<string[]>([]);

  useEffect(() => {
    if (!isNew) {
      const fetchChapter = async () => {
        try {
          const data = await getChapterByIdAdmin(chapterId);
          setFormData(data);
          setPagesText(data.pages.join("\n"));
        } catch (error) {
          console.error(error);
          Alert.alert("Error", "Failed to fetch chapter details");
        } finally {
          setLoading(false);
        }
      };
      fetchChapter();
    }
  }, [chapterId]);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      const uris = result.assets.map((a) => a.uri);
      setLocalPageUris([...localPageUris, ...uris]);
    }
  };

  const removeLocalPage = (index: number) => {
    setLocalPageUris(localPageUris.filter((_, i: number) => i !== index));
  };

  const removeExistingPage = (index: number) => {
    if (formData.pages) {
      setFormData({
        ...formData,
        pages: formData.pages.filter((_, i: number) => i !== index),
      });
    }
  };

  const handleSave = async () => {
    const manualPages = pagesText
      .split("\n")
      .map((p: string) => p.trim())
      .filter((p: string) => p.length > 0);

    setSaving(true);
    try {
      let uploadedUrls: string[] = [];
      if (localPageUris.length > 0) {
        uploadedUrls = await uploadMultipleImages(localPageUris);
      }

      const finalPages = [
        ...(formData.pages || []),
        ...uploadedUrls,
        ...manualPages,
      ];

      if (!formData.title || finalPages.length === 0) {
        Alert.alert("Error", "Title and at least one page URL are required");
        setSaving(false);
        return;
      }

      const payload = { ...formData, pages: finalPages };
      if (isNew) {
        await createChapter(payload);
        Alert.alert("Success", "Chapter created successfully");
      } else {
        await updateChapter(chapterId, payload);
        Alert.alert("Success", "Chapter updated successfully");
      }
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to save chapter");
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
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {isNew ? "New Chapter" : "Edit Chapter"}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scrollContent}>
        <View style={styles.form}>
          <Text style={[styles.label, { color: theme.text }]}>
            Chapter Title
          </Text>
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
            placeholder="e.g., The Beginning"
            placeholderTextColor={theme.icon}
          />

          <Text style={[styles.label, { color: theme.text }]}>
            Chapter Number
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                color: theme.text,
                borderColor: theme.border,
              },
            ]}
            value={formData.chapterNumber?.toString()}
            onChangeText={(text) =>
              setFormData({ ...formData, chapterNumber: parseFloat(text) || 0 })
            }
            keyboardType="numeric"
            placeholder="1"
            placeholderTextColor={theme.icon}
          />

          <Text style={[styles.label, { color: theme.text }]}>
            Chapter Pages
          </Text>

          <View style={styles.pagesList}>
            {formData.pages?.map((uri: string, idx: number) => (
              <View
                key={`existing-${idx}`}
                style={[styles.pageThumb, { borderColor: theme.border }]}
              >
                <Image source={{ uri }} style={styles.pageImage} />
                <Pressable
                  style={styles.removePageBtn}
                  onPress={() => removeExistingPage(idx)}
                >
                  <Ionicons name="close-circle" size={20} color="#E74C3C" />
                </Pressable>
                <Text style={styles.pageNumber}>{idx + 1}</Text>
              </View>
            ))}

            {localPageUris.map((uri: string, idx: number) => (
              <View
                key={`local-${idx}`}
                style={[
                  styles.pageThumb,
                  { borderColor: theme.tint, borderWidth: 2 },
                ]}
              >
                <Image source={{ uri }} style={styles.pageImage} />
                <Pressable
                  style={styles.removePageBtn}
                  onPress={() => removeLocalPage(idx)}
                >
                  <Ionicons name="close-circle" size={20} color="#E74C3C" />
                </Pressable>
                <View style={styles.newBadge}>
                  <Text style={styles.newBadgeText}>NEW</Text>
                </View>
                <Text style={styles.pageNumber}>
                  {(formData.pages?.length || 0) + idx + 1}
                </Text>
              </View>
            ))}

            <Pressable
              style={[
                styles.addPageBtn,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={pickImages}
            >
              <Ionicons name="add" size={30} color={theme.tint} />
              <Text style={[styles.addPageText, { color: theme.tint }]}>
                Add Pages
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.label, { color: theme.text, marginTop: 20 }]}>
            Manual URLs (one per line)
          </Text>
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
            value={pagesText}
            onChangeText={setPagesText}
            placeholder="https://example.com/page.jpg"
            placeholderTextColor={theme.icon}
            multiline
            numberOfLines={5}
          />

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
                {isNew ? "Create Chapter" : "Save Changes"}
              </Text>
            )}
          </Pressable>
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
  pagesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 10,
  },
  pageThumb: {
    width: 80,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative",
  },
  pageImage: {
    width: "100%",
    height: "100%",
  },
  removePageBtn: {
    position: "absolute",
    top: 2,
    right: 2,
    zIndex: 1,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderRadius: 10,
  },
  pageNumber: {
    position: "absolute",
    bottom: 2,
    left: 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    color: "#fff",
    fontSize: 10,
    paddingHorizontal: 4,
    borderRadius: 4,
    overflow: "hidden",
  },
  newBadge: {
    position: "absolute",
    top: 2,
    left: 2,
    backgroundColor: "#2ECC71",
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  newBadgeText: {
    color: "#fff",
    fontSize: 8,
    fontWeight: "bold",
  },
  addPageBtn: {
    width: 80,
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  addPageText: {
    fontSize: 10,
    fontWeight: "700",
  },
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
    marginBottom: 40,
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});
