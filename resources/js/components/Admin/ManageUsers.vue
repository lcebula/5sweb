<template>
    <div>
      <Navbar />
      <LoadingSpinner :isLoading="isLoading" />
      <div class="container mt-4">
        <h1>{{ $t('manageUsers') }}</h1>
        <button class="btn btn-primary mb-3" @click="addUser">
          <i class="fas fa-plus"></i> {{ $t('addUser') }}
        </button>
        <input type="text" v-model="searchTerm" :placeholder="$t('searchUsers')" class="form-control mb-3" />
        <table class="table table-hover">
          <thead>
            <tr>
              <th>{{ $t('name') }}</th>
              <th>{{ $t('email') }}</th>
              <th class="text-end">{{ $t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td class="text-end">
                <button class="btn btn-warning btn-icon" @click="editUser(user)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-icon ms-2" @click="confirmDelete(user.id)">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showModal" class="modal-container">
        <div class="modal-backdrop"></div>
        <div class="modal-dialog modal-dialog-centered modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditMode ? $t('editUser') : $t('addUser') }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveUser">
                <div class="mb-3">
                  <label for="name" class="form-label">{{ $t('name') }}</label>
                  <input type="text" id="name" v-model="currentUser.name" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label for="email" class="form-label">{{ $t('email') }}</label>
                  <input type="email" id="email" v-model="currentUser.email" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label for="password" class="form-label">{{ $t('password') }}</label>
                  <input type="password" id="password" v-model="currentUser.password" class="form-control" :required="!isEditMode" />
                </div>
                <div class="mb-3">
                  <label for="roles" class="form-label">{{ $t('roles') }}</label>
                  <select id="roles" v-model="currentUser.roles" class="form-control" multiple required>
                    <option v-for="role in roles" :value="role.id" :key="role.id">{{ role.name }}</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary">{{ $t('save') }}</button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Confirm Delete Modal -->
      <div v-if="showDeleteModal" class="modal-container">
        <div class="modal-backdrop"></div>
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ $t('confirmDelete') }}</h5>
              <button type="button" class="btn-close" @click="closeDeleteModal"></button>
            </div>
            <div class="modal-body">
              <p>{{ $t('confirmDeleteMessage') }}</p>
              <div class="d-flex justify-content-end">
                <button class="btn btn-danger me-2" @click="deleteUser">{{ $t('delete') }}</button>
                <button class="btn btn-secondary" @click="closeDeleteModal">{{ $t('cancel') }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script>
  import axios from 'axios';
  import Navbar from '../Navbar.vue';
  import LoadingSpinner from '../LoadingSpinner.vue';

  export default {
    components: {
      Navbar,
      LoadingSpinner
    },
    data() {
      return {
        users: [],
        roles: [],
        searchTerm: '',
        showModal: false,
        showDeleteModal: false,
        isEditMode: false,
        currentUser: {
          id: null,
          name: '',
          email: '',
          password: '',
          roles: []
        },
        deleteUserId: null,
        isLoading: false // Adicionar estado de carregamento
      };
    },
    computed: {
      filteredUsers() {
        return this.users.filter(user => user.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
      }
    },
    methods: {
      fetchUsers() {
        this.isLoading = true; // Ativar carregamento
        axios.get('/users')
          .then(response => {
            this.users = response.data;
          })
          .catch(error => {
            console.error(error);
          })
          .finally(() => {
            this.isLoading = false; // Desativar carregamento
          });
      },
      fetchRoles() {
        this.isLoading = true; // Ativar carregamento
        axios.get('/roles')
          .then(response => {
            this.roles = response.data;
          })
          .catch(error => {
            console.error(error);
          })
          .finally(() => {
            this.isLoading = false; // Desativar carregamento
          });
      },
      editUser(user) {
        this.currentUser = { ...user, roles: user.roles.map(role => role.id) };
        this.isEditMode = true;
        this.showModal = true;
      },
      addUser() {
        this.currentUser = {
          id: null,
          name: '',
          email: '',
          password: '',
          roles: []
        };
        this.isEditMode = false;
        this.showModal = true;
      },
      saveUser() {
        this.isLoading = true; // Ativar carregamento
        if (this.isEditMode) {
          axios.put(`/users/${this.currentUser.id}`, this.currentUser)
            .then(() => {
              this.fetchUsers();
              this.closeModal();
            })
            .catch(error => {
              console.error(error);
            })
            .finally(() => {
              this.isLoading = false; // Desativar carregamento
            });
        } else {
          axios.post('/users', this.currentUser)
            .then(() => {
              this.fetchUsers();
              this.closeModal();
            })
            .catch(error => {
              console.error(error);
            })
            .finally(() => {
              this.isLoading = false; // Desativar carregamento
            });
        }
      },
      confirmDelete(userId) {
        this.deleteUserId = userId;
        this.showDeleteModal = true;
      },
      deleteUser() {
        this.isLoading = true; // Ativar carregamento
        axios.delete(`/users/${this.deleteUserId}`)
          .then(() => {
            this.fetchUsers();
            this.closeDeleteModal();
          })
          .catch(error => {
            console.error(error);
          })
          .finally(() => {
            this.isLoading = false; // Desativar carregamento
          });
      },
      closeModal() {
        this.showModal = false;
      },
      closeDeleteModal() {
        this.showDeleteModal = false;
      }
    },
    created() {
      this.fetchUsers();
      this.fetchRoles();
    }
  };
  </script>

  <style scoped>
  .modal-container {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1050;
  }

  .modal-backdrop {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1040;
  }

  .modal-dialog {
    position: relative;
    z-index: 1051;
    background: white;
    border-radius: 0.5rem;
    overflow: hidden;
    width: 90%; /* Ajustar largura da janela modal */
    max-width: 800px; /* Definir um valor máximo para a largura */
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
    background-color: #f8f9fa;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 1rem;
    border-top: 1px solid #dee2e6;
    background-color: #f8f9fa;
  }

  .btn-icon i {
    font-size: 1rem; /* Adjust icon size */
  }

  .ms-2 {
    margin-left: 0.5rem; /* Adjust margin between icons */
  }

  .text-end {
    text-align: right;
  }
  </style>
