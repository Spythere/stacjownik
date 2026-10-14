import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  server: { port: 5123, open: true },
  preview: { port: 4001, open: false },
  publicDir: 'public',

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
        cleanupOutdatedCaches: true
      },
      devOptions: { enabled: true, suppressWarnings: true }
    })
  ]
});
