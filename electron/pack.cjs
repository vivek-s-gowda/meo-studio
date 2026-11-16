const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ensure local project-scoped cache directory exists to avoid ~/Library/Caches/electron root permission issues
const localCacheDir = path.join(__dirname, '../.cache/electron');
if (!fs.existsSync(localCacheDir)) {
  fs.mkdirSync(localCacheDir, { recursive: true });
}

// Set environment variables for electron-builder and @electron/get
const env = {
  ...process.env,
  ELECTRON_CACHE: localCacheDir,
  electron_config_cache: localCacheDir,
};

// Forward CLI arguments (e.g. --mac, --win, --linux)
const args = process.argv.slice(2);

console.log(`📦 Running electron-builder (Cache: ${localCacheDir})...`);

const builderProcess = spawn('npx', ['electron-builder', ...args], {
  stdio: 'inherit',
  shell: true,
  env,
});

builderProcess.on('close', (code) => {
  process.exit(code || 0);
});
