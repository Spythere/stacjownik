import enLang from './locales/en.json';
import plLang from './locales/pl.json';

import { createI18n } from 'vue-i18n';

function customRule(choice: number, choicesLength: number) {
  if (choice === 0) {
    return 0;
  }

  const teen = choice > 10 && choice < 20;
  const endsWithOne = choice % 10 === 1;

  if (!teen && endsWithOne) {
    return 1;
  }

  if (!teen && choice % 10 >= 2 && choice % 10 <= 4) {
    return 2;
  }

  return choicesLength < 4 ? 2 : 3;
}

const i18n = createI18n({
  locale: 'pl',
  legacy: false,
  warnHtmlMessage: false,
  fallbackLocale: 'pl',

  pluralizationRules: {
    pl: customRule
  },

  messages: {
    en: enLang,
    pl: plLang
  },
  enableLegacy: false
});

export default i18n;
