/**
 * QuoteCard Component
 * Displays a single quote with Buddhist-inspired styling
 */

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Quote } from '@quotes/shared-modules';
import { Colors } from '../constants/Colors';

export interface QuoteCardProps {
  quote: Quote;
  animate?: boolean;
}

export function QuoteCard({ quote, animate = false }: QuoteCardProps) {
  const fadeAnim = useRef(new Animated.Value(animate ? 0 : 1)).current;

  useEffect(() => {
    if (animate) {
      // Fade in animation
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [quote.id, animate]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.card}>
        <Text style={styles.content}>{quote.content}</Text>
        
        {quote.author && (
          <Text style={styles.author}>— {quote.author}</Text>
        )}
        
        {quote.category && (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{quote.category}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 12,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: Colors.accent,
  },
  content: {
    fontSize: 18,
    lineHeight: 28,
    color: Colors.text,
    fontWeight: '400',
    marginBottom: 16,
  },
  author: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 12,
  },
  categoryText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
});
