import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';
import Login from './components/Login.vue';
import Home from './components/Home.vue';
import App from './components/App.vue';
import i18n from './i18n';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.bundle.js'; // Adicionando o Bootstrap JS
import 'flag-icon-css/css/flag-icons.min.css'; // Importar os estilos das bandeiras

// Configurar Axios
axios.defaults.baseURL = import.meta.env.VITE_API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

axios.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

const routes = [
    { path: '/', component: Login, name: 'login' },
    { path: '/home', component: Home, name: 'home' }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Verificação de autenticação
router.beforeEach((to, from, next) => {
    const publicPages = ['/', '/login'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = localStorage.getItem('token');

    if (authRequired && !loggedIn) {
        return next('/');
    }

    next();
});

const app = createApp(App);
app.use(router);
app.use(i18n); // Usar i18n
app.config.globalProperties.$axios = axios;

// Função para detectar a localização e definir o idioma
async function detectLocationAndSetLanguage() {
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

// Detectar localização e definir o idioma ao inicializar a aplicação
detectLocationAndSetLanguage().then(() => {
    app.mount('#app');
});
