import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (normalizedId.includes('node_modules')) {
            if (normalizedId.includes('react') || normalizedId.includes('react-dom')) {
              return 'vendor-react';
            }
            if (normalizedId.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (normalizedId.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (normalizedId.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (normalizedId.includes('@google/genai')) {
              return 'vendor-genai';
            }
            if (normalizedId.includes('jszip')) {
              return 'vendor-jszip';
            }
            return 'vendor-other';
          }
          if (normalizedId.includes('/constants/teamLogos') || normalizedId.includes('/constants/championship')) {
            return 'data-logos';
          }
          if (normalizedId.includes('/data/teams/')) {
            return 'data-teams';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
