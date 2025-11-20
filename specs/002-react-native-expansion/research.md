# Research: Multi-Platform React Native Expansion

**Feature Branch**: `002-react-native-expansion`  
**Created**: 2025-11-20  
**Purpose**: Resolve technical unknowns for React Native multi-platform implementation

## Research Topics

### 1. React Native Platform Support

**Decision**: Use React Native core for iOS/Android, platform-specific extensions for Windows/macOS/wearables

**Rationale**: 
- **React Native Core** (iOS/Android): Mature, well-documented, extensive community support, 70-80% code reuse
- **React Native Windows**: Microsoft-maintained, production-ready, supports Windows 10+, integrates with Windows APIs
- **React Native macOS**: Microsoft-maintained, supports macOS 10.14+, native menu bar and system tray support
- **Wearables**: WatchKit (iOS) and Wear OS Compose (Android) via React Native bridges/modules

**Implementation Strategy**:
- **Mobile (P1)**: React Native 0.73+ with TypeScript, shared components/screens, platform-specific native modules
- **Desktop (P2)**: React Native Windows 0.73+ and React Native macOS 0.73+ with platform-specific system integration
- **Wearables (P3)**: WatchKit extension (Swift) with React Native bridge, Wear OS app (Kotlin/Compose) with React Native modules

**Alternatives Considered**:
- ❌ **Flutter**: Rejected - team has Angular/TypeScript expertise, no code sharing with Angular web app
- ❌ **Native Development (Swift/Kotlin)**: Rejected - 0% code reuse, separate codebases for each platform
- ❌ **React Native Web**: Rejected - keep Angular for web (proven V1), React Native for native platforms only
- ❌ **Xamarin**: Rejected - deprecated by Microsoft in favor of .NET MAUI, limited wearables support
- ✅ **React Native**: Chosen - TypeScript code sharing with Angular, 70-80% code reuse across platforms, mature ecosystem

**Platform-Specific Considerations**:
- **iOS**: Requires macOS for development, Xcode, CocoaPods, Apple Developer account ($99/year)
- **Android**: Cross-platform development (Windows/macOS/Linux), Android Studio, Gradle, Google Play Console ($25 one-time)
- **Windows**: Windows 10+ for development, Visual Studio 2019/2022, NuGet, Microsoft Partner Center (free)
- **macOS**: macOS for development, Xcode, CocoaPods, Mac App Store ($99/year via Apple Developer)
- **Apple Watch**: Bundled with iOS app, WatchKit extension, same Apple Developer account
- **Android Wear**: Bundled with Android app, Wear OS SDK, same Google Play Console

---

### 2. Expo vs Bare Workflow

**Decision**: Start with Expo managed workflow, eject to bare if needed for custom native modules

**Rationale**:
- **Expo Managed Workflow**:
  - ✅ Faster initial setup, over-the-air updates, unified build service (EAS Build)
  - ✅ Includes common modules (Audio, Haptics, FileSystem, SecureStore)
  - ✅ Simplified iOS provisioning and Android keystore management
  - ❌ Limited access to native code, some third-party modules incompatible
  - ❌ Larger app bundle size (~50MB baseline vs ~30MB bare)
- **Bare Workflow**:
  - ✅ Full native code access, all third-party modules compatible
  - ✅ Smaller bundle size, more control over native dependencies
  - ❌ Manual native builds (Xcode, Android Studio), manual provisioning/keystore
  - ❌ No OTA updates without CodePush, more complex CI/CD

**Implementation Strategy**:
1. **Phase 1 (Mobile P1)**: Start with Expo managed workflow for rapid iOS/Android development
2. **Phase 2 (Desktop P2)**: Eject to bare workflow when adding React Native Windows/macOS (not Expo-compatible)
3. **Phase 3 (Wearables P3)**: Bare workflow required for WatchKit/Wear OS native extensions

