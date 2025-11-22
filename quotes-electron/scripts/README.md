# Build Scripts

This directory contains automated build scripts for the Buddhist Quotes Electron app.

## Scripts Overview

| Script | Platform | Description |
|--------|----------|-------------|
| `dev.js` | All | Development server with hot reload |
| `create-mac-icon.js` | macOS | Instructions for creating .icns icon |
| `build-linux.sh` | Linux | Automated Linux build (AppImage + .deb) |

## Usage

### Development

**Start dev server (all platforms):**
```bash
npm run dev
# or
node scripts/dev.js
```

This will:
1. Start Angular dev server at http://localhost:4200
2. Launch Electron in development mode
3. Enable hot reload for both processes

### macOS Icon

**Create macOS icon:**
```bash
node scripts/create-mac-icon.js
```

Follow the instructions to create `build/icon.icns` from `build/icon.png`.

### Linux Build

**Automated build (Linux only):**
```bash
cd scripts
chmod +x build-linux.sh
./build-linux.sh
```

This will:
1. Check Node.js version (requires 20+)
2. Install system dependencies (apt-get/dnf/pacman)
3. Install npm dependencies
4. Build Angular app
5. Build Electron app (TypeScript)
6. Package for Linux (AppImage + .deb)

**Requirements:**
- Must run on Linux (Ubuntu 20.04+, Fedora 38+, Arch, etc.)
- Node.js 20+
- System build tools (gcc, make, etc.)
- Linux-specific libraries (see LINUX_PACKAGING_GUIDE.md)

**Alternatives if you're on Windows:**
1. **WSL2** (Recommended):
   ```powershell
   wsl --install -d Ubuntu-22.04
   wsl
   cd /mnt/d/Projects/Quotes/quotes-electron/scripts
   ./build-linux.sh
   ```

2. **Docker**:
   ```bash
   docker run -it --rm -v $(pwd):/workspace ubuntu:22.04 bash
   # Inside container: run build-linux.sh
   ```

3. **GitHub Actions**:
   - Create `.github/workflows/build-linux.yml`
   - See `LINUX_BUILD_QUICKREF.md` for workflow template

## Platform Build Matrix

| Platform | Script | Build On | Output |
|----------|--------|----------|--------|
| Windows | `npm run package:win` | Windows | .exe (NSIS + portable) |
| macOS | `npm run package:mac` | macOS | .dmg (universal binary) |
| Linux | `./scripts/build-linux.sh` | Linux | .AppImage + .deb |

## Notes

- **Windows packages**: Can be built on Windows (already built)
- **macOS packages**: Requires macOS system (configured, pending build)
- **Linux packages**: Requires Linux system (configured, pending build)

## Troubleshooting

### "Permission denied" on Linux scripts

```bash
chmod +x scripts/build-linux.sh
```

### "Cannot execute mksquashfs" on Windows

Linux builds require Linux tools. Use WSL2, Docker, or GitHub Actions.

### "Node version too old"

```bash
# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

## Resources

- **Windows**: See `DEPLOYMENT.md`
- **macOS**: See `MACOS_PACKAGING_GUIDE.md` and `MACOS_BUILD_QUICKREF.md`
- **Linux**: See `LINUX_PACKAGING_GUIDE.md` and `LINUX_BUILD_QUICKREF.md`
