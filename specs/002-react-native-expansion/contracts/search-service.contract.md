# Search Service Contract

**Location**: `shared-modules/services/search.service.ts`  
**Purpose**: Full-text search and filtering for quotes across all platforms

## Interface Definition

```typescript
import { Quote, QuoteType, Language } from '../models';

/**
 * Search query options
 */
export interface SearchOptions {
  /**
   * Search query text
   */
  query?: string;

  /**
   * Filter by quote type(s)
   */
  types?: QuoteType[];

  /**
   * Filter by category
   */
  category?: string;

  /**
   * Filter by language
   */
  language?: Language;

  /**
   * Filter by tags (any match)
   */
  tags?: string[];

  /**
   * Case-sensitive search (default: false)
   */
  caseSensitive?: boolean;

  /**
   * Search with diacritics (default: false, removes Vietnamese diacritics)
   */
  withDiacritics?: boolean;

  /**
   * Maximum results to return (default: unlimited)
   */
  limit?: number;

  /**
   * Offset for pagination (default: 0)
   */
  offset?: number;
}

/**
 * Search result with relevance score
 */
export interface SearchResult {
  /**
   * Matched quote
   */
  quote: Quote;

  /**
   * Relevance score (0-1, higher is better)
   */
  score: number;

  /**
   * Matched fields (content, author, category, tags)
   */
  matchedFields: string[];
}

/**
 * Search service interface
 */
export interface ISearchService {
  /**
   * Search quotes with full-text query and filters
   * @param quotes - Array of quotes to search
   * @param options - Search options
   * @returns Array of search results sorted by relevance
   */
  search(quotes: Quote[], options: SearchOptions): SearchResult[];

  /**
   * Filter quotes by category
   * @param quotes - Array of quotes to filter
   * @param category - Category slug or name
   * @returns Filtered quotes
   */
  filterByCategory(quotes: Quote[], category: string): Quote[];

  /**
   * Filter quotes by type
   * @param quotes - Array of quotes to filter
   * @param type - Quote type
   * @returns Filtered quotes
   */
  filterByType(quotes: Quote[], type: QuoteType): Quote[];

  /**
   * Filter quotes by language
   * @param quotes - Array of quotes to filter
   * @param language - Language code
   * @returns Filtered quotes
   */
  filterByLanguage(quotes: Quote[], language: Language): Quote[];

  /**
   * Get all unique categories from quotes
   * @param quotes - Array of quotes
   * @returns Array of unique category names
   */
  getCategories(quotes: Quote[]): string[];

  /**
   * Get all unique tags from quotes
   * @param quotes - Array of quotes
   * @returns Array of unique tags
   */
  getTags(quotes: Quote[]): string[];
}
```

## Implementation

