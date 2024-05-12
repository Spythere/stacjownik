import { createApp, Directive, ref } from 'vue';
import App from './App.vue';
import router from './router';

import i18n from './i18n';

import { createPinia } from 'pinia';
import useCustomSW from './mixins/useCustomSW';

// Service worker
useCustomSW();

const clickOutsideDirective: Directive = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event: Event) => {
      if (!(el == event.target || el.contains(event.target))) {
        binding.value();
      }
    };

    document.addEventListener('click', el.clickOutsideEvent);
  }
};

createApp(App)
  .provide('isFilterCardVisible', ref(false))
  .use(createPinia())
  .use(router)
  .use(i18n)
  .directive('click-outside', clickOutsideDirective)
  .mount('#app');
