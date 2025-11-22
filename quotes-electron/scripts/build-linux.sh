#!/bin/bash

# Linux Build Script for Buddhist Quotes Electron App
# This script should be run on a Linux system (Ubuntu 20.04+ recommended)

set -e  # Exit on error

echo "======================================"
echo "Buddhist Quotes - Linux Build Script"
echo "======================================"
echo ""

# Check if running on Linux
if [[ "$OSTYPE" != "linux-gnu"* ]]; then
    echo "❌ Error: This script must be run on Linux"
    echo "   Current OS: $OSTYPE"
    echo ""
    echo "Options:"
    echo "  1. Run on a Linux machine (Ubuntu 20.04+ recommended)"
    echo "  2. Use Docker: docker run -it --rm -v \$(pwd):/workspace ubuntu:22.04 bash"
    echo "  3. Use GitHub Actions (see .github/workflows/build-linux.yml)"
    echo "  4. Use WSL2 on Windows: wsl --install -d Ubuntu-22.04"
    exit 1
fi

# Check Node.js version
echo "📦 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed"
    echo "   Install: curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -"
    echo "           sudo apt-get install -y nodejs"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version 20+ required (current: $(node -v))"
    exit 1
fi
echo "✅ Node.js $(node -v)"

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm $(npm -v)"

# Install system dependencies
echo ""
echo "📦 Installing system dependencies..."
if command -v apt-get &> /dev/null; then
    # Debian/Ubuntu
    sudo apt-get update -qq
    sudo apt-get install -y -qq \
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
    echo "✅ Dependencies installed (Debian/Ubuntu)"
elif command -v dnf &> /dev/null; then
    # Fedora/RHEL
    sudo dnf install -y -q \
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
    echo "✅ Dependencies installed (Fedora/RHEL)"
elif command -v pacman &> /dev/null; then
    # Arch Linux
    sudo pacman -S --needed --noconfirm \
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
    echo "✅ Dependencies installed (Arch Linux)"
else
    echo "⚠️  Unknown package manager. Please install dependencies manually."
    echo "   See LINUX_PACKAGING_GUIDE.md for details."
fi

# Navigate to project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$PROJECT_ROOT"

echo ""
echo "📁 Project root: $PROJECT_ROOT"

# Install dependencies
echo ""
echo "📦 Installing Node.js dependencies..."

# Install quotes-platform dependencies
if [ -d "quotes-platform" ]; then
    echo "   → quotes-platform"
    cd quotes-platform
    npm install --silent
    cd ..
else
    echo "❌ quotes-platform directory not found"
    exit 1
fi

# Install quotes-electron dependencies
if [ -d "quotes-electron" ]; then
    echo "   → quotes-electron"
    cd quotes-electron
    npm install --silent
    cd ..
else
    echo "❌ quotes-electron directory not found"
    exit 1
fi

echo "✅ Dependencies installed"

# Build Angular app
echo ""
echo "🔨 Building Angular app..."
cd quotes-platform
npm run build -- --base-href "./"
echo "✅ Angular app built"

# Build Electron app
echo ""
echo "🔨 Building Electron app (TypeScript)..."
cd ../quotes-electron
npm run build
echo "✅ Electron TypeScript compiled"

# Copy Angular renderer
echo ""
echo "📋 Copying Angular renderer..."
npm run copy:renderer
echo "✅ Renderer copied"

# Package for Linux
echo ""
echo "📦 Packaging for Linux..."
echo "   This may take 2-5 minutes..."
npm run package:linux

# Check results
echo ""
echo "======================================"
echo "✅ Build Complete!"
echo "======================================"
echo ""

if [ -d "release" ]; then
    echo "📦 Packages created:"
    ls -lh release/*.AppImage release/*.deb 2>/dev/null | awk '{print "   " $9 " (" $5 ")"}'
    echo ""
    
    # Calculate total size
    TOTAL_SIZE=$(du -sh release/*.{AppImage,deb} 2>/dev/null | awk '{sum+=$1} END {print sum}')
    echo "📊 Total size: ~$TOTAL_SIZE MB"
    echo ""
    
    echo "📝 Next steps:"
    echo "   1. Test AppImage:"
    echo "      chmod +x release/Buddhist\\ Quotes-2.0.0.AppImage"
    echo "      ./release/Buddhist\\ Quotes-2.0.0.AppImage"
    echo ""
    echo "   2. Test .deb package:"
    echo "      sudo dpkg -i release/buddhist-quotes_2.0.0_amd64.deb"
    echo "      buddhist-quotes"
    echo ""
    echo "   3. Upload to GitHub Releases"
    echo ""
else
    echo "⚠️  No release directory found. Build may have failed."
    exit 1
fi
