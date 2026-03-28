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
import {
  getChapterById,
  Chapter,
  getChaptersByMangaId,
} from "../../../../services/api";
import { Colors } from "../../../../constants/Colors";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../../context/AuthContext";

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

const SinglePageViewer = ({
  pages,
  theme,
}: {
  pages: string[];
  theme: any;
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(0.7);

  const goTo = (index: number) => {
    setCurrentIndex(Math.max(0, Math.min(pages.length - 1, index)));
  };

  useEffect(() => {
    Image.getSize(
      pages[currentIndex],
      (w, h) => {
        if (w > 0 && h > 0) setAspectRatio(w / h);
      },
      (err) => console.warn("Failed to get image size", err),
    );
  }, [currentIndex, pages]);

  return (
    <View style={styles.singlePageContainer}>
      <Image
        key={pages[currentIndex]}
        source={{ uri: pages[currentIndex] }}
        style={{
          width: SCREEN_WIDTH,
          aspectRatio,
          maxHeight: "100%",
        }}
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

const ChapterNavigatorModal = ({
  visible,
  onClose,
  chapters,
  currentId,
  theme,
  mangaId,
}: {
  visible: boolean;
  onClose: () => void;
  chapters: Chapter[];
  currentId: string;
  theme: typeof Colors.dark;
  mangaId: string;
}) => {
  const currentIndex = chapters.findIndex((c) => c._id === currentId);
  // Chapters sorted descending (-1) so lower index = higher chapter number
  const nextChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const prevChapter =
    currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  const navigateTo = (id: string) => {
    onClose();
    router.replace(`/manga/${mangaId}/chapter/${id}`);
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.modalOverlayCenter}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.navModalBox,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <View style={styles.navHeader}>
                <Text style={[styles.modalTitle, { color: theme.text }]}>
                  Navigation
                </Text>
                <Ionicons
                  name="close"
                  size={24}
                  color={theme.text}
                  onPress={onClose}
                />
              </View>

              <View style={styles.navControls}>
                <Pressable
                  disabled={!prevChapter}
                  onPress={() => prevChapter && navigateTo(prevChapter._id)}
                  style={[
                    styles.navBtn,
                    { backgroundColor: theme.background },
                    !prevChapter && { opacity: 0.3 },
                  ]}
                >
                  <Ionicons name="chevron-back" size={20} color={theme.text} />
                  <Text style={[styles.navBtnText, { color: theme.text }]}>
                    Prev
                  </Text>
                </Pressable>

                <Pressable
                  disabled={!nextChapter}
                  onPress={() => nextChapter && navigateTo(nextChapter._id)}
                  style={[
                    styles.navBtn,
                    { backgroundColor: theme.background },
                    !nextChapter && { opacity: 0.3 },
                  ]}
                >
                  <Text style={[styles.navBtnText, { color: theme.text }]}>
                    Next
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={20}
                    color={theme.text}
                  />
                </Pressable>
              </View>

              <Text style={[styles.listLabel, { color: theme.icon }]}>
                Jump to Chapter
              </Text>
              <ScrollView style={styles.chapterList}>
                {chapters.map((c) => {
                  const isCurrent = c._id === currentId;
                  return (
                    <Pressable
                      key={c._id}
                      onPress={() => navigateTo(c._id)}
                      style={[
                        styles.chapterItem,
                        isCurrent && {
                          backgroundColor: theme.tint + "22",
                          borderColor: theme.tint,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.chapterItemText,
                          { color: isCurrent ? theme.tint : theme.text },
                          isCurrent && { fontWeight: "700" },
                        ]}
                      >
                        Chapter {c.chapterNumber}: {c.title}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
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
  const { user } = useAuth();

  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [allChapters, setAllChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [readingMode, setReadingMode] = useState<ReadingMode>("long-strip");
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [navVisible, setNavVisible] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getChapterById(chapterId);
        setChapter(res);
        if (res.mangaId) {
          const chaptersRes = await getChaptersByMangaId(res.mangaId);
          setAllChapters(chaptersRes);
        }
      } catch (error) {
        console.error("Failed to fetch chapter", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
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
          onPress={() => setNavVisible(true)}
          style={styles.settingsButton}
        >
          <Ionicons name="list" size={22} color={theme.text} />
        </Pressable>
        <Pressable
          onPress={() => setSettingsVisible(true)}
          style={styles.settingsButton}
        >
          <Ionicons name="settings-outline" size={22} color={theme.text} />
        </Pressable>
      </View>

      {chapter.isLimitReached ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: theme.background }}>
          <Ionicons name={user ? "lock-closed" : "person-circle-outline"} size={80} color={theme.tint} style={{ marginBottom: 20 }} />
          <Text style={{ color: theme.text, fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 12 }}>
            {user ? "Daily Limit Reached" : "Login Required"}
          </Text>
          <Text style={{ color: theme.text, opacity: 0.7, fontSize: 16, textAlign: "center", marginBottom: 30, lineHeight: 24 }}>
            {user 
              ? "You've hit your free limit of 5 chapters for today. Subscribe to Premium for unlimited access!"
              : "Please sign in or create an account to start reading your 5 free chapters per day."}
          </Text>
          <Pressable
            style={{ backgroundColor: theme.tint, paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30, shadowColor: theme.tint, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 5 }}
            onPress={() => router.push(user ? "/checkout" : "/auth")}
          >
            <Text style={{ color: "#000", fontWeight: "bold", fontSize: 16 }}>
              {user ? "Unlock Unlimited Reading" : "Sign In / Register"}
            </Text>
          </Pressable>
        </View>
      ) : readingMode === "long-strip" ? (
        <ScrollView
          style={[styles.reader, { backgroundColor: "#000" }]}
          contentContainerStyle={[
            styles.readerContent,
            { backgroundColor: "#000" },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {chapter.pages && chapter.pages.map((page, index) => (
            <MangaPage key={`${page}-${index}`} uri={page} index={index} />
          ))}
        </ScrollView>
      ) : (
        <SinglePageViewer pages={chapter.pages || []} theme={theme} />
      )}

      <SettingsModal
        visible={settingsVisible}
        onClose={() => setSettingsVisible(false)}
        mode={readingMode}
        onChangeMode={setReadingMode}
        theme={theme}
      />

      <ChapterNavigatorModal
        visible={navVisible}
        onClose={() => setNavVisible(false)}
        chapters={allChapters}
        currentId={chapterId}
        theme={theme}
        mangaId={chapter.mangaId}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    paddingTop: 60,
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
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
  },
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

  navModalBox: {
    width: "90%",
    maxHeight: "80%",
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  navHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  navControls: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  navBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: "600",
  },
  listLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    opacity: 0.6,
  },
  chapterList: {
    maxHeight: 300,
  },
  chapterItem: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  chapterItemText: {
    fontSize: 15,
  },
  singlePageContainer: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  singlePageImage: {
    width: "100%",
  },
});
