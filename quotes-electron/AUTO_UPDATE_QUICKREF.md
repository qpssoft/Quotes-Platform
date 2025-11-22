# Auto-Update Quick Reference

Quick commands and snippets for managing auto-updates.

## Check Current Version

```bash
# In package.json
cat package.json | grep version

# Or programmatically
npm pkg get version
```

## Publishing Updates

### 1. Update Version

```bash
# Patch (bug fixes)
npm version patch  # 2.0.0 → 2.0.1

# Minor (new features)
npm version minor  # 2.0.0 → 2.1.0

# Major (breaking changes)
npm version major  # 2.0.0 → 3.0.0
```

### 2. Build Packages

```bash
# Windows (can build on Windows)
npm run package:win

# macOS (requires macOS or CI/CD)
npm run package:mac

# Linux (requires Linux, WSL2, or CI/CD)
npm run package:linux

# All platforms (requires all systems or CI/CD)
npm run package
```

### 3. Create Git Tag

```bash
# Get current version
VERSION=$(npm pkg get version | tr -d '"')

# Create and push tag
git tag "v$VERSION"
git push origin "v$VERSION"
```

### 4. Create GitHub Release

**Manual:**
1. Go to: `https://github.com/YOUR_USERNAME/buddhist-quotes/releases/new`
2. Choose tag: `v2.1.0`
3. Write release notes
4. Attach files:
   - `Buddhist Quotes-Setup-2.1.0.exe`
   - `Buddhist Quotes-2.1.0-universal.dmg`
   - `Buddhist Quotes-2.1.0.AppImage`
5. Publish

**CLI (using gh):**
```bash
# Install GitHub CLI: https://cli.github.com/
gh release create v2.1.0 \
  --title "Buddhist Quotes v2.1.0" \
  --notes "Release notes here" \
  release/*.exe \
  release/*.dmg \
  release/*.AppImage
```

## Testing Updates Locally

```bash
# 1. Build and install v2.0.0
npm run package:win
# Install Buddhist Quotes-Setup-2.0.0.exe

# 2. Update version and build v2.0.1
npm version patch
npm run package:win

# 3. Create GitHub release v2.0.1
# (upload Buddhist Quotes-Setup-2.0.1.exe)

# 4. Launch v2.0.0 app
# Wait 10 seconds or click "Check for Updates"
# Verify update prompt appears
```

## API Usage

### In Angular/Renderer

**Check for Updates:**
```typescript
await window.electronAPI.updater.checkForUpdates();
```

**Get Version:**
```typescript
const version = await window.electronAPI.updater.getVersion();
console.log(`Current version: ${version}`);
```

**Listen for Updates:**
```typescript
window.electronAPI.updater.onStatus((message) => {
  console.log('Update:', message);
});

window.electronAPI.updater.onProgress((progress) => {
  console.log(`Progress: ${progress.percent.toFixed(1)}%`);
});
```

### In Main Process

**Setup Auto-Check:**
```typescript
import { UpdaterManager } from './updater';

const updaterManager = new UpdaterManager(mainWindow);
updaterManager.setupAutoCheck(12); // Check every 12 hours
```

**Manual Check:**
```typescript
updaterManager.checkForUpdatesAndNotify(); // With dialog
updaterManager.checkForUpdates();          // Silent
```

## Configuration

### electron-builder.yml

```yaml
publish:
  provider: github
  owner: YOUR_GITHUB_USERNAME  # ← Update this
  repo: buddhist-quotes         # ← Update this
  releaseType: release
```

### Update Check Settings

**Enable/Disable Automatic Checks:**
```typescript
// In preferences
{
  updates: {
    checkAutomatically: true  // or false
  }
}
```

**Change Check Interval:**
```typescript
// In main.ts
updaterManager.setupAutoCheck(24); // Check every 24 hours (instead of 12)
```

## Troubleshooting

### Update Check Not Working

```bash
# Check if app is packaged
# Auto-updater only works in production builds
npm run package:win
# Then install and test

# Check logs
# Windows: %APPDATA%\Buddhist Quotes\logs\main.log
# macOS: ~/Library/Logs/Buddhist Quotes/main.log
# Linux: ~/.config/Buddhist Quotes/logs/main.log
```

### GitHub Release Not Found

```bash
# Verify tag exists
git tag

# Verify release is published (not draft)
gh release list

# Check release files
gh release view v2.1.0
```

### Download Fails

**Check Network:**
```bash
curl -I https://api.github.com/repos/YOUR_USERNAME/buddhist-quotes/releases/latest
```

**Check Release Assets:**
```bash
gh api repos/YOUR_USERNAME/buddhist-quotes/releases/latest | jq '.assets[].name'
```

## Platform-Specific Notes

### Windows

**NSIS Installer:**
- ✅ Supports auto-update
- Updates in background
- Requires admin on first install
- Subsequent updates don't need admin

**Portable .exe:**
- ❌ No auto-update support
- Users must download manually

### macOS

**DMG:**
- ✅ Supports auto-update
- Requires code signing for smooth updates
- Without signing: User sees Gatekeeper warning

**Code Signing:**
```bash
# In electron-builder.yml
mac:
  identity: "Developer ID Application: Your Name (TEAM_ID)"
  hardenedRuntime: true
  entitlements: build/entitlements.mac.plist
```

### Linux

**AppImage:**
- ⚠️ Partial support (via AppImageUpdate)
- Requires additional setup
- Some distros don't support auto-update

**.deb Package:**
- ❌ No auto-update support
- Use APT repository for updates (advanced)

## Release Workflow

### Quick Release

```bash
# 1. Update version
npm version patch

# 2. Build packages
npm run package:win  # (or mac/linux)

# 3. Create tag
git push origin v$(npm pkg get version | tr -d '"')

# 4. Create GitHub release (manual or CLI)
gh release create v$(npm pkg get version | tr -d '"') \
  release/*.exe \
  release/*.dmg \
  release/*.AppImage
```

### Full CI/CD (GitHub Actions)

Create `.github/workflows/release.yml`:

```yaml
name: Release
on:
  push:
    tags: ['v*']
jobs:
  release:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [windows-latest, macos-latest, ubuntu-latest]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run build:all
      - run: npx electron-builder --publish always
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**Usage:**
```bash
npm version patch
git push origin v$(npm pkg get version | tr -d '"')
# GitHub Actions builds and publishes automatically
```

## Version History

Keep track of releases:

```bash
# List tags
git tag -l

# List GitHub releases
gh release list

# Show specific release
gh release view v2.1.0
```

## Resources

- Full guide: `AUTO_UPDATE_GUIDE.md`
- electron-updater docs: https://www.electron.build/auto-update
- GitHub Releases: https://docs.github.com/en/repositories/releasing-projects-on-github
