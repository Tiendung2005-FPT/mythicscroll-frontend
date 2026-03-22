import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  useColorScheme,
  Image,
} from "react-native";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { getAllMangas, Manga } from "../../../services/api";
import { Colors } from "../../../constants/Colors";

export default function MangaManagementScreen() {
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const fetchMangas = async () => {
    try {
      const data = await getAllMangas();
      setMangas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMangas();
  }, []);

  const renderItem = ({ item }: { item: Manga }) => (
    <Pressable
      style={[
        styles.itemCard,
        { backgroundColor: theme.surface, borderColor: theme.border },
      ]}
      onPress={() => router.push(`/(admin)/admin-manga/${item._id}` as any)}
    >
      <Image source={{ uri: item.coverUrl }} style={styles.cover} />
      <View style={styles.itemInfo}>
        <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={[styles.details, { color: theme.icon }]}>
          {item.status} • {item.year}
        </Text>
        <View style={styles.badgeContainer}>
          {!item.isDisplayed && (
            <View style={[styles.badge, { backgroundColor: "#E74C3C" }]}>
              <Text style={styles.badgeText}>Hidden</Text>
            </View>
          )}
          {item.isDisplayed && (
            <View style={[styles.badge, { backgroundColor: "#2ECC71" }]}>
              <Text style={styles.badgeText}>Visible</Text>
            </View>
          )}
        </View>
      </View>
      <Ionicons name="chevron-forward" size={20} color={theme.icon} />
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
          onPress={() => router.replace("/profile")}
          style={styles.backButton}
        >
          <Ionicons name="close" size={24} color={theme.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Manga Management
        </Text>
        <Pressable
          onPress={() => router.push("/(admin)/admin-manga/new" as any)}
          style={styles.addButton}
        >
          <Ionicons name="add" size={28} color={theme.tint} />
        </Pressable>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color={theme.tint}
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={mangas}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchMangas}
          refreshing={loading}
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
  headerTitle: { fontSize: 18, fontWeight: "700" },
  listContent: { padding: 16 },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  cover: { width: 50, height: 70, borderRadius: 6, marginRight: 12 },
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
});
