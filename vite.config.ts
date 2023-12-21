import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    port: 5001
  },
  publicDir: 'public',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['/images/*.png', '/fonts/*.woff', '/fonts/*.woff2'],

      workbox: {
        disableDevLogs: true,
        globPatterns: ['**/*.{js,css,html,png,svg,jpg}'],
        runtimeCaching: [
          {
            urlPattern: new RegExp('^https://stacjownik.spythere.eu/api/getSceneries', 'i'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sceneries-cache',
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: new RegExp('^https://raw.githubusercontent.com/Spythere/api/*', 'i'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'github-api-cache',

              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            urlPattern: /^https:\/\/rj.td2.info.pl\/dist\/img\/thumbnails\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 7 // <== 7 days
              },
              cacheableResponse: {
                statuses: [0, 200, 404]
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
  ]
});
