/**
 * Unit tests for NativeStorageService
 * Tests AsyncStorage persistence for user preferences and favorites
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStorageService } from '../../../src/services/storage/NativeStorageService';
import { UserPreferences, Category } from '@quotes/shared-modules';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('NativeStorageService', () => {
  let service: NativeStorageService;

  beforeEach(() => {
    service = new NativeStorageService();
    jest.clearAllMocks();
  });

  describe('savePreferences', () => {
    it('should save preferences with JSON serialization', async () => {
      const preferences: UserPreferences = {
        timerInterval: 15,
        soundEnabled: true,
        hapticEnabled: true,
        favorites: ['quote-1', 'quote-2'],
        lastViewedQuoteId: 'quote-3',
        displayHistory: [],
        selectedCategories: [Category.Buddhist],
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-15'),
      };

      await service.savePreferences(preferences);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_preferences',
        expect.stringContaining('"timerInterval":15')
      );
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'user_preferences',
        expect.stringContaining('"soundEnabled":true')
      );
    });

    it('should handle save errors gracefully', async () => {
      const preferences: UserPreferences = {
        timerInterval: 20,
        soundEnabled: false,
        hapticEnabled: false,
        favorites: [],
        displayHistory: [],
        selectedCategories: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage full')
      );

      await expect(service.savePreferences(preferences)).rejects.toThrow();
    });
  });

  describe('loadPreferences', () => {
    it('should load and deserialize preferences with Date objects', async () => {
      const storedData = JSON.stringify({
        timerInterval: 30,
        soundEnabled: false,
        hapticEnabled: true,
        favorites: ['quote-10', 'quote-20'],
        lastViewedQuoteId: 'quote-5',
        displayHistory: [],
        selectedCategories: [Category.Vietnamese],
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-15T00:00:00.000Z',
      });

      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(storedData);

      const preferences = await service.loadPreferences();

      expect(preferences).toBeDefined();
      expect(preferences?.timerInterval).toBe(30);
      expect(preferences?.soundEnabled).toBe(false);
      expect(preferences?.favorites).toEqual(['quote-10', 'quote-20']);
      expect(preferences?.createdAt).toBeInstanceOf(Date);
      expect(preferences?.updatedAt).toBeInstanceOf(Date);
    });

    it('should return null if no preferences exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const preferences = await service.loadPreferences();

      expect(preferences).toBeNull();
    });

    it('should handle malformed JSON gracefully', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
        'invalid json{'
      );

      await expect(service.loadPreferences()).rejects.toThrow();
    });
  });

  describe('saveFavorites', () => {
    it('should save favorites as string array', async () => {
      const favorites = ['quote-1', 'quote-2', 'quote-3'];

      await service.saveFavorites(favorites);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'favorites',
        JSON.stringify(favorites)
      );
    });

    it('should save empty favorites array', async () => {
      await service.saveFavorites([]);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        'favorites',
        JSON.stringify([])
      );
    });
  });

  describe('loadFavorites', () => {
    it('should load favorites as string array', async () => {
      const storedFavorites = JSON.stringify(['quote-a', 'quote-b']);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(storedFavorites);

      const favorites = await service.loadFavorites();

      expect(favorites).toEqual(['quote-a', 'quote-b']);
    });

    it('should return empty array if no favorites exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

      const favorites = await service.loadFavorites();

      expect(favorites).toEqual([]);
    });

    it('should handle storage errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValueOnce(
        new Error('Storage read error')
      );

      await expect(service.loadFavorites()).rejects.toThrow();
    });
  });

  describe('Date serialization', () => {
    it('should preserve Date objects through save/load cycle', async () => {
      const originalDate = new Date('2025-11-20T12:00:00.000Z');
      const preferences: UserPreferences = {
        timerInterval: 15,
        soundEnabled: true,
        hapticEnabled: true,
        favorites: [],
        displayHistory: [],
        selectedCategories: [],
        createdAt: originalDate,
        updatedAt: originalDate,
      };

      // Simulate the save/load cycle
      let savedData: string = '';
      (AsyncStorage.setItem as jest.Mock).mockImplementation((key, value) => {
        savedData = value;
        return Promise.resolve();
      });
      (AsyncStorage.getItem as jest.Mock).mockImplementation(() =>
        Promise.resolve(savedData)
      );

      await service.savePreferences(preferences);
      const loaded = await service.loadPreferences();

      expect(loaded?.createdAt).toBeInstanceOf(Date);
      expect(loaded?.createdAt.toISOString()).toBe(originalDate.toISOString());
    });
  });
});
