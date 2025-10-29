import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream, createReadStream } from 'fs';
import { pipeline } from 'stream/promises';
import archiver from 'archiver';
import { JSDOM } from 'jsdom';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const BANNERS_DIR = path.join(ROOT_DIR, 'banners');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');

// Define which sizes use which images
const IMAGE_USAGE = {
  'embrace.png': ['300x250', '160x600', '300x600']
};

async function extractReferencedAssets(htmlPath) {
  const html = await fs.readFile(htmlPath, 'utf-8');
  const dom = new JSDOM(html);
  const doc = dom.window.document;

  const assets = new Set();

  // Find all img tags
  const images = doc.querySelectorAll('img');
  images.forEach(img => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('/images/')) {
      assets.add(src.replace(/^\//, '')); // Remove leading slash
    }
  });

  // Find all background-image styles (if any)
  const allElements = doc.querySelectorAll('*');
  allElements.forEach(el => {
    const style = el.getAttribute('style');
    if (style && style.includes('background-image')) {
      const urlMatch = style.match(/url\(['"]?(\/images\/[^'")\s]+)['"]?\)/);
      if (urlMatch) {
        assets.add(urlMatch[1].replace(/^\//, ''));
      }
    }
  });

  return Array.from(assets);
}

async function packageBanner(bannerId, sizeId, sourcePath) {
  const packageName = `${bannerId}_${sizeId}.zip`;
  const packagePath = path.join(PACKAGES_DIR, packageName);

  console.log(`\n📦 Packaging: ${packageName}`);

  // Create packages directory if it doesn't exist
  await fs.mkdir(PACKAGES_DIR, { recursive: true });

  // Create output stream
  const output = createWriteStream(packagePath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });

  // Pipe archive data to the file
  archive.pipe(output);

  // Add index.html
  const htmlPath = path.join(sourcePath, 'index.html');
  const htmlContent = await fs.readFile(htmlPath);
  archive.append(htmlContent, { name: 'index.html' });
  console.log('  ✓ Added index.html');

  // Extract and add referenced images
  const referencedAssets = await extractReferencedAssets(htmlPath);

  for (const assetPath of referencedAssets) {
    const fullAssetPath = path.join(PUBLIC_DIR, assetPath);
    try {
      const assetContent = await fs.readFile(fullAssetPath);
      archive.append(assetContent, { name: assetPath });
      console.log(`  ✓ Added ${assetPath}`);
    } catch (error) {
      console.log(`  ⚠ Warning: Could not find ${assetPath}`);
    }
  }

  // Finalize the archive
  await archive.finalize();

  // Wait for the stream to finish
  await new Promise((resolve, reject) => {
    output.on('close', resolve);
    output.on('error', reject);
  });

  const stats = await fs.stat(packagePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  console.log(`  ✅ Package created: ${packageName} (${sizeKB} KB)`);

  return {
    packageName,
    size: stats.size,
    sizeKB,
    assets: referencedAssets
  };
}

async function findBannerSizes() {
  const banners = [];

  try {
    const entries = await fs.readdir(BANNERS_DIR, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() || entry.name.startsWith('.')) continue;

      const bannerId = entry.name;
      const bannerPath = path.join(BANNERS_DIR, bannerId);

      // Check if this is a banner directory (contains size subdirectories)
      const sizeEntries = await fs.readdir(bannerPath, { withFileTypes: true });

      for (const sizeEntry of sizeEntries) {
        if (!sizeEntry.isDirectory() || sizeEntry.name.startsWith('.')) continue;

        const sizeId = sizeEntry.name;
        const sizePath = path.join(bannerPath, sizeId);

        // Check if it has an index.html
        try {
          await fs.access(path.join(sizePath, 'index.html'));
          banners.push({ bannerId, sizeId, path: sizePath });
        } catch {
          // No index.html, skip
        }
      }
    }
  } catch (error) {
    console.error('Error reading banners directory:', error);
  }

  return banners;
}

async function main() {
  console.log('📦 Banner Packaging Tool\n');
  console.log('This will create self-contained ZIP packages for each banner size.');
  console.log('Each package includes only the HTML and referenced assets.\n');

  try {
    // Find all banner sizes
    const banners = await findBannerSizes();

    if (banners.length === 0) {
      console.log('❌ No banners found. Run "npm run build" first.');
      process.exit(1);
    }

    console.log(`Found ${banners.length} banner size(s) to package:\n`);

    // Clean packages directory
    try {
      await fs.rm(PACKAGES_DIR, { recursive: true });
    } catch {
      // Directory doesn't exist, that's fine
    }

    const results = [];

    // Package each banner
    for (const banner of banners) {
      const result = await packageBanner(banner.bannerId, banner.sizeId, banner.path);
      results.push({ ...banner, ...result });
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 PACKAGING SUMMARY');
    console.log('='.repeat(60));

    for (const result of results) {
      console.log(`\n${result.packageName}:`);
      console.log(`  Size: ${result.sizeKB} KB`);
      console.log(`  Assets: ${result.assets.length > 0 ? result.assets.join(', ') : 'None'}`);
    }

    const totalSize = results.reduce((sum, r) => sum + r.size, 0);
    const totalSizeKB = (totalSize / 1024).toFixed(2);

    console.log('\n' + '='.repeat(60));
    console.log(`Total: ${results.length} packages, ${totalSizeKB} KB`);
    console.log('='.repeat(60));
    console.log(`\n✅ All packages created in: ./packages/\n`);

  } catch (error) {
    console.error('\n❌ Error during packaging:', error);
    process.exit(1);
  }
}

main();
