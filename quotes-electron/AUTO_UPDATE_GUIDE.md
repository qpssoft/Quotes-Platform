# Auto-Update Setup Guide

This guide explains how to configure and use the auto-update system for the Buddhist Quotes desktop application.

## Overview

The app uses **electron-updater** to automatically check for and install updates. Updates are distributed via **GitHub Releases**.

### How It Works

1. **Check for Updates**: App checks GitHub Releases for new versions
2. **Download**: If available, downloads the update in the background
3. **Install**: Installs the update when the app restarts

### Supported Platforms

| Platform | Auto-Update | Method |
|----------|-------------|--------|
| Windows  | ✅ Yes      | NSIS installer updates itself |
| macOS    | ✅ Yes      | DMG updates via Squirrel.Mac |
| Linux    | ⚠️ Partial  | AppImage (via AppImageUpdate) |

**Note**: Windows portable `.exe` and Linux `.deb` do not support auto-updates.

---

## Configuration

### 1. electron-builder.yml

The publish configuration is already set in `electron-builder.yml`:

```yaml
publish:
  provider: github
  owner: YOUR_GITHUB_USERNAME
  repo: buddhist-quotes
  releaseType: release
```

**Update these values:**
- `owner`: Your GitHub username or organization
- `repo`: Your repository name

### 2. Update Check Settings

The app checks for updates:
- **On startup** (after 10 seconds)
- **Every 12 hours** (configurable)
- **Manually** via "Check for Updates" button

Users can disable automatic checks in preferences:
```typescript
preferences.updates.checkAutomatically = false;
```

---

## Publishing Updates

### Step 1: Update Version Number

Update version in `package.json`:

```json
{
  "version": "2.1.0"
}
```

