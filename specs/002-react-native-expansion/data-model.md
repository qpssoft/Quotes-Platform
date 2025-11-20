# Data Model: Multi-Platform React Native Expansion

**Feature Branch**: `002-react-native-expansion`  
**Created**: 2025-11-20  
**Purpose**: Define shared TypeScript data models for web (Angular) and native (React Native) platforms

## Overview

This document defines the data models used across all platforms (web, mobile, desktop, wearables). All entities are defined in TypeScript with strict typing and are shared between Angular web app and React Native native apps via the `shared-modules` package.

## Core Principles

1. **Shared Models**: All business entities (Quote, Category, UserPreferences) defined once in TypeScript, used everywhere
2. **Platform-Agnostic**: Models contain no platform-specific code (no Angular, no React Native dependencies)
3. **Firebase-Ready**: All models include fields needed for future Firebase integration (id, timestamps, metadata)
4. **Type Safety**: TypeScript strict mode, full type coverage, no `any` types
5. **Validation**: Runtime validation using type guards and validation functions

## Entity Diagram

```
┌─────────────────┐
│     Quote       │
├─────────────────┤
│ id: string      │
│ content: string │
│ author: string  │
│ type: QuoteType │
│ category: string│
│ tags: string[]  │
│ language: Lang  │
│ createdAt: Date │
│ updatedAt: Date │
└─────────────────┘
        │
        │ has many
        ▼
┌─────────────────┐
│    Category     │
├─────────────────┤
│ id: string      │
│ name: string    │
│ slug: string    │
│ description: str│
│ quoteCount: num │
└─────────────────┘

┌─────────────────────────┐
│   UserPreferences       │
├─────────────────────────┤
│ userId: string          │
│ timerInterval: number   │
│ soundEnabled: boolean   │
│ hapticEnabled: boolean  │
│ backgroundMode: boolean │
│ favorites: string[]     │
│ readingHistory: string[]│
│ notificationPosition:   │
│   NotificationPosition  │
│ keyboardShortcuts:      │
│   KeyboardShortcuts     │
│ syncState: SyncState    │
│ createdAt: Date         │
│ updatedAt: Date         │
└─────────────────────────┘

┌─────────────────┐
│   SyncState     │
├─────────────────┤
│ lastSyncAt: Date│
│ deviceId: string│
│ syncEnabled: bool
│ conflictCount: n│
└─────────────────┘
```

## Entity Definitions

### 1. Quote

Primary content entity representing all types of Buddhist wisdom content.

