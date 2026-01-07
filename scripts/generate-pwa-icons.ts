/**
 * PWA Icon Generator - World-Class Implementation
 * Generates all required icon sizes from source image
 */

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const SOURCE_ICON = join(process.cwd(), 'public/images/Logo Icon DatingAssistent.png');
const OUTPUT_DIR = join(process.cwd(), 'public/icons');

// Icon configurations for PWA
const ICON_SIZES = [
  // Standard PWA icons
  { size: 16, name: 'favicon-16x16.png' },
  { size: 32, name: 'favicon-32x32.png' },
  { size: 48, name: 'icon-48x48.png' },
  { size: 72, name: 'icon-72x72.png' },
  { size: 96, name: 'icon-96x96.png' },
  { size: 128, name: 'icon-128x128.png' },
  { size: 144, name: 'icon-144x144.png' },
  { size: 152, name: 'icon-152x152.png' },
  { size: 192, name: 'icon-192x192.png' },
  { size: 256, name: 'icon-256x256.png' },
  { size: 384, name: 'icon-384x384.png' },
  { size: 512, name: 'icon-512x512.png' },

  // Apple Touch Icons
  { size: 120, name: 'apple-touch-icon-120x120.png' },
  { size: 152, name: 'apple-touch-icon-152x152.png' },
  { size: 167, name: 'apple-touch-icon-167x167.png' },
  { size: 180, name: 'apple-touch-icon-180x180.png' },
  { size: 1024, name: 'apple-touch-icon-1024x1024.png' },

  // Badge icon (monochrome, smaller)
  { size: 72, name: 'badge-72x72.png' },
];

// Maskable icons need padding for safe zone
const MASKABLE_SIZES = [
  { size: 192, name: 'maskable-icon-192x192.png' },
  { size: 512, name: 'maskable-icon-512x512.png' },
];

async function generateIcons() {
  console.log('🎨 Generating PWA icons...\n');

  // Ensure output directory exists
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Check if source exists
  if (!existsSync(SOURCE_ICON)) {
    console.error(`❌ Source icon not found: ${SOURCE_ICON}`);
    process.exit(1);
  }

  const sourceImage = sharp(SOURCE_ICON);
  const metadata = await sourceImage.metadata();

  console.log(`📷 Source: ${metadata.width}x${metadata.height} ${metadata.format}\n`);

  // Generate standard icons
  console.log('📦 Generating standard icons...');
  for (const { size, name } of ICON_SIZES) {
    try {
      await sharp(SOURCE_ICON)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 255, g: 255, b: 255, alpha: 0 }
        })
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(join(OUTPUT_DIR, name));

      console.log(`  ✅ ${name}`);
    } catch (error) {
      console.error(`  ❌ Failed: ${name}`, error);
    }
  }

  // Generate maskable icons with safe zone padding (10% padding)
  console.log('\n🎭 Generating maskable icons...');
  for (const { size, name } of MASKABLE_SIZES) {
    try {
      const padding = Math.round(size * 0.1);
      const innerSize = size - (padding * 2);

      await sharp(SOURCE_ICON)
        .resize(innerSize, innerSize, {
          fit: 'contain',
          background: { r: 255, g: 107, b: 157, alpha: 1 } // Brand pink
        })
        .extend({
          top: padding,
          bottom: padding,
          left: padding,
          right: padding,
          background: { r: 255, g: 107, b: 157, alpha: 1 } // Brand pink
        })
        .png({ quality: 100, compressionLevel: 9 })
        .toFile(join(OUTPUT_DIR, name));

      console.log(`  ✅ ${name}`);
    } catch (error) {
      console.error(`  ❌ Failed: ${name}`, error);
    }
  }

  // Generate favicon.ico (multi-resolution)
  console.log('\n🔷 Generating favicon...');
  try {
    await sharp(SOURCE_ICON)
      .resize(32, 32, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
      .toFile(join(OUTPUT_DIR, 'favicon.ico'));
    console.log('  ✅ favicon.ico');
  } catch (error) {
    console.error('  ❌ Failed: favicon.ico', error);
  }

  // Generate screenshots placeholders info
  console.log('\n📱 Screenshot recommendations:');
  console.log('  - Mobile: 1080x1920 (9:16 aspect ratio)');
  console.log('  - Tablet: 1200x1600 (3:4 aspect ratio)');
  console.log('  - Desktop: 1920x1080 (16:9 aspect ratio)');

  console.log('\n✨ PWA icon generation complete!');
  console.log(`📁 Icons saved to: ${OUTPUT_DIR}`);
}

generateIcons().catch(console.error);
