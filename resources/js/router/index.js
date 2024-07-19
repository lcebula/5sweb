import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';
import Login from '../components/Login.vue';
import Home from '../components/Home.vue';
import ManageAreas from '../components/Admin/ManageAreas.vue';
import ManageSectors from '../components/Admin/ManageSectors.vue';
import ManageAudits from '../components/Admin/ManageAudits.vue';
import ManageUsers from '../components/Admin/ManageUsers.vue';

const routes = [
    { path: '/', component: Login, name: 'login' },
    { path: '/home', component: Home, name: 'home' },
    { path: '/admin/areas', component: ManageAreas, name: 'manage-areas', meta: { requiresRole: 'admin' } },
    { path: '/admin/sectors', component: ManageSectors, name: 'manage-sectors', meta: { requiresRole: 'admin' } },
    { path: '/admin/audits', component: ManageAudits, name: 'manage-audits', meta: { requiresRole: 'admin' } },
    { path: '/admin/users', component: ManageUsers, name: 'manage-users', meta: { requiresRole: 'admin' } }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Função para obter o papel do usuário
async function getUserRole() {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
        const response = await axios.get('/me', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const roles = response.data.user.roles || [];
        return roles.map(role => role.name); // Retorna os nomes dos papéis
    } catch (error) {
        console.error('Error fetching user roles:', error);
        return null;
    }
}

// Verificação de autenticação e papel
router.beforeEach(async (to, from, next) => {
    const publicPages = ['/', '/login'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = localStorage.getItem('token');

    if (authRequired && !loggedIn) {
        return next('/');
    }

    if (to.meta.requiresRole) {
        const roles = await getUserRole();
        if (!roles || !roles.includes(to.meta.requiresRole)) {
            return next('/home'); // Redireciona para a página inicial se o usuário não tiver o papel adequado
        }
    }

    next();
});

export default router;
