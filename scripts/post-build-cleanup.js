import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import prettier from 'prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const BANNERS_DIR = path.join(ROOT_DIR, 'banners');

async function cleanHTMLFile(filePath) {
  console.log(`\nCleaning: ${path.basename(filePath)}`);

  let cleanHTML = await fs.readFile(filePath, 'utf-8');

  // Remove Astro's data attributes from HTML tags
  cleanHTML = cleanHTML.replace(/\s*data-astro-cid-[a-z0-9]+="[^"]*"/g, '');
  cleanHTML = cleanHTML.replace(/\s*data-astro-cid-[a-z0-9]+(?=[\s>])/g, '');

  // Remove Astro's data attributes from CSS selectors
  cleanHTML = cleanHTML.replace(/\[data-astro-cid-[a-z0-9]+\]/g, '');

  // Remove empty attributes
  cleanHTML = cleanHTML.replace(/=""(?=[\s>])/g, '');

  // Merge all style tags into one
  const styleMatches = cleanHTML.match(/<style[^>]*>([\s\S]*?)<\/style>/g);
  if (styleMatches && styleMatches.length > 1) {
    // Extract all CSS content
    const allCSS = styleMatches.map(styleTag => {
      const cssMatch = styleTag.match(/<style[^>]*>([\s\S]*?)<\/style>/);
      return cssMatch ? cssMatch[1].trim() : '';
    }).filter(css => css.length > 0).join('\n\n');

    // Remove all existing style tags
    cleanHTML = cleanHTML.replace(/<style[^>]*>[\s\S]*?<\/style>\s*/g, '');

    // Insert single merged style tag before </head>
    cleanHTML = cleanHTML.replace('</head>', `    <style>\n${allCSS}\n    </style>\n  </head>`);
  }

  // Format the entire HTML with Prettier
  try {
    cleanHTML = await prettier.format(cleanHTML, {
      parser: 'html',
      printWidth: 100,
      tabWidth: 2,
      useTabs: false,
      semi: true,
      singleQuote: false,
      htmlWhitespaceSensitivity: 'css',
      endOfLine: 'lf'
    });
  } catch (error) {
    console.log('  ⚠ Prettier formatting failed, using unformatted output');
  }

  await fs.writeFile(filePath, cleanHTML, 'utf-8');
  console.log('  ✓ Cleaned successfully');
}

async function findHTMLFiles(dir) {
  const files = [];

  async function traverse(currentPath) {
    const entries = await fs.readdir(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentPath, entry.name);

      if (entry.isDirectory()) {
        await traverse(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.html')) {
        files.push(fullPath);
      }
    }
  }

  await traverse(dir);
  return files;
}

async function main() {
  console.log('🧹 Post-Build HTML Cleanup\n');

  try {
    const htmlFiles = await findHTMLFiles(BANNERS_DIR);
    // Filter to only clean banner HTML files, not the index
    const bannerFiles = htmlFiles.filter(f => !f.endsWith('banners/index.html'));
    console.log(`Found ${bannerFiles.length} banner HTML file(s) to clean`);

    for (const file of bannerFiles) {
      await cleanHTMLFile(file);
    }

    console.log(`\n✅ Cleanup complete!`);
  } catch (error) {
    console.error('\n❌ Error during cleanup:', error);
    process.exit(1);
  }
}

main();
