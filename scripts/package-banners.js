import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const OUTPUT_DIR = path.join(ROOT_DIR, 'packaged-banners');

async function readBannerData() {
  const dataPath = path.join(ROOT_DIR, 'src/data/banners.json');
  const content = await fs.readFile(dataPath, 'utf-8');
  return JSON.parse(content);
}

async function ensureDir(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
}

async function copyFile(src, dest) {
  await ensureDir(path.dirname(dest));
  await fs.copyFile(src, dest);
}

async function readFile(filePath) {
  try {
    return await fs.readFile(filePath, 'utf-8');
  } catch {
    return null;
  }
}

async function packageBanner(banner, size) {
  const sizeId = size.id;
  const bannerId = banner.id;
  const outputPath = path.join(OUTPUT_DIR, bannerId, `${size.width}x${size.height}`);

  await ensureDir(outputPath);

  console.log(`\nPackaging: ${banner.name} - ${size.width}x${size.height}`);

  // Read the built HTML from dist
  const htmlPath = path.join(DIST_DIR, 'banner', bannerId, `${sizeId}.html`);
  let html = await readFile(htmlPath);

  if (!html) {
    console.error(`  ❌ HTML file not found: ${htmlPath}`);
    return;
  }

  // Copy CSS files
  const cssBasePath = path.join(DIST_DIR, 'styles/banner-base.css');
  const cssSizePath = path.join(DIST_DIR, `styles/sizes/${size.width}x${size.height}.css`);

  const cssBase = await readFile(cssBasePath);
  const cssSize = await readFile(cssSizePath);

  if (cssBase && cssSize) {
    const combinedCSS = cssBase + '\n\n' + cssSize;
    await fs.writeFile(path.join(outputPath, 'styles.css'), combinedCSS);
    console.log('  ✓ CSS bundled');
  }

  // Copy JavaScript
  const jsPath = path.join(DIST_DIR, 'scripts/banner-animation.js');
  const js = await readFile(jsPath);

  if (js) {
    await fs.writeFile(path.join(outputPath, 'animation.js'), js);
    console.log('  ✓ JavaScript copied');
  }

  // Copy images referenced in banner
  const imagesDir = path.join(outputPath, 'images');
  await ensureDir(imagesDir);

  for (const [key, assetPath] of Object.entries(banner.assets || {})) {
    if (assetPath && typeof assetPath === 'string' && assetPath.startsWith('/images/')) {
      const filename = path.basename(assetPath);
      const srcPath = path.join(ROOT_DIR, 'public', assetPath);
      const destPath = path.join(imagesDir, filename);

      try {
        await copyFile(srcPath, destPath);
        console.log(`  ✓ Image copied: ${filename}`);
      } catch (err) {
        console.log(`  ⚠ Image not found: ${assetPath}`);
      }
    }
  }

  // Update HTML to use local paths
  html = html.replace(/href="\/styles\/banner-base\.css"/g, 'href="styles.css"');
  html = html.replace(/href="\/styles\/sizes\/[^"]+"/g, '');
  html = html.replace(/from '\/scripts\/banner-animation\.js'/g, "from './animation.js'");
  html = html.replace(/\/images\//g, 'images/');

  // Write the final HTML
  await fs.writeFile(path.join(outputPath, 'index.html'), html);
  console.log('  ✓ HTML created');

  // Create a ZIP-ready structure info file
  const info = {
    campaign: banner.name,
    size: `${size.width}x${size.height}`,
    dimensions: { width: size.width, height: size.height },
    files: [
      'index.html',
      'styles.css',
      'animation.js',
      ...(await fs.readdir(imagesDir)).map(f => `images/${f}`)
    ],
    clickthrough: banner.clickthrough
  };

  await fs.writeFile(
    path.join(outputPath, 'banner-info.json'),
    JSON.stringify(info, null, 2)
  );

  console.log(`  ✓ Package complete: ${outputPath}`);
  return outputPath;
}

async function main() {
  console.log('🎨 Banner Packaging Tool\n');

  // Read banner data
  const data = await readBannerData();
  console.log(`Found ${data.banners.length} campaign(s)`);

  // Check if dist exists
  try {
    await fs.access(DIST_DIR);
  } catch {
    console.error('\n❌ Error: dist directory not found.');
    console.error('Please run "npm run build" first.\n');
    process.exit(1);
  }

  // Clean output directory
  try {
    await fs.rm(OUTPUT_DIR, { recursive: true });
  } catch {}
  await ensureDir(OUTPUT_DIR);

  // Package all banners
  const packages = [];
  for (const banner of data.banners) {
    for (const size of banner.sizes) {
      const packagePath = await packageBanner(banner, size);
      if (packagePath) {
        packages.push(packagePath);
      }
    }
  }

  console.log(`\n✅ Packaged ${packages.length} banner(s)`);
  console.log(`📦 Output directory: ${OUTPUT_DIR}\n`);
}

main().catch(console.error);
