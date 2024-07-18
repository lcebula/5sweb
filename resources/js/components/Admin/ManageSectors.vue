<template>
    <div>
      <Navbar />
      <div class="container">
        <h2>{{ $t('manageSectors') }}</h2>
        <ul>
          <li v-for="sector in sectors" :key="sector.id">{{ sector.name }}</li>
        </ul>
      </div>
    </div>
  </template>

  <script>
  import axios from 'axios';
  import Navbar from './../Navbar.vue';

  export default {
    components: {
      Navbar
    },
    data() {
      return {
        sectors: []
      };
    },
    methods: {
      async fetchSectors() {
        const response = await axios.get('/sectors');
        this.sectors = response.data;
      }
    },
    created() {
      this.fetchSectors();
    }
  };
  </script>

  <style scoped>
  .container {
    padding-top: 20px;
  }
  </style>