**Ejection Triggers**:
- Need for React Native Windows or React Native macOS (desktop support)
- Need for custom native modules not available in Expo (wearables integrations)
- Bundle size optimization requirements (if 50MB baseline too large)

**Alternatives Considered**:
- ❌ **Bare Workflow from Start**: Rejected - slower initial setup, no benefit until desktop/wearables phases
- ❌ **Expo + Development Builds**: Considered - allows custom native code but still requires bare workflow for Windows/macOS
- ✅ **Expo → Bare Migration**: Chosen - fast start for mobile, eject when desktop/wearables require native modules

---

### 3. Native Modules for Audio & Haptics

**Decision**: Use Expo Audio + Expo Haptics for managed workflow, migrate to React Native Sound if needed in bare workflow

**Rationale**:
- **Audio Requirements**: Play short notification sounds (<2 seconds) on quote transitions
- **Haptics Requirements**: Gentle pulse/vibration on mobile, haptic feedback on wearables

**Mobile (iOS/Android) - Expo Managed Workflow**:
- **Expo Audio** (`expo-av`):
  - ✅ Expo-compatible, cross-platform (iOS/Android), supports background audio
  - ✅ Simple API: `Audio.Sound.createAsync()`, `sound.playAsync()`
  - ❌ Larger bundle size (includes video player)
- **Expo Haptics** (`expo-haptics`):
  - ✅ Expo-compatible, iOS (Taptic Engine) + Android (Vibrator API)
  - ✅ Predefined patterns: `Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)`

**Mobile (iOS/Android) - Bare Workflow Alternative**:
- **React Native Sound**:
  - ✅ Lightweight, mature library (8+ years), iOS + Android support
  - ✅ Background audio, precise playback control, audio ducking
  - ❌ Requires bare workflow (native linking)
- **React Native Haptic Feedback**:
  - ✅ More haptic options (selection, notification, impact)
  - ❌ Requires bare workflow

**Desktop (Windows/macOS)**:
- **Windows**: Use Windows.Media.Playback API via React Native Windows native module
- **macOS**: Use AVFoundation API via React Native macOS native module
- **No Haptics**: Desktop devices typically don't have haptic feedback hardware

**Wearables**:
- **Apple Watch**: WatchKit Haptic Engine API (6 predefined haptic types: notification, directionUp, directionDown, success, failure, retry)
- **Android Wear**: Vibrator API via WearableVibrator class (custom patterns supported)

**Implementation Strategy**:
1. **Phase 1 (Mobile)**: Use Expo Audio + Expo Haptics for iOS/Android
2. **Phase 2 (Desktop)**: Migrate to bare workflow, add Windows.Media.Playback + AVFoundation native modules
3. **Phase 3 (Wearables)**: Add WatchKit Haptic Engine (iOS) and WearableVibrator (Android) native bridges

**Audio Assets**:
- Format: MP3 (cross-platform compatibility)
- Duration: <2 seconds (notification bell/chime)
- File size: <100KB (minimize bundle size)
- Licensing: Creative Commons or original composition
- Bundle location: `assets/audio/notification.mp3`

**Alternatives Considered**:
- ❌ **React Native Sound from Start**: Rejected - requires bare workflow, no benefit during managed workflow phase
- ❌ **Web Audio API**: Rejected - React Native doesn't support browser APIs
- ❌ **Third-party SDKs**: Rejected - Expo + native platform APIs sufficient for requirements
- ✅ **Expo → Native APIs**: Chosen - start simple with Expo, migrate to platform-native when needed

---

### 4. Wearables SDK Integration

**Decision**: Use native WatchKit (iOS) and Wear OS Compose (Android) with React Native bridges

**Rationale**:
- React Native doesn't natively support wearables (no official watchOS/Wear OS support)
- Wearables require platform-specific UX patterns (complications, glances, force touch)
- Native development is the standard approach for watch apps

