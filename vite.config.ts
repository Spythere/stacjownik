import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 5001,
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
        runtimeCaching: [
          {
            urlPattern: new RegExp('^https://stacjownik.spythere.eu/api/getSceneries', 'i'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'spythere-sceneries-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: new RegExp('^https://rj.td2.info.pl/dist/img/thumbnails/*', 'i'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'swdr-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // <== 7 days
              },
              cacheableResponse: {
                statuses: [0, 200, 404]
              }
            }
          },
          {
            urlPattern: new RegExp('^https://static.spythere.eu/images/*', 'i'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'spythere-images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // <== 7 days
              },
              cacheableResponse: {
                statuses: [0, 200]
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
