import { createRouter, createWebHistory } from 'vue-router';
import store from '../store';
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

router.beforeEach(async (to, from, next) => {
    const publicPages = ['/', '/login'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = localStorage.getItem('token');

    if (authRequired && !loggedIn) {
        return next('/');
    }

    if (to.meta.requiresRole) {
        await store.dispatch('fetchUser'); // Ensure user is loaded
        const roles = store.state.roles;
        if (!roles.includes(to.meta.requiresRole)) {
            return next('/home'); // Redirect to home if user doesn't have the appropriate role
        }
    }

    next();
});

export default router;
