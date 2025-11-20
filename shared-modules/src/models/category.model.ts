/**
 * Shared location: shared-modules/models/category.model.ts
 * Used by: quotes-platform (Angular), quotes-native (React Native)
 */

export interface Category {
  /**
   * Unique identifier (UUID v4)
   * Used for: Firestore document ID, category filtering
   */
  id: string;

  /**
   * Display name (localized)
   * Examples: "Compassion", "Meditation", "Mindfulness"
   */
  name: string;

  /**
   * URL-safe slug (kebab-case)
   * Examples: "compassion", "meditation", "mindfulness"
   * Used for: URLs, routing, search keys
   */
  slug: string;

  /**
   * Category description (optional)
   * Used for: Category browsing UI, tooltips
   */
  description?: string;

  /**
   * Number of quotes in this category
   * Used for: Category list sorting, UI display
   * Updated by: Aggregate query or manual count
   */
  quoteCount: number;

  /**
   * ISO 8601 timestamp (creation date)
   */
  createdAt: Date;

  /**
   * ISO 8601 timestamp (last modification date)
   */
  updatedAt: Date;
}

/**
 * Type guard for runtime validation
 */
export function isCategory(obj: unknown): obj is Category {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const c = obj as Partial<Category>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.slug === 'string' &&
    typeof c.quoteCount === 'number' &&
    c.createdAt instanceof Date &&
    c.updatedAt instanceof Date
  );
}

/**
 * Predefined categories (Buddhist themes)
 */
export const CATEGORIES: Readonly<Category[]> = [
  {
    id: 'cat-compassion',
    name: 'Compassion',
    slug: 'compassion',
    description: 'Quotes about loving-kindness and compassion',
    quoteCount: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'cat-meditation',
    name: 'Meditation',
    slug: 'meditation',
    description: 'Quotes about meditation practice and mindfulness',
    quoteCount: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'cat-wisdom',
    name: 'Wisdom',
    slug: 'wisdom',
    description: 'Quotes about Buddhist wisdom and understanding',
    quoteCount: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'cat-mindfulness',
    name: 'Mindfulness',
    slug: 'mindfulness',
    description: 'Quotes about present-moment awareness',
    quoteCount: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'cat-suffering',
    name: 'Suffering',
    slug: 'suffering',
    description: 'Quotes about understanding and overcoming suffering',
    quoteCount: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
];
