import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpApi from 'i18next-http-backend';

i18n
  .use(HttpApi)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    supportedLngs: ['en', 'pl'],
    fallbackLng: 'pl',
    debug: process.env.NODE_ENV === 'development',
    defaultNS: 'common',
    ns: ['common', 'auth', 'courses', 'quizzes', 'navigation', 'notifications'],
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
        order: ['localStorage', 'cookie', 'navigator', 'htmlTag', 'path', 'subdomain'],
        caches: ['localStorage', 'cookie'],
    }
  });

export default i18n; 