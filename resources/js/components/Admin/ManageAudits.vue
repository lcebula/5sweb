<template>
    <div>
      <Navbar />
      <div class="container">
        <h2>{{ $t('manageAudits') }}</h2>
        <ul>
          <li v-for="audit in audits" :key="audit.id">{{ audit.name }}</li>
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
        audits: []
      };
    },
    methods: {
      async fetchAudits() {
        const response = await axios.get('/audits');
        this.audits = response.data;
      }
    },
    created() {
      this.fetchAudits();
    }
  };
  </script>

  <style scoped>
  .container {
    padding-top: 20px;
  }
  </style>
