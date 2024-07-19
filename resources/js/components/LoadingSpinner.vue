<template>
    <div class="loading-spinner" v-if="isLoading">
      <i class="fas fa-spinner fa-spin"></i>
    </div>
  </template>

  <script>
  export default {
    props: {
      isLoading: {
        type: Boolean,
        required: true
      }
    }
  }
  </script>

  <style scoped>
  .loading-spinner {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 9999;
  }
  </style>
