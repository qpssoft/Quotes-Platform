/**
 * QuoteGrid Component
 * FlatList rendering quotes with search filtering, 1-column mobile layout
 */

import React from 'react';
import { FlatList, StyleSheet, View, Text, RefreshControl } from 'react-native';
import { Quote } from '@quotes/shared-modules';
import { QuoteCard } from './QuoteCard';
import { Colors } from '../constants/Colors';

export interface QuoteGridProps {
  quotes: Quote[];
  refreshing?: boolean;
  onRefresh?: () => void;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
}

export function QuoteGrid({
  quotes,
  refreshing = false,
  onRefresh,
  ListHeaderComponent,
  ListEmptyComponent,
}: QuoteGridProps) {
  const renderQuote = ({ item }: { item: Quote }) => (
    <QuoteCard quote={item} animate={false} />
  );

  const keyExtractor = (item: Quote) => item.id;

  const getItemLayout = (_data: any, index: number) => ({
    length: 160, // Approximate height of QuoteCard
    offset: 160 * index,
    index,
  });

  const renderEmpty = () => {
    if (ListEmptyComponent) {
      return <>{ListEmptyComponent}</>;
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No quotes found</Text>
        <Text style={styles.emptyHint}>Try different keywords or filters</Text>
      </View>
    );
  };

  return (
    <FlatList
      data={quotes}
      renderItem={renderQuote}
      keyExtractor={keyExtractor}
      getItemLayout={getItemLayout}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        ) : undefined
      }
      ListHeaderComponent={ListHeaderComponent}
      ListEmptyComponent={renderEmpty}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      updateCellsBatchingPeriod={50}
      initialNumToRender={10}
      windowSize={21}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginBottom: 8,
  },
  emptyHint: {
    fontSize: 14,
    color: Colors.textLight,
    textAlign: 'center',
  },
});
