/**
 * SearchScreen
 * Search input with Vietnamese diacritic-insensitive filtering
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import { QuoteGrid } from '../components/QuoteGrid';
import { useQuotes } from '../hooks/useQuotes';
import { Colors, Spacing } from '../constants/Colors';
import { SearchService, QuoteType } from '@quotes/shared-modules';

const searchService = new SearchService();

const QUOTE_TYPES: QuoteType[] = [
  QuoteType.BuddhistQuote,
  QuoteType.LifeLesson,
  QuoteType.Proverb,
  QuoteType.CaDao,
  QuoteType.WisdomSaying,
];

export function SearchScreen() {
  const { quotes, refreshQuotes } = useQuotes();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<QuoteType[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Search quotes using SearchService with Vietnamese diacritic support
  const searchedQuotes = useMemo(() => {
    if (!searchQuery.trim()) {
      return quotes;
    }

    const results = searchService.search(quotes, { 
      query: searchQuery,
      withDiacritics: false // Vietnamese diacritic-insensitive
    });
    return results.map(result => result.quote);
  }, [quotes, searchQuery]);

  // Filter by quote types
  const filteredQuotes = useMemo(() => {
    if (selectedTypes.length === 0) {
      return searchedQuotes;
    }

    return searchedQuotes.filter((quote) =>
      selectedTypes.includes(quote.type)
    );
  }, [searchedQuotes, selectedTypes]);

  const toggleType = (type: QuoteType) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedTypes([]);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshQuotes();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search quotes, authors..."
          placeholderTextColor={Colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
            activeOpacity={0.7}
          >
            <Text style={styles.clearButtonText}>×</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Quote Type Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.categoriesContainer}
      >
        {QUOTE_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.categoryChip,
              selectedTypes.includes(type) && styles.categoryChipActive,
            ]}
            onPress={() => toggleType(type)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.categoryChipText,
                selectedTypes.includes(type) && styles.categoryChipTextActive,
              ]}
            >
              {type.replace('BuddhistQuote', 'Buddhist').replace('LifeLesson', 'Life Lesson').replace('WisdomSaying', 'Wisdom')}
            </Text>
          </TouchableOpacity>
        ))}
        
        {(searchQuery || selectedTypes.length > 0) && (
          <TouchableOpacity
            style={styles.clearFiltersButton}
            onPress={clearFilters}
            activeOpacity={0.7}
          >
            <Text style={styles.clearFiltersText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Results */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsCount}>
          {filteredQuotes.length} {filteredQuotes.length === 1 ? 'quote' : 'quotes'} found
        </Text>
      </View>

      {/* Quote Grid */}
      <QuoteGrid
        quotes={filteredQuotes}
        refreshing={refreshing}
        onRefresh={handleRefresh}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.backgroundDark,
    borderRadius: 24,
    paddingHorizontal: 20,
    fontSize: 16,
    color: Colors.text,
  },
  clearButton: {
    position: 'absolute',
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.textLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 24,
    color: Colors.surface,
    fontWeight: '300',
  },
  categoriesContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.backgroundDark,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  categoryChipTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  clearFiltersButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: Colors.error,
  },
  clearFiltersText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textInverse,
  },
  resultsContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
  },
  resultsCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
