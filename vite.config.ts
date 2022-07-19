import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
});

// PWA

// VitePWA({
//       registerType: 'autoUpdate',
//       workbox: {
//         globPatterns: ['**/*.{js,css,html,png,svg,img}'],
//         runtimeCaching: [
//           {
//             urlPattern: new RegExp('^https://stacjownik.eu-4.evennode.com/api/getSceneries'),
//             handler: 'NetworkFirst',
//             options: {
//               cacheName: 'sceneries-cache',
//               expiration: {
//                 maxEntries: 200,
//                 maxAgeSeconds: 60 * 60 * 24 * 60, // <== 60 days
//               },
//               cacheableResponse: {
//                 statuses: [0, 200],
//               },
//             },
//           },
//         ],
//       },
//       devOptions: {
//         enabled: true,
//       },
//     }),
