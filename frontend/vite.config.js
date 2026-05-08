import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
        manifest: {
          name: env.VITE_APP_NAME || 'Golden Fisheries ERP',
          short_name: 'MKE ERP',
          description: env.VITE_APP_DESCRIPTION || 'Advanced Operations & Management System',
          theme_color: env.VITE_THEME_COLOR || '#0066FF',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: 'pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    build: {
      chunkSizeWarningLimit: 650,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              // Core react libraries
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler') || id.includes('react-router') || id.includes('react-router-dom')) {
                return 'vendor-core';
              }
              // Icons
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
              // Heavy charts
              if (id.includes('recharts') || id.includes('d3') || id.includes('victory') || id.includes('recharts-scale')) {
                return 'vendor-charts';
              }
              // API and Query clients
              if (id.includes('@tanstack') || id.includes('axios')) {
                return 'vendor-query';
              }
              // UI / Form helpers
              if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
                return 'vendor-forms';
              }
              return 'vendor-others';
            }
          }
        }
      }
    }
  }
})
