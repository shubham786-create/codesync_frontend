import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const monacoPath = fs.existsSync(path.resolve(__dirname, 'node_modules/monaco-editor'))
  ? path.resolve(__dirname, 'node_modules/monaco-editor')
  : path.resolve(__dirname, '../node_modules/monaco-editor');

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'monaco-editor': monacoPath,
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
      '/yjs': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
