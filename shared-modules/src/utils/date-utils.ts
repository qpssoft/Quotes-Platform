/**
 * Date utilities for ISO 8601 formatting and timestamp operations
 * Shared location: shared-modules/utils/date-utils.ts
 */

/**
 * Format date to ISO 8601 string with timezone
 * 
 * @param date - Date to format
 * @returns ISO 8601 string (e.g., "2025-11-20T10:00:00.000Z")
 * 
 * @example
 * formatISO(new Date()) // Returns "2025-11-20T10:00:00.000Z"
 */
export function formatISO(date: Date): string {
  return date.toISOString();
}

/**
 * Parse ISO 8601 string to Date object
 * 
 * @param isoString - ISO 8601 string
 * @returns Date object
 * @throws Error if invalid ISO string
 * 
 * @example
 * parseISO("2025-11-20T10:00:00.000Z") // Returns Date object
 */
export function parseISO(isoString: string): Date {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid ISO 8601 date string: ${isoString}`);
  }
  return date;
}

/**
 * Get current timestamp in milliseconds
 * 
 * @returns Current timestamp
 * 
 * @example
 * now() // Returns 1700481600000
 */
export function now(): number {
  return Date.now();
}

/**
 * Add seconds to a date
 * 
 * @param date - Base date
 * @param seconds - Seconds to add
 * @returns New date with seconds added
 * 
 * @example
 * addSeconds(new Date(), 15) // Returns date 15 seconds in the future
 */
export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

/**
 * Add minutes to a date
 * 
 * @param date - Base date
 * @param minutes - Minutes to add
 * @returns New date with minutes added
 * 
 * @example
 * addMinutes(new Date(), 5) // Returns date 5 minutes in the future
 */
export function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

/**
 * Add days to a date
 * 
 * @param date - Base date
 * @param days - Days to add
 * @returns New date with days added
 * 
 * @example
 * addDays(new Date(), 7) // Returns date 7 days in the future
 */
export function addDays(date: Date, days: number): Date {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

/**
 * Calculate difference between two dates in seconds
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in seconds (absolute value)
 * 
 * @example
 * diffInSeconds(new Date("2025-11-20T10:00:00Z"), new Date("2025-11-20T10:01:00Z"))
 * // Returns 60
 */
export function diffInSeconds(date1: Date, date2: Date): number {
  return Math.abs(date1.getTime() - date2.getTime()) / 1000;
}

/**
 * Calculate difference between two dates in minutes
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in minutes (absolute value)
 * 
 * @example
 * diffInMinutes(new Date("2025-11-20T10:00:00Z"), new Date("2025-11-20T11:00:00Z"))
 * // Returns 60
 */
export function diffInMinutes(date1: Date, date2: Date): number {
  return diffInSeconds(date1, date2) / 60;
}

/**
 * Calculate difference between two dates in days
 * 
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Difference in days (absolute value)
 * 
 * @example
 * diffInDays(new Date("2025-11-20"), new Date("2025-11-27"))
 * // Returns 7
 */
export function diffInDays(date1: Date, date2: Date): number {
  return diffInSeconds(date1, date2) / (24 * 60 * 60);
}

/**
 * Check if a date is in the past
 * 
 * @param date - Date to check
 * @returns true if date is in the past
 * 
 * @example
 * isPast(new Date("2020-01-01")) // Returns true
 * isPast(new Date("2030-01-01")) // Returns false
 */
export function isPast(date: Date): boolean {
  return date.getTime() < Date.now();
}

/**
 * Check if a date is in the future
 * 
 * @param date - Date to check
 * @returns true if date is in the future
 * 
 * @example
 * isFuture(new Date("2030-01-01")) // Returns true
 * isFuture(new Date("2020-01-01")) // Returns false
 */
export function isFuture(date: Date): boolean {
  return date.getTime() > Date.now();
}

/**
 * Format date to human-readable string
 * 
 * @param date - Date to format
 * @param locale - Locale for formatting (default: "en-US")
 * @returns Formatted date string
 * 
 * @example
 * formatRelative(new Date("2025-11-20")) // Returns "Nov 20, 2025"
 */
export function formatDate(date: Date, locale: string = 'en-US'): string {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format time to human-readable string
 * 
 * @param date - Date to format
 * @param locale - Locale for formatting (default: "en-US")
 * @returns Formatted time string
 * 
 * @example
 * formatTime(new Date("2025-11-20T10:30:00Z")) // Returns "10:30 AM"
 */
export function formatTime(date: Date, locale: string = 'en-US'): string {
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit'
  });
}
