# Implementation Plan: Multi-Platform React Native Expansion

**Branch**: `002-react-native-expansion` | **Date**: 2025-11-20 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/002-react-native-expansion/spec.md`

## Summary

Expand Buddhist quotes platform from Angular web-only to multi-platform ecosystem using React Native for native platforms (iOS, Android, Windows, macOS, Apple Watch, Android Wear). Keep existing Angular web app (quotes-platform/) and create NEW React Native app (quotes-native/) with shared TypeScript business logic via monorepo (shared-modules/). Implementation follows constitution v3.0.0 multi-platform architecture principles with phased rollout: Mobile (P1) → Desktop (P2) → Wearables (P3).

**Technical Approach** (from research.md):
- React Native 0.73+ for iOS/Android/Windows/macOS
- Expo managed workflow (mobile P1) → Bare workflow (desktop P2, wearables P3)
- Native WatchKit (iOS) + Wear OS Compose (Android) for wearables
- Yarn Workspaces monorepo for code sharing
- Platform-specific storage with abstraction layer
- Unicode NFC normalization for Vietnamese text

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), React Native 0.73+, Expo SDK 50+  
**Primary Dependencies**:
  - React Native 0.73+ with TypeScript
  - Expo SDK 50+ (managed workflow Phase 1)
  - React Navigation 6+ (navigation)
  - Expo Audio + Expo Haptics (audio/haptic feedback)
  - AsyncStorage → MMKV (storage migration in bare workflow)
  - React Native Windows 0.73+ (desktop Windows)
  - React Native macOS 0.73+ (desktop macOS)
  - WatchKit (Swift) + Wear OS Compose (Kotlin) for wearables

**Shared Business Logic** (shared-modules/):
  - Data models: Quote, Category, UserPreferences interfaces
  - Services: SearchService, RotationService, TextService
  - Utilities: Vietnamese text processing (NFC normalization)

**Storage**:
  - Mobile: AsyncStorage (Expo managed) → MMKV (bare workflow)
  - Desktop: UserDefaults (macOS), LocalSettings (Windows)
  - Wearables: 50 quotes synced via App Groups (iOS) / Wearable Data Layer (Android)
  - Web: Unchanged (localStorage + IndexedDB)

**Testing**:
  - Shared modules: Jest with TypeScript
  - Mobile: Jest + React Native Testing Library (unit), Detox (e2e optional)
  - Platform-specific: Manual testing on physical devices (haptic/audio validation)

**Target Platforms**:
  - Phase 1 (P1): iOS 13+, Android 6.0+ (API 23+)
  - Phase 2 (P2): Windows 10+, macOS 10.14+
  - Phase 3 (P3): watchOS 6+, Wear OS 2+
  - Web: Unchanged (Angular, modern browsers)

**Project Type**: Monorepo with 3 packages:
  1. `quotes-platform/` - Angular web app (existing, no changes)
  2. `quotes-native/` - React Native native app (NEW)
  3. `shared-modules/` - Shared TypeScript business logic (NEW)

**Performance Goals**:
  - Mobile: <2s app launch, 60fps animations, <50MB app size
  - Desktop: <1s launch, efficient CPU/memory, <100MB installed
  - Wearables: <500ms complication update, <1% battery per hour
  - Search: <1s response time across all platforms

**Constraints**:
  - No backend server (static/bundled JSON only)
  - Offline-first (all platforms function without internet after setup)
  - Platform-specific UI (React Native components, no code sharing with Angular)
  - Shared business logic only (models, services, utilities)
  - App store guidelines compliance (iOS, Android, Windows, macOS)
  - Vietnamese text UTF-8 with diacritics (NFC normalization)
  - Battery efficiency on wearables (<1% per hour)
  - Background operation opt-in (mobile), user permission required

**Scale/Scope**:
  - 500K+ Buddhist quotes (target future scale)
  - Initial: ~5-10K quotes bundled with mobile/desktop apps
  - Wearables: 50 quotes synced from phone app
  - Multi-platform: 6 platforms (iOS, Android, Windows, macOS, watchOS, Wear OS)
  - Phased rollout: Mobile (P1) → Desktop (P2) → Wearables (P3)

## Constitution Check

✅ **Shared Static JSON Data Architecture**: Uses static JSON bundled with apps. Platform-specific caching (AsyncStorage mobile, UserDefaults macOS, LocalSettings Windows, paired device sync wearables). Performance optimizations via indexed search. Content taxonomy supports all types. UTF-8 NFC normalization for Vietnamese.

✅ **Web Platform with Angular**: Angular web app unchanged (quotes-platform/). TypeScript strict mode. PWA offline support. GitHub Pages deployment retained.

✅ **Native Platforms with React Native**: React Native 0.73+ for iOS/Android/Windows/macOS. TypeScript throughout. Expo managed (P1) → bare workflow (P2/P3). Platform-specific code paths via Platform.OS. Wearables use native WatchKit/Wear OS with RN bridges.

✅ **Buddhist-Inspired UX Across All Platforms**: Consistent design system (shared tokens). Platform-specific adaptations (native gestures mobile, menu bar desktop, complications wearables). Offline-first all platforms. Audio (mobile/desktop) + haptic (mobile/wearables) feedback. Vietnamese text NFC rendering.

✅ **Performance at Scale**: Platform-specific targets defined (see above). Sub-second search via indexed search service. Bundle sizes within limits (mobile <50MB, desktop <100MB, wearables <10MB). Background operation optional (user permission). Battery-aware features (reduce haptic at 20%, disable auto-rotation at 10%).

✅ **Simplicity**: Minimal dependencies per platform. Expo simplifies mobile (P1), bare workflow only when needed (P2/P3). Platform-native APIs preferred (Audio, Haptics, Storage). Code sharing clear (business logic only, UI platform-specific). Avoiding over-engineering (no GraphQL, no complex state management beyond Context/Hooks).

✅ **Multi-Platform Architecture**: React Native core (iOS/Android), RN Windows/macOS (desktop), native WatchKit/Wear OS (wearables). Monorepo (Yarn Workspaces). Platform-specific features documented (widgets mobile, menu bar desktop, complications wearables).

✅ **Code Sharing Strategy**: Shared TypeScript modules (models, services, utils) in shared-modules/. Platform-specific UI (Angular web, React Native native). Testing strategy (Jest for shared, RN Testing Library for native). Abstraction layer (IStorageService, IAudioService, IHapticService).

✅ **BDD Testing**: Acceptance criteria in spec.md use Given-When-Then format. Platform-appropriate tools (Detox for mobile, manual for wearables). Feature files structure optional (focus on manual testing for P1).

**Violations Requiring Justification**: None - all principles satisfied.

## Project Structure

### Documentation (this feature)

```text
specs/002-react-native-expansion/
├── spec.md              # Feature specification (user stories, requirements)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0 research (React Native platforms, Expo vs bare, etc.)
├── data-model.md        # Phase 1 data models (Quote, Category, UserPreferences)
├── quickstart.md        # Phase 1 quickstart (development environment setup)
└── contracts/           # Phase 1 service interfaces
    ├── README.md
    ├── storage-service.contract.md
    ├── search-service.contract.md
    ├── rotation-service.contract.md
    ├── audio-service.contract.md
    └── haptic-service.contract.md
