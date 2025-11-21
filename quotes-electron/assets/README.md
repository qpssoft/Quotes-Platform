# Tray Icons

This directory contains system tray icons for the Buddhist Quotes desktop app.

## Required Icons

### Windows
- `tray-icon.ico` - 16x16, 32x32 multi-resolution ICO file

### macOS
- `tray-iconTemplate.png` - 16x16 PNG with transparency (template icon)
- `tray-iconTemplate@2x.png` - 32x32 PNG for Retina displays

### Linux
- `tray-icon.png` - 16x16 PNG with transparency
- `tray-icon@2x.png` - 32x32 PNG for HiDPI displays

## Design Guidelines

**Concept**: Simple lotus flower or dharma wheel silhouette

**Colors**:
- Windows: Full color or monochrome
- macOS: Pure black/white (template mode)
- Linux: Full color with transparency

**Style**: Minimalist, recognizable at small sizes

## TODO

Generate actual icon files. For now, using placeholder icons.

To generate icons from SVG:
```bash
# Install ImageMagick or similar tool
# Convert SVG to various formats
convert icon.svg -resize 16x16 tray-icon.png
convert icon.svg -resize 32x32 tray-icon@2x.png
# For ICO (multi-resolution)
convert icon.svg -define icon:auto-resize=16,32,48 tray-icon.ico
```
