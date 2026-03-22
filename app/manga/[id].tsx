import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import {
  getMangaById,
  getChaptersByMangaId,
  Manga,
  Chapter,
  getGenres,
  Genre,
  rateManga,
} from "../../services/api";
import { Colors } from "../../constants/Colors";
import { TagCard } from "../../components/TagCard";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";

export default function MangaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const { user } = useAuth();

  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState(0);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const handleRate = async (rating: number) => {
    if (!manga) return;
    try {
      await rateManga(manga._id, rating);
      setUserRating(rating);
      const updatedManga = await getMangaById(id);
      setManga(updatedManga);
    } catch (error) {
      console.error("Failed to rate manga", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mangaRes, chaptersRes, genresRes] = await Promise.all([
          getMangaById(id),
          getChaptersByMangaId(id),
          getGenres(),
        ]);
        setManga(mangaRes);
        setChapters(chaptersRes);
        setGenres(genresRes);
        if (mangaRes.userRating) {
          setUserRating(mangaRes.userRating);
        }
      } catch (error) {
        console.error("Failed to fetch manga detail", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!manga) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={{ color: theme.text }}>Manga not found</Text>
      </View>
    );
  }

  const genreNames = manga.genres.map(
    (gid) => genres.find((g) => g._id === gid)?.name || "Unknown",
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Image
          source={{ uri: manga.coverUrl }}
          style={styles.coverImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay} />

        <Pressable
          style={[styles.backButton, { backgroundColor: "rgba(0,0,0,0.5)" }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>

        <View style={styles.infoContainer}>
          <Image
            source={{ uri: manga.coverUrl }}
            style={styles.thumbnailImage}
          />
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {manga.title}
            </Text>
            <View style={styles.statsContainer}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={14} color="#F1C40F" />
                <Text style={styles.ratingValueHeader}>
                  {manga.averageRating?.toFixed(1) || "0.0"}
                </Text>
              </View>
              <Text style={styles.subtitle}>
                ({manga.ratingCount || 0}) • {manga.status} • {manga.year}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.tagsContainer}>
          {genreNames.map((genre, idx) => (
            <TagCard key={`${genre}-${idx}`} name={genre} />
          ))}
        </View>

        <View style={styles.ratingSection}>
          <Text
            style={[
              styles.rateTagline,
              { color: theme.text, marginBottom: 12 },
            ]}
          >
            {userRating > 0 ? "Your rating" : "Rate this manga"}
          </Text>
          <View style={styles.starContainer}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable key={star} onPress={() => handleRate(star)}>
                <Ionicons
                  name={star <= (userRating || 0) ? "star" : "star-outline"}
                  size={36}
                  color="#F1C40F"
                  style={styles.starIcon}
                />
              </Pressable>
            ))}
          </View>
        </View>

        {user?.role?.title === "Admin" && (
          <Pressable
            style={[styles.editButton, { backgroundColor: theme.tint }]}
            onPress={() =>
              router.push(`/(admin)/admin-manga/${manga._id}` as any)
            }
          >
            <Ionicons
              name="create-outline"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.editButtonText}>Edit Manga</Text>
          </Pressable>
        )}

        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Description
        </Text>
        <Text style={[styles.description, { color: theme.icon }]}>
          {manga.description}
        </Text>

        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Chapters ({chapters.length})
          </Text>
          <Pressable
            onPress={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            style={styles.sortButton}
          >
            <Ionicons
              name={sortOrder === "asc" ? "trending-up" : "trending-down"}
              size={20}
              color={theme.tint}
            />
            <Text style={[styles.sortText, { color: theme.tint }]}>
              {sortOrder === "asc" ? "Oldest" : "Newest"}
            </Text>
          </Pressable>
        </View>

        {[...chapters]
          .sort((a, b) => {
            const numA = parseFloat(a.chapterNumber.toString());
            const numB = parseFloat(b.chapterNumber.toString());
            return sortOrder === "asc" ? numA - numB : numB - numA;
          })
          .map((chapter) => (
            <Pressable
              key={chapter._id}
              style={({ pressed }) => [
                styles.chapterRow,
                { borderBottomColor: theme.border },
                pressed && { backgroundColor: theme.surface },
              ]}
              onPress={() =>
                router.push(`/manga/${manga._id}/chapter/${chapter._id}` as any)
              }
            >
              <Text style={[styles.chapterTitle, { color: theme.text }]}>
                Chapter {chapter.chapterNumber}: {chapter.title}
              </Text>
            </Pressable>
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    height: 250,
    width: "100%",
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 44,
    left: 16,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  coverImage: {
    width: "100%",
    height: "100%",
    opacity: 0.5,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  infoContainer: {
    position: "absolute",
    bottom: -30,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  thumbnailImage: {
    width: 100,
    height: 150,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#fff",
  },
  titleContainer: {
    flex: 1,
    marginLeft: 16,
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#ccc",
  },
  content: {
    padding: 16,
    paddingTop: 46,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
  },
  ratingSection: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 4,
  },
  ratingValueHeader: {
    color: "#F1C40F",
    fontWeight: "bold",
    fontSize: 14,
  },
  ratingInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  ratingValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  ratingCount: {
    fontSize: 14,
  },
  starContainer: {
    flexDirection: "row",
  },
  starIcon: {
    marginHorizontal: 4,
  },
  rateTagline: {
    fontSize: 14,
    fontWeight: "bold",
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
  },
  chapterRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  chapterTitle: {
    fontSize: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 8,
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sortText: {
    fontSize: 12,
    fontWeight: "600",
  },
  editButton: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  editButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
