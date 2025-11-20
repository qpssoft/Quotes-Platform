/**
 * Abstract storage service interface
 * Implemented by platform-specific storage services
 */
export interface IStorageService {
  /**
   * Retrieve a value by key
   * @param key - Storage key
   * @returns Promise resolving to value string or null if not found
   * @throws StorageError if read operation fails
   */
  getItem(key: string): Promise<string | null>;

  /**
   * Store a value with key
   * @param key - Storage key
   * @param value - Value to store (JSON string)
   * @throws StorageError if write operation fails
   */
  setItem(key: string, value: string): Promise<void>;

  /**
   * Remove a value by key
   * @param key - Storage key
   * @throws StorageError if delete operation fails
   */
  removeItem(key: string): Promise<void>;

  /**
   * Clear all stored values
   * @throws StorageError if clear operation fails
   */
  clear(): Promise<void>;

  /**
   * Get all keys in storage
   * @returns Promise resolving to array of storage keys
   * @throws StorageError if enumeration fails
   */
  getAllKeys(): Promise<string[]>;
}

/**
 * Storage operation error
 */
export class StorageError extends Error {
  constructor(
    message: string,
    public readonly key?: string,
    public readonly operation?: 'get' | 'set' | 'remove' | 'clear' | 'keys'
  ) {
    super(message);
    this.name = 'StorageError';
  }
}

/**
 * Helper methods for serialization
 */
export class StorageSerializer {
  /**
   * Serialize object to JSON string
   * @param obj - Object to serialize
   * @returns JSON string
   */
  static serialize<T>(obj: T): string {
    return JSON.stringify(obj);
  }

  /**
   * Deserialize JSON string to object
   * @param json - JSON string
   * @returns Deserialized object
   * @throws StorageError if parsing fails
   */
  static deserialize<T>(json: string): T {
    try {
      return JSON.parse(json);
    } catch (error) {
      throw new StorageError(`Failed to deserialize JSON: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
