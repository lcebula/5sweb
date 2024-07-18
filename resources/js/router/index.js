import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Home from '../components/Home.vue';
import ManageAreas from '../components/Admin/ManageAreas.vue';
import ManageSectors from '../components/Admin/ManageSectors.vue';
import ManageAudits from '../components/Admin/ManageAudits.vue';
import ManageUsers from '../components/Admin/ManageUsers.vue';

const routes = [
    { path: '/', component: Login, name: 'login' },
    { path: '/home', component: Home, name: 'home' },
    { path: '/admin/areas', component: ManageAreas, name: 'manage-areas' },
    { path: '/admin/sectors', component: ManageSectors, name: 'manage-sectors' },
    { path: '/admin/audits', component: ManageAudits, name: 'manage-audits' },
    { path: '/admin/users', component: ManageUsers, name: 'manage-users' }
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

export default router;