Follow [Semantic Versioning](https://semver.org/):
- `MAJOR.MINOR.PATCH`
- `2.0.0` → `2.0.1` (patch: bug fixes)
- `2.0.0` → `2.1.0` (minor: new features)
- `2.0.0` → `3.0.0` (major: breaking changes)

### Step 2: Build Release Packages

```bash
# Build for all platforms (requires macOS for DMG, Linux for packages)
npm run package

# Or build individually:
npm run package:win   # Windows (can build on Windows)
npm run package:mac   # macOS (requires macOS)
npm run package:linux # Linux (requires Linux or WSL)
```

**Output:**
- `release/Buddhist Quotes-Setup-2.1.0.exe` (Windows NSIS)
- `release/Buddhist Quotes-2.1.0.exe` (Windows portable - no auto-update)
- `release/Buddhist Quotes-2.1.0-universal.dmg` (macOS)
- `release/Buddhist Quotes-2.1.0.AppImage` (Linux)
- `release/buddhist-quotes_2.1.0_amd64.deb` (Linux - no auto-update)

### Step 3: Create GitHub Release

#### Option A: Manual Release (Recommended)

1. **Create Git Tag:**
   ```bash
   git tag v2.1.0
   git push origin v2.1.0
   ```

2. **Create GitHub Release:**
   - Go to: `https://github.com/YOUR_USERNAME/buddhist-quotes/releases/new`
   - Choose tag: `v2.1.0`
   - Release title: `Buddhist Quotes v2.1.0`
   - Description: Write release notes (what's new, bug fixes, etc.)
   - Attach files:
     - `Buddhist Quotes-Setup-2.1.0.exe`
     - `Buddhist Quotes-2.1.0-universal.dmg`
     - `Buddhist Quotes-2.1.0.AppImage`
     - `buddhist-quotes_2.1.0_amd64.deb` (optional)
   - Click "Publish release"

3. **Verify Files:**
   - Ensure `latest.yml` (Windows) is auto-generated
   - Ensure `latest-mac.yml` (macOS) is auto-generated
   - Ensure `latest-linux.yml` (Linux) is auto-generated

#### Option B: Automated Release (GitHub Actions)

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    tags:
      - 'v*'

jobs:
  release:
    runs-on: ${{ matrix.os }}
    
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: |
          cd quotes-platform
          npm ci
          cd ../quotes-electron
          npm ci
      
      - name: Build Angular
        run: |
          cd quotes-platform
          npm run build -- --base-href "./"
      
      - name: Build and Publish
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: |
          cd quotes-electron
          npm run build:all
          npx electron-builder --publish always
```

**Usage:**
```bash
git tag v2.1.0
git push origin v2.1.0
```

GitHub Actions will automatically build and publish the release.

---

## Update Flow

### User Experience

1. **Update Available:**
   - User sees dialog: "A new version (2.1.0) is available!"
   - Shows release notes
   - Options: "Download" or "Later"

2. **Downloading:**
   - Progress bar shows download percentage
   - Download happens in background
   - User can continue using the app

3. **Update Ready:**
   - User sees dialog: "Version 2.1.0 has been downloaded"
   - Options: "Restart Now" or "Later"
   - If "Later": Update installs on next app restart
   - If "Restart Now": App restarts and updates immediately

### Auto-Install on Quit

If user clicks "Later" on update prompt:
- Update is downloaded and ready
- When user quits the app, update installs automatically
- Next launch is the new version

---

## Testing Updates

### Local Testing

**1. Create Test Release:**
```bash
# Build app version 2.0.0
npm run package:win

# Install v2.0.0 on test machine
```

**2. Publish Update:**
```bash
# Update version to 2.0.1 in package.json
# Build and create GitHub release v2.0.1
```

**3. Test Update Flow:**
- Launch v2.0.0 app
- Wait 10 seconds (or click "Check for Updates")
- Should see "Update available: 2.0.1" dialog
- Click "Download"
- Wait for download to complete
- Click "Restart Now"
- Verify app restarts to v2.0.1

### Staging Environment

Create a separate repository for testing:
```bash
# In electron-builder.yml
publish:
  provider: github
  owner: YOUR_USERNAME
  repo: buddhist-quotes-staging
```

Test all update scenarios before publishing to production repo.

---

## API Reference

### Renderer Process (Angular)

Access updater via `window.electronAPI.updater`:

**Check for Updates (with dialog):**
```typescript
const result = await window.electronAPI.updater.checkForUpdates();
if (result.available) {
  console.log('Update check initiated');
} else {
  console.log('Updates not available:', result.reason);
}
```

**Check for Updates (silent):**
```typescript
await window.electronAPI.updater.checkForUpdatesSilent();
// No dialog shown, only status events
```

**Get Current Version:**
```typescript
const version = await window.electronAPI.updater.getVersion();
console.log('Current version:', version); // "2.0.0"
```

**Listen for Update Status:**
```typescript
window.electronAPI.updater.onStatus((message: string) => {
  console.log('Update status:', message);
  // "Checking for updates..."
  // "Update available: 2.1.0"
  // "Downloading update..."
  // "Update downloaded. Restart to install."
});
```

**Listen for Download Progress:**
```typescript
window.electronAPI.updater.onProgress((progress) => {
  console.log(`Downloaded: ${progress.percent.toFixed(1)}%`);
  console.log(`Speed: ${(progress.bytesPerSecond / 1024 / 1024).toFixed(2)} MB/s`);
  console.log(`Progress: ${progress.transferred} / ${progress.total} bytes`);
});
```

### Main Process

The `UpdaterManager` class handles all update logic:

```typescript
import { UpdaterManager } from './updater';

// Initialize (in main.ts)
const updaterManager = new UpdaterManager(mainWindow);

// Setup automatic checking (every 12 hours)
updaterManager.setupAutoCheck(12);

// Manual check (with dialog)
updaterManager.checkForUpdatesAndNotify();

// Silent check (no dialog if no updates)
updaterManager.checkForUpdates();

// Stop automatic checking
updaterManager.stopAutoCheck();

// Cleanup
updaterManager.destroy();
```

---

## Troubleshooting

### Updates Not Working

**1. Check App is Packaged:**
```typescript
// Auto-updater only works in packaged apps
if (!app.isPackaged) {
  console.log('Auto-updater disabled (development mode)');
}
```

**2. Verify GitHub Release:**
- Release must be tagged (e.g., `v2.1.0`)
- Release must be published (not draft)
- Files must be attached to the release
- `latest.yml` files should be auto-generated

**3. Check Network:**
- Ensure the app can reach `https://api.github.com`
- Check firewall/antivirus settings

**4. Check Logs:**
```bash
# Windows
%APPDATA%\Buddhist Quotes\logs\main.log

# macOS
~/Library/Logs/Buddhist Quotes/main.log

# Linux
~/.config/Buddhist Quotes/logs/main.log
```

### Private Repositories

If using a private repository, configure a GitHub token:

```typescript
// In main.ts (before creating UpdaterManager)
import { autoUpdater } from 'electron-updater';

autoUpdater.setFeedURL({
  provider: 'github',
  owner: 'YOUR_USERNAME',
  repo: 'buddhist-quotes',
  token: 'YOUR_GITHUB_TOKEN', // Personal access token
});
```

**Never commit tokens to source code!** Use environment variables:

```bash
# Set token
export GH_TOKEN=your_token_here

# Or in .env file (add to .gitignore)
GH_TOKEN=your_token_here
```

### Update Download Fails

**Increase Timeout:**
```typescript
autoUpdater.requestHeaders = {
  'User-Agent': 'Buddhist-Quotes',
};

// Increase timeout (default: 60 seconds)
autoUpdater.requestTimeout = 120000; // 2 minutes
```

### Code Signing Issues

**Windows:**
- NSIS installers should be code-signed for best update experience
- Unsigned installers may trigger SmartScreen warnings

**macOS:**
- DMG must be code-signed and notarized
- Unsigned apps won't update properly

See `MACOS_PACKAGING_GUIDE.md` for code signing instructions.

---

## Best Practices

### Version Numbering

Use [Semantic Versioning](https://semver.org/):
- **Patch** (2.0.1): Bug fixes, no new features
- **Minor** (2.1.0): New features, backward compatible
- **Major** (3.0.0): Breaking changes

### Release Notes

Write clear, concise release notes:

```markdown
## What's New in v2.1.0

### Features
- Added Vietnamese quote search
- New overlay positioning options
- Dark mode support

### Bug Fixes
- Fixed quote rotation timer
- Improved memory usage
- Fixed tray icon on Linux

### Known Issues
- macOS: Some shortcuts may conflict with system shortcuts
```

### Testing Checklist

Before publishing a release:
- [ ] Test update flow (v2.0.0 → v2.1.0)
- [ ] Verify all features work in new version
- [ ] Test on Windows 10/11
- [ ] Test on macOS (Intel + Apple Silicon)
- [ ] Test on Ubuntu 22.04+
- [ ] Check for memory leaks
- [ ] Verify update rollback works (if needed)

### Rollback Strategy

If a bad update is released:

1. **Unpublish the Release:**
   - Go to GitHub Releases
   - Edit the bad release
   - Check "Set as a pre-release" or delete it

2. **Publish Hotfix:**
   - Increment version (e.g., 2.1.0 → 2.1.1)
   - Fix the issue
   - Publish new release

3. **Notify Users:**
   - Post in discussions/issues
   - Tweet/announce the hotfix

---

## Security Considerations

### Code Signing

**Why it matters:**
- Prevents tampering
- Reduces SmartScreen warnings
- Enables auto-updates without warnings

**How to sign:**
- **Windows**: Purchase code signing certificate (~$200/year)
- **macOS**: Apple Developer Program ($99/year)

See platform-specific guides for details.

### Update Integrity

electron-updater verifies updates using:
- **SHA512 checksums** (in `latest.yml`)
- **HTTPS downloads** from GitHub
- **Signature verification** (if code-signed)

Never disable signature verification:
```typescript
// DON'T DO THIS:
autoUpdater.verifySignature = false; // ❌ Insecure!
```

---

## Advanced Configuration

### Prerelease Channels

Support beta/alpha releases:

```typescript
// In updater.ts
autoUpdater.allowPrerelease = true;
autoUpdater.channel = 'beta'; // 'stable' | 'beta' | 'alpha'
```

**GitHub Release:**
- Check "This is a pre-release"
- Tag with suffix: `v2.1.0-beta.1`

### Custom Update Server

Instead of GitHub, use your own server:

```yaml
# electron-builder.yml
publish:
  provider: generic
  url: https://releases.yourserver.com/buddhist-quotes
```

**Server Requirements:**
- Must serve `latest.yml`, `latest-mac.yml`, `latest-linux.yml`
- Must host update files (`.exe`, `.dmg`, `.AppImage`)
- Must support HTTPS

### Differential Updates

electron-updater supports downloading only changed files (not full installer):

```typescript
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Differential updates automatically enabled
// Requires proper .blockmap files (auto-generated by electron-builder)
```

---

## Resources

- [electron-updater Documentation](https://www.electron.build/auto-update)
- [Semantic Versioning](https://semver.org/)
- [GitHub Releases API](https://docs.github.com/en/rest/releases)
- [Code Signing Best Practices](https://www.electron.build/code-signing)

---

**Last Updated**: 2025-11-22  
**Electron Version**: 28.3.3  
**electron-updater Version**: 6.1.7  
**electron-builder Version**: 24.13.3
