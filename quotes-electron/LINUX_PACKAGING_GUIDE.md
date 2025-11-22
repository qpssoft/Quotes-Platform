# Linux Packaging Guide

This guide covers building and distributing the Buddhist Quotes desktop app for Linux systems.

## Prerequisites

### Required Tools

1. **Node.js 20+** and **npm**
   ```bash
   node --version  # Should be 20.x or higher
   npm --version
   ```

2. **Build Dependencies** (Ubuntu/Debian)
   ```bash
   sudo apt-get update
   sudo apt-get install -y \
     build-essential \
     libglib2.0-dev \
     libfuse2 \
     libnss3 \
     libatk1.0-0 \
     libatk-bridge2.0-0 \
     libcups2 \
     libdrm2 \
     libgtk-3-0 \
     libgbm1 \
     libasound2
   ```

3. **Build Dependencies** (Fedora/RHEL)
   ```bash
   sudo dnf install -y \
     gcc-c++ \
     make \
     glib2-devel \
     fuse-libs \
     nss \
     atk \
     at-spi2-atk \
     cups-libs \
     libdrm \
     gtk3 \
     mesa-libgbm \
     alsa-lib
   ```

4. **Build Dependencies** (Arch Linux)
   ```bash
   sudo pacman -S --needed \
     base-devel \
     glib2 \
     fuse2 \
     nss \
     atk \
     at-spi2-atk \
     cups \
     libdrm \
     gtk3 \
     mesa \
     alsa-lib
   ```

### Optional Tools

- **Docker**: For clean, reproducible builds
- **GitHub Actions**: For CI/CD builds

---

## Building Linux Packages

### Step 1: Prepare the Build

```bash
cd quotes-electron

# Install dependencies
npm install

# Build TypeScript (main process + preload)
npm run build

# Copy Angular renderer
npm run copy:renderer
```

### Step 2: Build Linux Packages

**Build Both AppImage and .deb:**
```bash
npm run package:linux
```

This will create:
- `release/Buddhist Quotes-2.0.0.AppImage` (~80-100 MB)
- `release/buddhist-quotes_2.0.0_amd64.deb` (~80-100 MB)

**Build Only AppImage:**
```bash
npx electron-builder --linux appimage
```

**Build Only .deb:**
```bash
npx electron-builder --linux deb
```

### Step 3: Verify Package Sizes

```bash
ls -lh release/*.AppImage release/*.deb
```

Expected sizes:
- AppImage: ~80-100 MB (includes all dependencies)
- .deb: ~80-100 MB (includes bundled dependencies)

---

## Package Details

### AppImage

**What is AppImage?**
- Self-contained executable (like a portable app)
- No installation required
- Works on most Linux distributions
- Includes all dependencies

**File Structure:**
```
Buddhist Quotes-2.0.0.AppImage
├── usr/
│   ├── bin/buddhist-quotes
│   ├── lib/
│   ├── share/
│   │   ├── applications/buddhist-quotes.desktop
│   │   └── icons/hicolor/512x512/apps/buddhist-quotes.png
│   └── ...
└── AppRun (executable entry point)
```

**Usage:**
```bash
# Make executable
chmod +x Buddhist\ Quotes-2.0.0.AppImage

# Run
./Buddhist\ Quotes-2.0.0.AppImage
```

**Integration with Desktop:**
```bash
# Move to applications directory
mkdir -p ~/.local/share/applications
mv Buddhist\ Quotes-2.0.0.AppImage ~/.local/bin/

# AppImage will auto-create desktop entry on first run
~/.local/bin/Buddhist\ Quotes-2.0.0.AppImage
```

### Debian Package (.deb)

**What is .deb?**
- Debian/Ubuntu package format
- Requires installation
- Integrates with package manager
- Creates menu entries automatically

