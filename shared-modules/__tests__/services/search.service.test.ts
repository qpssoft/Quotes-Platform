/**
 * Search Service Unit Tests
 * Tests full-text search, filtering, Vietnamese diacritics handling
 */

import { SearchService, SearchOptions } from '../../src/services/search.service';
import { Quote, QuoteType, Language, createQuote } from '../../src/models/quote.model';
import { generateUUID } from '../../src/utils/uuid';

describe('SearchService', () => {
  let searchService: SearchService;
  let testQuotes: Quote[];

  beforeEach(() => {
    searchService = new SearchService();

    // Create test quotes with Vietnamese content
    testQuotes = [
      createQuote(
        generateUUID(),
        'Hạnh phúc không phải là điều gì đó sẵn có. Nó đến từ chính hành động của bạn.',
        'Đức Đạt Lai Lạt Ma XIV',
        QuoteType.BuddhistQuote,
        'Hạnh phúc',
        ['hạnh phúc', 'hành động', 'mindfulness'],
        Language.Vietnamese
      ),
      createQuote(
        generateUUID(),
        'Thiền định là nghệ thuật của sự tĩnh lặng.',
        'Thích Nhất Hạnh',
        QuoteType.BuddhistQuote,
        'Thiền định',
        ['thiền', 'tĩnh lặng', 'meditation'],
        Language.Vietnamese
      ),
      createQuote(
        generateUUID(),
        'Compassion is the basis of all Buddhist practice.',
        'Unknown',
        QuoteType.WisdomSaying,
        'Compassion',
        ['compassion', 'practice'],
        Language.English
      ),
      createQuote(
        generateUUID(),
        'Có công mài sắt có ngày nên kim.',
        'Traditional',
        QuoteType.Proverb,
        'Sự kiên trì',
        ['kiên trì', 'nỗ lực'],
        Language.Vietnamese
      )
    ];
  });

  describe('search()', () => {
    it('should return all quotes when no query provided', () => {
      const results = searchService.search(testQuotes, {});
      expect(results).toHaveLength(4);
      expect(results.every(r => r.score === 0.5)).toBe(true);
    });

    it('should find quotes by Vietnamese content (diacritic-insensitive)', () => {
      const results = searchService.search(testQuotes, {
        query: 'hanh phuc', // Without diacritics
        withDiacritics: false
      });

      expect(results).toHaveLength(1);
      expect(results[0].quote.content).toContain('Hạnh phúc');
      expect(results[0].matchedFields).toContain('content');
    });

    it('should find quotes by author', () => {
      const results = searchService.search(testQuotes, {
        query: 'Thich Nhat Hanh', // Without diacritics
        withDiacritics: false
      });

      expect(results).toHaveLength(1);
      expect(results[0].quote.author).toBe('Thích Nhất Hạnh');
      expect(results[0].matchedFields).toContain('author');
    });

    it('should filter by quote type', () => {
      const results = searchService.search(testQuotes, {
        types: [QuoteType.BuddhistQuote]
      });

      expect(results).toHaveLength(2);
      expect(results.every(r => r.quote.type === QuoteType.BuddhistQuote)).toBe(true);
    });

    it('should filter by category', () => {
      const results = searchService.search(testQuotes, {
        category: 'Hạnh phúc'
      });

      expect(results).toHaveLength(1);
      expect(results[0].quote.category).toBe('Hạnh phúc');
    });

    it('should filter by language', () => {
      const results = searchService.search(testQuotes, {
        language: Language.Vietnamese
      });

      expect(results).toHaveLength(3);
      expect(results.every(r => r.quote.language === Language.Vietnamese)).toBe(true);
    });

    it('should filter by tags', () => {
      const results = searchService.search(testQuotes, {
        tags: ['meditation']
      });

      expect(results).toHaveLength(1);
      expect(results[0].quote.tags).toContain('meditation');
    });

    it('should apply pagination with limit and offset', () => {
      const page1 = searchService.search(testQuotes, {
        limit: 2,
        offset: 0
      });
      const page2 = searchService.search(testQuotes, {
        limit: 2,
        offset: 2
      });

      expect(page1).toHaveLength(2);
      expect(page2).toHaveLength(2);
      expect(page1[0].quote.id).not.toBe(page2[0].quote.id);
    });

    it('should sort results by relevance score', () => {
      const results = searchService.search(testQuotes, {
        query: 'compassion'
      });

      // Expect results sorted by score (descending)
      for (let i = 0; i < results.length - 1; i++) {
        expect(results[i].score).toBeGreaterThanOrEqual(results[i + 1].score);
      }
    });

    it('should combine query and filters', () => {
      const results = searchService.search(testQuotes, {
        query: 'thien', // Search for meditation
        types: [QuoteType.BuddhistQuote],
        language: Language.Vietnamese
      });

      expect(results).toHaveLength(1);
      expect(results[0].quote.content).toContain('Thiền định');
    });
  });

  describe('filterByCategory()', () => {
    it('should filter quotes by category (case-insensitive)', () => {
      const results = searchService.filterByCategory(testQuotes, 'HẠNH PHÚC');
      expect(results).toHaveLength(1);
      expect(results[0].category).toBe('Hạnh phúc');
    });
  });

  describe('filterByType()', () => {
    it('should filter quotes by type', () => {
      const results = searchService.filterByType(testQuotes, QuoteType.Proverb);
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe(QuoteType.Proverb);
    });
  });

  describe('filterByLanguage()', () => {
    it('should filter quotes by language', () => {
      const results = searchService.filterByLanguage(testQuotes, Language.English);
      expect(results).toHaveLength(1);
      expect(results[0].language).toBe(Language.English);
    });
  });

  describe('getCategories()', () => {
    it('should return unique categories sorted alphabetically', () => {
      const categories = searchService.getCategories(testQuotes);
      expect(categories).toHaveLength(4);
      expect(categories).toEqual([
        'Compassion',
        'Hạnh phúc',
        'Sự kiên trì',
        'Thiền định'
      ]);
    });
  });

  describe('getTags()', () => {
    it('should return unique tags sorted alphabetically', () => {
      const tags = searchService.getTags(testQuotes);
      expect(tags.length).toBeGreaterThan(0);
      expect(tags).toContain('hạnh phúc');
      expect(tags).toContain('compassion');
    });
  });
});
