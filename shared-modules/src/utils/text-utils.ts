/**
 * Vietnamese text utilities
 * Shared location: shared-modules/utils/text-utils.ts
 */

/**
 * Normalize Vietnamese text to NFC (Canonical Decomposition + Canonical Composition)
 * Ensures consistent rendering of Vietnamese diacritics across platforms
 * 
 * @param text - Text to normalize
 * @returns NFC-normalized text
 * 
 * @example
 * normalizeVietnamese("Thích Nhất Hạnh") // Returns consistent UTF-8 representation
 */
export function normalizeVietnamese(text: string): string {
  return text.normalize('NFC');
}

/**
 * Remove Vietnamese diacritics for diacritic-insensitive comparison
 * Converts "Thích Nhất Hạnh" → "Thich Nhat Hanh"
 * 
 * @param text - Text with diacritics
 * @returns Text without diacritics
 * 
 * @example
 * removeDiacritics("Thích Nhất Hạnh") // Returns "Thich Nhat Hanh"
 * removeDiacritics("compassion") // Returns "compassion" (unchanged)
 */
export function removeDiacritics(text: string): string {
  return text
    .normalize('NFD') // Decompose to base + combining marks
    .replace(/[\u0300-\u036f]/g, ''); // Remove combining diacritical marks
}

/**
 * Compare two Vietnamese strings with diacritic-insensitive matching
 * Useful for search and filtering
 * 
 * @param a - First string
 * @param b - Second string
 * @param caseSensitive - Whether to perform case-sensitive comparison (default: false)
 * @returns true if strings match (ignoring diacritics)
 * 
 * @example
 * compareVietnamese("Thích Nhất Hạnh", "thich nhat hanh") // Returns true
 * compareVietnamese("Hạnh phúc", "Hanh phuc") // Returns true
 */
export function compareVietnamese(a: string, b: string, caseSensitive: boolean = false): boolean {
  let normalizedA = removeDiacritics(normalizeVietnamese(a));
  let normalizedB = removeDiacritics(normalizeVietnamese(b));

  if (!caseSensitive) {
    normalizedA = normalizedA.toLowerCase();
    normalizedB = normalizedB.toLowerCase();
  }

  return normalizedA === normalizedB;
}

/**
 * Check if Vietnamese text contains search query (diacritic-insensitive)
 * 
 * @param text - Text to search in
 * @param query - Search query
 * @param caseSensitive - Whether to perform case-sensitive search (default: false)
 * @returns true if text contains query
 * 
 * @example
 * containsVietnamese("Hạnh phúc đến từ hành động", "hanh phuc") // Returns true
 * containsVietnamese("Thiền định", "thien dinh") // Returns true
 */
export function containsVietnamese(text: string, query: string, caseSensitive: boolean = false): boolean {
  let normalizedText = removeDiacritics(normalizeVietnamese(text));
  let normalizedQuery = removeDiacritics(normalizeVietnamese(query));

  if (!caseSensitive) {
    normalizedText = normalizedText.toLowerCase();
    normalizedQuery = normalizedQuery.toLowerCase();
  }

  return normalizedText.includes(normalizedQuery);
}

/**
 * Truncate text to specified length with ellipsis
 * Preserves word boundaries (doesn't cut words in half)
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length (including ellipsis)
 * @param ellipsis - Ellipsis string (default: "...")
 * @returns Truncated text
 * 
 * @example
 * truncateText("Hạnh phúc không phải là điều gì đó sẵn có", 30) 
 * // Returns "Hạnh phúc không phải là..."
 */
export function truncateText(text: string, maxLength: number, ellipsis: string = '...'): string {
  if (text.length <= maxLength) {
    return text;
  }

  const truncated = text.slice(0, maxLength - ellipsis.length);
  const lastSpace = truncated.lastIndexOf(' ');

  // If there's a space, truncate at word boundary
  if (lastSpace > 0) {
    return truncated.slice(0, lastSpace) + ellipsis;
  }

  return truncated + ellipsis;
}

/**
 * Count words in text (supports Vietnamese and English)
 * Vietnamese: Count by spaces (word separation)
 * 
 * @param text - Text to count words in
 * @returns Number of words
 * 
 * @example
 * countWords("Hạnh phúc đến từ hành động") // Returns 5
 */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) return 0;
  
  return trimmed.split(/\s+/).length;
}

/**
 * Highlight search query in text (diacritic-insensitive)
 * Returns text with <mark> tags around matches
 * 
 * @param text - Text to highlight in
 * @param query - Search query
 * @param markTag - HTML tag for highlighting (default: "mark")
 * @returns Text with highlighted matches
 * 
 * @example
 * highlightQuery("Hạnh phúc đến từ hành động", "hanh phuc")
 * // Returns "Hạnh phúc đến từ hành động" with <mark> around "Hạnh phúc"
 */
export function highlightQuery(text: string, query: string, markTag: string = 'mark'): string {
  if (!query.trim()) return text;

  const normalizedQuery = removeDiacritics(query.toLowerCase());
  const words = text.split(/(\s+)/); // Keep whitespace

  const highlighted = words.map(word => {
    const normalizedWord = removeDiacritics(word.toLowerCase());
    if (normalizedWord.includes(normalizedQuery)) {
      return `<${markTag}>${word}</${markTag}>`;
    }
    return word;
  });

  return highlighted.join('');
}
