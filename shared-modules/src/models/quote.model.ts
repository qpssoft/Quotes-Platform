/**
 * Shared location: shared-modules/models/quote.model.ts
 * Used by: quotes-platform (Angular), quotes-native (React Native)
 */

export enum QuoteType {
  BuddhistQuote = 'BuddhistQuote',
  LifeLesson = 'LifeLesson',
  Proverb = 'Proverb',
  CaDao = 'CaDao',
  WisdomSaying = 'WisdomSaying'
}

export enum Language {
  Vietnamese = 'vi',
  English = 'en',
  Bilingual = 'vi-en'
}

export interface Quote {
  /**
   * Unique identifier (UUID v4)
   * Used for: Firestore document ID, local storage key, deduplication
   */
  id: string;

  /**
   * Quote text content (UTF-8 with Vietnamese diacritics)
   * NFC normalized for consistent rendering
   * Max length: 5000 characters
   */
  content: string;

  /**
   * Author or source attribution
   * Required for BuddhistQuote and LifeLesson types
   * Optional for Proverb, CaDao, WisdomSaying (use "Unknown" or "Traditional")
   */
  author: string;

  /**
   * Content type classification
   * Used for: Filtering, UI presentation, analytics
   */
  type: QuoteType;

  /**
   * Thematic category (e.g., "Compassion", "Meditation", "Mindfulness")
   * Used for: Category filtering, browsing by theme
   */
  category: string;

  /**
   * Searchable keywords/tags
   * Used for: Tag-based search, related content discovery
   */
  tags: string[];

  /**
   * Content language
   * Used for: Language filtering, font selection, search optimization
   */
  language: Language;

  /**
   * ISO 8601 timestamp (creation date)
   * Used for: Firestore sync, sorting, analytics
   */
  createdAt: Date;

  /**
   * ISO 8601 timestamp (last modification date)
   * Used for: Firestore sync, conflict resolution
   */
  updatedAt: Date;

  /**
   * Optional metadata for future enhancements
   * Examples: sourceUrl, imageUrl, audioUrl, difficulty, popularity
   */
  metadata?: Record<string, unknown>;
}

/**
 * Type guard for runtime validation
 */
export function isQuote(obj: unknown): obj is Quote {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const q = obj as Partial<Quote>;
  return (
    typeof q.id === 'string' &&
    typeof q.content === 'string' &&
    typeof q.author === 'string' &&
    Object.values(QuoteType).includes(q.type as QuoteType) &&
    typeof q.category === 'string' &&
    Array.isArray(q.tags) &&
    q.tags.every(t => typeof t === 'string') &&
    Object.values(Language).includes(q.language as Language) &&
    q.createdAt instanceof Date &&
    q.updatedAt instanceof Date
  );
}

/**
 * Factory function for creating new quotes
 * Note: UUID generation is platform-specific, must be provided
 */
export function createQuote(
  id: string,
  content: string,
  author: string,
  type: QuoteType,
  category: string,
  tags: string[],
  language: Language,
  metadata?: Record<string, unknown>
): Quote {
  const now = new Date();
  return {
    id,
    content: content.normalize('NFC'), // Unicode NFC normalization
    author,
    type,
    category,
    tags,
    language,
    createdAt: now,
    updatedAt: now,
    metadata
  };
}
