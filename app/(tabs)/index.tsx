import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  useColorScheme,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from "react-native";
import { Colors } from "../../constants/Colors";
import { getFeaturedManga, getLatestUpdates, Manga } from "../../services/api";
import { MangaCard } from "../../components/MangaCard";
import { router } from "expo-router";

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const [featuredManga, setFeaturedManga] = useState<Manga[]>([]);
  const [latestUpdates, setLatestUpdates] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [featured, latest] = await Promise.all([
        getFeaturedManga(),
        getLatestUpdates(),
      ]);
      setFeaturedManga(featured);
      setLatestUpdates(latest);
    } catch (error) {
      console.error("Failed to refresh home data", error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [featured, latest] = await Promise.all([
          getFeaturedManga(),
          getLatestUpdates(),
        ]);
        setFeaturedManga(featured);
        setLatestUpdates(latest);
      } catch (error) {
        console.error("Failed to fetch home data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handlePressManga = (id: string) => {
    router.push(`/manga/${id}` as any);
  };

  if (loading) {
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
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={theme.tint}
          colors={[theme.tint]}
        />
      }
    >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Featured
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={featuredManga}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <MangaCard manga={item} onPress={handlePressManga} isLarge={true} />
          )}
          contentContainerStyle={styles.horizontalList}
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Latest Updates
        </Text>
        <FlatList
          data={latestUpdates}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={({ item }) => (
            <MangaCard manga={item} onPress={handlePressManga} numColumns={2} />
          )}
          scrollEnabled={false}
          contentContainerStyle={styles.gridList}
          columnWrapperStyle={styles.row}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  section: {
    paddingTop: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginLeft: 16,
    marginBottom: 16,
  },
  horizontalList: {
    paddingLeft: 16,
    paddingRight: 4,
    gap: 16,
  },
  gridList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: "space-between",
  },
});
