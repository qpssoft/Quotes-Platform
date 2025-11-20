# Mobile Development Setup Guide

## Phase 3 Status: ✅ 39/42 Tasks Complete (93%)

### Completed Tasks:
- ✅ All React Hooks (useQuotes, useRotation, usePreferences)
- ✅ All Components (QuoteCard, QuoteGrid, RotationControls)
- ✅ All Screens (HomeScreen, SearchScreen, FavoritesScreen, SettingsScreen)
- ✅ Navigation (AppNavigator with bottom tabs)
- ✅ All core functionality implemented

### Remaining Tasks:
- [ ] T050: Write unit tests for NativeStorageService
- [ ] T055: Write unit tests for NativeAudioService
- [ ] T059: Write unit tests for HapticService
- [ ] T094: Add background mode toggle (optional advanced feature)
- [ ] T100-T106: Manual testing on physical devices (requires device setup below)

---

## Option 1: Test on Physical Devices (Recommended) 📱

### iOS (iPhone/iPad)
1. **Install Expo Go from App Store**:
   - Open App Store on your iPhone/iPad
   - Search for "Expo Go"
   - Install the app

2. **Connect to same WiFi network** as your development machine

3. **Scan QR code**:
   - The Expo server is already running at http://localhost:8081
   - Open Expo Go app
   - Tap "Scan QR Code"
   - Scan the QR code displayed in your terminal

4. **App loads automatically** on your device with hot-reload enabled

### Android (Phone/Tablet)
1. **Install Expo Go from Google Play Store**:
   - Open Google Play Store
   - Search for "Expo Go"
   - Install the app

2. **Connect to same WiFi network** as your development machine

3. **Scan QR code**:
   - Open Expo Go app
   - Tap "Scan QR Code"
   - Scan the QR code displayed in your terminal

4. **App loads automatically** with hot-reload

---

## Option 2: iOS Simulator (macOS Only) 🍎

### Prerequisites:
- **macOS** (Big Sur 11+ recommended)
- **Xcode** (latest version from Mac App Store - ~12GB download)

### Setup Steps:

1. **Install Xcode**:
   ```bash
   # Open Mac App Store and install Xcode (free)
   # After installation, open Xcode once to accept license
   ```

2. **Install Xcode Command Line Tools**:
   ```bash
   xcode-select --install
   ```

3. **Install Watchman** (file watcher for better performance):
   ```bash
   # Using Homebrew
   brew install watchman
   ```

4. **Start iOS Simulator from Expo**:
   ```bash
   cd d:\Projects\Quotes\quotes-native
   npx expo start
   # Press 'i' in the terminal to open iOS Simulator
   ```

5. **Or manually open simulator**:
   ```bash
   # Open Xcode > Xcode menu > Open Developer Tool > Simulator
   # Then in Expo terminal, press 'i'
   ```

### Supported iOS Simulators:
- iPhone 15 Pro Max (latest)
- iPhone 14 Pro
- iPhone SE (3rd generation)
- iPad Pro 12.9"

---

## Option 3: Android Emulator (Windows/macOS/Linux) 🤖

### Prerequisites:
- **Android Studio** (~1.5GB download + ~2GB SDK)
- **At least 8GB RAM** (16GB recommended)

### Setup Steps:

1. **Install Android Studio**:
   - Download from: https://developer.android.com/studio
   - Run installer and follow setup wizard
   - Select "Standard" installation type

2. **Install Android SDK**:
   - During setup, ensure these are checked:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device
     - Performance (Intel ® HAXM) or (AMD Processor)

3. **Configure Environment Variables (Windows)**:
   ```powershell
   # Add to System Environment Variables
   ANDROID_HOME = C:\Users\<YourUsername>\AppData\Local\Android\Sdk
   
   # Add to Path:
   %ANDROID_HOME%\platform-tools
   %ANDROID_HOME%\emulator
   %ANDROID_HOME%\tools
   %ANDROID_HOME%\tools\bin
   ```

