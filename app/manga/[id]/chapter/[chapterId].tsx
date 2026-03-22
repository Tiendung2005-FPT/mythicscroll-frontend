import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  useColorScheme,
  ActivityIndicator,
  Dimensions,
  Pressable,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { getChapterById, Chapter } from "../../../../services/api";
import { Colors } from "../../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type ReadingMode = "long-strip" | "single-page";

const MangaPage = ({ uri, index }: { uri: string; index: number }) => {
  const [aspectRatio, setAspectRatio] = useState(0.7);

  useEffect(() => {
    Image.getSize(
      uri,
      (w, h) => {
        if (w > 0 && h > 0) setAspectRatio(w / h);
      },
      (err) => console.warn("Failed to get image size", err),
    );
  }, [uri]);

  return (
    <Image
      source={{ uri }}
      style={{
        width: SCREEN_WIDTH,
        aspectRatio,
        marginTop: index === 0 ? 0 : -1,
      }}
      resizeMode="stretch"
    />
  );
};

const SinglePageViewer = ({ pages }: { pages: string[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(pages.length - 1, index)));
  };

  return (
    <View style={{ flex: 1 }}>
      <Image
        source={{ uri: pages[currentIndex] }}
        style={{ width: SCREEN_WIDTH, height: SCREEN_HEIGHT }}
        resizeMode="contain"
      />

      <Pressable
        style={styles.tapZoneLeft}
        onPress={() => goTo(currentIndex - 1)}
      />

      <Pressable
        style={styles.tapZoneRight}
        onPress={() => goTo(currentIndex + 1)}
      />

      <View style={styles.pageIndicator} pointerEvents="none">
        <Text style={styles.pageIndicatorText}>
          {currentIndex + 1} / {pages.length}
        </Text>
      </View>
    </View>
  );
};

const SettingsModal = ({
  visible,
  onClose,
  mode,
  onChangeMode,
  theme,
}: {
  visible: boolean;
  onClose: () => void;
  mode: ReadingMode;
  onChangeMode: (m: ReadingMode) => void;
  theme: typeof Colors.dark;
}) => {
  const options: { label: string; value: ReadingMode; icon: string }[] = [
    { label: "Long Strip", value: "long-strip", icon: "reorder-three-outline" },
    {
      label: "Single Page",
      value: "single-page",
      icon: "tablet-landscape-outline",
    },
  ];

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                Reading Mode
              </Text>

              {options.map((opt) => {
                const selected = mode === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => {
                      onChangeMode(opt.value);
                      onClose();
                    }}
                    style={[
                      styles.modeOption,
                      {
                        backgroundColor: selected
                          ? theme.tint + "22"
                          : "transparent",
                        borderColor: selected ? theme.tint : theme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={opt.icon as any}
                      size={20}
                      color={selected ? theme.tint : theme.text}
                      style={{ marginRight: 10 }}
                    />
                    <Text
                      style={[
                        styles.modeLabel,
                        {
                          color: selected ? theme.tint : theme.text,
                          fontWeight: selected ? "700" : "400",
                        },
                      ]}
                    >
                      {opt.label}
                    </Text>
                    {selected && (
                      <Ionicons
                        name="checkmark"
                        size={18}
                        color={theme.tint}
                        style={{ marginLeft: "auto" }}
                      />
                    )}
                  </Pressable>
                );
              })}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default function ChapterReaderScreen() {
  const { chapterId } = useLocalSearchParams<{ chapterId: string }>();
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState<ReadingMode>("long-strip");
  const [settingsVisible, setSettingsVisible] = useState(false);

  useEffect(() => {
    const fetchChapter = async () => {
      try {
        const res = await getChapterById(chapterId);
        setChapter(res);
      } catch (error) {
        console.error("Failed to fetch chapter", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChapter();
  }, [chapterId]);

  if (loading) {
    return (
      <View
        style={[styles.loadingContainer, { backgroundColor: theme.background }]}
      >
        <ActivityIndicator size="large" color={theme.tint} />
      </View>
    );
  }

  if (!chapter) {
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
        <Text style={{ color: theme.text }}>Chapter not found</Text>
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
        <View style={styles.headerInfo}>
          <Text
            style={[styles.chapterInfo, { color: theme.text }]}
            numberOfLines={1}
          >
            Chapter {chapter.chapterNumber}: {chapter.title}
          </Text>
        </View>
        <Pressable
          onPress={() => setSettingsVisible(true)}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={22} color={theme.text} />
        </Pressable>
      </View>

      {readingMode === "long-strip" ? (
        <ScrollView
          style={styles.reader}
          contentContainerStyle={styles.readerContent}
          showsVerticalScrollIndicator={false}
        >
          {chapter.pages.map((page, index) => (
            <MangaPage key={`${page}-${index}`} uri={page} index={index} />
          ))}
        </ScrollView>
      ) : (
        <SinglePageViewer pages={chapter.pages} />
      )}

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        mode={readingMode}
        onChangeMode={setReadingMode}
        theme={theme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: { padding: 4 },
  headerInfo: { flex: 1, marginLeft: 12 },
  chapterInfo: { fontSize: 16, fontWeight: "600" },
  settingsButton: { padding: 4, marginLeft: 8 },
  reader: { flex: 1 },
  readerContent: { paddingBottom: 40 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 64,
    paddingRight: 16,
  },
  modalBox: {
    width: 220,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
    opacity: 0.5,
  },
  modeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  modeLabel: { fontSize: 15 },

  tapZoneLeft: {
    position: "absolute",
    left: 0,
    top: 0,
    width: "50%",
    height: "100%",
  },
  tapZoneRight: {
    position: "absolute",
    right: 0,
    top: 0,
    width: "50%",
    height: "100%",
  },

  pageIndicator: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.55)",
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
  },
  pageIndicatorText: { color: "#fff", fontSize: 13, fontWeight: "600" },
});
