import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt',

      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,img}'],
        runtimeCaching: [
          // {
          //   urlPattern: new RegExp('^https://stacjownik.eu-4.evennode.com/api/getSceneries'),
          //   handler: 'NetworkFirst',
          //   options: {
          //     cacheName: 'sceneries-cache',
          //     expiration: {
          //       maxEntries: 200,
          //       maxAgeSeconds: 60 * 60 * 24 * 60, // <== 60 days
          //     },
          //     cacheableResponse: {
          //       statuses: [0, 200],
          //     },
          //   },
          // },
          {
            urlPattern: /^https:\/\/rj.td2.info.pl\/dist\/img\/thumbnails\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 300,
                maxAgeSeconds: 60 * 60 * 24 * 7,
              },
              cacheableResponse: {
                statuses: [0, 200, 404],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
});

