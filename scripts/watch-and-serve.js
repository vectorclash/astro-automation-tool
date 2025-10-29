import { watch } from 'fs';
import { spawn } from 'child_process';
import browserSync from 'browser-sync';
import { join } from 'path';
import { readdirSync, statSync } from 'fs';

const bs = browserSync.create();
let isBuilding = false;
let buildQueued = false;
let buildDebounceTimer = null;

// Start browser-sync server
bs.init({
  server: './banners',
  files: ['banners/**/*.html'],
  port: 3000,
  ui: false,
  notify: false,
  open: true,
});

console.log('\n🚀 Dev server started at http://localhost:3000');
console.log('👀 Watching for changes...\n');

// Function to run the build with debouncing
function runBuild() {
  // Clear any pending build
  if (buildDebounceTimer) {
    clearTimeout(buildDebounceTimer);
  }

  // Debounce the build to avoid multiple rapid builds
  buildDebounceTimer = setTimeout(() => {
    if (isBuilding) {
      buildQueued = true;
      return;
    }

    isBuilding = true;
    console.log('🔨 Building...');

    const build = spawn('npm', ['run', 'build'], {
      stdio: 'inherit',
      shell: true,
    });

    build.on('close', (code) => {
      isBuilding = false;

      if (code === 0) {
        console.log('✅ Build complete!\n');
      } else {
        console.log('❌ Build failed\n');
      }

      // If a build was queued while we were building, run it now
      if (buildQueued) {
        buildQueued = false;
        runBuild();
      }
    });
  }, 300); // Debounce for 300ms
}

// Recursively get all files in a directory
function getAllFiles(dir, fileList = []) {
  try {
    const files = readdirSync(dir);
    files.forEach(file => {
      const filePath = join(dir, file);
      try {
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
          // Skip node_modules and hidden directories
          if (!file.startsWith('.') && file !== 'node_modules') {
            getAllFiles(filePath, fileList);
          }
        } else {
          fileList.push(filePath);
        }
      } catch (err) {
        // Skip files we can't access
      }
    });
  } catch (err) {
    console.error(`Error reading directory ${dir}:`, err);
  }
  return fileList;
}

// Watch directories using native fs.watch
function watchDirectory(dir, label) {
  try {
    const watcher = watch(dir, { recursive: true }, (eventType, filename) => {
      if (filename) {
        // Ignore hidden files, node_modules, and dist
        if (filename.startsWith('.') ||
            filename.includes('node_modules') ||
            filename.includes('dist/') ||
            filename.includes('.astro/')) {
          return;
        }

        const changeType = eventType === 'rename' ? '📝' : '📝';
        console.log(`${changeType} Changed: ${filename} (${label})`);
        runBuild();
      }
    });

    watcher.on('error', (error) => {
      console.error(`❌ Watcher error in ${dir}:`, error);
    });

    console.log(`✅ Watching: ${label}`);
    return watcher;
  } catch (err) {
    console.error(`Failed to watch ${dir}:`, err);
    return null;
  }
}

// Set up watchers for source directories
const watchers = [];
watchers.push(watchDirectory('./src', 'src/'));
watchers.push(watchDirectory('./public', 'public/'));

// Watch astro.config.mjs specifically
try {
  const configWatcher = watch('./astro.config.mjs', () => {
    console.log('📝 Changed: astro.config.mjs');
    runBuild();
  });
  watchers.push(configWatcher);
  console.log('✅ Watching: astro.config.mjs');
} catch (err) {
  console.error('Failed to watch astro.config.mjs:', err);
}

console.log('\n✅ File watchers ready and monitoring for changes\n');

// Run initial build
runBuild();

// Handle cleanup on exit
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down...');
  watchers.forEach(w => {
    if (w && typeof w.close === 'function') {
      w.close();
    }
  });
  bs.exit();
  process.exit();
});
