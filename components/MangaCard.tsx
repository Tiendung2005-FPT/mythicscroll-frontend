import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  useColorScheme,
  Dimensions,
} from "react-native";
import { Manga } from "../services/api";
import { Colors } from "../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface MangaCardProps {
  manga: Manga;
  onPress: (id: string) => void;
  isLarge?: boolean;
  numColumns?: number;
}

export const MangaCard = ({
  manga,
  onPress,
  isLarge = false,
  numColumns = 2,
}: MangaCardProps) => {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const cardWidth = isLarge
    ? 200
    : (width - 32 - (numColumns - 1) * 12) / numColumns;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          width: cardWidth,
        },
        pressed && { opacity: 0.8 },
      ]}
      onPress={() => onPress(manga._id)}
    >
      <Image
        source={{ uri: manga.coverUrl }}
        style={[styles.image, { height: isLarge ? 280 : 200 }]}
        resizeMode="cover"
      />
      <View style={styles.info}>
        <Text
          style={[
            styles.title,
            { color: theme.text, fontSize: isLarge ? 14 : 12 },
          ]}
          numberOfLines={1}
        >
          {manga.title}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={isLarge ? 14 : 12} color="#F1C40F" />
          <Text
            style={[
              styles.ratingText,
              { color: theme.text, fontSize: isLarge ? 12 : 10 },
            ]}
          >
            {manga.averageRating?.toFixed(1) || "0.0"}
          </Text>
          <Text
            style={[
              styles.ratingCount,
              { color: theme.icon, fontSize: isLarge ? 11 : 9 },
            ]}
          >
            ({manga.ratingCount || 0})
          </Text>
        </View>
        <Text
          style={[
            styles.subtitle,
            { color: theme.icon, fontSize: isLarge ? 12 : 10 },
          ]}
        >
          {manga.year} | {manga.status}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
  },
  image: {
    width: "100%",
  },
  info: {
    padding: 8,
  },
  title: {
    fontWeight: "bold",
    marginBottom: 2,
    height: 20,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 4,
  },
  ratingText: {
    fontWeight: "bold",
  },
  ratingCount: {},
  subtitle: {},
});
