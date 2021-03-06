import Vue from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import VueI18n from 'vue-i18n';

import enLang from '@/lang/en.json';
import plLang from '@/lang/pl.json';

Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: 'pl',
  fallbackLocale: 'pl',
  messages: {
    en: enLang,
    pl: plLang,
  },
});

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app');
