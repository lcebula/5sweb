import { createI18n } from 'vue-i18n';
import en from '../lang/en.json';
import pt from '../lang/pt.json';
import es from '../lang/es.json';

const messages = {
    en,
    pt,
    es
};

const userLocale = localStorage.getItem('language') || 'en';

const i18n = createI18n({
    locale: userLocale,
    fallbackLocale: 'en',
    messages
});

export default i18n;
