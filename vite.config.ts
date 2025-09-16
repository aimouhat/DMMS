import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0', // Bind to all network interfaces
    port: 60, // Use default HTTP port (no port needed in URL)
    strictPort: true,
    allowedHosts: ['dailymeeting.ocp', 'localhost', '127.0.0.1'],
    hmr: {
      overlay: false // Disable HMR overlay
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: true
  }
});