```typescript
/**
 * Shared location: shared-modules/models/quote.model.ts
 * Used by: quotes-platform (Angular), quotes-native (React Native)
 */

export enum QuoteType {
  BuddhistQuote = 'BuddhistQuote',
  LifeLesson = 'LifeLesson',
  Proverb = 'Proverb',
  CaDao = 'CaDao',
  WisdomSaying = 'WisdomSaying'
}

export enum Language {
  Vietnamese = 'vi',
  English = 'en',
  Bilingual = 'vi-en'
}

export interface Quote {
  /**
   * Unique identifier (UUID v4)
   * Used for: Firestore document ID, local storage key, deduplication
   */
  id: string;

  /**
   * Quote text content (UTF-8 with Vietnamese diacritics)
   * NFC normalized for consistent rendering
   * Max length: 5000 characters
   */
  content: string;

  /**
   * Author or source attribution
   * Required for BuddhistQuote and LifeLesson types
   * Optional for Proverb, CaDao, WisdomSaying (use "Unknown" or "Traditional")
   */
  author: string;

  /**
   * Content type classification
   * Used for: Filtering, UI presentation, analytics
   */
  type: QuoteType;

  /**
   * Thematic category (e.g., "Compassion", "Meditation", "Mindfulness")
   * Used for: Category filtering, browsing by theme
   */
  category: string;

  /**
   * Searchable keywords/tags
   * Used for: Tag-based search, related content discovery
   */
  tags: string[];

  /**
   * Content language
   * Used for: Language filtering, font selection, search optimization
   */
  language: Language;

  /**
   * ISO 8601 timestamp (creation date)
   * Used for: Firestore sync, sorting, analytics
   */
  createdAt: Date;

  /**
   * ISO 8601 timestamp (last modification date)
   * Used for: Firestore sync, conflict resolution
   */
  updatedAt: Date;

  /**
   * Optional metadata for future enhancements
   * Examples: sourceUrl, imageUrl, audioUrl, difficulty, popularity
   */
  metadata?: Record<string, unknown>;
}

/**
 * Type guard for runtime validation
 */
export function isQuote(obj: unknown): obj is Quote {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const q = obj as Partial<Quote>;
  return (
    typeof q.id === 'string' &&
    typeof q.content === 'string' &&
    typeof q.author === 'string' &&
    Object.values(QuoteType).includes(q.type as QuoteType) &&
    typeof q.category === 'string' &&
    Array.isArray(q.tags) &&
    q.tags.every(t => typeof t === 'string') &&
    Object.values(Language).includes(q.language as Language) &&
    q.createdAt instanceof Date &&
    q.updatedAt instanceof Date
  );
}

/**
 * Factory function for creating new quotes
 */
export function createQuote(
  content: string,
  author: string,
  type: QuoteType,
  category: string,
  tags: string[],
  language: Language,
  metadata?: Record<string, unknown>
): Quote {
  const now = new Date();
  return {
    id: generateUUID(), // Platform-specific UUID generation
    content: content.normalize('NFC'), // Unicode NFC normalization
    author,
    type,
    category,
    tags,
    language,
    createdAt: now,
    updatedAt: now,
    metadata
  };
}
```

**Storage Representation**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "content": "Hạnh phúc không phải là điều gì đó sẵn có. Nó đến từ chính hành động của bạn.",
  "author": "Đức Đạt Lai Lạt Ma XIV",
  "type": "BuddhistQuote",
  "category": "Hạnh phúc",
  "tags": ["hạnh phúc", "hành động", "mindfulness"],
  "language": "vi",
  "createdAt": "2025-11-20T10:00:00.000Z",
  "updatedAt": "2025-11-20T10:00:00.000Z",
  "metadata": {}
}
```

---

### 2. Category

Organizational entity for grouping quotes by theme.

```typescript
/**
 * Shared location: shared-modules/models/category.model.ts
 * Used by: quotes-platform (Angular), quotes-native (React Native)
 */

export interface Category {
  /**
   * Unique identifier (UUID v4)
   * Used for: Firestore document ID, category filtering
   */
  id: string;

  /**
   * Display name (localized)
   * Examples: "Compassion", "Meditation", "Mindfulness"
   */
  name: string;

  /**
   * URL-safe slug (kebab-case)
   * Examples: "compassion", "meditation", "mindfulness"
   * Used for: URLs, routing, search keys
   */
  slug: string;

  /**
   * Category description (optional)
   * Used for: Category browsing UI, tooltips
   */
  description?: string;

  /**
   * Number of quotes in this category
   * Used for: Category list sorting, UI display
   * Updated by: Aggregate query or manual count
   */
  quoteCount: number;

  /**
   * ISO 8601 timestamp (creation date)
   */
  createdAt: Date;

  /**
   * ISO 8601 timestamp (last modification date)
   */
  updatedAt: Date;
}

/**
 * Type guard for runtime validation
 */
export function isCategory(obj: unknown): obj is Category {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const c = obj as Partial<Category>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.slug === 'string' &&
    typeof c.quoteCount === 'number' &&
    c.createdAt instanceof Date &&
    c.updatedAt instanceof Date
  );
}

/**
 * Predefined categories (Buddhist themes)
 */
