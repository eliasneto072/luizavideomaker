import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Configuração do Vite.
 *
 * - Plugin React para JSX/Fast Refresh.
 * - Alias "@" apontando para src, para imports limpos.
 * - Proxy de /api e /health para o backend em desenvolvimento, evitando
 *   problemas de CORS e permitindo chamar a API por caminho relativo.
 */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
      '/health': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      },
    },
  },
});
