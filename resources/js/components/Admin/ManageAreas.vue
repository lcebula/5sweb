<template>
    <div>
      <Navbar />
      <div class="container mt-4">
        <h1>{{ $t('manageAreas') }}</h1>
        <button class="btn btn-primary mb-3" @click="addArea">
          <i class="fas fa-plus"></i> {{ $t('addArea') }}
        </button>
        <input type="text" v-model="searchTerm" placeholder="Search areas..." class="form-control mb-3" />
        <table class="table table-hover">
          <thead>
            <tr>
              <th>{{ $t('name') }}</th>
              <th class="text-end">{{ $t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="area in filteredAreas" :key="area.id">
              <td>{{ area.name }}</td>
              <td class="text-end">
                <button class="btn btn-warning btn-icon" @click="editArea(area)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-icon ms-2" @click="confirmDelete(area.id)">
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
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ isEditMode ? $t('editArea') : $t('addArea') }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveArea">
                <div class="mb-3">
                  <label for="name" class="form-label">{{ $t('name') }}</label>
                  <input type="text" id="name" v-model="currentArea.name" class="form-control" required />
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
                <button class="btn btn-danger me-2" @click="deleteArea">{{ $t('delete') }}</button>
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

  export default {
    components: {
      Navbar
    },
    data() {
      return {
        areas: [],
        searchTerm: '',
        showModal: false,
        showDeleteModal: false,
        isEditMode: false,
        currentArea: {
          id: null,
          name: ''
        },
        deleteAreaId: null
      };
    },
    computed: {
      filteredAreas() {
        return this.areas.filter(area => area.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
      }
    },
    methods: {
      fetchAreas() {
        this.$axios.get('/areas')
          .then(response => {
            this.areas = response.data;
          })
          .catch(error => {
            console.error(error);
          });
      },
      editArea(area) {
        this.currentArea = { ...area };
        this.isEditMode = true;
        this.showModal = true;
      },
      addArea() {
        this.currentArea = {
          id: null,
          name: ''
        };
        this.isEditMode = false;
        this.showModal = true;
      },
      saveArea() {
        if (this.isEditMode) {
          this.$axios.put(`/areas/${this.currentArea.id}`, this.currentArea)
            .then(() => {
              this.fetchAreas();
              this.closeModal();
            })
            .catch(error => {
              console.error(error);
            });
        } else {
          this.$axios.post('/areas', this.currentArea)
            .then(() => {
              this.fetchAreas();
              this.closeModal();
            })
            .catch(error => {
              console.error(error);
            });
        }
      },
      confirmDelete(areaId) {
        this.deleteAreaId = areaId;
        this.showDeleteModal = true;
      },
      deleteArea() {
        this.$axios.delete(`/areas/${this.deleteAreaId}`)
          .then(() => {
            this.fetchAreas();
            this.closeDeleteModal();
          })
          .catch(error => {
            console.error(error);
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
      this.fetchAreas();
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
