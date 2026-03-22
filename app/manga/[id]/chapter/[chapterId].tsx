import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, useColorScheme, ActivityIndicator, Dimensions, Pressable } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { getChapterById, Chapter } from '../../../../services/api';
import { Colors } from '../../../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const MangaPage = ({ uri, index }: { uri: string; index: number }) => {
  const [aspectRatio, setAspectRatio] = useState(0.7); 

  useEffect(() => {
    Image.getSize(uri, (w, h) => {
      if (w > 0 && h > 0) {
        setAspectRatio(w / h);
      }
    }, (err) => {
      console.warn('Failed to get image size', err);
    });
  }, [uri]);

  return (
    <Image
      source={{ uri }}
      style={{ 
        width: SCREEN_WIDTH, 
        aspectRatio, 
        marginTop: index === 0 ? 0 : -1 // Fix sub-pixel gaps
      }}
      resizeMode="stretch" // Ensure it fills the exact calculated width/height
    />
  );
};

export default function ChapterReaderScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await getChapterById(chapterId);
        setChapter(res);
      } catch (error) {
        console.error('Failed to fetch chapter', error);
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [chapterId]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!chapter) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: theme.text }}>Chapter not found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </Pressable>
        <View style={styles.headerInfo}>
          <Text style={[styles.chapterInfo, { color: theme.text }]} numberOfLines={1}>
            Chapter {chapter.chapterNumber}: {chapter.title}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.reader} 
        contentContainerStyle={styles.readerContent}
        showsVerticalScrollIndicator={false}
      >
        {chapter.pages.map((page, index) => (
          <MangaPage key={`${page}-${index}`} uri={page} index={index} />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    paddingTop: 0, 
    marginTop: 40, // Added back for safe area offset if header is hidden
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chapterInfo: {
    fontSize: 16,
    fontWeight: '600',
  },
  reader: {
    flex: 1,
  },
  readerContent: {
    paddingBottom: 40,
  },
});