```typescript
// shared-modules/services/search.service.ts

export class SearchService implements ISearchService {
  /**
   * Remove Vietnamese diacritics for search matching
   */
  private removeDiacritics(text: string): string {
    return text
      .normalize('NFD') // Decompose to base + combining marks
      .replace(/[\u0300-\u036f]/g, ''); // Remove combining marks
  }

  /**
   * Normalize text for search comparison
   */
  private normalizeText(
    text: string,
    caseSensitive: boolean,
    withDiacritics: boolean
  ): string {
    let normalized = text.normalize('NFC');
    
    if (!caseSensitive) {
      normalized = normalized.toLowerCase();
    }
    
    if (!withDiacritics) {
      normalized = this.removeDiacritics(normalized);
    }
    
    return normalized;
  }

  /**
   * Get searchable text from quote
   */
  private getSearchableText(quote: Quote): string {
    return [
      quote.content,
      quote.author,
      quote.category,
      ...quote.tags
    ].join(' ');
  }

  /**
   * Calculate relevance score for a match
   */
  private calculateScore(
    quote: Quote,
    query: string,
    matchedFields: string[]
  ): number {
    let score = 0;
    
    // Base score: number of matched fields
    score += matchedFields.length * 0.2;
    
    // Bonus: exact match in content
    if (quote.content.toLowerCase().includes(query.toLowerCase())) {
      score += 0.5;
    }
    
    // Bonus: match in author
    if (matchedFields.includes('author')) {
      score += 0.2;
    }
    
    // Bonus: match in category
    if (matchedFields.includes('category')) {
      score += 0.1;
    }
    
    return Math.min(score, 1); // Cap at 1.0
  }

  search(quotes: Quote[], options: SearchOptions): SearchResult[] {
    const {
      query = '',
      types,
      category,
      language,
      tags,
      caseSensitive = false,
      withDiacritics = false,
      limit,
      offset = 0
    } = options;

    let results = quotes;

    // Filter by type
    if (types && types.length > 0) {
      results = results.filter(q => types.includes(q.type));
    }

    // Filter by category
    if (category) {
      results = results.filter(q => 
        q.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Filter by language
    if (language) {
      results = results.filter(q => q.language === language);
    }

    // Filter by tags
    if (tags && tags.length > 0) {
      results = results.filter(q => 
        q.tags.some(tag => 
          tags.some(filterTag => 
            tag.toLowerCase() === filterTag.toLowerCase()
          )
        )
      );
    }

    // Full-text search
    if (query.trim()) {
      const normalizedQuery = this.normalizeText(query, caseSensitive, withDiacritics);
      
      const searchResults: SearchResult[] = results
        .map(quote => {
          const searchableText = this.getSearchableText(quote);
          const normalizedText = this.normalizeText(searchableText, caseSensitive, withDiacritics);
          
          if (normalizedText.includes(normalizedQuery)) {
            const matchedFields: string[] = [];
            
            if (this.normalizeText(quote.content, caseSensitive, withDiacritics).includes(normalizedQuery)) {
              matchedFields.push('content');
            }
            if (this.normalizeText(quote.author, caseSensitive, withDiacritics).includes(normalizedQuery)) {
              matchedFields.push('author');
            }
            if (this.normalizeText(quote.category, caseSensitive, withDiacritics).includes(normalizedQuery)) {
              matchedFields.push('category');
            }
            if (quote.tags.some(tag => this.normalizeText(tag, caseSensitive, withDiacritics).includes(normalizedQuery))) {
              matchedFields.push('tags');
            }
            
            return {
              quote,
              score: this.calculateScore(quote, query, matchedFields),
              matchedFields
            };
          }
          
          return null;
        })
        .filter((result): result is SearchResult => result !== null)
        .sort((a, b) => b.score - a.score); // Sort by relevance (highest first)
      
      // Apply pagination
      const start = offset;
      const end = limit ? start + limit : undefined;
      return searchResults.slice(start, end);
    }

    // No query: return filtered results with default score
    const searchResults = results.map(quote => ({
      quote,
      score: 0.5,
      matchedFields: []
    }));

    // Apply pagination
    const start = offset;
    const end = limit ? start + limit : undefined;
    return searchResults.slice(start, end);
  }

  filterByCategory(quotes: Quote[], category: string): Quote[] {
    return quotes.filter(q => 
      q.category.toLowerCase() === category.toLowerCase()
    );
  }

  filterByType(quotes: Quote[], type: QuoteType): Quote[] {
    return quotes.filter(q => q.type === type);
  }

  filterByLanguage(quotes: Quote[], language: Language): Quote[] {
    return quotes.filter(q => q.language === language);
  }

  getCategories(quotes: Quote[]): string[] {
    const categories = new Set(quotes.map(q => q.category));
    return Array.from(categories).sort();
  }

  getTags(quotes: Quote[]): string[] {
    const tags = new Set(quotes.flatMap(q => q.tags));
    return Array.from(tags).sort();
  }
}
```

## Usage Example

```typescript
import { SearchService, SearchOptions } from '@quotes/shared-modules';

const searchService = new SearchService();
const quotes: Quote[] = [...]; // Load quotes

// Simple text search
const results1 = searchService.search(quotes, {
  query: 'mindfulness'
});

// Search with filters
const results2 = searchService.search(quotes, {
  query: 'Thích Nhất Hạnh',
  types: [QuoteType.BuddhistQuote],
  language: Language.Vietnamese,
  withDiacritics: false // Match "Thich Nhat Hanh" too
});

// Pagination
const results3 = searchService.search(quotes, {
  query: 'compassion',
  limit: 10,
  offset: 0 // First page
});

// Category filter
const compassionQuotes = searchService.filterByCategory(quotes, 'compassion');

// Get all categories
const categories = searchService.getCategories(quotes);
```

## Performance Optimization

```typescript
// Indexed search for large datasets (500K+ quotes)
export class IndexedSearchService extends SearchService {
  private index: Map<string, Set<string>> = new Map(); // term -> quote IDs
  
  buildIndex(quotes: Quote[]): void {
    this.index.clear();
    
    for (const quote of quotes) {
      const searchableText = this.getSearchableText(quote);
      const terms = this.normalizeText(searchableText, false, false)
        .split(/\s+/)
        .filter(term => term.length > 2); // Index terms >= 3 chars
      
      for (const term of terms) {
        if (!this.index.has(term)) {
          this.index.set(term, new Set());
        }
        this.index.get(term)!.add(quote.id);
      }
    }
  }
  
  // Override search to use index
  search(quotes: Quote[], options: SearchOptions): SearchResult[] {
    if (!options.query || options.query.trim().length < 3) {
      return super.search(quotes, options);
    }
    
    // Use index for preliminary filtering
    const queryTerms = this.normalizeText(options.query, false, false)
      .split(/\s+/)
      .filter(term => term.length > 2);
    
    const candidateIds = new Set<string>();
    for (const term of queryTerms) {
      const matchingIds = this.index.get(term);
      if (matchingIds) {
        matchingIds.forEach(id => candidateIds.add(id));
      }
    }
    
    // Filter quotes to candidates only
    const candidateQuotes = quotes.filter(q => candidateIds.has(q.id));
    
    // Run full search on candidates
    return super.search(candidateQuotes, options);
  }
}
```
