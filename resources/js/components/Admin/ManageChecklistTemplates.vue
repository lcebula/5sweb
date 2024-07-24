<template>
    <div>
      <Navbar />
      <LoadingSpinner :isLoading="isLoading" />
      <div class="container mt-4">
        <h1>{{ $t('manageChecklistTemplates') }}</h1>
        <button class="btn btn-primary mb-3" @click="showAddTemplateForm = true">
          <i class="fas fa-plus"></i> {{ $t('addTemplate') }}
        </button>
        <input type="text" v-model="searchQuery" :placeholder="$t('searchTemplates')" class="form-control mb-3" />
        <table class="table table-hover">
          <thead>
            <tr>
              <th>{{ $t('name') }}</th><th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="template in filteredTemplates" :key="template.id">
              <td>{{ template.name }}</td>
              <td class="text-end">
                <button class="btn btn-warning btn-icon" @click="showEditForm(template)">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-icon ms-2" @click="confirmDelete(template.id)">
                  <i class="fas fa-trash-alt"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Add/Edit Modal -->
      <div v-if="showAddTemplateForm || showEditTemplateForm" class="modal-container">
        <div class="modal-backdrop"></div>
        <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ showEditTemplateForm ? $t('editTemplate') : $t('addTemplate') }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="saveTemplate">
                <div class="mb-3">
                  <label for="name" class="form-label">{{ $t('name') }}</label>
                  <input v-model="currentTemplate.name" id="name" class="form-control" required />
                </div>
                <div v-if="showEditTemplateForm" class="mb-3">
                  <label class="form-label">{{ $t('items') }}</label>
                  <div v-for="item in currentTemplate.items" :key="item.id" class="mb-2">
                    <textarea v-model="item.item" class="form-control mb-1" placeholder="Item" rows="3" required></textarea>
                    <label class="form-label">{{ $t('concept') }}</label>
                    <select v-model="item.concept" class="form-control mb-1" required>
                      <option value="seiri">{{ $t('seiri') }}</option>
                      <option value="seiton">{{ $t('seiton') }}</option>
                      <option value="seiso">{{ $t('seiso') }}</option>
                      <option value="seiketsu">{{ $t('seiketsu') }}</option>
                      <option value="shitsuke">{{ $t('shitsuke') }}</option>
                    </select>
                    <button type="button" class="btn btn-danger btn-sm mt-1" @click="removeItem(item.id)">{{ $t('delete') }}</button>
                  </div>
                  <button type="button" class="btn btn-secondary mt-2" @click="addItem">{{ $t('addItem') }}</button>
                </div>
                <div class="mt-3 d-flex justify-content-end">
                  <button type="submit" class="btn btn-primary me-2">{{ $t('save') }}</button>
                  <button type="button" class="btn btn-secondary" @click="closeModal">{{ $t('cancel') }}</button>
                </div>
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
                <button class="btn btn-danger me-2" @click="deleteTemplate">{{ $t('delete') }}</button>
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

  export default {
    components: {
      Navbar,
      LoadingSpinner
    },
    data() {
      return {
        templates: [],
        currentTemplate: {
          id: null,
          name: '',
          items: []
        },
        showAddTemplateForm: false,
        showEditTemplateForm: false,
        showDeleteModal: false,
        searchQuery: '',
        deleteTemplateId: null,
        isLoading: false
      };
    },
    computed: {
      filteredTemplates() {
        return this.templates.filter(template =>
          template.name.toLowerCase().includes(this.searchQuery.toLowerCase())
        );
      }
    },
    created() {
      this.fetchTemplates();
    },
    methods: {
      async fetchTemplates() {
        this.isLoading = true;
        try {
          const response = await this.$axios.get('/checklist-templates');
          this.templates = response.data;
        } catch (error) {
          console.error(error);
        } finally {
          this.isLoading = false;
        }
      },
      addTemplate() {
        this.currentTemplate = {
          id: null,
          name: '',
          items: []
        };
        this.showAddTemplateForm = true;
      },
      showEditForm(template) {
        this.currentTemplate = { ...template, items: [...template.items] };
        this.showEditTemplateForm = true;
      },
      async saveTemplate() {
        this.isLoading = true;
        try {
          if (this.showEditTemplateForm) {
            const response = await this.$axios.put(`/checklist-templates/${this.currentTemplate.id}`, this.currentTemplate);
            const index = this.templates.findIndex(template => template.id === this.currentTemplate.id);
            this.templates.splice(index, 1, response.data);
          } else {
            const response = await this.$axios.post('/checklist-templates', this.currentTemplate);
            this.templates.push(response.data);
          }
          this.closeModal();
        } catch (error) {
          console.error(error);
        } finally {
          this.isLoading = false;
        }
      },
      async deleteTemplate() {
        this.isLoading = true;
        try {
          await this.$axios.delete(`/checklist-templates/${this.deleteTemplateId}`);
          this.templates = this.templates.filter(template => template.id !== this.deleteTemplateId);
          this.closeDeleteModal();
        } catch (error) {
          console.error(error);
        } finally {
          this.isLoading = false;
        }
      },
      confirmDelete(templateId) {
        this.deleteTemplateId = templateId;
        this.showDeleteModal = true;
      },
      closeModal() {
        this.showAddTemplateForm = false;
        this.showEditTemplateForm = false;
      },
      closeDeleteModal() {
        this.showDeleteModal = false;
      },
      addItem() {
        this.currentTemplate.items.push({ id: Date.now(), item: '', concept: '' });
      },
      removeItem(itemId) {
        this.currentTemplate.items = this.currentTemplate.items.filter(item => item.id !== itemId);
      }
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

  .modal-dialog-scrollable .modal-content {
    max-height: 90vh; /* Permitir rolagem se necessário */
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #dee2e6;
    background-color: #f8f9fa;
    position: sticky;
    top: 0;
    z-index: 1052;
  }

  .modal-body {
    padding: 1rem;
    overflow-y: auto;
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

  .me-2 {
    margin-right: 0.5rem;
  }

  .table-hover tbody tr td:first-child {
    border-bottom: 1px solid #dee2e6;
  }

  th {
    border-bottom: 1px solid #dee2e6;
  }
  </style>
