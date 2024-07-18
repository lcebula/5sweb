import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import store from './store';
import i18n from './i18n';  // Certifique-se de ter o i18n configurado
import 'bootstrap/dist/css/bootstrap.css';

const app = createApp(App);

app.use(router);
app.use(store);
app.use(i18n);

app.mount('#app');
