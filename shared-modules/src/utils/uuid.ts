/**
 * UUID v4 generation utility
 * Shared location: shared-modules/utils/uuid.ts
 * 
 * Platform-agnostic UUID generation for cross-platform compatibility
 */

/**
 * Generate a random UUID v4
 * Uses crypto.randomUUID() if available (modern browsers, Node.js 16.7+)
 * Falls back to Math.random() for older environments
 * 
 * @returns UUID v4 string
 * 
 * @example
 * generateUUID() // Returns "550e8400-e29b-41d4-a716-446655440000"
 */
export function generateUUID(): string {
  // Modern crypto API (browsers, Node.js 16.7+)
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  // Fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validate UUID v4 format
 * 
 * @param uuid - UUID string to validate
 * @returns true if valid UUID v4 format
 * 
 * @example
 * isValidUUID("550e8400-e29b-41d4-a716-446655440000") // Returns true
 * isValidUUID("invalid-uuid") // Returns false
 */
export function isValidUUID(uuid: string): boolean {
  const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidV4Regex.test(uuid);
}

/**
 * Generate multiple UUIDs at once
 * Useful for batch operations
 * 
 * @param count - Number of UUIDs to generate
 * @returns Array of UUID strings
 * 
 * @example
 * generateUUIDs(3) // Returns ["uuid1", "uuid2", "uuid3"]
 */
export function generateUUIDs(count: number): string[] {
  return Array.from({ length: count }, () => generateUUID());
}
