<template>
    <div>
      <Navbar />
      <div class="container mt-4">
        <h1>{{ $t('myAudits') }}</h1>
        <table class="table table-striped">
          <thead>
            <tr>
              <th>{{ $t('auditDate') }}</th>
              <th>{{ $t('area') }}</th>
              <th>{{ $t('sector') }}</th>
              <th>{{ $t('status') }}</th>
              <th>{{ $t('checklistTemplate') }}</th>
              <th>{{ $t('observations') }}</th>
              <th>{{ $t('details') }}</th>
              <th>{{ $t('actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="audits.length === 0">
              <td colspan="8">{{ $t('noAudits') }}</td>
            </tr>
            <tr v-for="audit in audits" :key="audit.id">
              <td>{{ formattedDate(audit.audit_date) }}</td>
              <td>{{ audit.area.name }}</td>
              <td>{{ audit.sector.name }}</td>
              <td>
                <div class="status-container">
                  <span :class="statusClass(audit.status)">
                    <i :class="statusIcon(audit.status)"></i> {{ $t(audit.status) }}
                  </span>
                </div>
              </td>
              <td>{{ audit.checklist_template.name }}</td>
              <td>{{ audit.observations }}</td>
              <td><AuditItem :audit="audit" /></td>
              <td>
                <div v-if="audit.status !== 'completed'" class="action-buttons">
                  <select @change="updateAuditStatus(audit, $event.target.value)" v-model="audit.status" class="form-select form-select-sm">
                    <option value="pending">{{ $t('pending') }}</option>
                    <option value="in_progress">{{ $t('inProgress') }}</option>
                    <option value="completed">{{ $t('complete') }}</option>
                  </select>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-if="showConfirmModal" class="modal-container">
          <div class="modal-backdrop"></div>
          <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">{{ $t('confirm') }}</h5>
                <button type="button" class="btn-close" @click="closeConfirmModal"></button>
              </div>
              <div class="modal-body">
                <p>{{ $t('confirmFinalizeMessage') }}</p>
              </div>
              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" @click="closeConfirmModal">{{ $t('cancel') }}</button>
                <button type="button" class="btn btn-danger" @click="finalizeAudit">{{ $t('confirm') }}</button>
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
  import AuditItem from './AuditItem.vue';
  import moment from 'moment';

  export default {
    components: {
      Navbar,
      AuditItem,
    },
    data() {
      return {
        audits: [],
        showConfirmModal: false,
        auditToFinalize: null,
      };
    },
    created() {
      this.fetchAudits();
    },
    methods: {
      fetchAudits() {
        axios
          .get('/audits/my-audits', {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
          .then((response) => {
            this.audits = response.data;
          })
          .catch((error) => {
            console.error('Error fetching audits:', error);
          });
      },
      formattedDate(date) {
        return moment(date).format('L');
      },
      statusClass(status) {
        return {
          'text-danger': status === 'pending',
          'text-primary': status === 'in_progress',
          'text-success': status === 'completed',
        };
      },
      statusIcon(status) {
        return {
          'fas fa-exclamation-circle': status === 'pending',
          'fas fa-spinner': status === 'in_progress',
          'fas fa-check-circle': status === 'completed',
        };
      },
      updateAuditStatus(audit, newStatus) {
        axios
          .put(`/audits/${audit.id}`, { status: newStatus }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
          .then((response) => {
            audit.status = newStatus;
            if (newStatus === 'completed') {
              this.fetchAudits();
            }
          })
          .catch((error) => {
            console.error('Error updating audit status:', error);
          });
      },
      confirmFinalize(audit) {
        this.auditToFinalize = audit;
        this.showConfirmModal = true;
      },
      closeConfirmModal() {
        this.showConfirmModal = false;
        this.auditToFinalize = null;
      },
      finalizeAudit() {
        if (this.auditToFinalize) {
          this.updateAuditStatus(this.auditToFinalize, 'completed');
          this.closeConfirmModal();
        }
      },
    },
  };
  </script>

  <style scoped>
  .container {
    margin-top: 20px;
  }
  .table {
    margin-top: 20px;
  }
  .status-container {
    display: flex;
    align-items: center;
  }
  .action-buttons {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  .text-danger {
    color: red;
  }
  .text-primary {
    color: blue;
  }
  .text-success {
    color: green;
  }
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
    width: 80%;
    max-width: 600px;
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
  </style>
