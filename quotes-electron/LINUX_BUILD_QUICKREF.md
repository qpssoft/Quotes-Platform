# Linux Build Quick Reference

Quick commands for building Buddhist Quotes on Linux.

## Prerequisites

```bash
# Ubuntu/Debian
sudo apt-get install -y build-essential libglib2.0-dev libfuse2 libnss3 \
  libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgtk-3-0 libgbm1 libasound2

# Fedora/RHEL
sudo dnf install -y gcc-c++ make glib2-devel fuse-libs nss atk at-spi2-atk \
  cups-libs libdrm gtk3 mesa-libgbm alsa-lib

# Arch Linux
sudo pacman -S --needed base-devel glib2 fuse2 nss atk at-spi2-atk cups \
  libdrm gtk3 mesa alsa-lib
```

## Build Commands

### Quick Build (Automated)

```bash
# Run the build script
cd quotes-electron/scripts
chmod +x build-linux.sh
./build-linux.sh
```

### Manual Build

```bash
# 1. Install dependencies
cd quotes-platform && npm install
cd ../quotes-electron && npm install

# 2. Build Angular
cd ../quotes-platform
npm run build -- --base-href "./"

# 3. Build Electron
cd ../quotes-electron
npm run build:all

# 4. Package for Linux
npm run package:linux
```

### Build Specific Targets

```bash
# AppImage only
npx electron-builder --linux appimage

# .deb only
npx electron-builder --linux deb

# Both (default)
npx electron-builder --linux
```

## Test Commands

### Test AppImage

```bash
cd release
chmod +x Buddhist\ Quotes-2.0.0.AppImage
./Buddhist\ Quotes-2.0.0.AppImage
```

### Test .deb Package

```bash
sudo dpkg -i release/buddhist-quotes_2.0.0_amd64.deb
buddhist-quotes

# Uninstall
sudo apt-get remove buddhist-quotes
```

## Using WSL2 on Windows

```powershell
# Install WSL2 with Ubuntu
wsl --install -d Ubuntu-22.04

# Enter WSL
wsl

# Inside WSL, navigate to project
cd /mnt/d/Projects/Quotes
./quotes-electron/scripts/build-linux.sh
```

## Using Docker

```bash
# Build in Ubuntu container
docker run -it --rm \
  -v $(pwd):/workspace \
  -w /workspace \
  ubuntu:22.04 bash

# Inside container:
apt-get update
apt-get install -y curl build-essential
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt-get install -y nodejs
cd quotes-electron/scripts
./build-linux.sh
```

## Using GitHub Actions

Create `.github/workflows/build-linux.yml`:

```yaml
name: Build Linux

on:
  push:
    tags: ['v*']

jobs:
  build:
    runs-on: ubuntu-22.04
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: cd quotes-electron/scripts && ./build-linux.sh
      - uses: actions/upload-artifact@v4
        with:
          name: linux-packages
          path: quotes-electron/release/*.{AppImage,deb}
```

## Build Output

Expected files in `release/`:
- `Buddhist Quotes-2.0.0.AppImage` (~80-100 MB)
- `buddhist-quotes_2.0.0_amd64.deb` (~80-100 MB)

## Testing Matrix

| Distribution | AppImage | .deb | Tested |
|--------------|----------|------|--------|
| Ubuntu 20.04 | ✅       | ✅   | ⏸️     |
| Ubuntu 22.04 | ✅       | ✅   | ⏸️     |
| Ubuntu 24.04 | ✅       | ✅   | ⏸️     |
| Debian 11    | ✅       | ✅   | ⏸️     |
| Debian 12    | ✅       | ✅   | ⏸️     |
| Linux Mint   | ✅       | ✅   | ⏸️     |
| Fedora 38+   | ✅       | ❌   | ⏸️     |
| Arch Linux   | ✅       | ❌   | ⏸️     |

## Troubleshooting

### "mksquashfs: command not found"

Building on Windows won't work. Use:
1. WSL2: `wsl --install -d Ubuntu-22.04`
2. Docker: See Docker command above
3. GitHub Actions: See workflow above
4. Linux VM or physical machine

### "Cannot find module 'fs-extra'"

```bash
cd quotes-electron
npm install
```

### Permission Denied

```bash
chmod +x Buddhist\ Quotes-2.0.0.AppImage
```

## Resources

- Full guide: `LINUX_PACKAGING_GUIDE.md`
- Build script: `scripts/build-linux.sh`
- Config: `electron-builder.yml`
