import { createApp, Directive, ref } from 'vue';
import App from './App.vue';

import { registerSW } from 'virtual:pwa-register';

// Service worker
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('Needs refresh!');
  }
});

createApp(App).mount('#app');
