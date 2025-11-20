# Quickstart: Multi-Platform React Native Development

**Feature Branch**: `002-react-native-expansion`  
**Created**: 2025-11-20  
**Purpose**: Setup instructions for React Native multi-platform development environment

## Overview

This guide covers setup for:
- **Mobile**: iOS (macOS only) and Android (any OS)
- **Desktop**: Windows (Windows only) and macOS (macOS only)
- **Wearables**: Apple Watch (macOS only) and Android Wear (any OS)
- **Web**: Angular (existing, no changes needed)

## Prerequisites

### All Platforms

- **Node.js**: 18.x or 20.x LTS
- **Yarn**: 1.22+ (for monorepo workspaces)
- **Git**: Latest stable version
- **Code Editor**: VS Code recommended with extensions:
  - ESLint
  - Prettier
  - React Native Tools
  - TypeScript

### Platform-Specific Requirements

| Platform | OS Requirement | Additional Tools |
|----------|----------------|------------------|
| iOS | macOS only | Xcode 14+, CocoaPods, Apple Developer account ($99/year) |
| Android | Any OS | Android Studio, Java JDK 17, Android SDK 33+, Google Play Console ($25 one-time) |
| Windows | Windows 10/11 | Visual Studio 2019/2022, Windows 10 SDK, Microsoft Partner Center (free) |
| macOS | macOS | Xcode 14+, CocoaPods, Mac App Store ($99/year via Apple Developer) |
| Apple Watch | macOS only | Same as iOS + watchOS 9+ SDK |
| Android Wear | Any OS | Same as Android + Wear OS SDK |

## Phase 1: Mobile Development (iOS & Android)

### Step 1: Install Node.js and Yarn

```powershell
# Windows (using Chocolatey)
choco install nodejs-lts yarn -y

# macOS (using Homebrew)
brew install node@20 yarn

# Verify installations
node --version  # Should show v20.x
yarn --version  # Should show 1.22+
```

