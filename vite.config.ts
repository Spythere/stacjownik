import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 5001,
    open: true
  },
  preview: {
    port: 4001,
    open: true
  },
  publicDir: 'public',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['/images/*.{png,svg,jpg}', '/fonts/*.{woff,woff2}'],

      workbox: {
        disableDevLogs: true,
        globPatterns: ['**/*.{js,css,html,png,svg,jpg}'],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            urlPattern:
              /^https:\/\/stacjownik.spythere.eu\/api\/(getVehicles|getDonators|getSceneries)/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'stacjownik-api-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/static.spythere.eu\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'spythere-static-cache',
              cacheableResponse: {
                statuses: [0, 200]
              },
              expiration: {
                maxEntries: 100
              }
            }
          }
        ]
      },
      devOptions: {
        enabled: true,
        suppressWarnings: true
      }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'app-[name].js',
        assetFileNames: 'app-[name].css',
        chunkFileNames: 'chunk-[name].js'
      }
    }
  }
});
