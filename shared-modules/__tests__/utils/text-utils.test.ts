/**
 * Text Utilities Unit Tests
 * Tests Vietnamese text normalization and diacritic handling
 */

import {
  normalizeVietnamese,
  removeDiacritics,
  compareVietnamese,
  containsVietnamese,
  truncateText,
  countWords,
  highlightQuery
} from '../../src/utils/text-utils';

describe('Text Utilities', () => {
  describe('normalizeVietnamese()', () => {
    it('should normalize Vietnamese text to NFC', () => {
      const text = 'Thích Nhất Hạnh';
      const normalized = normalizeVietnamese(text);
      
      // NFC normalization ensures consistent representation
      expect(normalized).toBe(text);
      expect(normalized.normalize('NFC')).toBe(normalized);
    });
  });

  describe('removeDiacritics()', () => {
    it('should remove Vietnamese diacritics', () => {
      expect(removeDiacritics('Thích Nhất Hạnh')).toBe('Thich Nhat Hanh');
      expect(removeDiacritics('Hạnh phúc')).toBe('Hanh phuc');
      expect(removeDiacritics('Thiền định')).toBe('Thien dinh');
    });

    it('should not modify text without diacritics', () => {
      expect(removeDiacritics('compassion')).toBe('compassion');
      expect(removeDiacritics('mindfulness')).toBe('mindfulness');
    });

    it('should handle empty string', () => {
      expect(removeDiacritics('')).toBe('');
    });
  });

  describe('compareVietnamese()', () => {
    it('should match Vietnamese text ignoring diacritics (case-insensitive)', () => {
      expect(compareVietnamese('Thích Nhất Hạnh', 'thich nhat hanh')).toBe(true);
      expect(compareVietnamese('Hạnh phúc', 'hanh phuc')).toBe(true);
    });

    it('should match text with case sensitivity when specified', () => {
      expect(compareVietnamese('Thích Nhất Hạnh', 'Thich Nhat Hanh', true)).toBe(true);
      expect(compareVietnamese('Thích Nhất Hạnh', 'thich nhat hanh', true)).toBe(false);
    });

    it('should not match different text', () => {
      expect(compareVietnamese('Thiền định', 'Hạnh phúc')).toBe(false);
    });
  });

  describe('containsVietnamese()', () => {
    it('should find query in Vietnamese text (diacritic-insensitive)', () => {
      expect(containsVietnamese('Hạnh phúc đến từ hành động', 'hanh phuc')).toBe(true);
      expect(containsVietnamese('Thiền định là nghệ thuật', 'thien dinh')).toBe(true);
    });

    it('should handle case sensitivity', () => {
      expect(containsVietnamese('Hạnh phúc', 'Hanh Phuc', false)).toBe(true);
      expect(containsVietnamese('Hạnh phúc', 'HANH PHUC', false)).toBe(true);
    });

    it('should return false when query not found', () => {
      expect(containsVietnamese('Thiền định', 'happiness')).toBe(false);
    });
  });

  describe('truncateText()', () => {
    it('should truncate long text with ellipsis', () => {
      const text = 'Hạnh phúc không phải là điều gì đó sẵn có. Nó đến từ chính hành động của bạn.';
      const truncated = truncateText(text, 30);
      
      expect(truncated.length).toBeLessThanOrEqual(30);
      expect(truncated).toContain('...');
    });

    it('should preserve text shorter than maxLength', () => {
      const text = 'Short text';
      expect(truncateText(text, 50)).toBe(text);
    });

    it('should truncate at word boundary', () => {
      const text = 'Hạnh phúc đến từ hành động';
      const truncated = truncateText(text, 20);
      
      // Should not cut words in half
      expect(truncated).not.toMatch(/\w\.\.\./);
    });

    it('should use custom ellipsis', () => {
      const text = 'Long text that needs truncation';
      const truncated = truncateText(text, 15, '…');
      
      expect(truncated).toContain('…');
      expect(truncated).not.toContain('...');
    });
  });

  describe('countWords()', () => {
    it('should count Vietnamese words correctly', () => {
      expect(countWords('Hạnh phúc đến từ hành động')).toBe(5);
      expect(countWords('Thiền định là nghệ thuật của sự tĩnh lặng')).toBe(8);
    });

    it('should count English words correctly', () => {
      expect(countWords('Compassion is the basis of all Buddhist practice')).toBe(8);
    });

    it('should handle empty string', () => {
      expect(countWords('')).toBe(0);
      expect(countWords('   ')).toBe(0);
    });

    it('should handle single word', () => {
      expect(countWords('compassion')).toBe(1);
    });
  });

  describe('highlightQuery()', () => {
    it('should highlight matching words (diacritic-insensitive)', () => {
      const text = 'Hạnh phúc đến từ hành động';
      const highlighted = highlightQuery(text, 'hanh phuc');
      
      expect(highlighted).toContain('<mark>');
      expect(highlighted).toContain('</mark>');
      expect(highlighted).toContain('Hạnh phúc');
    });

    it('should return original text when query is empty', () => {
      const text = 'Compassion is the basis';
      expect(highlightQuery(text, '')).toBe(text);
    });

    it('should use custom mark tag', () => {
      const text = 'Compassion is the basis';
      const highlighted = highlightQuery(text, 'compassion', 'strong');
      
      expect(highlighted).toContain('<strong>');
      expect(highlighted).toContain('</strong>');
    });
  });
});
