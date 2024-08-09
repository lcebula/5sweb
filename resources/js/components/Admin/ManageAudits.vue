<template>
    <div>
      <Navbar />
      <LoadingSpinner :isLoading="isLoading" />
      <div class="container mt-4">
        <h1>{{ $t('manageAudits') }}</h1>
        <button class="btn btn-primary mb-3" @click="addAudit">
          <i class="fas fa-plus"></i> {{ $t('addAudit') }}
        </button>
        <input type="text" v-model="searchTerm" :placeholder="$t('searchAudits')" class="form-control mb-3" />
        <table class="table table-hover">
          <thead>
            <tr>
              <th>{{ $t('area') }}</th>
              <th>{{ $t('sector') }}</th>
              <th>{{ $t('auditor') }}</th>
              <th>{{ $t('auditDate') }}</th>
              <th>{{ $t('checklistTemplate') }}</th>
              <th>{{ $t('status') }}</th>
              <th>{{ $t('observations') }}</th>
              <th class="text-end">{{ $t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="audit in filteredAudits" :key="audit.id">
              <td>{{ audit.area.name }}</td>
              <td>{{ audit.sector.name }}</td>
              <td>{{ audit.user.name }}</td>
              <td>{{ formattedDate(audit.audit_date) }}</td>
              <td>{{ audit.checklist_template.name }}</td>
              <td>
                <i :class="statusIconClass(audit.status)"></i>
                {{ $t(audit.status) }}
              </td>
              <td>{{ audit.observations }}</td>
              <td class="text-end">
                <button class="btn btn-warning btn-icon" @click="editAudit(audit)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-icon ms-2" @click="confirmDelete(audit.id)">
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
              <h5 class="modal-title">{{ isEditMode ? $t('editAudit') : $t('addAudit') }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveAudit">
                <div class="mb-3">
                  <label for="area" class="form-label">{{ $t('area') }}</label>
                  <select id="area" v-model="currentAudit.area_id" class="form-control" required>
                    <option v-for="area in areas" :value="area.id" :key="area.id">{{ area.name }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="sector" class="form-label">{{ $t('sector') }}</label>
                  <select id="sector" v-model="currentAudit.sector_id" class="form-control" required>
                    <option v-for="sector in sectors" :value="sector.id" :key="sector.id">{{ sector.name }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="auditor" class="form-label">{{ $t('auditor') }}</label>
                  <select id="auditor" v-model="currentAudit.user_id" class="form-control" required>
                    <option v-for="auditor in auditors" :value="auditor.id" :key="auditor.id">{{ auditor.name }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="checklistTemplate" class="form-label">{{ $t('checklistTemplate') }}</label>
                  <select id="checklistTemplate" v-model="currentAudit.checklist_template_id" class="form-control" required>
                    <option v-for="template in checklistTemplates" :value="template.id" :key="template.id">{{ template.name }}</option>
                  </select>
                </div>
                <div class="mb-3">
                  <label for="auditDate" class="form-label">{{ $t('auditDate') }}</label>
                  <input type="date" id="auditDate" v-model="currentAudit.audit_date" class="form-control" required />
                </div>
                <div class="mb-3">
                  <label for="observations" class="form-label">{{ $t('observations') }}</label>
                  <textarea id="observations" v-model="currentAudit.observations" class="form-control"></textarea>
                </div>
                <div class="mb-3">
                  <label for="status" class="form-label">{{ $t('status') }}</label>
                  <select id="status" v-model="currentAudit.status" class="form-control" required>
                    <option value="pending">{{ $t('pending') }}</option>
                    <option value="in_progress">{{ $t('inProgress') }}</option>
                    <option value="completed">{{ $t('completed') }}</option>
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
                <button class="btn btn-danger me-2" @click="deleteAudit">{{ $t('delete') }}</button>
                <button class="btn btn-secondary" @click="closeDeleteModal">{{ $t('cancel') }}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

  <script>
  import Navbar from '../Navbar.vue';
  import LoadingSpinner from '../LoadingSpinner.vue';
  import { useI18n } from 'vue-i18n';
  import moment from 'moment';

  export default {
    components: {
      Navbar,
      LoadingSpinner
    },
    data() {
      return {
        audits: [],
        areas: [],
        sectors: [],
        auditors: [],
        checklistTemplates: [],
        searchTerm: '',
        showModal: false,
        showDeleteModal: false,
        isEditMode: false,
        currentAudit: {
          id: null,
          area_id: '',
          sector_id: '',
          user_id: '',
          checklist_template_id: '',
          audit_date: '',
          observations: '',
          status: 'pending' // Valor padrão inicial
        },
        deleteAuditId: null,
        isLoading: false
      };
    },
    computed: {
      filteredAudits() {
        return this.audits.filter(audit => {
          return (
            audit.area.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            audit.sector.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            audit.user.name.toLowerCase().includes(this.searchTerm.toLowerCase())
          );
        });
      }
    },
    methods: {
      fetchAudits() {
        this.isLoading = true;
        this.$axios.get('/audits')
          .then(response => {
            this.audits = response.data;
          })
          .catch(error => {
            console.error(error);
          })
          .finally(() => {
            this.isLoading = false;
          });
      },
      fetchAreas() {
        this.$axios.get('/areas')
          .then(response => {
            this.areas = response.data;
          })
          .catch(error => {
            console.error(error);
          });
      },
      fetchSectors() {
        this.$axios.get('/sectors')
          .then(response => {
            this.sectors = response.data;
          })
          .catch(error => {
            console.error(error);
          });
      },
      fetchAuditors() {
        this.$axios.get('/users')
          .then(response => {
            this.auditors = response.data;
          })
          .catch(error => {
            console.error(error);
          });
      },
      fetchChecklistTemplates() {
        this.$axios.get('/checklist-templates')
          .then(response => {
            this.checklistTemplates = response.data;
          })
          .catch(error => {
            console.error(error);
          });
      },
      addAudit() {
        this.currentAudit = {
          id: null,
          area_id: '',
          sector_id: '',
          user_id: '',
          checklist_template_id: '',
          audit_date: '',
          observations: '',
          status: 'pending' // Valor padrão inicial
        };
        this.isEditMode = false;
        this.showModal = true;
      },
      editAudit(audit) {
        this.currentAudit = { ...audit };
        this.isEditMode = true;
        this.showModal = true;
      },
      saveAudit() {
        this.isLoading = true;
        if (this.isEditMode) {
          this.$axios.put(`/audits/${this.currentAudit.id}`, this.currentAudit)
            .then(() => {
              this.fetchAudits();
              this.closeModal();
            })
            .catch(error => {
              console.error(error);
            })
            .finally(() => {
              this.isLoading = false;
            });
        } else {
          this.$axios.post('/audits', this.currentAudit)
            .then(() => {
              this.fetchAudits();
              this.closeModal();
            })
            .catch(error => {
              console.error(error);
            })
            .finally(() => {
              this.isLoading = false;
            });
        }
      },
      confirmDelete(auditId) {
        this.deleteAuditId = auditId;
        this.showDeleteModal = true;
      },
      deleteAudit() {
        this.isLoading = true;
        this.$axios.delete(`/audits/${this.deleteAuditId}`)
          .then(() => {
            this.fetchAudits();
            this.closeDeleteModal();
          })
          .catch(error => {
            console.error(error);
          })
          .finally(() => {
            this.isLoading = false;
          });
      },
      closeModal() {
        this.showModal = false;
      },
      closeDeleteModal() {
        this.showDeleteModal = false;
      },
      formattedDate(date) {
        return this.$d(new Date(date), 'long'); // 'long' corresponde ao formato definido no JSON
    },
      statusIconClass(status) {
        switch (status) {
          case 'pending':
            return 'fas fa-circle text-danger';
          case 'in_progress':
            return 'fas fa-circle text-primary';
          case 'completed':
            return 'fas fa-circle text-success';
          default:
            return '';
        }
      }
    },
    created() {
      this.fetchAudits();
      this.fetchAreas();
      this.fetchSectors();
      this.fetchAuditors();
      this.fetchChecklistTemplates();
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
    width: 80%; /* Ajustar largura do modal */
    max-width: 600px; /* Definir largura máxima */
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
    font-size: 1rem; /* Ajustar tamanho do ícone */
  }

  .ms-2 {
    margin-left: 0.5rem; /* Ajustar margem entre os ícones */
  }

  .text-end {
    text-align: right;
  }
  </style>
