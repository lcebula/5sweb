<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
      <div class="container-fluid">
        <router-link class="navbar-brand" :to="{ name: 'home' }">{{ $t('home') }}</router-link>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item dropdown" v-if="isAdmin">
              <a class="nav-link dropdown-toggle" href="#" id="adminDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                {{ $t('admin') }}
              </a>
              <ul class="dropdown-menu" aria-labelledby="adminDropdown">
                <li><router-link class="dropdown-item" :to="{ name: 'manage-areas' }">{{ $t('manageAreas') }}</router-link></li>
                <li><router-link class="dropdown-item" :to="{ name: 'manage-sectors' }">{{ $t('manageSectors') }}</router-link></li>
                <li><router-link class="dropdown-item" :to="{ name: 'manage-audits' }">{{ $t('manageAudits') }}</router-link></li>
                <li><router-link class="dropdown-item" :to="{ name: 'manage-users' }">{{ $t('manageUsers') }}</router-link></li>
              </ul>
            </li>
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
      };
    },
    methods: {
      logout() {
        localStorage.removeItem('token');
        this.$router.push({ name: 'login' });
      },
      checkAdminRole() {
        const token = localStorage.getItem('token');
        if (token) {
          axios.get('/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .then(response => {
            const roles = response.data.roles.map(role => role.name) || [];
            this.isAdmin = roles.includes('admin');
          })
          .catch(error => {
            console.error('Error fetching user roles:', error);
            this.isAdmin = false;
          });
        }
      },
    },
    created() {
      this.checkAdminRole();
    },
  };
  </script>

  <style scoped>
  .navbar {
    margin-bottom: 20px;
  }
  </style>
