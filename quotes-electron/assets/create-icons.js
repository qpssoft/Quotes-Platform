/**
 * Script to generate tray icons for all platforms
 * Requires: npm install sharp
 * Run: node assets/create-icons.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Simple Buddhist symbol using SVG (Dharma Wheel simplified)
const iconSvg = `
<svg width="64" height="64" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="grad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" style="stop-color:#D4AF37;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#B8860B;stop-opacity:1" />
    </radialGradient>
  </defs>
  
  <!-- Outer circle -->
  <circle cx="32" cy="32" r="28" fill="url(#grad)" stroke="#8B4513" stroke-width="2"/>
  
  <!-- Inner circle -->
  <circle cx="32" cy="32" r="6" fill="#FFF8F0" stroke="#8B4513" stroke-width="1.5"/>
  
  <!-- 8 spokes of Dharma Wheel -->
  <line x1="32" y1="10" x2="32" y2="26" stroke="#FFF8F0" stroke-width="2" stroke-linecap="round"/>
  <line x1="32" y1="38" x2="32" y2="54" stroke="#FFF8F0" stroke-width="2" stroke-linecap="round"/>
  <line x1="10" y1="32" x2="26" y2="32" stroke="#FFF8F0" stroke-width="2" stroke-linecap="round"/>
  <line x1="38" y1="32" x2="54" y2="32" stroke="#FFF8F0" stroke-width="2" stroke-linecap="round"/>
  
  <line x1="17" y1="17" x2="27" y2="27" stroke="#FFF8F0" stroke-width="2" stroke-linecap="round"/>
  <line x1="37" y1="37" x2="47" y2="47" stroke="#FFF8F0" stroke-width="2" stroke-linecap="round"/>
  <line x1="47" y1="17" x2="37" y2="27" stroke="#FFF8F0" stroke-width="2" stroke-linecap="round"/>
  <line x1="27" y1="37" x2="17" y2="47" stroke="#FFF8F0" stroke-width="2" stroke-linecap="round"/>
</svg>
`;

async function generateIcons() {
  const assetsDir = __dirname;
  
  console.log('Generating tray icons...');
  
  try {
    // Create base image from SVG
    const baseImage = sharp(Buffer.from(iconSvg));
    
    // Windows: 16x16 ICO (tray icon standard size)
    await baseImage
      .clone()
      .resize(16, 16)
      .png()
      .toFile(path.join(assetsDir, 'tray-icon.png'));
    console.log('✓ Created tray-icon.png (16x16)');
    
    // Create 32x32 for better quality on high DPI
    await baseImage
      .clone()
      .resize(32, 32)
      .png()
      .toFile(path.join(assetsDir, 'tray-icon@2x.png'));
    console.log('✓ Created tray-icon@2x.png (32x32)');
    
    // macOS: Template icon (monochrome, will be inverted by system)
    // Create a white version for template
    const templateSvg = iconSvg
      .replace(/fill="url\(#grad\)"/g, 'fill="transparent"')
      .replace(/stroke="#8B4513"/g, 'stroke="white"')
      .replace(/fill="#FFF8F0"/g, 'fill="white"')
      .replace(/stroke="#FFF8F0"/g, 'stroke="white"');
    
    await sharp(Buffer.from(templateSvg))
      .resize(22, 22) // macOS standard tray icon size
      .png()
      .toFile(path.join(assetsDir, 'tray-iconTemplate.png'));
    console.log('✓ Created tray-iconTemplate.png (22x22 for macOS)');
    
    await sharp(Buffer.from(templateSvg))
      .resize(44, 44) // macOS retina
      .png()
      .toFile(path.join(assetsDir, 'tray-iconTemplate@2x.png'));
    console.log('✓ Created tray-iconTemplate@2x.png (44x44 for macOS Retina)');
    
    console.log('\n✅ All tray icons generated successfully!');
    console.log('\nNote: For Windows ICO format, you can use online converters or:');
    console.log('  npm install -g png-to-ico');
    console.log('  png-to-ico assets/tray-icon.png assets/tray-icon@2x.png > assets/tray-icon.ico');
    
  } catch (error) {
    console.error('❌ Error generating icons:', error);
    process.exit(1);
  }
}

// Check if sharp is installed
try {
  require.resolve('sharp');
  generateIcons();
} catch (e) {
  console.error('❌ Sharp is not installed. Please run: npm install sharp');
  console.log('\nAlternatively, you can generate icons manually or use an online tool.');
  process.exit(1);
}