**Apple Watch Strategy**:
- **WatchKit Extension**: Swift app that runs alongside iOS app
- **React Native Bridge**: Shared data layer via `react-native-watch-connectivity`
- **Architecture**:
  1. iOS app (React Native) syncs 50 quotes to UserDefaults via App Groups
  2. WatchKit extension (Swift) reads from shared UserDefaults
  3. Watch app displays quotes, handles complications, sends events to iOS app
- **Complications**: Modular, Graphic Corner, Graphic Circular (display current quote)
- **Standalone Mode**: Watch app functions offline with synced quotes (no phone required)
- **Navigation**: Digital Crown scroll through quotes, force touch for menu

**Android Wear Strategy**:
- **Wear OS App**: Kotlin + Jetpack Compose for Wear OS
- **React Native Bridge**: Shared data layer via `react-native-watch-connectivity` (Android extension)
- **Architecture**:
  1. Android app (React Native) syncs 50 quotes to SharedPreferences
  2. Wear OS app (Kotlin) reads from SharedPreferences via Wearable Data Layer API
  3. Watch app displays quotes, handles tiles, sends events to Android app
- **Tiles**: Quote of the day tile, timer controls tile
- **Standalone Mode**: Watch app functions offline with synced quotes
- **Navigation**: Rotary input (bezel) scroll through quotes, long press for menu

**Data Synchronization**:
- **Sync Mechanism**: Manual sync triggered by user in phone app
- **Sync Payload**: 50 quotes (~25KB JSON) transferred to watch storage
- **Sync Frequency**: On-demand (user initiates), future: daily auto-sync when paired
- **Conflict Resolution**: Phone app is source of truth (one-way sync: phone → watch)

**Battery Optimization**:
- Haptic feedback only (no audio on watch to preserve battery)
- Reduce haptic intensity at 20% battery
- Disable auto-rotation at 10% battery
- Manual navigation always available

**Implementation Strategy**:
1. **Phase 1 (Mobile)**: Build iOS/Android apps with placeholder watch sync UI
2. **Phase 2 (Desktop)**: Skip (no wearables on desktop)
3. **Phase 3 (Wearables)**: Build WatchKit extension + Wear OS app, integrate watch connectivity

