import { createI18n } from 'vue-i18n';
import en from '../lang/en.json';
import es from '../lang/es.json';
import pt from '../lang/pt.json';

const messages = {
  en: en,
  es: es,
  pt: pt
};

const i18n = createI18n({
  locale: 'en', // Idioma padrão
  fallbackLocale: 'en',
  messages
});

export default i18n;
