<template>
    <div>
      <Navbar />
      <LoadingSpinner :isLoading="isLoading" />
      <div class="container mt-4">
        <h1>{{ $t('manageSectors') }}</h1>
        <button class="btn btn-primary mb-3" @click="addSector">
          <i class="fas fa-plus"></i> {{ $t('addSector') }}
        </button>
        <input type="text" v-model="searchTerm" :placeholder="$t('searchSectors')" class="form-control mb-3" />
        <table class="table table-hover">
          <thead>
            <tr>
              <th>{{ $t('name') }}</th>
              <th>{{ $t('area') }}</th>
              <th class="text-end">{{ $t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sector in filteredSectors" :key="sector.id">
              <td>{{ sector.name }}</td>
              <td>{{ getAreaName(sector.area_id) }}</td>
              <td class="text-end">
                <button class="btn btn-warning btn-icon" @click="editSector(sector)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-icon ms-2" @click="confirmDelete(sector.id)">
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
              <h5 class="modal-title">{{ isEditMode ? $t('editSector') : $t('addSector') }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveSector">
                <div class="mb-3">
                  <label for="name" class="form-label">{{ $t('name') }}</label>
                  <input type="text" id="name" v-model="currentSector.name" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label for="area_id" class="form-label">{{ $t('area') }}</label>
                  <select id="area_id" v-model="currentSector.area_id" class="form-control" required>
                    <option v-for="area in areas" :value="area.id" :key="area.id">{{ area.name }}</option>
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
                <button class="btn btn-danger me-2" @click="deleteSector">{{ $t('delete') }}</button>
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
      sectors: [],
      areas: [],
      searchTerm: '',
      showModal: false,
      showDeleteModal: false,
      isEditMode: false,
      currentSector: {
        id: null,
        name: '',
        area_id: ''
      },
      deleteSectorId: null,
      isLoading: false // Adicionar estado de carregamento
    };
  },
  computed: {
    filteredSectors() {
      return this.sectors.filter(sector => sector.name.toLowerCase().includes(this.searchTerm.toLowerCase()));
    }
  },
  methods: {
    fetchSectors() {
      this.isLoading = true; // Ativar carregamento
      this.$axios.get('/sectors')
        .then(response => {
          this.sectors = response.data;
        })
        .catch(error => {
          console.error(error);
        })
        .finally(() => {
          this.isLoading = false; // Desativar carregamento
        });
    },
    fetchAreas() {
      this.isLoading = true; // Ativar carregamento
      this.$axios.get('/areas')
        .then(response => {
          this.areas = response.data;
        })
        .catch(error => {
          console.error(error);
        })
        .finally(() => {
          this.isLoading = false; // Desativar carregamento
        });
    },
    getAreaName(areaId) {
      const area = this.areas.find(area => area.id === areaId);
      return area ? area.name : '';
    },
    editSector(sector) {
      this.currentSector = { ...sector };
      this.isEditMode = true;
      this.showModal = true;
    },
    addSector() {
      this.currentSector = {
        id: null,
        name: '',
        area_id: ''
      };
      this.isEditMode = false;
      this.showModal = true;
    },
    saveSector() {
      this.isLoading = true; // Ativar carregamento
      if (this.isEditMode) {
        this.$axios.put(`/sectors/${this.currentSector.id}`, this.currentSector)
          .then(() => {
            this.fetchSectors();
            this.closeModal();
          })
          .catch(error => {
            console.error(error);
          })
          .finally(() => {
            this.isLoading = false; // Desativar carregamento
          });
      } else {
        this.$axios.post('/sectors', this.currentSector)
          .then(() => {
            this.fetchSectors();
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
    confirmDelete(sectorId) {
      this.deleteSectorId = sectorId;
      this.showDeleteModal = true;
    },
    deleteSector() {
      this.isLoading = true; // Ativar carregamento
      this.$axios.delete(`/sectors/${this.deleteSectorId}`)
        .then(() => {
          this.fetchSectors();
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
    this.fetchSectors();
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
