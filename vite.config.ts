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
            if (normalizedId.includes('jszip')) {
              return 'vendor-jszip';
            }
            return 'vendor-other';
          }
          if (normalizedId.includes('playerPhotos')) {
            return 'data-player-photos';
          }
          if (normalizedId.includes('/constants/teamLogos') || normalizedId.includes('/constants/championship')) {
            return 'data-logos';
          }
          if (normalizedId.includes('/data/teams/')) {
            if (
              normalizedId.includes('ligaArgentina') ||
              normalizedId.includes('brasileirao') ||
              normalizedId.includes('ligaChile') ||
              normalizedId.includes('ligaColombia') ||
              normalizedId.includes('copaDePrimera') ||
              normalizedId.includes('ligaMx') ||
              normalizedId.includes('southAmericanClubs')
            ) {
              return 'data-teams-latam';
            }
            if (
              normalizedId.includes('premierLeague') ||
              normalizedId.includes('championship') ||
              normalizedId.includes('laLiga') ||
              normalizedId.includes('bundesliga') ||
              normalizedId.includes('serieA') ||
              normalizedId.includes('ligue1') ||
              normalizedId.includes('secondDivisions')
            ) {
              return 'data-teams-europe';
            }
            return 'data-teams-core';
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
});
