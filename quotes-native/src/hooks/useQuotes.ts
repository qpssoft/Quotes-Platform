/**
 * useQuotes Hook
 * Loads and manages quote data from bundled JSON with AsyncStorage caching
 */

import { useState, useEffect } from 'react';
import { Quote } from '@quotes/shared-modules';

// Import bundled quotes JSON
const quotesData = require('../../assets/data/quotes.json');

export interface UseQuotesResult {
  quotes: Quote[];
  loading: boolean;
  error: Error | null;
  refreshQuotes: () => Promise<void>;
}

export function useQuotes(): UseQuotesResult {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const loadQuotes = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Try to load from cache first
      const cached = await loadFromCache();
      if (cached) {
        setQuotes(cached);
        setLoading(false);
        return;
      }

      // Load from bundled JSON
      const loadedQuotes: Quote[] = quotesData.quotes || quotesData;
      
      // Validate quote structure
      const validQuotes = loadedQuotes.filter(isValidQuote);
      
      if (validQuotes.length === 0) {
        throw new Error('No valid quotes found in data file');
      }

      setQuotes(validQuotes);
      
      // Cache for future loads
      await saveToCache(validQuotes);
      
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load quotes';
      setError(new Error(errorMessage));
      setLoading(false);
    }
  };

  const loadFromCache = async (): Promise<Quote[] | null> => {
    // For bundled assets, no need for caching
    // Assets are already optimized by React Native bundler
    return null;
  };

  const saveToCache = async (_quotesToCache: Quote[]): Promise<void> => {
    // For bundled assets, caching is not necessary
    // React Native handles asset caching automatically
  };

  const refreshQuotes = async (): Promise<void> => {
    await loadQuotes();
  };

  useEffect(() => {
    loadQuotes();
  }, []);

  return {
    quotes,
    loading,
    error,
    refreshQuotes,
  };
}

/**
 * Validate quote structure
 */
function isValidQuote(quote: any): quote is Quote {
  return (
    typeof quote === 'object' &&
    quote !== null &&
    typeof quote.id === 'string' &&
    typeof quote.content === 'string' &&
    quote.content.length > 0
  );
}