export const CATEGORIES: Readonly<Category[]> = [
  {
    id: 'cat-compassion',
    name: 'Compassion',
    slug: 'compassion',
    description: 'Quotes about loving-kindness and compassion',
    quoteCount: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'cat-meditation',
    name: 'Meditation',
    slug: 'meditation',
    description: 'Quotes about meditation practice and mindfulness',
    quoteCount: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'cat-wisdom',
    name: 'Wisdom',
    slug: 'wisdom',
    description: 'Quotes about Buddhist wisdom and understanding',
    quoteCount: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'cat-mindfulness',
    name: 'Mindfulness',
    slug: 'mindfulness',
    description: 'Quotes about present-moment awareness',
    quoteCount: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  },
  {
    id: 'cat-suffering',
    name: 'Suffering',
    slug: 'suffering',
    description: 'Quotes about understanding and overcoming suffering',
    quoteCount: 0,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01')
  }
];
```

---

### 3. UserPreferences

User settings and personalization data (stored locally per device, future cloud sync via Firebase).

```typescript
/**
 * Shared location: shared-modules/models/user-preferences.model.ts
 * Used by: quotes-platform (Angular), quotes-native (React Native)
 */

export enum NotificationPosition {
  TopLeft = 'top-left',
  TopCenter = 'top-center',
  TopRight = 'top-right',
  MiddleLeft = 'middle-left',
  MiddleCenter = 'middle-center',
  MiddleRight = 'middle-right',
  BottomLeft = 'bottom-left',
  BottomCenter = 'bottom-center',
  BottomRight = 'bottom-right'
}

export enum KeyboardShortcut {
  ShowQuote_CtrlC = 'ctrl+c',
  ShowQuote_CtrlX = 'ctrl+x',
  NextQuote_CtrlV = 'ctrl+v',
  NextQuote_CtrlN = 'ctrl+n'
}

export interface KeyboardShortcuts {
  /**
   * Shortcut to show quote overlay (desktop only)
   * Options: Ctrl+C or Ctrl+X (user choice)
   */
  showQuote: KeyboardShortcut.ShowQuote_CtrlC | KeyboardShortcut.ShowQuote_CtrlX;

  /**
   * Shortcut to advance to next quote (desktop only)
   * Options: Ctrl+V or Ctrl+N (user choice)
   */
  nextQuote: KeyboardShortcut.NextQuote_CtrlV | KeyboardShortcut.NextQuote_CtrlN;
}

export interface UserPreferences {
  /**
   * User identifier (UUID v4)
   * Phase 2: Generated locally per device (deviceId)
   * V3+: Firebase Auth UID for cross-device sync
   */
  userId: string;

  /**
   * Auto-rotation timer interval (seconds)
   * Range: 5-60 seconds, step: 5 seconds
   * Default: 15 seconds
   */
  timerInterval: number;

  /**
   * Enable audio notification on quote transitions
   * Default: true (all platforms except wearables)
   */
  soundEnabled: boolean;

  /**
   * Enable haptic feedback on quote transitions
   * Default: true (mobile, wearables), false (web, desktop)
   */
  hapticEnabled: boolean;

  /**
   * Enable background auto-rotation (mobile only)
   * Default: false (requires user permission, battery impact)
   * Requires: iOS background audio permission, Android foreground service
   */
  backgroundMode: boolean;

  /**
   * Favorited quote IDs
   * Stored locally per device in Phase 2
   * V3+: Synced via Firebase Firestore
   */
  favorites: string[];

  /**
   * Reading history (last 100 viewed quotes)
   * Stored locally per device in Phase 2
   * V3+: Synced via Firebase Firestore
   */
  readingHistory: string[];

  /**
   * Notification position (desktop only)
   * Default: BottomRight
   */
  notificationPosition: NotificationPosition;

  /**
   * Keyboard shortcuts (desktop only)
   * Default: { showQuote: 'ctrl+c', nextQuote: 'ctrl+v' }
   */
  keyboardShortcuts: KeyboardShortcuts;

  /**
   * Cloud sync state (V3+ Firebase integration)
   * Phase 2: Null (no sync)
   */
  syncState: SyncState | null;

  /**
   * ISO 8601 timestamp (creation date)
   */
  createdAt: Date;

  /**
   * ISO 8601 timestamp (last modification date)
   */
  updatedAt: Date;
}

/**
 * Type guard for runtime validation
 */
