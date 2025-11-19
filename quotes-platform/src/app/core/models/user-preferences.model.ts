/**
 * User preferences persisted in localStorage
 */
export interface UserPreferences {
  /** Timer interval in seconds */
  timerInterval: number;
  
  /** Number of quotes to display in grid */
  displayCount?: number;
  
  /** Selected font family for quotes */
  fontFamily?: string;
  
  /** localStorage key for persistence */
  storageKey: string;
}
