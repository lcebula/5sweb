<template>
    <div>
      <button class="btn btn-info btn-sm" @click="showDetails">{{ $t('details') }}</button>

      <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block;">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ audit.checklist_template.name }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <p><strong>{{ $t('auditDate') }}:</strong> {{ formattedDate(audit.audit_date) }}</p>
              <p><strong>{{ $t('area') }}:</strong> {{ audit.area.name }}</p>
              <p><strong>{{ $t('sector') }}:</strong> {{ audit.sector.name }}</p>
              <p><strong>{{ $t('status') }}:</strong> {{ $t(audit.status) }}</p>
              <p><strong>{{ $t('observations') }}:</strong> {{ audit.observations }}</p>
              <p><strong>{{ $t('evidence') }}:</strong></p>
              <ul>
                <li v-for="photo in audit.photos" :key="photo.id">{{ photo.filename }}</li>
              </ul>

              <div v-if="audit.status !== 'completed'">
                <h3>{{ $t('fillChecklist') }}</h3>
                <form @submit.prevent="submitChecklist">
                  <div v-for="item in checklistItems" :key="item.id" class="form-group">
                    <label :for="'item-' + item.id">{{ item.item }}</label>
                    <select :id="'item-' + item.id" v-model="checklist[item.id].score" class="form-control">
                      <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary">{{ $t('save') }}</button>
                </form>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" @click="closeModal">{{ $t('close') }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>

<script>
import { reactive } from 'vue';
import axios from 'axios';
import { useI18n } from 'vue-i18n';

export default {
  props: {
    audit: Object,
  },
  data() {
    return {
      showModal: false,
      checklist: reactive({}),
    };
  },
  computed: {
    checklistItems() {
      return this.audit.checklist_template?.items || [];
    },
  },
  methods: {
    showDetails() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
    },
    submitChecklist() {
      const items = this.checklistItems.map(item => ({
        item: item.item,
        concept: item.concept,
        score: this.checklist[item.id]?.score,
      }));

      axios
        .post(`/audits/${this.audit.id}/checklist`, { items }, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        .then((response) => {
          alert(this.$t('checklistSaved'));
          this.closeModal();
        })
        .catch((error) => {
          console.error('Error saving checklist:', error);
        });
    },
    initializeChecklist() {
      if (this.audit && this.audit.checklist_template && this.audit.checklist_template.items) {
        this.audit.checklist_template.items.forEach((item) => {
          this.checklist[item.id] = { score: '' };
        });
      }
    },
    formattedDate(date) {
      return this.$d(new Date(date), 'long');
    }
  },
  watch: {
    audit: {
      immediate: true,
      handler() {
        this.initializeChecklist();
      },
    },
  },
};
</script>

<style scoped>
.modal.fade.show {
  display: block;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
