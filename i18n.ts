import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files directly
import enCommon from './locales/en/common.json';
import trCommon from './locales/tr/common.json';
import deCommon from './locales/de/common.json';

const i18n = createInstance();

const resources = {
  en: {
    common: enCommon,
  },
  tr: {
    common: trCommon,
  },
  de: {
    common: deCommon,
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',

    interpolation: {
      escapeValue: false,
    },

    react: {
      useSuspense: false,
    },

    defaultNS: 'common',
    ns: ['common'],
  });

export default i18n;