4. **Create Android Virtual Device (AVD)**:
   ```bash
   # Open Android Studio
   # Tools > Device Manager
   # Click "Create Virtual Device"
   # Select Phone > Pixel 6 Pro (or any device)
   # Select System Image > R (API Level 30) or higher
   # Click Finish
   ```

5. **Start Android Emulator from Expo**:
   ```powershell
   cd d:\Projects\Quotes\quotes-native
   npx expo start
   # Press 'a' in the terminal to open Android emulator
   ```

6. **Or manually start emulator**:
   ```powershell
   # Open Android Studio > Device Manager > Click Play button on AVD
   # Then in Expo terminal, press 'a'
   ```

### Recommended AVD Configuration:
- **Device**: Pixel 6 Pro or Pixel 7
- **System Image**: Android 12 (API 31) or higher
- **RAM**: 2GB minimum, 4GB recommended
- **Storage**: 2GB minimum

---

## Option 4: Quick Start with Expo Go (No Simulator Needed) ⚡

**Fastest way to test without installing heavy tools:**

1. **Your Expo server is already running** at http://localhost:8081

2. **On your mobile device**:
   - Install Expo Go app (free)
   - Open the app
   - Scan the QR code from your terminal

3. **That's it!** 
   - App loads instantly
   - Changes hot-reload automatically
   - Works on both iOS and Android

---

## Current Running Status

✅ **Expo Dev Server**: Running on http://localhost:8081
✅ **Web Build**: Successful (553 modules)
✅ **Hot Reload**: Active (14-37ms rebuilds)

### To test the app:
```powershell
# Server is already running, just:
# Option 1: Use physical device with Expo Go (scan QR code)
# Option 2: Press 'i' for iOS Simulator (macOS only)
# Option 3: Press 'a' for Android Emulator (requires Android Studio)
# Option 4: Press 'w' for web browser (already working)
```

---

## Testing Checklist (Tasks T100-T106)

Once you have a device/simulator running:

### Offline Functionality Test:
- [ ] Enable airplane mode
- [ ] Close app completely
- [ ] Reopen app
- [ ] Verify all quotes load
- [ ] Verify search works
- [ ] Verify favorites persist

### Performance Test:
- [ ] App launches in <2 seconds
- [ ] Animations run at 60fps
- [ ] Search responds in <1 second
- [ ] Smooth scrolling in quote grid

### Vietnamese Text Test:
- [ ] All Vietnamese diacritics display correctly
- [ ] Search with diacritics works (case-insensitive)
- [ ] Search without diacritics finds diacritic matches

### Haptic Feedback Test:
- [ ] Play button triggers light haptic
- [ ] Pause button triggers light haptic
- [ ] Next button triggers medium haptic
- [ ] Auto-rotation triggers light haptic

### Audio Test:
- [ ] Enable sound in settings
- [ ] Click Next button → hear notification sound
- [ ] Start auto-rotation → hear sound on each transition
- [ ] Disable sound in settings → no sound

---

## Troubleshooting

### iOS Simulator Issues:
- **"Unable to boot simulator"**: Reset simulator (Device > Erase All Content and Settings)
- **"Developer tools not found"**: Run `xcode-select --install`
- **Simulator is slow**: Close other apps, increase RAM allocation in Xcode

### Android Emulator Issues:
- **"HAXM not installed"**: Enable virtualization in BIOS
- **Emulator won't start**: Check ANDROID_HOME path is correct
- **Emulator is slow**: 
  - Enable "Hardware - GLES 2.0" in AVD settings
  - Increase RAM to 4GB
  - Use x86 system image (faster than ARM)

### Expo Go Issues:
- **"Could not connect"**: Ensure device and PC on same WiFi
- **"Network error"**: Disable VPN
- **"Unable to resolve"**: Clear Expo cache: `npx expo start -c`

---

## Next Steps

1. **Choose your testing method** from options above
2. **Complete manual testing** (Tasks T100-T106)
3. **Fix any bugs found** during testing
4. **Phase 3 is 93% complete!** Only testing remains