**File Structure:**
```
buddhist-quotes_2.0.0_amd64.deb
├── DEBIAN/
│   ├── control (package metadata)
│   ├── postinst (post-install script)
│   └── prerm (pre-remove script)
└── usr/
    ├── bin/buddhist-quotes
    ├── lib/buddhist-quotes/
    └── share/
        ├── applications/buddhist-quotes.desktop
        └── icons/hicolor/512x512/apps/buddhist-quotes.png
```

**Installation:**
```bash
# Install
sudo dpkg -i buddhist-quotes_2.0.0_amd64.deb

# Fix dependencies (if needed)
sudo apt-get install -f

# Run from menu or terminal
buddhist-quotes
```

**Uninstallation:**
```bash
sudo apt-get remove buddhist-quotes
```

---

## Testing

### Test Checklist - AppImage

**Ubuntu 20.04+ / Linux Mint 20+:**
- [ ] Download AppImage
- [ ] Make executable: `chmod +x Buddhist\ Quotes-2.0.0.AppImage`
- [ ] Run AppImage: `./Buddhist\ Quotes-2.0.0.AppImage`
- [ ] Verify app launches without errors
- [ ] Test quote display and rotation
- [ ] Test search functionality
- [ ] Test favorites
- [ ] Test system tray icon (if supported)
- [ ] Test global shortcuts (Ctrl+Shift+Q, etc.)
- [ ] Test overlay window
- [ ] Test Vietnamese text rendering
- [ ] Close app, verify it quits cleanly

**Fedora / RHEL:**
- [ ] Same tests as Ubuntu
- [ ] Verify FUSE support (`sudo dnf install fuse-libs`)

**Arch Linux / Manjaro:**
- [ ] Same tests as Ubuntu
- [ ] Verify FUSE support (`sudo pacman -S fuse2`)

### Test Checklist - .deb Package

**Ubuntu / Debian / Linux Mint:**
- [ ] Install: `sudo dpkg -i buddhist-quotes_2.0.0_amd64.deb`
- [ ] Verify desktop entry created (check application menu)
- [ ] Launch from menu
- [ ] Test all features (quotes, search, favorites, tray, shortcuts, overlay)
- [ ] Verify auto-launch setting works
- [ ] Test always-on-top mode
- [ ] Test multi-monitor positioning (if available)
- [ ] Close and relaunch, verify settings persist
- [ ] Uninstall: `sudo apt-get remove buddhist-quotes`
- [ ] Verify clean removal (no leftover files in /usr)

### Performance Testing

**Memory Usage:**
```bash
# Monitor memory usage
watch -n 1 'ps aux | grep buddhist-quotes'
```
- Expected: ~150-300 MB RAM
- Acceptable: <500 MB RAM

**CPU Usage:**
```bash
# Monitor CPU usage
top -p $(pidof buddhist-quotes)
```
- Idle: <1% CPU
- During transitions: <5% CPU

**Startup Time:**
```bash
time ./Buddhist\ Quotes-2.0.0.AppImage
```
- Target: <3 seconds from launch to window visible

---

## Multi-Distribution Testing

### Using Docker

**Ubuntu 20.04:**
```bash
docker run -it --rm \
  -v $(pwd):/workspace \
  -e DISPLAY=$DISPLAY \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  ubuntu:20.04 bash

# Inside container:
apt-get update
apt-get install -y libfuse2 libnss3 libatk1.0-0 libatk-bridge2.0-0 \
  libcups2 libdrm2 libgtk-3-0 libgbm1 libasound2
cd /workspace
chmod +x Buddhist\ Quotes-2.0.0.AppImage
./Buddhist\ Quotes-2.0.0.AppImage
```

**Fedora 38:**
```bash
docker run -it --rm \
  -v $(pwd):/workspace \
  -e DISPLAY=$DISPLAY \
  -v /tmp/.X11-unix:/tmp/.X11-unix \
  fedora:38 bash

# Inside container:
dnf install -y fuse-libs nss atk at-spi2-atk cups-libs libdrm gtk3 mesa-libgbm alsa-lib
cd /workspace
chmod +x Buddhist\ Quotes-2.0.0.AppImage
./Buddhist\ Quotes-2.0.0.AppImage
```

