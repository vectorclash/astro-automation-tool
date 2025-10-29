import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';
import prettier from 'prettier';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, '..');
const BANNERS_DIR = path.join(ROOT_DIR, 'banners');

async function cleanHTMLFile(filePath) {
  console.log(`\nCleaning: ${path.basename(filePath)}`);

  let content = await fs.readFile(filePath, 'utf-8');

  // Split by </html> tag to find malformed content
  const htmlParts = content.split('</html>');
  if (htmlParts.length < 2) {
    console.log('  ⚠ No closing </html> tag found');
    return;
  }

  // Everything before </html>
  let mainHtml = htmlParts[0];

  // Everything after </html> (malformed content)
  const afterHtml = htmlParts.slice(1).join('</html>');

  // Parse the malformed content to extract body
  const dom = new JSDOM(afterHtml);
  const bodyElement = dom.window.document.body;

  // Get all content from body including script tags
  const bodyContent = bodyElement.innerHTML;

  // Find where </head> ends in the main HTML
  const headEndMatch = mainHtml.match(/(<\/head>)/i);
  if (!headEndMatch) {
    console.log('  ⚠ No closing </head> tag found');
    return;
  }

  const headEndIndex = mainHtml.indexOf(headEndMatch[0]) + headEndMatch[0].length;

  // Get everything up to and including </head>
  const htmlHead = mainHtml.substring(0, headEndIndex);

  // Get any orphaned styles/scripts between </head> and where we stopped
  const betweenContent = mainHtml.substring(headEndIndex).trim();

  // Build clean HTML
  let cleanHTML = htmlHead;

  // If there's content between </head> and </html>, it's likely styles - add to head
  if (betweenContent) {
    // Insert before </head>
    cleanHTML = htmlHead.replace('</head>', betweenContent + '\n</head>');
  }

  // Add body and close
  cleanHTML += '\n<body>\n' + bodyContent + '\n</body>\n</html>';

  // Remove Astro's data attributes from HTML tags
  cleanHTML = cleanHTML.replace(/\s*data-astro-cid-[a-z0-9]+="[^"]*"/g, '');
  cleanHTML = cleanHTML.replace(/\s*data-astro-cid-[a-z0-9]+(?=[\s>])/g, '');

  // Remove Astro's data attributes from CSS selectors
  cleanHTML = cleanHTML.replace(/\[data-astro-cid-[a-z0-9]+\]/g, '');

  // Remove empty attributes
  cleanHTML = cleanHTML.replace(/=""(?=[\s>])/g, '');

  // Fix title tag formatting - sometimes gets split like </title><style>...x250
  // This happens when title contains template vars like {size.width}x{size.height}
  cleanHTML = cleanHTML.replace(/(<title>[^<]*)<\/title>\s*<style>([^<]*<\/style>)([^<\s]+)\s*<style>/gs, (match, titleStart, firstStyle, orphanedText) => {
    // Combine the orphaned text back into the title
    return `${titleStart}${orphanedText}</title>\n    <style>${firstStyle}\n    <style>`;
  });

  // Simpler case: just text between </style> and <style>
  cleanHTML = cleanHTML.replace(/<\/style>\s*([a-zA-Z0-9]+)\s*<style>/g, '</style>\n    <style>');

  // Add line breaks after closing tags in head
  cleanHTML = cleanHTML.replace(/<\/title>/g, '</title>\n    ');
  cleanHTML = cleanHTML.replace(/<\/meta>/g, '</meta>\n    ');
  cleanHTML = cleanHTML.replace(/<\/style>\s*<style>/g, '</style>\n    <style>');

  // Format head section better
  cleanHTML = cleanHTML.replace(/<head>\s*/g, '<head>\n    ');
  cleanHTML = cleanHTML.replace(/\s*<\/head>/g, '\n  </head>');

  // Clean up body formatting
  cleanHTML = cleanHTML.replace(/<body>\s*/g, '<body>\n    ');
  cleanHTML = cleanHTML.replace(/\s*<\/body>/g, '\n  </body>');

  // Clean up excessive whitespace
  cleanHTML = cleanHTML.replace(/\n\s*\n\s*\n/g, '\n\n');

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
