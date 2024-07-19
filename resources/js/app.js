// app.js
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js';
import { createApp } from 'vue';
import router from './router';
import axios from 'axios';
import App from './components/App.vue';
import i18n from './i18n';
import 'flag-icon-css/css/flag-icons.min.css';
import '@fortawesome/fontawesome-free/css/all.css';

axios.defaults.baseURL = import.meta.env.VITE_API_URL; // Verifique se a baseURL não inclui '/api'
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    const companyId = localStorage.getItem('company_id'); // Recuperar a companhia do localStorage
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    if (companyId) {
        config.headers['X-Company-ID'] = companyId; // Adicionar a companhia aos cabeçalhos
    }
    return config;
}, error => {
    return Promise.reject(error);
});

axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            router.push({ name: 'login' });
        }
        return Promise.reject(error);
    }
);

const app = createApp(App);
app.use(router);
app.use(i18n);
app.config.globalProperties.$axios = axios;

async function detectLocationAndSetLanguage() {
    const storedLanguage = localStorage.getItem('language');
    if (storedLanguage) {
        i18n.global.locale = storedLanguage;
    } else {
        try {
            const response = await axios.get('https://ipapi.co/json/');
            const countryCode = response.data.country_code;

            let language = 'en';
            if (countryCode === 'BR') {
                language = 'pt';
            } else if (countryCode === 'ES') {
                language = 'es';
            }

            i18n.global.locale = language;
            localStorage.setItem('language', language);
        } catch (error) {
            console.error('Failed to detect location', error);
        }
    }
}

detectLocationAndSetLanguage().then(() => {
    app.mount('#app');
});
