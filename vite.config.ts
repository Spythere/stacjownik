import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  server: { port: 5123, open: true },
  preview: { port: 4001, open: false },
  publicDir: 'public',
  css: {
    preprocessorOptions: {
      scss: { additionalData: `@use '@/styles/global';`, silenceDeprecations: ['legacy-js-api'] }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        disableDevLogs: true,
        globPatterns: ['**/*.{js,css,html,ico,woff,woff2,ttf}', '**/*.{png,jpg,jpeg,svg,webp,gif}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/stacjownik.spythere.eu\/api\/(getVehicles|getDonators|getSceneries)/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'stacjownik-api-cache',
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: { enabled: true, suppressWarnings: true }
    })
  ]
});
