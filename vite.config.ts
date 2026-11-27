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
          if (normalizedId.endsWith('/services/customPacks/playerPhotos.ts')) {
            return 'data-player-photos';
          }
          if (normalizedId.endsWith('/data/realPlayerMetadata.ts')) {
            return 'data-player-metadata';
          }
          if (
            normalizedId.includes('/constants/teamLogos') ||
            normalizedId.includes('/constants/championship') ||
            normalizedId.endsWith('/services/customPacks/argentineLogos.ts') ||
            normalizedId.endsWith('/data/trophyCatalog.ts') ||
            normalizedId.endsWith('/data/competitionLogoCatalog.ts')
          ) {
            return 'data-logos';
          }
          if (normalizedId.includes('/data/teams/') && !normalizedId.endsWith('/helpers.tsx') && !normalizedId.endsWith('/squadHelpers.ts')) {
            if (
              normalizedId.includes('ligaArgentina') ||
              normalizedId.includes('brasileirao') ||
              normalizedId.includes('ligaChile') ||
              normalizedId.includes('ligaColombia') ||
              normalizedId.includes('copaDePrimera') ||
              normalizedId.includes('ligaMx') ||
              normalizedId.includes('southAmericanClubs') ||
              normalizedId.includes('americasExpansion')
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
              normalizedId.includes('secondDivisions') ||
              normalizedId.includes('europeExpansion')
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
