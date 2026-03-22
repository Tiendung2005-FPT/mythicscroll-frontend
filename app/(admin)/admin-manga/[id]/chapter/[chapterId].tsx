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
} from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import {
  getChapterByIdAdmin,
  createChapter,
  updateChapter,
  Chapter,
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

  const handleSave = async () => {
    const pages = pagesText
      .split("\n")
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (!formData.title || pages.length === 0) {
      Alert.alert("Error", "Title and at least one page URL are required");
      return;
    }

    setSaving(true);
    try {
      const payload = { ...formData, pages };
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
            Pages (one URL per line)
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
            placeholder="https://example.com/page1.jpg"
            placeholderTextColor={theme.icon}
            multiline
            numberOfLines={10}
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
    paddingTop: 10,
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
  textArea: { height: 200, textAlignVertical: "top" },
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