**Development Tools**:
- **Apple Watch**: Xcode, watchOS Simulator, watchOS 6+ target
- **Android Wear**: Android Studio, Wear OS Emulator, Wear OS 2+ target
- **Testing**: Physical devices recommended (simulators don't support all haptic feedback)

**Alternatives Considered**:
- ❌ **Flutter for Wearables**: Rejected - no code sharing with React Native, limited watchOS support
- ❌ **Third-party Frameworks**: Rejected - WatchKit and Wear OS are platform standards
- ❌ **Web-based Watch Apps**: Rejected - not supported on Apple Watch or Wear OS
- ✅ **Native + React Native Bridges**: Chosen - industry standard, full platform capabilities

---

### 5. Code Sharing Strategies

**Decision**: Monorepo with shared TypeScript business logic, platform-specific UI implementations

**Rationale**:
- Angular (web) and React Native (native) can share business logic but not UI code
- TypeScript enables type-safe sharing of models, services, utilities
- Monorepo simplifies dependency management and versioning

**Monorepo Structure**:
```
Quotes/
├── quotes-platform/          # Angular web app (existing)
│   ├── src/app/
│   │   ├── core/
│   │   │   ├── models/      # Angular-specific models (import from shared)
│   │   │   └── services/    # Angular services (use shared business logic)
│   │   └── features/        # Angular components (platform-specific UI)
├── quotes-native/            # React Native native app (NEW)
│   ├── src/
│   │   ├── shared/          # React Native-specific shared code
│   │   ├── components/      # React Native components (platform-specific UI)
│   │   ├── screens/         # Screen components (navigation)
│   │   └── services/        # React Native services (use shared business logic)
├── shared-modules/           # Shared TypeScript business logic (NEW)
│   ├── models/              # Data models (Quote, Category, UserPreferences)
│   ├── services/            # Business logic (SearchService, RotationService)
│   ├── utils/               # Utilities (text processing, date formatting)
│   └── __tests__/           # Jest tests for shared modules
└── package.json             # Workspace root
```

**Shared Business Logic** (TypeScript in `shared-modules/`):
- **Data Models**: `Quote`, `Proverb`, `CaDao`, `Category`, `UserPreferences` interfaces
- **Search Service**: Full-text search, fuzzy matching, category filtering algorithms
- **Rotation Service**: Random selection, prevent immediate repeats, timer management logic
- **Text Utilities**: Vietnamese text normalization (NFC), diacritic handling
- **Constants**: Design tokens (colors, spacing, typography), configuration values

**Platform-Specific UI** (NOT shared):
- **Angular**: Angular components, templates, SCSS, Angular Router
- **React Native**: React Native components, JSX, StyleSheet, React Navigation
- **Design System**: Shared design tokens (JSON), platform-specific implementations

**Monorepo Tool**:
- **Yarn Workspaces**: Lightweight, no additional tooling, sufficient for 3 packages
- **Package Structure**:
  ```json
  // package.json (root)
  {
    "private": true,
    "workspaces": [
      "quotes-platform",
      "quotes-native",
      "shared-modules"
    ]
  }
  ```

**Import Pattern**:
```typescript
// quotes-platform (Angular)
import { Quote, SearchService } from '@quotes/shared-modules';

// quotes-native (React Native)
import { Quote, SearchService } from '@quotes/shared-modules';
```

**Testing Shared Modules**:
- **Tool**: Jest with TypeScript support
- **Location**: `shared-modules/__tests__/`
- **Run**: `yarn workspace @quotes/shared-modules test`
- **Coverage**: 100% coverage for business logic (search, rotation, text processing)

**Alternatives Considered**:
- ❌ **Git Submodules**: Rejected - complex versioning, extra repo overhead
- ❌ **NPM Packages**: Rejected - overkill for internal code sharing, publish/version overhead
- ❌ **Lerna**: Rejected - feature set too large for simple 3-package monorepo
- ❌ **Nx**: Rejected - enterprise complexity not needed for this project size
- ✅ **Yarn Workspaces**: Chosen - simple, lightweight, built-in, sufficient for needs

---

### 6. Platform-Specific Storage

**Decision**: Use platform-appropriate storage solutions with consistent API abstraction layer

**Rationale**:
- Each platform has different storage APIs and capabilities
- Need consistent interface for shared business logic
- Must support future Firebase integration (V3+)

**Web (Angular) - Existing**:
- **localStorage**: Simple key-value pairs (user preferences, timer settings)
- **IndexedDB**: Structured data, offline quote caching, search indices
- **Service Workers**: Cache JSON quote files for offline access
- **Capacity**: 5-10MB typical limit (sufficient for 500K quotes ~5MB JSON)

**Mobile (iOS/Android) - React Native**:
- **AsyncStorage**: Simple key-value pairs (Expo-compatible)
  - ✅ Built-in, cross-platform, 6MB limit on Android (sufficient)
  - ❌ Slow for large datasets, deprecated in favor of MMKV/SQLite
- **MMKV**: High-performance key-value storage (bare workflow)
  - ✅ 10x faster than AsyncStorage, encryption support, unlimited capacity
  - ❌ Requires bare workflow, native module linking
- **SQLite**: Relational database for structured data
  - ✅ Full SQL queries, millions of records, proven for large datasets
  - ❌ Overkill for simple key-value needs, requires bare workflow

**Desktop (Windows/macOS)**:
- **Windows**: LocalSettings API via React Native Windows native module
- **macOS**: UserDefaults API via React Native macOS native module
- **Capacity**: Unlimited (desktop storage constraints negligible)

**Wearables**:
- **Apple Watch**: UserDefaults (shared with iOS app via App Groups)
- **Android Wear**: SharedPreferences (synced with Android app via Wearable Data Layer API)
- **Capacity**: 50 quotes (~25KB) easily fits within watch storage limits

**Storage Abstraction Layer**:
```typescript
// shared-modules/services/storage.service.ts
export interface StorageService {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
}

// quotes-platform (Angular)
export class WebStorageService implements StorageService {
  async getItem(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }
  // ... other methods
}

// quotes-native (React Native)
export class NativeStorageService implements StorageService {
  async getItem(key: string): Promise<string | null> {
    return AsyncStorage.getItem(key);
  }
  // ... other methods
}
```

**Implementation Strategy**:
1. **Phase 1 (Mobile)**: Use AsyncStorage for simple needs (preferences, timer settings)
2. **Phase 2 (Desktop)**: Add UserDefaults (macOS) and LocalSettings (Windows) implementations
3. **Phase 3 (Wearables)**: Add watch-specific storage with phone app sync
4. **Future (V3+)**: Add Firebase Firestore integration layer with offline persistence

**Firebase Compatibility Design**:
- Abstract all storage behind `StorageService` interface
- Data models include `id`, `createdAt`, `updatedAt` fields (Firestore-compatible)
- Sync state tracked in `SyncState` entity (timestamp, device ID, conflict resolution)
- Local-first strategy: All operations work offline, sync to Firebase when online

**Alternatives Considered**:
- ❌ **AsyncStorage Only**: Rejected - deprecated, performance issues with large datasets
- ❌ **SQLite Only**: Rejected - overkill for simple key-value storage needs
- ❌ **Realm**: Rejected - heavy dependency, sync requires Realm Cloud subscription
- ✅ **Platform-Native + Abstraction Layer**: Chosen - optimal performance, future-proof for Firebase

---

### 7. Vietnamese Text Handling & Search Optimization

**Decision**: Use Unicode NFC normalization + full-text search with diacritic-insensitive matching

**Rationale**:
- Vietnamese uses diacritics (tone marks) that have multiple Unicode representations
- Users may search with or without diacritics ("Thích Nhất Hạnh" vs "Thich Nhat Hanh")
- Need consistent rendering across all platforms (web, mobile, desktop, wearables)

**Unicode Normalization**:
- **Problem**: Vietnamese diacritics can be represented as:
  - Precomposed characters (NFC): `é` = single Unicode codepoint U+00E9
  - Decomposed characters (NFD): `é` = base `e` U+0065 + combining acute accent U+0301
- **Solution**: Normalize all text to NFC (Canonical Composition) for consistent storage and comparison
- **Implementation**: Apply `text.normalize('NFC')` on JSON import and search queries

**Search Strategy**:
```typescript
// shared-modules/services/search.service.ts
export class SearchService {
  private removeDiacritics(text: string): string {
    return text
      .normalize('NFD') // Decompose to base + combining marks
      .replace(/[\u0300-\u036f]/g, ''); // Remove combining marks
  }

  search(quotes: Quote[], query: string): Quote[] {
    const normalizedQuery = this.removeDiacritics(query.toLowerCase());
    
    return quotes.filter(quote => {
      const searchableText = [
        quote.content,
        quote.author,
        quote.category,
        ...quote.tags
      ].join(' ');
      
      const normalizedText = this.removeDiacritics(searchableText.toLowerCase());
      return normalizedText.includes(normalizedQuery);
    });
  }
}
```

**Performance Optimization**:
- **Pre-indexed Search**: Build search index during JSON load (map: normalized text → quote IDs)
- **Chunked Processing**: Split large datasets into chunks (10K quotes per chunk)
- **Background Processing**: 
  - Web: Use Web Workers for search indexing
  - Native: Use `react-native-background-task` or platform-specific background threads

**Platform-Specific Rendering**:
- **Web**: UTF-8 meta tag, NFC normalization in Angular services
- **Mobile**: React Native handles UTF-8 natively, NFC normalization in JavaScript
- **Desktop**: Same as mobile (React Native Windows/macOS)
- **Wearables**: Limited display space, test NFC rendering on physical devices

**Font Selection**:
- **Web**: System fonts with Vietnamese support (Roboto, San Francisco, Segoe UI)
- **Mobile**: Platform default fonts (San Francisco on iOS, Roboto on Android)
- **Desktop**: System fonts (Segoe UI on Windows, San Francisco on macOS)
- **Wearables**: System fonts (SF Compact on Apple Watch, Roboto on Wear OS)

**Testing Vietnamese Text**:
- Test queries: "Thích Nhất Hạnh", "Thich Nhat Hanh", "thich nhat hanh" (all match)
- Test diacritics: "ă", "â", "đ", "ê", "ô", "ơ", "ư" (all 7 Vietnamese-specific characters)
- Test tone marks: acute (á), grave (à), hook above (ả), tilde (ã), dot below (ạ)
- Verify rendering on physical devices (simulators may not match real device fonts)

**Alternatives Considered**:
- ❌ **Exact Match Only**: Rejected - users expect flexible search (with/without diacritics)
- ❌ **Elasticsearch/Algolia**: Rejected - requires backend, violates static architecture
- ❌ **Third-party Search Libraries**: Rejected - client-side search sufficient for 500K records
- ✅ **NFC Normalization + Diacritic Removal**: Chosen - handles all Vietnamese text requirements, performant

---

### 8. Background Operation Support (Mobile)

**Decision**: Optional background auto-rotation with user permission, default pause/resume behavior

**Rationale**:
- Users want quotes to continue rotating when app is backgrounded (during meditation, commute)
- Background operation requires special permissions and increases battery drain
- Must balance user experience with battery efficiency

**Default Behavior (No Permission)**:
- **Foreground**: Auto-rotation active, audio + haptic feedback on transitions
- **Background**: Auto-rotation paused, timer stopped
- **Foreground Return**: Auto-rotation resumes, timer restarts from current quote
- **Battery Impact**: ~0% (app inactive in background)

**Optional Background Mode (With Permission)**:
- **Foreground**: Same as default
- **Background**: Auto-rotation continues, audio notifications play, haptic feedback disabled
- **Background Return**: Auto-rotation continues seamlessly
- **Battery Impact**: ~5-10% per hour (audio playback, timer operations)
- **Permission Required**: 
  - iOS: `UIBackgroundModes` → `audio` capability in Info.plist
  - Android: `FOREGROUND_SERVICE` permission + notification (required by Android 8+)

**Implementation Strategy**:
```typescript
// quotes-native/src/services/background.service.ts
export class BackgroundService {
  async requestBackgroundPermission(): Promise<boolean> {
    if (Platform.OS === 'ios') {
      // iOS: Request background audio permission
      const status = await Audio.requestPermissionsAsync();
      return status.granted;
    } else {
      // Android: Request foreground service permission
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.FOREGROUND_SERVICE
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
  }

  startBackgroundRotation(interval: number) {
    if (Platform.OS === 'ios') {
      // iOS: Use background audio session
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true
      });
    } else {
      // Android: Start foreground service with notification
      BackgroundService.start(veryIntensiveTask, options);
    }
  }
}
```

**User Education**:
- Settings screen explains battery impact before enabling background mode
- Permission dialog clearly states "Allow background audio for quote rotation"
- Settings screen shows battery usage estimate (~5-10% per hour)
- Users can disable background mode anytime (reverts to pause/resume behavior)

**Android Foreground Service Notification**:
- **Title**: "Quotes Rotation Active"
- **Message**: "Displaying Buddhist wisdom quotes"
- **Icon**: App icon
- **Actions**: Pause, Next Quote, Stop
- **Required**: Android 8+ requires persistent notification for foreground services

**iOS Background Audio Session**:
- **Category**: `AVAudioSessionCategoryPlayback`
- **Mode**: `AVAudioSessionModeDefault`
- **Options**: `AVAudioSessionCategoryOptionMixWithOthers` (don't interrupt other audio)

**Testing Background Operation**:
- Test app backgrounding (swipe up, home button)
- Test audio playback continues in background (iOS)
- Test foreground service notification appears (Android)
- Test battery drain measurement (1-hour test with background rotation)
- Test app termination (force quit) stops background rotation

**Alternatives Considered**:
- ❌ **Background Only (No Permission)**: Rejected - impossible on iOS, violates Android guidelines
- ❌ **Always-On Background**: Rejected - excessive battery drain, poor user experience
- ❌ **Silent Notifications**: Rejected - iOS limits background fetch to 15-minute intervals
- ✅ **Optional Background Mode**: Chosen - balances user control, battery efficiency, platform guidelines

---

## Research Summary

### Key Decisions

1. **Platform Strategy**: React Native core (iOS/Android), React Native Windows/macOS (desktop), native WatchKit/Wear OS (wearables)
2. **Development Workflow**: Start with Expo managed (mobile), eject to bare for desktop/wearables
3. **Audio/Haptics**: Expo Audio + Expo Haptics (managed), migrate to native APIs (bare)
4. **Wearables**: Native WatchKit (iOS) + Wear OS Compose (Android) with React Native bridges
5. **Code Sharing**: Yarn Workspaces monorepo with shared TypeScript business logic
6. **Storage**: Platform-native storage (AsyncStorage, MMKV, SQLite) with abstraction layer
7. **Vietnamese Text**: Unicode NFC normalization + diacritic-insensitive search
8. **Background Operation**: Optional background rotation with user permission, default pause/resume

### Technology Stack

**Mobile (iOS/Android - P1)**:
- React Native 0.73+ with TypeScript 5.x
- Expo SDK 50+ (managed workflow)
- React Navigation 6+
- Expo Audio + Expo Haptics
- AsyncStorage (simple storage)
- Jest + React Native Testing Library

**Desktop (Windows/macOS - P2)**:
- React Native Windows 0.73+
- React Native macOS 0.73+
- Bare workflow (ejected from Expo)
- Native audio APIs (Windows.Media.Playback, AVFoundation)
- UserDefaults (macOS), LocalSettings (Windows)

**Wearables (watchOS/Wear OS - P3)**:
- WatchKit (Swift) for Apple Watch
- Wear OS Compose (Kotlin) for Android Wear
- React Native Watch Connectivity bridge
- Native haptic APIs (WatchKit Haptic Engine, WearableVibrator)

**Shared Business Logic**:
- TypeScript 5.x with strict mode
- Yarn Workspaces monorepo
- Jest for unit testing
- ESLint + Prettier

### Implementation Risks

| Risk | Mitigation Strategy |
|------|---------------------|
| Expo → Bare migration complexity | Start mobile-only in Expo, plan migration for desktop phase |
| Wearables native bridge complexity | Use proven libraries (react-native-watch-connectivity), allocate extra time |
| Vietnamese text rendering on wearables | Test on physical devices early, adjust font sizing if needed |
| Background operation battery drain | Make it optional, educate users on battery impact, provide disable option |
| App store approval delays | Follow platform guidelines strictly, allow 2 weeks for approval |
| Monorepo dependency conflicts | Use Yarn Workspaces, maintain consistent versions across packages |

### Next Steps (Phase 1)

1. Generate `data-model.md` with shared TypeScript entities
2. Generate `contracts/` with service interfaces
3. Generate `quickstart.md` with React Native setup instructions
4. Update agent context with React Native technologies
5. Generate complete `plan.md` with implementation phases