export function isUserPreferences(obj: unknown): obj is UserPreferences {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const p = obj as Partial<UserPreferences>;
  return (
    typeof p.userId === 'string' &&
    typeof p.timerInterval === 'number' &&
    p.timerInterval >= 5 && p.timerInterval <= 60 &&
    typeof p.soundEnabled === 'boolean' &&
    typeof p.hapticEnabled === 'boolean' &&
    typeof p.backgroundMode === 'boolean' &&
    Array.isArray(p.favorites) &&
    p.favorites.every(f => typeof f === 'string') &&
    Array.isArray(p.readingHistory) &&
    p.readingHistory.every(h => typeof h === 'string') &&
    Object.values(NotificationPosition).includes(p.notificationPosition as NotificationPosition) &&
    p.createdAt instanceof Date &&
    p.updatedAt instanceof Date
  );
}

/**
 * Default preferences factory
 */
export function createDefaultPreferences(userId: string): UserPreferences {
  const now = new Date();
  return {
    userId,
    timerInterval: 15,
    soundEnabled: true,
    hapticEnabled: false, // Platform-specific default (true on mobile/wearables)
    backgroundMode: false,
    favorites: [],
    readingHistory: [],
    notificationPosition: NotificationPosition.BottomRight,
    keyboardShortcuts: {
      showQuote: KeyboardShortcut.ShowQuote_CtrlC,
      nextQuote: KeyboardShortcut.NextQuote_CtrlV
    },
    syncState: null,
    createdAt: now,
    updatedAt: now
  };
}
```

---

### 4. SyncState

Cloud synchronization state (deferred to V3+, included for Firebase-compatible design).

```typescript
/**
 * Shared location: shared-modules/models/sync-state.model.ts
 * Used by: quotes-platform (Angular), quotes-native (React Native)
 * Purpose: Track cloud sync status for Firebase Firestore integration (V3+)
 */

export interface SyncState {
  /**
   * Last successful sync timestamp (ISO 8601)
   * Used for: Determining if local data is stale, conflict resolution
   */
  lastSyncAt: Date | null;

  /**
   * Device identifier (UUID v4)
   * Generated on first app launch, persisted in secure storage
   * Used for: Multi-device conflict resolution, analytics
   */
  deviceId: string;

  /**
   * Cloud sync enabled flag
   * Default: false (Phase 2: local-only)
   * V3+: true when user enables Firebase sync
   */
  syncEnabled: boolean;

  /**
   * Number of unresolved sync conflicts
   * Used for: Alerting user to review conflicts
   */
  conflictCount: number;

  /**
   * Optional metadata for sync debugging
   */
  metadata?: {
    lastError?: string;
    lastErrorAt?: Date;
    syncAttempts?: number;
  };
}

/**
 * Type guard for runtime validation
 */
export function isSyncState(obj: unknown): obj is SyncState {
  if (typeof obj !== 'object' || obj === null) return false;
  
  const s = obj as Partial<SyncState>;
  return (
    (s.lastSyncAt === null || s.lastSyncAt instanceof Date) &&
    typeof s.deviceId === 'string' &&
    typeof s.syncEnabled === 'boolean' &&
    typeof s.conflictCount === 'number'
  );
}

/**
 * Default sync state factory (local-only, no sync)
 */
export function createDefaultSyncState(deviceId: string): SyncState {
  return {
    lastSyncAt: null,
    deviceId,
    syncEnabled: false,
    conflictCount: 0
  };
}
```

---

## Platform-Specific Storage

### Web (Angular) - localStorage + IndexedDB

```typescript
// quotes-platform/src/app/core/services/storage/web-storage.service.ts

import { UserPreferences } from '@quotes/shared-modules';

export class WebStorageService {
  private readonly STORAGE_KEYS = {
    PREFERENCES: 'quotes_preferences',
    FAVORITES: 'quotes_favorites',
    HISTORY: 'quotes_history'
  };

  async savePreferences(prefs: UserPreferences): Promise<void> {
    const json = JSON.stringify(prefs);
    localStorage.setItem(this.STORAGE_KEYS.PREFERENCES, json);
  }

