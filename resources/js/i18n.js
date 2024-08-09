import { createI18n } from 'vue-i18n';
import en from '../lang/en.json';
import es from '../lang/es.json';
import pt from '../lang/pt.json';

const messages = {
  en: en,
  es: es,
  pt: pt
};

const datetimeFormats = {
  en: en.dateTimeFormats,
  es: es.dateTimeFormats,
  pt: pt.dateTimeFormats
};

const i18n = createI18n({
  locale: 'pt', // Idioma padrão
  fallbackLocale: 'en',
  messages,
  datetimeFormats // Adiciona os formatos de data e hora
});

export default i18n;
