# Linux Packaging - Configuration Summary

**Task**: T704: Linux Packaging  
**Status**: ⏳ Configuration Complete - Build Requires Linux System  
**Date**: 2025-11-22

## What Was Completed

### 1. electron-builder Configuration ✅

Updated `electron-builder.yml` with Linux targets:
- **AppImage**: Universal Linux package (runs on all distros)
- **.deb**: Debian/Ubuntu package format
- **Desktop Entry**: Proper application metadata
- **Executable Name**: `buddhist-quotes`
- **Icon**: `build/icon.png` (already exists)

```yaml
linux:
  target:
    - target: AppImage
      arch: [x64]
    - target: deb
      arch: [x64]
  category: Utility
  desktop:
    Name: Buddhist Quotes
    GenericName: Quote Application
    Categories: Utility;
    Terminal: false
```

### 2. Documentation Created ✅

**LINUX_PACKAGING_GUIDE.md** (600+ lines):
- Prerequisites for Ubuntu, Fedora, Arch Linux
- Build process (manual and automated)
- Package details (AppImage and .deb)
- Testing checklists
- Multi-distribution testing with Docker
- CI/CD setup with GitHub Actions
- Distribution strategies
- Troubleshooting guide

**LINUX_BUILD_QUICKREF.md** (150+ lines):
- Quick command reference
- Prerequisites by distro
- Build commands
- Test commands
- WSL2 usage
- Docker usage
- GitHub Actions template

**scripts/README.md**:
- Overview of all build scripts
- Usage instructions
- Platform build matrix
- Troubleshooting

### 3. Build Script Created ✅

**scripts/build-linux.sh**:
- Automated build script for Linux
- Checks Node.js version
- Installs system dependencies (apt-get/dnf/pacman)
- Builds Angular app
- Builds Electron app
- Packages for Linux (AppImage + .deb)
- Displays build results with sizes

## Why Build Failed on Windows

Building Linux packages requires Linux-specific tools that are **not available on Windows**:

1. **mksquashfs**: Creates SquashFS filesystem for AppImage (Linux kernel feature)
2. **dpkg**: Debian package builder (Linux-only)
3. **FUSE**: Filesystem in Userspace (Linux kernel feature)

**Error encountered:**
```
⨯ cannot execute cause=exec: "mksquashfs": file does not exist
```

This is **expected behavior** - electron-builder cannot create Linux packages on Windows.

## How to Build Linux Packages

You have **4 options**:

### Option 1: WSL2 (Windows Subsystem for Linux) - RECOMMENDED

Best for Windows users who want to build locally:

```powershell
# Install WSL2 with Ubuntu
wsl --install -d Ubuntu-22.04

# Enter WSL
wsl

# Navigate to project (Windows drives are mounted at /mnt/)
cd /mnt/d/Projects/Quotes

# Run build script
cd quotes-electron/scripts
chmod +x build-linux.sh
./build-linux.sh
```

**Pros**: Fast, local, no cloud dependency  
**Cons**: Requires Windows 10/11 with WSL2 feature

### Option 2: Docker

Build in an isolated Ubuntu container:

```bash
# Run Ubuntu container
docker run -it --rm \
  -v D:\Projects\Quotes:/workspace \
  -w /workspace \
  ubuntu:22.04 bash

# Inside container
apt-get update
apt-get install -y curl build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs

cd quotes-electron/scripts
./build-linux.sh
```

**Pros**: Isolated, reproducible  
**Cons**: Requires Docker Desktop, slower

### Option 3: GitHub Actions - RECOMMENDED FOR DISTRIBUTION

Automated cloud builds triggered by git tags:

Create `.github/workflows/build-linux.yml`:

```yaml
name: Build Linux Packages

on:
  push:
    tags: ['v*']
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-22.04
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Build Angular
        run: |
          cd quotes-platform
          npm ci
          npm run build -- --base-href "./"
      
      - name: Build Linux packages
        run: |
          cd quotes-electron/scripts
          chmod +x build-linux.sh
          ./build-linux.sh
      
      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: linux-packages
          path: quotes-electron/release/*.{AppImage,deb}
      
      - name: Create Release
        if: startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v1
        with:
          files: quotes-electron/release/*.{AppImage,deb}
```

**Pros**: Automated, cloud-based, free for public repos  
**Cons**: Requires GitHub, slower than local

### Option 4: Linux VM or Physical Machine