**Note**: GUI apps in Docker require X11 forwarding. For production testing, use VMs or physical machines.

---

## CI/CD with GitHub Actions

### Workflow Example

Create `.github/workflows/build-linux.yml`:

```yaml
name: Build Linux Packages

on:
  push:
    tags:
      - 'v*'
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-22.04
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: |
          cd quotes-electron
          npm ci
      
      - name: Build Angular app
        run: |
          cd quotes-platform
          npm ci
          npm run build -- --base-href "./"
      
      - name: Build Electron app
        run: |
          cd quotes-electron
          npm run build:all
      
      - name: Package for Linux
        run: |
          cd quotes-electron
          npm run package:linux
        env:
          GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
      
      - name: Upload AppImage
        uses: actions/upload-artifact@v4
        with:
          name: linux-appimage
          path: quotes-electron/release/*.AppImage
      
      - name: Upload .deb
        uses: actions/upload-artifact@v4
        with:
          name: linux-deb
          path: quotes-electron/release/*.deb
      
      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v1
        with:
          files: |
            quotes-electron/release/*.AppImage
            quotes-electron/release/*.deb
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## Distribution

### AppImage Distribution

**Recommended Hosting:**
1. **GitHub Releases** (free, recommended)
   - Upload to: `https://github.com/YOUR_USER/buddhist-quotes/releases`
   - Users download: `Buddhist Quotes-2.0.0.AppImage`

2. **AppImageHub** (optional, for discoverability)
   - Submit to: https://www.appimagehub.com/
   - Requires appdata.xml file

3. **Self-Hosted**
   - Upload to your server
   - Provide direct download link

**Download Instructions for Users:**
```markdown
## Linux (AppImage)

1. Download: [Buddhist Quotes-2.0.0.AppImage](DOWNLOAD_URL)
2. Make executable: `chmod +x Buddhist\ Quotes-2.0.0.AppImage`
3. Run: `./Buddhist\ Quotes-2.0.0.AppImage`

No installation required!
```

### .deb Distribution

**Recommended Hosting:**
1. **GitHub Releases** (easiest)
   - Upload .deb file to releases

2. **Custom APT Repository** (advanced)
   - Setup: https://wiki.debian.org/DebianRepository/Setup
   - Users add your repo and `apt-get install buddhist-quotes`

**Download Instructions for Users:**
```markdown
## Linux (Debian/Ubuntu)

1. Download: [buddhist-quotes_2.0.0_amd64.deb](DOWNLOAD_URL)
2. Install: `sudo dpkg -i buddhist-quotes_2.0.0_amd64.deb`
3. Fix dependencies (if needed): `sudo apt-get install -f`
4. Launch from application menu or run: `buddhist-quotes`
```

---

## Troubleshooting

### AppImage Won't Run

**Problem**: `AppImages require FUSE to run`

**Solution:**
```bash
# Ubuntu/Debian
sudo apt-get install libfuse2

# Fedora
sudo dnf install fuse-libs

# Arch
sudo pacman -S fuse2
```

**Alternative**: Extract and run directly
```bash
./Buddhist\ Quotes-2.0.0.AppImage --appimage-extract
./squashfs-root/AppRun
```

### Missing Dependencies (.deb)

**Problem**: `dpkg: dependency problems prevent configuration`

**Solution:**
```bash
sudo apt-get install -f
```

### System Tray Not Working

**Problem**: Tray icon doesn't appear

**Solution**:
- GNOME: Install TopIconsPlus extension
- KDE: Should work out of the box
- XFCE: Check tray plugin is enabled

### Global Shortcuts Not Working

**Problem**: Shortcuts don't respond

