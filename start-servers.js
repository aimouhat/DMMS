import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Daily Meeting Manager...');

// Start the backend server
console.log('📡 Starting backend server...');
const backendProcess = spawn('node', ['server/server.js'], {
  cwd: __dirname,
  stdio: 'inherit',
  env: { ...process.env, NODE_ENV: 'development' }
});

// Wait a moment for backend to start
setTimeout(() => {
  console.log('🌐 Starting frontend development server...');
  const frontendProcess = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  // Handle process cleanup
  const cleanup = () => {
    console.log('\n🛑 Shutting down servers...');
    backendProcess.kill();
    frontendProcess.kill();
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  frontendProcess.on('error', (error) => {
    console.error('Frontend process error:', error);
  });

}, 2000);

backendProcess.on('error', (error) => {
  console.error('Backend process error:', error);
  process.exit(1);
});

backendProcess.on('exit', (code) => {
  if (code !== 0) {
    console.error(`Backend server exited with code ${code}`);
    process.exit(1);
  }
});