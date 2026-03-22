import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, TextInput, StyleSheet, FlatList, useColorScheme, ActivityIndicator, Text, Pressable, ScrollView, Modal, TouchableWithoutFeedback } from 'react-native';
import { Colors } from '../../constants/Colors';
import { getMangas, getGenres, Manga, Genre } from '../../services/api';
import { MangaCard } from '../../components/MangaCard';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

type FilterState = 'included' | 'excluded' | 'none';

export default function BrowseScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;
  
  const [searchQuery, setSearchQuery] = useState('');
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [genreFilters, setGenreFilters] = useState<Record<string, FilterState>>({});
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | 'none'>('none');
  const [loading, setLoading] = useState(true);

  const [isGenreOpen, setIsGenreOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await getGenres();
        setGenres(res);
      } catch (err) {
        console.error('Failed to fetch genres', err);
      }
    };
    fetchGenres();
  }, []);

  const fetchMangas = useCallback(async () => {
    setLoading(true);
    try {
      const selectedGenres: string[] = [];
      Object.entries(genreFilters).forEach(([id, state]) => {
        if (state === 'included') selectedGenres.push(id);
        if (state === 'excluded') selectedGenres.push(`-${id}`);
      });

      let sortQuery = '';
      if (sortField && sortDirection !== 'none') {
        sortQuery = sortDirection === 'desc' ? `-${sortField}` : sortField;
      }

      const res = await getMangas({
        keyword: searchQuery,
        genre: selectedGenres,
        sort: sortQuery
      });
      setMangas(res);
    } catch (err) {
      console.error('Failed to fetch mangas', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, genreFilters, sortField, sortDirection]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchMangas();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [fetchMangas]);

  const toggleGenre = (id: string) => {
    setGenreFilters(prev => {
      const current = prev[id] || 'none';
      const next: FilterState = current === 'none' ? 'included' : current === 'included' ? 'excluded' : 'none';
      return { ...prev, [id]: next };
    });
  };

  const clearGenreFilters = () => {
    setGenreFilters({});
  };

  const toggleSort = (field: string) => {
    if (sortField !== field) {
      setSortField(field);
      setSortDirection(field === 'rating' ? 'desc' : 'asc');
    } else {
      let nextDir: 'asc' | 'desc' | 'none';
      if (field === 'rating') {
        nextDir = sortDirection === 'desc' ? 'asc' : sortDirection === 'asc' ? 'none' : 'desc';
      } else {
        nextDir = sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? 'none' : 'asc';
      }
      setSortDirection(nextDir);
      if (nextDir === 'none') setSortField(null);
    }
  };

  const activeGenrePreview = useMemo(() => {
    const activeEntries = Object.entries(genreFilters).filter(([_, s]) => s !== 'none');
    if (activeEntries.length === 0) return 'All Genres';
    const firstId = activeEntries[0][0];
    const firstGenre = genres.find(g => g._id === firstId);
    return `${firstGenre?.name || ''}${activeEntries.length > 1 ? ` + [${activeEntries.length - 1}]` : ''}`;
  }, [genreFilters, genres]);

  const activeSortLabel = useMemo(() => {
    if (sortDirection === 'none' || !sortField) return 'Sort By';
    const labels: Record<string, string> = { title: 'Title', uploadedAt: 'Date', rating: 'Rating' };
    return `${labels[sortField]} ${sortDirection === 'asc' ? '(Asc)' : '(Desc)'}`;
  }, [sortField, sortDirection]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
        <Ionicons name="search" size={20} color={theme.icon} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: theme.text }]}
          placeholder="Search manga..."
          placeholderTextColor={theme.icon}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.dropdownsRow}>
        <Pressable 
          style={[styles.dropdownTrigger, { backgroundColor: theme.surface }]} 
          onPress={() => setIsGenreOpen(true)}
        >
          <Text style={[styles.dropdownLabel, { color: theme.text }]} numberOfLines={1}>
            {activeGenrePreview}
          </Text>
          <Ionicons name="chevron-down" size={16} color={theme.icon} />
        </Pressable>

        <Pressable 
          style={[styles.dropdownTrigger, { backgroundColor: theme.surface }]} 
          onPress={() => setIsSortOpen(true)}
        >
          <Text style={[styles.dropdownLabel, { color: theme.text }]} numberOfLines={1}>
            {activeSortLabel}
          </Text>
          <Ionicons name="swap-vertical" size={16} color={theme.icon} />
        </Pressable>
      </View>

      <Modal visible={isGenreOpen} transparent animationType="fade" onRequestClose={() => setIsGenreOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsGenreOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: '#1A1D23' }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Genres</Text>
                  <View style={styles.modalHeaderActions}>
                    <Pressable onPress={clearGenreFilters}>
                      <Text style={styles.clearButtonText}>Clear All</Text>
                    </Pressable>
                    <Ionicons name="close" size={24} color="#fff" onPress={() => setIsGenreOpen(false)} />
                  </View>
                </View>
                <ScrollView style={styles.modalScroll}>
                  {genres.map(genre => {
                    const state = genreFilters[genre._id] || 'none';
                    return (
                      <Pressable key={genre._id} style={styles.filterRow} onPress={() => toggleGenre(genre._id)}>
                        <View style={[
                          styles.stateBox, 
                          state === 'included' && styles.stateBoxIncluded,
                          state === 'excluded' && styles.stateBoxExcluded
                        ]}>
                          {state === 'included' && <Text style={styles.stateIcon}>+</Text>}
                          {state === 'excluded' && <Text style={styles.stateIcon}>-</Text>}
                        </View>
                        <Text style={[
                          styles.genreName, 
                          state === 'included' && styles.textIncluded,
                          state === 'excluded' && styles.textExcluded
                        ]}>
                          {genre.name}
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

      <Modal visible={isSortOpen} transparent animationType="fade" onRequestClose={() => setIsSortOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setIsSortOpen(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: '#1A1D23' }]}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Sort By</Text>
                  <Ionicons name="close" size={24} color="#fff" onPress={() => setIsSortOpen(false)} />
                </View>
                <ScrollView style={styles.modalScroll}>
                  {[
                    { label: 'Title', field: 'title' },
                    { label: 'Upload Date', field: 'uploadedAt' },
                    { label: 'Rating', field: 'rating' },
                  ].map(option => {
                    const isCurrent = sortField === option.field;
                    const dir = isCurrent ? sortDirection : 'none';
                    return (
                      <Pressable key={option.field} style={styles.filterRow} onPress={() => toggleSort(option.field)}>
                        <View style={[
                          styles.stateBox, 
                          dir !== 'none' && styles.stateBoxIncluded,
                        ]}>
                          {(option.field === 'rating' ? dir === 'desc' : dir === 'asc') && <Text style={styles.stateIcon}>+</Text>}
                          {(option.field === 'rating' ? dir === 'asc' : dir === 'desc') && <Text style={styles.stateIcon}>-</Text>}
                        </View>
                        <Text style={[
                          styles.genreName, 
                          dir !== 'none' && styles.textIncluded,
                        ]}>
                          {option.label}
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

      {loading && mangas.length === 0 ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.tint} />
        </View>
      ) : (
        <FlatList
          data={mangas}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={({ item }) => (
            <MangaCard manga={item} onPress={(id) => router.push(`/manga/${id}` as any)} numColumns={2} />
          )}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: theme.icon }]}>No manga found matching your criteria.</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  dropdownsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  dropdownTrigger: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
  },
  dropdownLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginRight: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 12,
    padding: 16,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clearButtonText: {
    color: '#2ECC71',
    fontSize: 14,
    fontWeight: '600',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  modalScroll: {
    flexGrow: 0,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  stateBox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stateBoxIncluded: {
    backgroundColor: '#2ECC71',
    borderColor: '#2ECC71',
  },
  stateBoxExcluded: {
    backgroundColor: '#34495E',
    borderColor: '#34495E',
  },
  stateIcon: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    lineHeight: 20,
  },
  genreName: {
    fontSize: 16,
    color: '#BDC3C7',
  },
  textIncluded: {
    color: '#2ECC71',
    fontWeight: '600',
  },
  textExcluded: {
    color: '#BDC3C7',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
  },
});
