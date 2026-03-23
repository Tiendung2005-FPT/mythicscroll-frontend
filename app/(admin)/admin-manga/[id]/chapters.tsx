import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  Alert,
  TextInput,
} from "react-native";
import {
  Stack,
  useLocalSearchParams,
  router,
  useFocusEffect,
} from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import {
  getAllChapters,
  getMangaByIdAdmin,
  Chapter,
  Manga,
} from "../../../../services/api";
import { Colors } from "../../../../constants/Colors";

export default function ChapterManagementScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const fetchData = useCallback(async () => {
    try {
      const [chaptersData, mangaData] = await Promise.all([
        getAllChapters(id),
        getMangaByIdAdmin(id),
      ]);
      setChapters(chaptersData);
      setManga(mangaData);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to fetch chapters");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const filteredChapters = useMemo(() => {
    let filtered = chapters;

    // Apply search filter
    if (searchQuery.trim()) {
      filtered = chapters.filter(
        (chapter) =>
          chapter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          chapter.chapterNumber.toString().includes(searchQuery.toLowerCase()),
      );
    }

    // Sort by chapterNumber descending
    return filtered.sort((a, b) => b.chapterNumber - a.chapterNumber);
  }, [chapters, searchQuery]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const renderItem = ({ item }: { item: Chapter }) => (
    <Pressable
      style={[
        styles.itemCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
      onPress={() =>
        router.push(`/(admin)/admin-manga/${id}/chapter/${item._id}` as any)
      }
    >
      <View style={styles.itemInfo}>
        <Text style={[styles.title, { color: theme.text }]}>
          Chapter {item.chapterNumber}: {item.title}
        </Text>
        <Text style={[styles.details, { color: theme.icon }]}>
          {item.pages.length} Pages
        </Text>
        <View style={styles.badgeContainer}>
          {!item.isDisplayed && (
            <View style={[styles.badge, { backgroundColor: "#E74C3C" }]}>
              <Text style={styles.badgeText}>Hidden</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="pencil" size={18} color={theme.tint} />
    </Pressable>
  );

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
          onPress={() => router.replace(`/(admin)/admin-manga/${id}` as any)}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <Text
          style={[styles.headerTitle, { color: theme.text }]}
          numberOfLines={1}
        >
          {manga ? `${manga.title} - Chapters` : "Chapters"}
        </Text>
        <Pressable
          onPress={() =>
            router.push(`/(admin)/admin-manga/${id}/chapter/new` as any)
          }
          style={styles.addButton}
        >
          <Ionicons name="add" size={28} color={theme.tint} />
        </Pressable>
      </View>

      <View
        style={[styles.searchContainer, { backgroundColor: theme.surface }]}
      >
        <Ionicons
          name="search"
          size={20}
          color={theme.icon}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search chapters..."
          placeholderTextColor={theme.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.tint}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={filteredChapters}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchData}
          refreshing={loading}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.icon }]}>
              {searchQuery.trim()
                ? "No chapters found matching your search."
                : "No chapters yet. Click + to add one."}
            </Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  backButton: { padding: 4 },
  addButton: { padding: 4 },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    flex: 1,
    textAlign: "center",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: { padding: 16 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  itemInfo: { flex: 1 },
  title: { fontSize: 16, fontWeight: "700", marginBottom: 4 },
  details: { fontSize: 13, marginBottom: 8 },
  badgeContainer: { flexDirection: "row" },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  emptyText: { textAlign: "center", marginTop: 40, fontSize: 15 },
});
