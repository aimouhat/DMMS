import { spawn } from 'child_process';
import { config } from 'dotenv';

// Load environment variables
config();

// Start the frontend
const frontend = spawn('npm', ['run', 'dev'], { 
  stdio: 'inherit',
  shell: true 
});

// Start the backend
const backend = spawn('node', ['server/server.js'], { 
  stdio: 'inherit',
  shell: true 
});

// Handle process termination
process.on('SIGINT', () => {
  frontend.kill('SIGINT');
  backend.kill('SIGINT');
  process.exit();
});

console.log('Development servers started!');
console.log('- Frontend: http://localhost:5173');
console.log('- Backend: http://localhost:3001');
console.log('');
console.log('Press Ctrl+C to stop all servers');