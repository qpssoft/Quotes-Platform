/**
 * Native Storage Service (React Native Implementation)
 * Uses AsyncStorage for persistent local storage on mobile devices
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { IStorageService, StorageError } from '@quotes/shared-modules';

export class NativeStorageService implements IStorageService {
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      throw new StorageError(
        `Failed to get item from AsyncStorage: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
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
        `Failed to set item in AsyncStorage: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
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
        `Failed to remove item from AsyncStorage: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
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
        `Failed to clear AsyncStorage: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
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
        `Failed to get keys from AsyncStorage: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        undefined,
        'keys'
      );
    }
  }
}

// Export singleton instance
export const storageService = new NativeStorageService();
