import { createRouter, createWebHistory } from 'vue-router';
import axios from 'axios';
import Login from '../components/Login.vue';
import Home from '../components/Home.vue';
import ManageAreas from '../components/Admin/ManageAreas.vue';
import ManageSectors from '../components/Admin/ManageSectors.vue';
import ManageAudits from '../components/Admin/ManageAudits.vue';
import ManageUsers from '../components/Admin/ManageUsers.vue';
import ManageChecklistTemplates from '../components/Admin/ManageChecklistTemplates.vue';
import MinhasAuditorias from '../components/Auditor/MinhasAuditorias.vue';

const routes = [
  { path: '/', component: Login, name: 'login' },
  { path: '/home', component: Home, name: 'home' },
  { path: '/admin/areas', component: ManageAreas, name: 'manage-areas' },
  { path: '/admin/sectors', component: ManageSectors, name: 'manage-sectors' },
  { path: '/admin/audits', component: ManageAudits, name: 'manage-audits' },
  { path: '/admin/users', component: ManageUsers, name: 'manage-users' },
  { path: '/admin/checklist-templates', component: ManageChecklistTemplates, name: 'manage-checklist-templates' },
  { path: '/auditor/my-audits', component: MinhasAuditorias, name: 'my-audits', meta: { role: 'auditor' } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Verificação de autenticação e autorização
router.beforeEach((to, from, next) => {
    const publicPages = ['/', '/login'];
    const authRequired = !publicPages.includes(to.path);
    const loggedIn = localStorage.getItem('token');

    if (authRequired && !loggedIn) {
      return next('/');
    }

    // Verificação de autorização
    const roleRequired = to.meta.role;
    if (roleRequired && loggedIn) {
      axios.get('/me', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }).then(response => {
        const roles = response.data.user.roles.map(role => role.name);
        if (roles.includes(roleRequired)) {
          next();
        } else {
          next('/home');
        }
      }).catch(() => {
        next('/');
      });
    } else {
      next();
    }
  });

export default router;