  async loadPreferences(): Promise<UserPreferences | null> {
    const json = localStorage.getItem(this.STORAGE_KEYS.PREFERENCES);
    if (!json) return null;
    
    const obj = JSON.parse(json);
    return this.deserializePreferences(obj);
  }

  private deserializePreferences(obj: any): UserPreferences {
    return {
      ...obj,
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt),
      syncState: obj.syncState ? {
        ...obj.syncState,
        lastSyncAt: obj.syncState.lastSyncAt ? new Date(obj.syncState.lastSyncAt) : null
      } : null
    };
  }
}
```

### Mobile (React Native) - AsyncStorage

```typescript
// quotes-native/src/services/storage/native-storage.service.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '@quotes/shared-modules';

export class NativeStorageService {
  private readonly STORAGE_KEYS = {
    PREFERENCES: '@quotes/preferences',
    FAVORITES: '@quotes/favorites',
    HISTORY: '@quotes/history'
  };

  async savePreferences(prefs: UserPreferences): Promise<void> {
    const json = JSON.stringify(prefs);
    await AsyncStorage.setItem(this.STORAGE_KEYS.PREFERENCES, json);
  }

  async loadPreferences(): Promise<UserPreferences | null> {
    const json = await AsyncStorage.getItem(this.STORAGE_KEYS.PREFERENCES);
    if (!json) return null;
    
    const obj = JSON.parse(json);
    return this.deserializePreferences(obj);
  }

  private deserializePreferences(obj: any): UserPreferences {
    return {
      ...obj,
      createdAt: new Date(obj.createdAt),
      updatedAt: new Date(obj.updatedAt),
      syncState: obj.syncState ? {
        ...obj.syncState,
        lastSyncAt: obj.syncState.lastSyncAt ? new Date(obj.syncState.lastSyncAt) : null
      } : null
    };
  }
}
```

### Wearables - UserDefaults (iOS) / SharedPreferences (Android)

```swift
// quotes-native/ios/QuotesWatch Extension/WatchStorageService.swift

import Foundation

class WatchStorageService {
    static let shared = WatchStorageService()
    private let userDefaults = UserDefaults.standard
    
    private enum Keys {
        static let syncedQuotes = "synced_quotes"
        static let preferences = "watch_preferences"
    }
    
    func saveSyncedQuotes(_ quotes: [Quote]) {
        let encoder = JSONEncoder()
        if let data = try? encoder.encode(quotes) {
            userDefaults.set(data, forKey: Keys.syncedQuotes)
        }
    }
    
    func loadSyncedQuotes() -> [Quote]? {
        guard let data = userDefaults.data(forKey: Keys.syncedQuotes) else {
            return nil
        }
        let decoder = JSONDecoder()
        return try? decoder.decode([Quote].self, from: data)
    }
}
```

---

## Firebase Integration (V3+ Design)

### Firestore Data Structure

```typescript
// quotes-platform/src/app/core/services/firebase/firestore.service.ts (Future)

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { Quote, UserPreferences } from '@quotes/shared-modules';

/**
 * Firestore collections structure (V3+)
 */
export const FIRESTORE_COLLECTIONS = {
  QUOTES: 'quotes',           // Global quotes collection (read-only)
  USERS: 'users',             // User profiles
  PREFERENCES: 'preferences', // User preferences subcollection
  FAVORITES: 'favorites'      // User favorites subcollection
};

/**
 * Firestore path: /users/{userId}/preferences/{deviceId}
 */
export async function savePreferencesToFirestore(
  userId: string,
  deviceId: string,
  prefs: UserPreferences
): Promise<void> {
  const db = getFirestore();
  const prefRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId, FIRESTORE_COLLECTIONS.PREFERENCES, deviceId);
  
  await setDoc(prefRef, {
    ...prefs,
    updatedAt: new Date() // Firestore server timestamp
  });
}

/**
 * Firestore path: /users/{userId}/favorites
 */