```

### Source Code (repository root)

```text
Quotes/                              # Monorepo root
├── package.json                     # Yarn Workspaces configuration
├── .gitignore
├── README.md
├── DEPLOYMENT.md
│
├── quotes-platform/                 # Angular web app (EXISTING, unchanged)
│   ├── package.json
│   ├── angular.json
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/               # Services, models, guards
│   │   │   ├── features/           # Quote display, grid, controls
│   │   │   └── shared/             # Shared components (quote-card)
│   │   └── styles/
│   └── public/
│       └── data/
│           └── quotes.json         # Static JSON data
│
├── quotes-native/                   # React Native native app (NEW)
│   ├── package.json                # RN dependencies
│   ├── app.json                    # Expo configuration
│   ├── tsconfig.json               # TypeScript config
│   ├── metro.config.js             # Metro bundler config
│   ├── babel.config.js             # Babel transpiler config
│   ├── src/
│   │   ├── App.tsx                 # Root component
│   │   ├── components/             # Shared RN components
│   │   │   ├── QuoteCard.tsx      # Quote card component
│   │   │   ├── QuoteGrid.tsx      # Quote grid (FlatList)
│   │   │   └── RotationControls.tsx
│   │   ├── screens/                # Screen components
│   │   │   ├── HomeScreen.tsx     # Main quotes screen
│   │   │   ├── SearchScreen.tsx   # Search interface
│   │   │   ├── SettingsScreen.tsx # User preferences
│   │   │   └── FavoritesScreen.tsx
│   │   ├── navigation/             # React Navigation
│   │   │   ├── AppNavigator.tsx   # Root navigator
│   │   │   └── types.ts           # Navigation types
│   │   ├── services/               # Platform-specific services
│   │   │   ├── storage/
│   │   │   │   └── NativeStorageService.ts
│   │   │   ├── audio/
│   │   │   │   └── NativeAudioService.ts
│   │   │   ├── haptic/
│   │   │   │   └── HapticService.ts
│   │   │   └── background/
│   │   │       └── BackgroundService.ts
│   │   ├── hooks/                  # React hooks
│   │   │   ├── useQuotes.ts
│   │   │   ├── useRotation.ts
│   │   │   └── usePreferences.ts
│   │   └── constants/
│   │       ├── Colors.ts           # Design tokens
│   │       └── Config.ts
│   ├── assets/
│   │   ├── audio/
│   │   │   └── notification.mp3   # Audio notification
│   │   ├── data/
│   │   │   └── quotes.json        # Bundled quotes
│   │   └── images/
│   ├── ios/                        # Native iOS project (bare workflow P2+)
│   │   ├── QuotesNative.xcworkspace
│   │   ├── QuotesNative/
│   │   └── Podfile
│   ├── android/                    # Native Android project (bare workflow P2+)
│   │   ├── app/
│   │   │   ├── src/main/
│   │   │   └── build.gradle
│   │   └── build.gradle
│   ├── windows/                    # React Native Windows (P2)
│   │   └── QuotesNative.sln
│   ├── macos/                      # React Native macOS (P2)
│   │   └── QuotesNative.xcworkspace
│   └── __tests__/                  # Jest tests
│       ├── components/
│       └── services/
│
└── shared-modules/                  # Shared TypeScript business logic (NEW)
    ├── package.json                # Shared dependencies
    ├── tsconfig.json               # TypeScript config
    ├── src/
    │   ├── index.ts                # Public API exports
    │   ├── models/                 # Data models
    │   │   ├── quote.model.ts     # Quote, QuoteType, Language
    │   │   ├── category.model.ts  # Category
    │   │   ├── user-preferences.model.ts
    │   │   └── sync-state.model.ts
    │   ├── services/               # Business logic services
    │   │   ├── storage.service.ts # IStorageService interface
    │   │   ├── search.service.ts  # SearchService
    │   │   ├── rotation.service.ts
    │   │   ├── audio.service.ts   # IAudioService interface
    │   │   └── haptic.service.ts  # IHapticService interface
    │   └── utils/                  # Utility functions
    │       ├── text-utils.ts      # Vietnamese text processing
    │       ├── date-utils.ts
    │       └── uuid.ts
    ├── dist/                       # Compiled TypeScript output
    └── __tests__/                  # Jest tests
        ├── services/
        └── utils/
