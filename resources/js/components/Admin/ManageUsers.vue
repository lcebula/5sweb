<template>
    <div>
      <Navbar />
      <div class="container">
        <h2>{{ $t('manageUsers') }}</h2>
        <ul>
          <li v-for="user in users" :key="user.id">{{ user.name }}</li>
        </ul>
      </div>
    </div>
  </template>

  <script>
  import axios from 'axios';
  import Navbar from '../Navbar.vue';

  export default {
    components: {
      Navbar
    },
    data() {
      return {
        users: []
      };
    },
    methods: {
      async fetchUsers() {
        const response = await axios.get('/users');
        this.users = response.data;
      }
    },
    created() {
      this.fetchUsers();
    }
  };
  </script>

  <style scoped>
  .container {
    padding-top: 20px;
  }
  </style>
