<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <router-link class="navbar-brand" :to="{ name: 'home' }">{{ $t('home') }}</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <!-- Admin Menu -->
            <li class="nav-item dropdown" v-if="isAdmin">
              <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                {{ $t('admin') }}
              </a>
              <ul class="dropdown-menu" aria-labelledby="adminDropdown">
                <li><router-link class="dropdown-item" :to="{ name: 'manage-areas' }">{{ $t('manageAreas') }}</router-link></li>
                <li><router-link class="dropdown-item" :to="{ name: 'manage-sectors' }">{{ $t('manageSectors') }}</router-link></li>
                <li><router-link class="dropdown-item" :to="{ name: 'manage-audits' }">{{ $t('manageAudits') }}</router-link></li>
                <li><router-link class="dropdown-item" :to="{ name: 'manage-users' }">{{ $t('manageUsers') }}</router-link></li>
                <li><router-link class="dropdown-item" :to="{ name: 'manage-checklist-templates' }">{{ $t('manageChecklistTemplates') }}</router-link></li>
              </ul>
            </li>
            <!-- Auditor Menu -->
            <li class="nav-item dropdown" v-if="isAuditor">
              <a class="nav-link dropdown-toggle" href="#" id="auditorDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                {{ $t('audit') }}
              </a>
              <ul class="dropdown-menu" aria-labelledby="auditorDropdown">
                <li><router-link class="dropdown-item" :to="{ name: 'my-audits' }">{{ $t('myAudits') }}</router-link></li>
              </ul>
            </li>
            <!-- Logout -->
            <li class="nav-item">
              <a class="nav-link" href="#" @click.prevent="logout">{{ $t('logout') }}</a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </template>

  <script>
  import axios from 'axios';

  export default {
    data() {
      return {
        isAdmin: false,
        isAuditor: false,
      };
    },
    methods: {
      logout() {
        localStorage.removeItem('token');
        this.$router.push({ name: 'login' });
      },
      checkRoles() {
        const token = localStorage.getItem('token');
        if (token) {
          axios.get('/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(response => {
            const roles = response.data.user.roles || [];
            console.log('User roles:', roles);  // Adicione este log
            this.isAdmin = roles.some(role => role.name === 'admin');
            this.isAuditor = roles.some(role => role.name === 'auditor');
          })
          .catch(error => {
            console.error('Error fetching user roles:', error);
            this.isAdmin = false;
            this.isAuditor = false;
          });
        }
      },
    },
    created() {
      this.checkRoles();
    },
  };
  </script>

  <style scoped>
  .navbar {
    margin-bottom: 20px;
  }
  </style>
