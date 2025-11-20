/**
 * Application configuration constants
 * Timer intervals, defaults, storage keys
 */

export const Config = {
  // Timer configuration
  timer: {
    minInterval: 5, // seconds
    maxInterval: 60, // seconds
    defaultInterval: 15, // seconds
    step: 5, // seconds
  },

  // Storage keys
  storage: {
    preferences: '@quotes/preferences',
    favorites: '@quotes/favorites',
    history: '@quotes/history',
    deviceId: '@quotes/device-id',
    quotes: '@quotes/quotes-cache',
  },

  // Audio configuration
  audio: {
    notificationPath: require('../../assets/audio/notification.mp3'),
    defaultVolume: 0.7,
  },

  // Haptic configuration
  haptic: {
    defaultEnabled: true,
    batteryThresholdForDisable: 0.10, // 10%
    batteryThresholdForReduce: 0.20, // 20%
  },

  // Quote display
  quotes: {
    recentQuotesLimit: 10, // Prevent repeats
    truncateLength: 200, // Max characters in grid view
    maxHistoryLength: 100, // Max reading history items
  },

  // Performance
  performance: {
    quotesPerPage: 20, // Pagination
    searchDebounceMs: 300, // Search input debounce
  },

  // App metadata
  app: {
    name: 'Buddhist Quotes',
    version: '1.0.0',
    author: 'QPS Software',
  },
};

export default Config;
