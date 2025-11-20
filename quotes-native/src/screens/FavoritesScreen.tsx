/**
 * FavoritesScreen
 * Display saved favorite quotes with heart icon toggle
 */

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { Quote } from '@quotes/shared-modules';
import { QuoteCard } from '../components/QuoteCard';
import { useQuotes } from '../hooks/useQuotes';
import { usePreferences } from '../hooks/usePreferences';
import { Colors, Spacing } from '../constants/Colors';

export function FavoritesScreen() {
  const { quotes } = useQuotes();
  const { preferences, addFavorite, removeFavorite, isFavorite } = usePreferences();
  const [refreshing, setRefreshing] = useState(false);

  // Filter quotes to only show favorites
  const favoriteQuotes = useMemo(() => {
    return quotes.filter((quote) => isFavorite(quote.id));
  }, [quotes, preferences.favorites]);

  const handleToggleFavorite = async (quoteId: string) => {
    if (isFavorite(quoteId)) {
      await removeFavorite(quoteId);
    } else {
      await addFavorite(quoteId);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    setRefreshing(false);
  };

  const renderQuote = ({ item }: { item: Quote }) => (
    <View style={styles.quoteItem}>
      <View style={styles.quoteContent}>
        <QuoteCard quote={item} animate={false} />
      </View>
      <TouchableOpacity
        style={styles.favoriteButton}
        onPress={() => handleToggleFavorite(item.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.heartIcon}>
          {isFavorite(item.id) ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>♡</Text>
      <Text style={styles.emptyTitle}>No favorites yet</Text>
      <Text style={styles.emptyText}>
        Tap the heart icon on quotes to save them here
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Favorites</Text>
        <Text style={styles.headerCount}>
          {favoriteQuotes.length} {favoriteQuotes.length === 1 ? 'quote' : 'quotes'}
        </Text>
      </View>

      {/* Favorites List */}
      <FlatList
        data={favoriteQuotes}
        renderItem={renderQuote}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.divider,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
  },
  headerCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
  quoteItem: {
    position: 'relative',
  },
  quoteContent: {
    flex: 1,
  },
  favoriteButton: {
    position: 'absolute',
    top: 20,
    right: 24,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  heartIcon: {
    fontSize: 24,
    color: Colors.accent,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    color: Colors.textLight,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
});
