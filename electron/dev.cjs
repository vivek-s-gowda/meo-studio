const { spawn } = require('child_process');
const http = require('http');

console.log('🚀 Starting FlexUI in Electron Development Mode...');

// 1. Start Vite Dev Server
const viteProcess = spawn('npx', ['vite', '--port', '5173'], {
  stdio: 'inherit',
  shell: true,
  env: { ...process.env, BROWSER: 'none' },
});

// 2. Poll until Vite is ready
function waitForVite(callback, retries = 30) {
  if (retries <= 0) {
    console.error('❌ Timeout waiting for Vite server.');
    viteProcess.kill();
    process.exit(1);
  }

  const req = http.get('http://localhost:5173', (res) => {
    callback();
  });

  req.on('error', () => {
    setTimeout(() => waitForVite(callback, retries - 1), 500);
  });
}

waitForVite(() => {
  console.log('✨ Vite dev server ready on http://localhost:5173');
  console.log('🖥️ Launching Electron window...');

  const electronProcess = spawn('npx', ['electron', '.'], {
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'development',
      VITE_DEV_SERVER_URL: 'http://localhost:5173',
    },
  });

  electronProcess.on('close', () => {
    console.log('👋 Electron closed. Shutting down Vite...');
    viteProcess.kill();
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  viteProcess.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  viteProcess.kill();
  process.exit(0);
});