export async function saveFavoritesToFirestore(
  userId: string,
  favorites: string[]
): Promise<void> {
  const db = getFirestore();
  const favRef = doc(db, FIRESTORE_COLLECTIONS.USERS, userId, FIRESTORE_COLLECTIONS.FAVORITES, 'all');
  
  await setDoc(favRef, {
    quoteIds: favorites,
    updatedAt: new Date()
  });
}
```

---

## Validation Rules

### Quote Validation

```typescript
// shared-modules/models/validators/quote.validator.ts

import { Quote, QuoteType, Language } from '../quote.model';

export interface QuoteValidationError {
  field: keyof Quote;
  message: string;
}

export function validateQuote(quote: Quote): QuoteValidationError[] {
  const errors: QuoteValidationError[] = [];

  // Content validation
  if (!quote.content || quote.content.trim().length === 0) {
    errors.push({ field: 'content', message: 'Content is required' });
  }
  if (quote.content.length > 5000) {
    errors.push({ field: 'content', message: 'Content exceeds 5000 characters' });
  }

  // Author validation
  if (!quote.author || quote.author.trim().length === 0) {
    errors.push({ field: 'author', message: 'Author is required' });
  }

  // Type validation
  if (!Object.values(QuoteType).includes(quote.type)) {
    errors.push({ field: 'type', message: 'Invalid quote type' });
  }

  // Category validation
  if (!quote.category || quote.category.trim().length === 0) {
    errors.push({ field: 'category', message: 'Category is required' });
  }

  // Tags validation
  if (!Array.isArray(quote.tags)) {
    errors.push({ field: 'tags', message: 'Tags must be an array' });
  }

  // Language validation
  if (!Object.values(Language).includes(quote.language)) {
    errors.push({ field: 'language', message: 'Invalid language' });
  }

  return errors;
}
```

---

## Migration Strategy

### Phase 2 (Current): Local Storage Only

- All data models defined in `shared-modules/models/`
- Platform-specific storage services implement `StorageService` interface
- No cloud sync, no user authentication
- UserPreferences include `syncState: null` (placeholder for V3+)

### V3+ (Future): Firebase Integration

1. Add Firebase SDK dependencies (web, mobile, desktop)
2. Implement `FirestoreStorageService` extending `StorageService`
3. Add user authentication (Firebase Auth)
4. Enable cloud sync toggle in UserPreferences
5. Implement conflict resolution strategy (last-write-wins or manual review)
6. Migrate existing local data to Firestore on first sync

**Migration Path**:
```typescript
// Pseudo-code for V3+ migration
export async function migrateLocalToFirestore(userId: string): Promise<void> {
  // 1. Load local preferences
  const localPrefs = await localStorageService.loadPreferences();
  
  // 2. Upload to Firestore
  await firestoreService.savePreferences(userId, localPrefs);
  
  // 3. Enable sync
  localPrefs.syncState = {
    lastSyncAt: new Date(),
    deviceId: getDeviceId(),
    syncEnabled: true,
    conflictCount: 0
  };
  
  // 4. Update local preferences
  await localStorageService.savePreferences(localPrefs);
}
```

---

## Summary

### Entities

- **Quote**: Buddhist wisdom content with metadata, shared across all platforms
- **Category**: Thematic grouping for filtering and browsing
- **UserPreferences**: User settings and personalization (local per device, future cloud sync)
- **SyncState**: Cloud sync tracking (deferred to V3+, Firebase-compatible design)

### Shared Code

All models defined in `shared-modules/models/` and imported by:
- `quotes-platform` (Angular web app)
- `quotes-native` (React Native mobile/desktop/wearables)

### Storage Strategy

- **Web**: localStorage (simple) + IndexedDB (structured)
- **Mobile**: AsyncStorage (Expo managed) → MMKV (bare workflow)
- **Desktop**: UserDefaults (macOS), LocalSettings (Windows)
- **Wearables**: UserDefaults (iOS), SharedPreferences (Android)
- **V3+**: Firebase Firestore with offline persistence

### Type Safety

- TypeScript strict mode throughout
- Runtime validation via type guards (`isQuote`, `isUserPreferences`)
- Validation functions for business rules (`validateQuote`)