### Step 2: Install Expo CLI (Managed Workflow)

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Verify installation
expo --version
```

### Step 3: iOS Setup (macOS Only)

1. **Install Xcode** from Mac App Store (requires macOS 13+)
   - Open Xcode → Preferences → Locations → Command Line Tools (select Xcode version)

2. **Install CocoaPods**:
   ```bash
   sudo gem install cocoapods
   pod --version  # Verify installation
   ```

3. **Install iOS Simulator**:
   - Open Xcode → Preferences → Components → Download iOS 16.0+ Simulator

4. **Apple Developer Account**:
   - Sign up at https://developer.apple.com ($99/year)
   - Add account in Xcode → Preferences → Accounts

### Step 4: Android Setup (Any OS)

1. **Install Android Studio** from https://developer.android.com/studio

2. **Install Android SDK**:
   - Open Android Studio → SDK Manager
   - Install Android 13 (API 33) or latest
   - Install Android SDK Build-Tools
   - Install Android Emulator

3. **Configure Environment Variables**:

   **Windows (PowerShell)**:
   ```powershell
   [Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
   [Environment]::SetEnvironmentVariable("Path", "$env:Path;$env:ANDROID_HOME\emulator;$env:ANDROID_HOME\platform-tools", "User")
   ```

   **macOS/Linux (Bash)**:
   ```bash
   echo 'export ANDROID_HOME=$HOME/Library/Android/sdk' >> ~/.zshrc
   echo 'export PATH=$PATH:$ANDROID_HOME/emulator:$ANDROID_HOME/platform-tools' >> ~/.zshrc
   source ~/.zshrc
   ```

4. **Create Android Emulator**:
   - Open Android Studio → AVD Manager
   - Create Virtual Device → Pixel 6 → Android 13 (API 33)

5. **Google Play Console**:
   - Sign up at https://play.google.com/console ($25 one-time fee)

### Step 5: Clone Repository and Install Dependencies

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/Quotes.git
cd Quotes

# Checkout feature branch
git checkout 002-react-native-expansion

# Install dependencies (monorepo)
yarn install

# Install mobile dependencies
cd quotes-native
yarn install

# iOS only: Install CocoaPods dependencies
cd ios
pod install
cd ..
```

### Step 6: Run Mobile App

**iOS (Expo Managed Workflow)**:
```bash
cd quotes-native
expo start --ios

# Or run on physical device
expo start
# Scan QR code with Expo Go app
```

**Android (Expo Managed Workflow)**:
```bash
cd quotes-native
expo start --android

# Or run on physical device
expo start
# Scan QR code with Expo Go app
```

**Development Tips**:
- Use `expo start --clear` to clear Metro bundler cache
- Use `expo start --tunnel` for remote development (slower)
- Physical devices recommended for testing haptic feedback and audio

---

## Phase 2: Desktop Development (Windows & macOS)

### Prerequisites

- Complete Phase 1 mobile setup
- Eject from Expo managed workflow to bare workflow

### Step 1: Eject to Bare Workflow

```bash
cd quotes-native

# Eject from Expo
expo eject

# Choose "bare workflow" when prompted
# This creates ios/ and android/ native directories
```

### Step 2: Windows Desktop Setup (Windows Only)

1. **Install Visual Studio 2019/2022**:
   - Download from https://visualstudio.microsoft.com/
   - Select "Desktop development with C++" workload
   - Select "Universal Windows Platform development" workload
   - Install Windows 10 SDK (10.0.19041.0 or later)

2. **Install React Native Windows CLI**:
   ```powershell
   npm install -g react-native-windows-init
   ```

3. **Initialize React Native Windows**:
   ```bash
   cd quotes-native
   npx react-native-windows-init --overwrite
   ```

4. **Run Windows App**:
   ```powershell
   npx react-native run-windows
   ```

### Step 3: macOS Desktop Setup (macOS Only)

1. **Install React Native macOS CLI**:
   ```bash
   npm install -g react-native-macos-init
   ```

2. **Initialize React Native macOS**:
   ```bash
   cd quotes-native
   npx react-native-macos-init --overwrite
   ```

3. **Install CocoaPods dependencies**:
   ```bash
   cd macos
   pod install
   cd ..
   ```

4. **Run macOS App**:
   ```bash
   npx react-native run-macos
   ```

**Development Tips**:
- Windows: Use Visual Studio for native debugging
- macOS: Use Xcode for native debugging
- Both: Fast refresh enabled for React Native code

---

## Phase 3: Wearables Development (watchOS & Wear OS)

### Apple Watch Setup (macOS Only)

1. **Prerequisites**:
   - Complete iOS setup (Phase 1)
   - Xcode 14+ with watchOS 9+ SDK

2. **Create WatchKit Extension**:
   - Open `quotes-native/ios/QuotesNative.xcworkspace` in Xcode
   - File → New → Target → watchOS → Watch App
   - Name: QuotesWatch
   - Language: Swift, SwiftUI

3. **Add Watch Connectivity**:
   ```bash
   cd quotes-native
   yarn add react-native-watch-connectivity
   cd ios
   pod install
   cd ..
   ```

4. **Configure App Groups** (for data sharing):
   - Xcode → QuotesNative target → Signing & Capabilities → Add Capability → App Groups
   - Create group: `group.com.yourcompany.quotes`
   - Repeat for QuotesWatch target

5. **Run Watch App**:
   - Select "QuotesWatch" scheme in Xcode
   - Choose Apple Watch simulator
   - Run (⌘R)

### Android Wear Setup (Any OS)

1. **Prerequisites**:
   - Complete Android setup (Phase 1)
   - Android Studio with Wear OS SDK

2. **Install Wear OS SDK**:
   - Open Android Studio → SDK Manager
   - SDK Platforms → Check "Wear OS 3" (API 30+)
   - SDK Tools → Check "Wear OS Emulator System Image"

3. **Create Wear OS Module**:
   ```bash
   cd quotes-native/android
   # Create wear module in Android Studio
   # File → New → New Module → Wear OS Module
   ```

4. **Add Wearable Data Layer**:
   ```gradle
   // android/wear/build.gradle
   dependencies {
       implementation 'com.google.android.gms:play-services-wearable:18.0.0'
       implementation 'androidx.wear:wear:1.2.0'
   }
   ```

5. **Run Wear OS App**:
   - Open Android Studio
   - Create Wear OS emulator (Wear OS 3, API 30+)
   - Select "wear" module
   - Run

**Development Tips**:
- Apple Watch: Test on physical device for haptic feedback
- Android Wear: Test rotary input on physical device
- Both: Complications require separate testing on watch faces

---

## Monorepo Structure

```
Quotes/
├── package.json                 # Root workspace configuration
├── .gitignore
├── README.md
│
├── quotes-platform/             # Angular web app (existing)
│   ├── package.json
│   ├── angular.json
│   └── src/
│
├── quotes-native/               # React Native native app (NEW)
│   ├── package.json
│   ├── app.json                # Expo configuration
│   ├── tsconfig.json
│   ├── src/
│   │   ├── shared/             # Shared RN code
│   │   ├── components/         # RN components
│   │   ├── screens/            # Screen components
│   │   ├── navigation/         # React Navigation
│   │   └── services/           # Platform-specific services
│   ├── ios/                    # Native iOS project (bare workflow)
│   ├── android/                # Native Android project (bare workflow)
│   ├── windows/                # Native Windows project (RN Windows)
│   ├── macos/                  # Native macOS project (RN macOS)
│   └── __tests__/              # Jest tests
│
└── shared-modules/              # Shared TypeScript business logic (NEW)
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── models/             # Data models (Quote, Category, etc.)
    │   ├── services/           # Business logic (Search, Rotation)
    │   └── utils/              # Utilities (text processing)
    └── __tests__/              # Jest tests
```

## Workspace Configuration

**Root `package.json`**:
```json
{
  "name": "quotes-workspace",
  "private": true,
  "workspaces": [
    "quotes-platform",
    "quotes-native",
    "shared-modules"
  ],
  "scripts": {
    "web": "cd quotes-platform && ng serve",
    "mobile": "cd quotes-native && expo start",
    "ios": "cd quotes-native && expo start --ios",
    "android": "cd quotes-native && expo start --android",
    "windows": "cd quotes-native && npx react-native run-windows",
    "macos": "cd quotes-native && npx react-native run-macos",
    "test": "yarn workspaces run test",
    "lint": "yarn workspaces run lint"
  }
}
```

**Shared Modules `package.json`**:
```json
{
  "name": "@quotes/shared-modules",
  "version": "1.0.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src --ext .ts"
  },
  "dependencies": {},
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "eslint": "^8.0.0",
    "@typescript-eslint/eslint-plugin": "^6.0.0",
    "@typescript-eslint/parser": "^6.0.0"
  }
}
```

## Development Workflow

### 1. Start Development Servers

```bash
# Terminal 1: Web (Angular)
yarn web

# Terminal 2: Mobile (React Native)
yarn mobile

# Terminal 3: Shared modules watch mode
cd shared-modules
yarn build --watch
```

### 2. Make Changes to Shared Business Logic

```typescript
// shared-modules/src/services/search.service.ts
export class SearchService {
  search(quotes: Quote[], query: string): Quote[] {
    // Shared search logic used by both Angular and React Native
  }
}
```

### 3. Import in Platform-Specific Code

```typescript
// quotes-platform/src/app/core/services/search.service.ts (Angular)
import { SearchService } from '@quotes/shared-modules';

@Injectable({ providedIn: 'root' })
export class WebSearchService extends SearchService {
  // Angular-specific enhancements
}
```

```typescript
// quotes-native/src/services/search.service.ts (React Native)
import { SearchService } from '@quotes/shared-modules';

export class NativeSearchService extends SearchService {
  // React Native-specific enhancements
}
```

### 4. Run Tests

```bash
# Test all workspaces
yarn test

# Test specific workspace
cd shared-modules && yarn test
cd quotes-native && yarn test
```

### 5. Build for Production

**Web (Angular)**:
```bash
cd quotes-platform
ng build --configuration production
# Output: dist/quotes-platform/
```

**Mobile (React Native)**:
```bash
cd quotes-native

# iOS
eas build --platform ios

# Android
eas build --platform android
```

**Desktop**:
```bash
cd quotes-native

# Windows
npx react-native run-windows --release

# macOS
npx react-native run-macos --release
```

## Troubleshooting

### Common Issues

**Issue**: `Module not found: @quotes/shared-modules`  
**Solution**: Run `yarn install` at root and `yarn build` in `shared-modules/`

**Issue**: Expo won't start on iOS  
**Solution**: Run `pod install` in `quotes-native/ios/`

**Issue**: Android emulator not found  
**Solution**: Check `ANDROID_HOME` environment variable and AVD Manager

**Issue**: Windows build fails  
**Solution**: Ensure Visual Studio 2019/2022 with C++ workload installed

**Issue**: WatchKit extension build fails  
**Solution**: Check App Groups configuration matches between iOS app and Watch extension

### Getting Help

- **React Native Docs**: https://reactnative.dev/docs/getting-started
- **Expo Docs**: https://docs.expo.dev/
- **React Native Windows**: https://microsoft.github.io/react-native-windows/
- **React Native macOS**: https://microsoft.github.io/react-native-windows/docs/rnm-getting-started
- **Project Issues**: [GitHub Issues](https://github.com/YOUR_USERNAME/Quotes/issues)

## Next Steps

1. Complete Phase 1 (Mobile) setup and verify iOS/Android apps run
2. Implement shared business logic in `shared-modules/`
3. Build mobile UI with React Native components
4. Test on physical devices (recommended for haptic/audio feedback)
5. Proceed to Phase 2 (Desktop) when mobile is stable
6. Proceed to Phase 3 (Wearables) when desktop is stable