If you have access to a Linux system:

```bash
# Clone repository
git clone https://github.com/YOUR_USER/buddhist-quotes.git
cd buddhist-quotes

# Run build script
cd quotes-electron/scripts
chmod +x build-linux.sh
./build-linux.sh
```

**Pros**: Native Linux environment  
**Cons**: Requires Linux access

## Expected Build Output

When build completes successfully, you'll get:

```
release/
├── Buddhist Quotes-2.0.0.AppImage      (~80-100 MB)
└── buddhist-quotes_2.0.0_amd64.deb     (~80-100 MB)
```

## Testing Requirements

Once built, test on these Linux distributions:

### Priority (Must Test)
- [ ] Ubuntu 22.04 LTS (AppImage + .deb)
- [ ] Ubuntu 20.04 LTS (AppImage + .deb)
- [ ] Debian 12 (AppImage + .deb)

### Secondary (Should Test)
- [ ] Ubuntu 24.04 LTS
- [ ] Linux Mint 21
- [ ] Pop!_OS 22.04

### Tertiary (Nice to Test)
- [ ] Fedora 38+ (AppImage only)
- [ ] Arch Linux (AppImage only)

### Test Checklist

**AppImage:**
1. Make executable: `chmod +x Buddhist\ Quotes-2.0.0.AppImage`
2. Run: `./Buddhist\ Quotes-2.0.0.AppImage`
3. Verify app launches without errors
4. Test all features (quotes, search, favorites, tray, shortcuts, overlay)
5. Verify Vietnamese text renders correctly
6. Close and relaunch, verify settings persist

**.deb Package:**
1. Install: `sudo dpkg -i buddhist-quotes_2.0.0_amd64.deb`
2. Fix dependencies: `sudo apt-get install -f`
3. Launch from application menu
4. Test all features
5. Verify desktop integration (menu entry, icon)
6. Test auto-launch setting
7. Uninstall: `sudo apt-get remove buddhist-quotes`
8. Verify clean removal

## Current Project Status

### Phase 7: Packaging & Distribution

| Task | Status | Platform | Notes |
|------|--------|----------|-------|
| T701 | ✅ Complete | All | electron-builder configured |
| T702 | ✅ Build Done | Windows | NSIS + portable (73 MB each) |
| T703 | ⏳ Configured | macOS | Requires macOS to build DMG |
| T704 | ⏳ Configured | Linux | Requires Linux to build packages |
| T705 | ⏸️ Pending | All | Auto-update setup |

**Overall**: 3/5 tasks configured, 1/5 built and tested

### What's Ready
- ✅ All configuration files
- ✅ All documentation
- ✅ Build scripts
- ✅ Windows packages (already built)

### What's Pending
- ⏸️ macOS build (needs Mac or CI/CD)
- ⏸️ Linux build (needs Linux, WSL2, Docker, or CI/CD)
- ⏸️ Cross-platform testing (Phase 8)
- ⏸️ Auto-update implementation (T705)

## Recommended Next Steps

### Immediate (Today)
1. Choose build method (WSL2, Docker, or GitHub Actions)
2. Build Linux packages using chosen method
3. Test AppImage on Ubuntu 22.04

### Short-term (This Week)
1. Test .deb package on Ubuntu/Debian
2. Document any distribution-specific issues
3. Test on 2-3 additional distributions
4. Begin T705: Auto-Update Setup

### Medium-term (Next Week)
1. Setup GitHub Actions for automated builds
2. Create release workflow (Windows + Linux + macOS)
3. Begin Phase 8: Testing & Polish
4. Write user documentation

## Resources

- **Full Guide**: `LINUX_PACKAGING_GUIDE.md`
- **Quick Reference**: `LINUX_BUILD_QUICKREF.md`
- **Build Script**: `scripts/build-linux.sh`
- **Scripts Documentation**: `scripts/README.md`
- **Configuration**: `electron-builder.yml`

## Support

For issues or questions:
1. Check `LINUX_PACKAGING_GUIDE.md` troubleshooting section
2. Review electron-builder docs: https://www.electron.build/configuration/linux
3. AppImage docs: https://docs.appimage.org/

---

**Summary**: T704 configuration is complete. All files, scripts, and documentation are ready. Building requires a Linux system (WSL2, Docker, VM, or CI/CD). Once built, test on Ubuntu 20.04+, Debian 11+, and optionally other distros.
