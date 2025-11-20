# Storage Service Contract

**Location**: `shared-modules/services/storage.service.ts`  
**Purpose**: Abstract storage interface for platform-agnostic data persistence

## Interface Definition

```typescript
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
```

## Platform Implementations

### Web (Angular)

```typescript
// quotes-platform/src/app/core/services/storage/web-storage.service.ts

import { Injectable } from '@angular/core';
import { IStorageService, StorageError } from '@quotes/shared-modules';

@Injectable({ providedIn: 'root' })
export class WebStorageService implements IStorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      throw new StorageError(
        `Failed to get item from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key,
        'get'
      );
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      throw new StorageError(
        `Failed to set item in localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key,
        'set'
      );
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      throw new StorageError(
        `Failed to remove item from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key,
        'remove'
      );
    }
  }

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      throw new StorageError(
        `Failed to clear localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'clear'
      );
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      throw new StorageError(
        `Failed to get keys from localStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'keys'
      );
    }
  }
}
```

### Mobile (React Native)

```typescript
// quotes-native/src/services/storage/native-storage.service.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageService, StorageError } from '@quotes/shared-modules';

export class NativeStorageService implements IStorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      throw new StorageError(
        `Failed to get item from AsyncStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key,
        'get'
      );
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      throw new StorageError(
        `Failed to set item in AsyncStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key,
        'set'
      );
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      throw new StorageError(
        `Failed to remove item from AsyncStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        key,
        'remove'
      );
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      throw new StorageError(
        `Failed to clear AsyncStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'clear'
      );
    }
  }

  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      throw new StorageError(
        `Failed to get keys from AsyncStorage: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        'keys'
      );
    }
  }
}
```

## Usage Example

```typescript
// Shared business logic using IStorageService
import { IStorageService, UserPreferences, StorageSerializer } from '@quotes/shared-modules';

export class PreferencesRepository {
  private readonly PREFS_KEY = 'user_preferences';

  constructor(private storage: IStorageService) {}

  async savePreferences(prefs: UserPreferences): Promise<void> {
    const json = StorageSerializer.serialize(prefs);
    await this.storage.setItem(this.PREFS_KEY, json);
  }

  async loadPreferences(): Promise<UserPreferences | null> {
    const json = await this.storage.getItem(this.PREFS_KEY);
    if (!json) return null;
    return StorageSerializer.deserialize<UserPreferences>(json);
  }
}

// Platform-specific injection
// Angular
const repository = new PreferencesRepository(new WebStorageService());

// React Native
const repository = new PreferencesRepository(new NativeStorageService());
```

## Error Handling

```typescript
try {
  await storageService.setItem('key', 'value');
} catch (error) {
  if (error instanceof StorageError) {
    console.error(`Storage operation failed: ${error.operation} on key ${error.key}`);
    console.error(`Error message: ${error.message}`);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Testing

```typescript
// Mock storage service for testing
export class MockStorageService implements IStorageService {
  private store: Map<string, string> = new Map();

  async getItem(key: string): Promise<string | null> {
    return this.store.get(key) ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    this.store.set(key, value);
  }

  async removeItem(key: string): Promise<void> {
    this.store.delete(key);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }

  async getAllKeys(): Promise<string[]> {
    return Array.from(this.store.keys());
  }
}
```
