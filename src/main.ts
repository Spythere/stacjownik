import { createApp, Directive, ref } from 'vue'
import App from './App.vue'
import router from './router'
import { store, key } from './store'

import enLang from '@/locales/en.json';
import plLang from '@/locales/pl.json';

import { createI18n } from 'vue-i18n'


const i18n = createI18n({
  locale: 'pl',
  fallbackLocale: 'pl',
  messages: {
    en: enLang,
    pl: plLang,
  },
  enableLegacy: false,
})


const clickOutsideDirective: Directive = {
  mounted(el, binding) {

    el.clickOutsideEvent = (event: Event) => {
      if (!(el == event.target || el.contains(event.target))) {
        binding.value();
      }
    };

    document.addEventListener("click", el.clickOutsideEvent);
  },
}

createApp(App)
.provide('isFilterCardVisible', ref(false))
  .use(store, key)
  .use(router)
  .use(i18n)
  .directive('click-outside', clickOutsideDirective)
  .mount('#app')
