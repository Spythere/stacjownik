import enLang from './locales/en.json';
import plLang from './locales/pl.json';

import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  locale: 'pl',
  legacy: false,
  warnHtmlMessage: false,
  fallbackLocale: 'pl',

  pluralizationRules: {
    en: {
      ordinal: (ctx: { named: (arg0: string) => number }) => {
        const number = ctx.named('count');

        const suffixes: Record<number, string> = {
          1: 'st',
          2: 'nd',
          3: 'rd'
        };
        const suffix = suffixes[number % 10] || 'th';

        return `${number}${suffix}`;
      }
    }
  },

  messages: {
    en: {
      ...enLang,
      ordinal: (ctx: { named: (arg0: string) => number }) => {
        const number = ctx.named('count');

        const suffixes: Record<number, string> = {
          1: 'st',
          2: 'nd',
          3: 'rd'
        };
        const suffix = suffixes[number % 10] || 'th';

        return `${number}${suffix}`;
      }
    },
    pl: {
      ...plLang,
      ordinal: '{count}.'
    }
  },
  enableLegacy: false
});

export default i18n;