```

**Structure Decision**: Monorepo with 3 packages (quotes-platform, quotes-native, shared-modules) using Yarn Workspaces. Angular web app unchanged. React Native app uses Expo managed workflow (P1 mobile), ejects to bare workflow for desktop (P2) and wearables (P3). Shared business logic in TypeScript modules imported by both platforms.

## Implementation Phases

### Phase 0: Monorepo Setup & Shared Modules ✅ (COMPLETE)

**Status**: Research and design complete (research.md, data-model.md, contracts/, quickstart.md)

**Deliverables**:
- ✅ Monorepo structure with Yarn Workspaces
- ✅ `shared-modules/` package with TypeScript models
- ✅ Service interface contracts (IStorageService, ISearchService, etc.)
- ✅ Data model definitions (Quote, Category, UserPreferences)
- ✅ Development environment setup guide (quickstart.md)

**Next**: Begin Phase 1 (Mobile iOS/Android implementation)

---

### Phase 1: Mobile Apps (iOS & Android) - P1 Priority

**Goal**: Launch React Native mobile apps on iOS App Store and Google Play Store

**Duration**: 8-12 weeks

**Prerequisites**:
- macOS for iOS development (Xcode, CocoaPods)
- Android Studio for Android development
- Apple Developer account ($99/year)
- Google Play Console account ($25 one-time)

#### Step 1.1: Project Initialization (Week 1)

**Tasks**:
1. Create `quotes-native/` directory in repository root
2. Initialize Expo managed workflow project:
   ```bash
   cd Quotes
   npx create-expo-app quotes-native --template blank-typescript
   ```
3. Configure `app.json` with app metadata:
   - App name: "Buddhist Quotes"
   - Bundle identifiers: `com.yourcompany.quotes`
   - Splash screen, app icon
4. Install dependencies:
   ```bash
   yarn add react-navigation @react-navigation/native @react-navigation/bottom-tabs
   yarn add expo-av expo-haptics @react-native-async-storage/async-storage
   yarn add @quotes/shared-modules
   ```
5. Configure TypeScript strict mode in `tsconfig.json`
6. Setup ESLint + Prettier (match shared-modules config)

**Outputs**:
- Working Expo project structure
- Dependencies installed
- TypeScript + linting configured

#### Step 1.2: Implement Shared Business Logic (Week 1-2)

**Tasks**:
1. Copy data models from `data-model.md` to `shared-modules/src/models/`:
   - `quote.model.ts`
   - `category.model.ts`
   - `user-preferences.model.ts`
   - `sync-state.model.ts`
2. Implement service interfaces from `contracts/`:
   - `storage.service.ts` (IStorageService interface)
   - `search.service.ts` (SearchService implementation)
   - `rotation.service.ts` (RotationService implementation)
3. Implement utilities:
   - `text-utils.ts` (Vietnamese NFC normalization)
   - `uuid.ts` (UUID generation)
4. Write unit tests (Jest) for all services:
   - `search.service.test.ts`
   - `rotation.service.test.ts`
   - `text-utils.test.ts`
5. Build shared modules: `cd shared-modules && yarn build`

**Outputs**:
- Shared models and services ready for import
- 100% test coverage for business logic
- Compiled TypeScript in `shared-modules/dist/`

#### Step 1.3: Platform-Specific Services (Week 2-3)

**Tasks**:
1. Implement `NativeStorageService` (AsyncStorage):
   - Location: `quotes-native/src/services/storage/`
   - Implements `IStorageService` from shared-modules
   - Save/load UserPreferences
2. Implement `NativeAudioService` (Expo Audio):
   - Location: `quotes-native/src/services/audio/`
   - Load `assets/audio/notification.mp3`
   - Play on quote transitions
3. Implement `HapticService` (Expo Haptics):
   - Location: `quotes-native/src/services/haptic/`
   - Light impact on quote transitions
   - Battery-aware intensity reduction
4. Implement `BackgroundService` (optional):
   - Location: `quotes-native/src/services/background/`
   - Request background audio permission (iOS)
   - Request foreground service permission (Android)
   - Continue rotation in background

**Outputs**:
- Platform-specific service implementations
- Audio/haptic feedback working on devices
- Background operation opt-in functional

#### Step 1.4: React Native Components (Week 3-5)

**Tasks**:
1. Create shared components:
   - `QuoteCard.tsx`: Display single quote with author, category
   - `QuoteGrid.tsx`: FlatList of quotes with search filtering
   - `RotationControls.tsx`: Play/Pause/Next buttons, timer interval picker
2. Create screen components:
   - `HomeScreen.tsx`: Continuous display + quote grid
   - `SearchScreen.tsx`: Search input + filtered results
   - `SettingsScreen.tsx`: User preferences (timer, sound, haptic, background mode)
   - `FavoritesScreen.tsx`: Saved quotes list
3. Implement navigation:
   - `AppNavigator.tsx`: Bottom tab navigator (Home, Search, Favorites, Settings)
   - Platform-specific styling (iOS vs Android)
4. Implement React hooks:
   - `useQuotes.ts`: Load quotes from bundled JSON, cache in AsyncStorage
   - `useRotation.ts`: Auto-rotation logic using RotationService
   - `usePreferences.ts`: Load/save UserPreferences

**Outputs**:
- Complete mobile UI with React Native components
- Navigation between screens working
- Quotes loading and displaying correctly

#### Step 1.5: Feature Implementation (Week 5-7)

**Tasks**:
1. **Continuous Display**:
   - Auto-rotation with configurable timer (5-60s)
   - Fade-in/fade-out transitions
   - Audio notification on transitions
   - Haptic feedback on transitions
   - Play/Pause/Next controls
2. **Search & Filtering**:
   - Full-text search (content, author, category, tags)
   - Category filtering
   - Vietnamese diacritic-insensitive search
   - Real-time search results
3. **Favorites**:
   - Add/remove favorites (heart icon)
   - Persist favorites in AsyncStorage
   - Favorites screen with saved quotes
4. **User Preferences**:
   - Timer interval picker (5-60s, step: 5s)
   - Sound toggle
   - Haptic toggle
   - Background mode toggle (with permission request)
   - Persist preferences in AsyncStorage

**Outputs**:
- All core features functional
- User preferences persisting across sessions
- Audio + haptic feedback working on physical devices

#### Step 1.6: Testing & Refinement (Week 7-8)

**Tasks**:
1. Manual testing on physical devices:
   - iOS: iPhone (test audio, haptic, background mode)
   - Android: Pixel/Samsung (test audio, haptic, foreground service)
2. Test Vietnamese text rendering (NFC normalization)
3. Test offline functionality (airplane mode)
4. Test battery usage (background mode enabled)
5. Test app performance (60fps animations, <2s launch)
6. Fix bugs and polish UI

**Outputs**:
- App tested on iOS and Android devices
- All features working correctly
- Performance targets met

#### Step 1.7: App Store Submission (Week 8-10)

**Tasks**:
1. **iOS App Store**:
   - Create app listing in App Store Connect
   - Generate screenshots (6.5", 5.5" required)
   - Write app description, keywords
   - Build IPA with Expo: `eas build --platform ios`
   - Submit for review (1-3 days typical)
2. **Google Play Store**:
   - Create app listing in Google Play Console
   - Generate screenshots (phone, tablet)
   - Write app description
   - Build APK/AAB with Expo: `eas build --platform android`
   - Submit for review (1-7 days typical)
3. Wait for approval and launch

**Outputs**:
- iOS app live on App Store
- Android app live on Google Play
- Public download links

**Phase 1 Completion Criteria**:
- ✅ Mobile apps published on iOS App Store and Google Play Store
- ✅ All functional requirements (FR-001 to FR-012) implemented
- ✅ Success criteria (SC-001 to SC-010) met
- ✅ User acceptance testing with 10+ beta testers
- ✅ App store ratings >4.0 stars

---

### Phase 2: Desktop Apps (Windows & macOS) - P2 Priority

**Goal**: Launch native desktop apps on Microsoft Store and Mac App Store

**Duration**: 6-8 weeks

**Prerequisites**:
- Complete Phase 1 (mobile apps launched)
- Windows 10+ with Visual Studio 2019/2022 (for Windows app)
- macOS with Xcode 14+ (for macOS app)
- Microsoft Partner Center account (free)
- Mac App Store via Apple Developer account

#### Step 2.1: Eject to Bare Workflow (Week 1)

**Tasks**:
1. Eject Expo project to bare workflow:
   ```bash
   cd quotes-native
   expo eject
   ```
2. Verify iOS and Android builds still work
3. Migrate from Expo Audio to React Native Sound (if needed)
4. Migrate from Expo Haptics to React Native Haptic Feedback (if needed)

**Outputs**:
- Bare workflow project with `ios/` and `android/` native directories
- iOS and Android apps still functional

#### Step 2.2: Add React Native Windows (Week 1-2)

**Tasks**:
1. Initialize React Native Windows:
   ```bash
   npx react-native-windows-init --overwrite
   ```
2. Implement Windows-specific services:
   - `WindowsStorageService`: Use Windows.Storage.LocalSettings API
   - `WindowsAudioService`: Use Windows.Media.Playback API
3. Implement desktop-specific features:
   - System tray icon (menu bar)
   - Global keyboard shortcuts (Ctrl+C/Ctrl+X, Ctrl+V/Ctrl+N)
   - Quote notification overlay (configurable position)
   - Auto-launch on startup (optional)
4. Build and test Windows app:
   ```bash
   npx react-native run-windows
   ```

**Outputs**:
- Windows app running natively
- System integration features working

#### Step 2.3: Add React Native macOS (Week 2-3)

**Tasks**:
1. Initialize React Native macOS:
   ```bash
   npx react-native-macos-init --overwrite
   ```
2. Install CocoaPods dependencies:
   ```bash
   cd macos && pod install
   ```
3. Implement macOS-specific services:
   - `MacStorageService`: Use UserDefaults API
   - `MacAudioService`: Use AVFoundation API
4. Implement desktop-specific features:
   - Menu bar app (NSStatusItem)
   - Global keyboard shortcuts (Cmd+C/Cmd+X, Cmd+V/Cmd+N)
   - Quote notification overlay
   - Auto-launch on startup (Login Items)
5. Build and test macOS app:
   ```bash
   npx react-native run-macos
   ```

**Outputs**:
- macOS app running natively
- System integration features working

#### Step 2.4: Testing & Refinement (Week 3-4)

**Tasks**:
1. Test Windows app on Windows 10/11
2. Test macOS app on macOS 13+
3. Test keyboard shortcuts
4. Test notification positioning (9 positions)
5. Test auto-launch functionality
6. Polish desktop UI (larger fonts, mouse-friendly)

**Outputs**:
- Desktop apps tested and polished
- All desktop features working

#### Step 2.5: App Store Submission (Week 4-6)

**Tasks**:
1. **Microsoft Store**:
   - Create app listing in Microsoft Partner Center
   - Generate screenshots
   - Build MSIX package
   - Submit for review
2. **Mac App Store**:
   - Create app listing in App Store Connect
   - Generate screenshots
   - Notarize app with Apple
   - Submit for review

**Outputs**:
- Windows app live on Microsoft Store
- macOS app live on Mac App Store

**Phase 2 Completion Criteria**:
- ✅ Desktop apps published on Microsoft Store and Mac App Store
- ✅ Desktop-specific features (menu bar, shortcuts, notifications) working
- ✅ User acceptance testing with 5+ beta testers per platform

---

### Phase 3: Wearables (Apple Watch & Android Wear) - P3 Priority

**Goal**: Launch watch apps bundled with mobile apps

**Duration**: 6-8 weeks

**Prerequisites**:
- Complete Phase 1 (mobile apps launched)
- Bare workflow (from Phase 2)
- Apple Watch (watchOS 9+) for testing
- Android Wear device (Wear OS 3+) for testing

#### Step 3.1: Apple Watch Development (Week 1-4)

**Tasks**:
1. Create WatchKit extension in Xcode:
   - Open `quotes-native/ios/QuotesNative.xcworkspace`
   - File → New → Target → Watch App
   - Name: QuotesWatch
2. Implement watch app (Swift + SwiftUI):
   - Quote display view
   - Quote navigation (Digital Crown)
   - Watch complications (Modular, Graphic)
   - Haptic feedback on transitions
3. Configure App Groups for data sharing:
   - iOS app and Watch app share UserDefaults
4. Implement watch sync:
   - iOS app syncs 50 quotes to shared UserDefaults
   - Watch app reads quotes from UserDefaults
5. Implement standalone mode:
   - Watch app functions offline
6. Test on physical Apple Watch

**Outputs**:
- Apple Watch app functional
- Complications working on watch faces
- Standalone mode operational

#### Step 3.2: Android Wear Development (Week 1-4)

**Tasks**:
1. Create Wear OS module in Android Studio:
   - Open `quotes-native/android/`
   - File → New → Module → Wear OS Module
2. Implement watch app (Kotlin + Jetpack Compose for Wear OS):
   - Quote display composable
   - Quote navigation (Rotary input)
   - Wear OS tiles (Quote of the day)
   - Vibration feedback on transitions
3. Configure Wearable Data Layer:
   - Android app syncs 50 quotes via DataClient
   - Wear app receives quotes via MessageClient
4. Implement standalone mode:
   - Wear app functions offline
5. Test on physical Wear OS device

**Outputs**:
- Android Wear app functional
- Tiles working on watch
- Standalone mode operational

#### Step 3.3: Testing & Refinement (Week 5-6)

**Tasks**:
1. Test Apple Watch app on physical devices
2. Test Android Wear app on physical devices
3. Test haptic feedback
4. Test battery usage (<1% per hour)
5. Test quote sync (manual sync from phone)
6. Test standalone mode (disconnect from phone)

**Outputs**:
- Watch apps tested on physical devices
- Battery usage optimized

#### Step 3.4: App Store Update (Week 6-8)

**Tasks**:
1. Update iOS mobile app to include Watch app
2. Update Android mobile app to include Wear app
3. Submit updated versions to App Store and Google Play
4. Wait for approval

**Outputs**:
- Watch apps available to download
- Bundled with mobile apps

**Phase 3 Completion Criteria**:
- ✅ Watch apps published (bundled with mobile apps)
- ✅ Wearables-specific features (complications, standalone mode) working
- ✅ Battery efficiency <1% per hour
- ✅ User acceptance testing with 3+ beta testers per platform

---

## Rollout Strategy

### Phase 1: Mobile Launch (8-12 weeks)
- **Target Audience**: iOS and Android users (largest user base)
- **Marketing**: App Store listings, social media, Buddhist communities
- **Beta Testing**: TestFlight (iOS), Google Play Beta (Android), 10+ beta testers
- **Success Metrics**: 100+ downloads first week, 4.0+ stars, <5% crash rate

### Phase 2: Desktop Launch (6-8 weeks)
- **Target Audience**: Desktop users (work, home use cases)
- **Marketing**: Microsoft Store, Mac App Store, productivity communities
- **Beta Testing**: 5+ beta testers per platform
- **Success Metrics**: 50+ downloads first week, 4.0+ stars

### Phase 3: Wearables Launch (6-8 weeks)
- **Target Audience**: Smartwatch users (mindfulness moments)
- **Marketing**: Watch-specific features (complications, standalone mode)
- **Beta Testing**: 3+ beta testers per platform (physical devices required)
- **Success Metrics**: 10+ active watch users, <1% battery usage validated

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Expo → Bare migration complexity | High | Start with Expo (P1), plan migration for P2, allocate extra time |
| App store rejection | Medium | Follow guidelines strictly, allow 2 weeks buffer for re-submission |
| Vietnamese text rendering issues | Medium | Test on physical devices early, NFC normalization tested in P0 |
| Battery drain on wearables | Medium | Battery-aware features (reduce haptic at 20%, disable rotation at 10%) |
| Background operation permissions | Low | Make it optional, educate users on battery impact |
| Wearables native bridge complexity | High | Use proven libraries (react-native-watch-connectivity), allocate extra time |

## Success Criteria

All success criteria from spec.md must be met:

- ✅ SC-001: Search results in <1s on all platforms
- ✅ SC-002: Initial load <3s web, <2s mobile, <1s desktop, <500ms wearables
- ✅ SC-003: 80% users rate UI as 'calming' or 'very calming'
- ✅ SC-004: Random quote from cache <100ms
- ✅ SC-005: All platforms deployed successfully (stores approved)
- ✅ SC-006: 100% interactive elements meet platform standards
- ✅ SC-007: All platforms function offline 30+ days
- ✅ SC-008: Wearables <1% battery per hour
- ✅ SC-009: User preferences persist with 100% reliability
- ✅ SC-010: Mobile apps achieve 4.5+ stars within 3 months

## Complexity Tracking

**No principle violations** - all constitution principles satisfied.

**Complexity drivers**:
- Multi-platform architecture (6 platforms)
- Code sharing strategy (shared business logic, platform-specific UI)
- Wearables native development (Swift + Kotlin)
- App store compliance (4 app stores)

**Justification**: Complexity inherent to multi-platform expansion strategy. Phased rollout (mobile → desktop → wearables) manages complexity by allowing iterative validation. Code sharing (70-80% business logic reuse) reduces maintenance burden. Trade-off: Higher initial complexity for long-term code reuse and broader user reach.

## Next Steps

1. ✅ Phase 0 complete (research, data models, contracts, quickstart)
2. **Next**: Begin Phase 1 (Mobile iOS/Android implementation)
   - Week 1: Project initialization + shared business logic
   - Week 2-3: Platform-specific services
   - Week 3-5: React Native components
   - Week 5-7: Feature implementation
   - Week 7-8: Testing & refinement
   - Week 8-10: App store submission
3. After Phase 1 launch: Begin Phase 2 (Desktop Windows/macOS)
4. After Phase 2 launch: Begin Phase 3 (Wearables watchOS/Wear OS)