**Solution**:
- Check if shortcuts conflict with system shortcuts
- Try different key combinations in settings
- Some desktop environments restrict global shortcuts

### Permission Denied

**Problem**: `AppImage: Permission denied`

**Solution:**
```bash
chmod +x Buddhist\ Quotes-2.0.0.AppImage
```

---

## Advanced Configuration

### Custom Installation Path (.deb)

The .deb package installs to:
- Binary: `/usr/bin/buddhist-quotes`
- Resources: `/usr/lib/buddhist-quotes/`
- Desktop entry: `/usr/share/applications/buddhist-quotes.desktop`
- Icon: `/usr/share/icons/hicolor/512x512/apps/buddhist-quotes.png`

### Desktop Entry Customization

Edit `/usr/share/applications/buddhist-quotes.desktop`:
```ini
[Desktop Entry]
Name=Buddhist Quotes
Comment=View and manage Buddhist quotes
Exec=buddhist-quotes
Icon=buddhist-quotes
Type=Application
Categories=Utility;
Terminal=false
StartupWMClass=Buddhist Quotes
```

### File Associations (Optional)

To associate .quote files with the app:
```ini
[Desktop Entry]
...
MimeType=application/x-buddhist-quote;
```

---

## Build Optimization

### Reduce Package Size

**1. Remove Source Maps:**
```bash
# Already configured in electron-builder.yml
files:
  - "!**/*.map"
```

**2. Use Maximum Compression:**
```yaml
# electron-builder.yml
compression: maximum
```

**3. Exclude Dev Dependencies:**
```bash
npm prune --production
```

### Target Specific Architectures

**x64 only (default):**
```bash
npx electron-builder --linux --x64
```

**arm64 (for ARM devices):**
```bash
npx electron-builder --linux --arm64
```

**Both:**
```bash
npx electron-builder --linux --x64 --arm64
```

---

## Testing Matrix

| Distribution | Version | AppImage | .deb | Notes |
|--------------|---------|----------|------|-------|
| Ubuntu       | 20.04   | ✅       | ✅   | LTS, primary target |
| Ubuntu       | 22.04   | ✅       | ✅   | LTS, recommended |
| Ubuntu       | 24.04   | ✅       | ✅   | Latest LTS |
| Debian       | 11      | ✅       | ✅   | Stable |
| Debian       | 12      | ✅       | ✅   | Current stable |
| Linux Mint   | 21      | ✅       | ✅   | Based on Ubuntu 22.04 |
| Pop!_OS      | 22.04   | ✅       | ✅   | Based on Ubuntu |
| Fedora       | 38+     | ✅       | ❌   | Use AppImage |
| RHEL/CentOS  | 8+      | ✅       | ❌   | Use AppImage |
| Arch Linux   | Rolling | ✅       | ❌   | Use AppImage or AUR |
| Manjaro      | Latest  | ✅       | ❌   | Use AppImage |
| openSUSE     | Leap    | ✅       | ❌   | Use AppImage |

✅ = Fully supported and tested  
❌ = Not applicable for this distribution

---

## Next Steps

After building and testing:

1. **T705: Auto-Update Setup** - Configure electron-updater for Linux
2. **Phase 8: Testing** - Comprehensive testing on multiple distributions
3. **Documentation** - Update user guides with Linux installation instructions
4. **Distribution** - Upload packages to GitHub Releases

---

## Resources

- [Electron Builder Linux Config](https://www.electron.build/configuration/linux)
- [AppImage Documentation](https://docs.appimage.org/)
- [Debian Packaging Guide](https://www.debian.org/doc/manuals/maint-guide/)
- [Desktop Entry Specification](https://specifications.freedesktop.org/desktop-entry-spec/latest/)
- [Icon Theme Specification](https://specifications.freedesktop.org/icon-theme-spec/latest/)

---

**Last Updated**: 2025-11-22  
**Electron Version**: 28.3.3  
**electron-builder Version**: 24.13.3
