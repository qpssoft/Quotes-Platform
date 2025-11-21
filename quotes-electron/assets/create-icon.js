const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// SVG icon with Dharma Wheel on gold background
const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#E5C485;stop-opacity:1" />
      <stop offset="50%" style="stop-color:#D4AF37;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#C49B2A;stop-opacity:1" />
    </linearGradient>
  </defs>
  
  <!-- Rounded background -->
  <rect x="0" y="0" width="512" height="512" rx="80" fill="url(#goldGradient)"/>
  
  <!-- Dharma Wheel (White) -->
  <g transform="translate(256,256)" fill="#FFFFFF" stroke="#FFFFFF">
    <!-- Center hub -->
    <circle cx="0" cy="0" r="25" fill="#FFFFFF"/>
    
    <!-- 8 spokes -->
    <g id="spoke">
      <rect x="-8" y="-120" width="16" height="95" rx="4"/>
    </g>
    <use href="#spoke" transform="rotate(45)"/>
    <use href="#spoke" transform="rotate(90)"/>
    <use href="#spoke" transform="rotate(135)"/>
    <use href="#spoke" transform="rotate(180)"/>
    <use href="#spoke" transform="rotate(225)"/>
    <use href="#spoke" transform="rotate(270)"/>
    <use href="#spoke" transform="rotate(315)"/>
    
    <!-- Outer rim -->
    <circle cx="0" cy="0" r="120" fill="none" stroke="#FFFFFF" stroke-width="20"/>
    
    <!-- Center dot -->
    <circle cx="0" cy="0" r="12" fill="#D4AF37"/>
  </g>
</svg>`;

async function createIcons() {
  const assetsDir = __dirname;
  
  // Save SVG
  const svgPath = path.join(assetsDir, 'icon.svg');
  fs.writeFileSync(svgPath, svgIcon);
  console.log('✓ Created icon.svg');
  
  // Create PNG at different sizes
  const sizes = [16, 32, 48, 64, 128, 256, 512];
  
  for (const size of sizes) {
    await sharp(Buffer.from(svgIcon))
      .resize(size, size)
      .png()
      .toFile(path.join(assetsDir, `icon-${size}.png`));
    console.log(`✓ Created icon-${size}.png`);
  }
  
  // Create ICO file (Windows) - combine multiple sizes
  const icoSizes = [16, 32, 48, 256];
  const pngBuffers = await Promise.all(
    icoSizes.map(size =>
      sharp(Buffer.from(svgIcon))
        .resize(size, size)
        .png()
        .toBuffer()
    )
  );
  
  // Create ICO header
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // Reserved
  icoHeader.writeUInt16LE(1, 2); // Type (1 = ICO)
  icoHeader.writeUInt16LE(icoSizes.length, 4); // Number of images
  
  // Create ICO directory entries
  let offset = 6 + (16 * icoSizes.length);
  const directoryEntries = icoSizes.map((size, i) => {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0); // Width (0 = 256)
    entry.writeUInt8(size === 256 ? 0 : size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(pngBuffers[i].length, 8); // Image size
    entry.writeUInt32LE(offset, 12); // Image offset
    offset += pngBuffers[i].length;
    return entry;
  });
  
  // Combine all parts
  const icoBuffer = Buffer.concat([
    icoHeader,
    ...directoryEntries,
    ...pngBuffers
  ]);
  
  const icoPath = path.join(assetsDir, 'icon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log('✓ Created icon.ico');
  
  // Create ICNS for macOS (simplified - just copy largest PNG)
  await sharp(Buffer.from(svgIcon))
    .resize(1024, 1024)
    .png()
    .toFile(path.join(assetsDir, 'icon-1024.png'));
  console.log('✓ Created icon-1024.png (use for macOS ICNS conversion)');
  
  console.log('\n✅ All icons created successfully!');
  console.log('Note: For macOS .icns file, use a tool like "iconutil" or "png2icns"');
}

createIcons().catch(err => {
  console.error('Error creating icons:', err);
  process.exit(1);
});
