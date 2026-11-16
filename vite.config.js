import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const monacoPath = fs.existsSync(path.resolve(__dirname, 'node_modules/monaco-editor'))
  ? path.resolve(__dirname, 'node_modules/monaco-editor')
  : path.resolve(__dirname, '../node_modules/monaco-editor');

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const targetBackend = env.VITE_API_URL || 'http://localhost:5000';

  return {
    plugins: [react()],
    resolve: {
      alias: {
        'monaco-editor': monacoPath,
      },
    },
    server: {
      port: 5173,
      strictPort: true,
      host: true,
      hmr: {
        protocol: 'ws',
        host: 'localhost',
        port: 5173,
      },
      proxy: {
        '/api': {
          target: targetBackend,
          changeOrigin: true,
          secure: false,
        },
        '/socket.io': {
          target: targetBackend,
          ws: true,
          changeOrigin: true,
          secure: false,
        },
        '/yjs': {
          target: targetBackend,
          ws: true,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
