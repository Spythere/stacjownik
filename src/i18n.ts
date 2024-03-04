import enLang from './locales/en.json';
import plLang from './locales/pl.json';

import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  locale: 'pl',
  legacy: false,
  warnHtmlMessage: false,
  fallbackLocale: 'pl',

  messages: {
    en: enLang,
    pl: plLang
  },
  enableLegacy: false
});

export default i18n;
