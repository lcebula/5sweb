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
            </tr>
          </thead>
          <tbody>
            <tr v-if="audits.length === 0">
              <td colspan="7">{{ $t('noAudits') }}</td>
            </tr>
            <tr v-for="audit in audits" :key="audit.id">
              <td>{{ formattedDate(audit.audit_date) }}</td>
              <td>{{ audit.area.name }}</td>
              <td>{{ audit.sector.name }}</td>
              <td>
                <span :class="statusClass(audit.status)">
                  <i :class="statusIcon(audit.status)"></i> {{ $t(audit.status) }}
                </span>
              </td>
              <td>{{ audit.checklist_template.name }}</td>
              <td>{{ audit.observations }}</td>
              <td><AuditItem :audit="audit" /></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>

  <script>
  import axios from 'axios';
  import Navbar from '../Navbar.vue';
  import AuditItem from './AuditItem.vue';
  import { useI18n } from 'vue-i18n';
  import moment from 'moment';

  export default {
    components: {
      Navbar,
      AuditItem,
    },
    data() {
      return {
        audits: [],
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
          'text-primary': status === 'inProgress',
          'text-success': status === 'completed',
        };
      },
      statusIcon(status) {
        return {
          'fas fa-exclamation-circle': status === 'pending',
          'fas fa-spinner': status === 'inProgress',
          'fas fa-check-circle': status === 'completed',
        };
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
  .text-danger {
    color: red;
  }
  .text-primary {
    color: blue;
  }
  .text-success {
    color: green;
  }
  </style>
