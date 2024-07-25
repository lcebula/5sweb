<template>
    <div>
      <button class="btn btn-info btn-sm" @click="showDetails">{{ $t('details') }}</button>

      <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block;">
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ audit.checklist_template.name }}</h5>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <div v-if="audit.status !== 'completed'">
                <h3>{{ $t('fillChecklist') }}</h3>
                <form @submit.prevent="submitChecklist">
                  <div v-for="item in checklistItems" :key="item.id" class="form-group">
                    <label :for="'item-' + item.id">{{ item.item }}</label>
                    <select :id="'item-' + item.id" v-model="checklist[item.id].score" class="form-control">
                      <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary save-button">{{ $t('save') }}</button>
                </form>
              </div>
              <div v-else>
                <h3>{{ $t('checklist') }}</h3>
                <div v-for="item in checklistItems" :key="item.id" class="form-group">
                  <label :for="'item-' + item.id">{{ item.item }}</label>
                  <p class="form-control-static">{{ getScore(item.id) }}</p>
                </div>
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

export default {
  props: {
    audit: Object,
  },
  data() {
    return {
      showModal: false,
      checklist: reactive({}),
      filledAudit: null,
    };
  },
  computed: {
    checklistItems() {
      return this.audit.checklist_template?.items || [];
    },
  },
  methods: {
    showDetails() {
      this.loadFilledAudit();
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

      if (this.filledAudit) {
        // Update existing filled audit
        axios
          .put(`/filled-audits/${this.filledAudit.id}`, { template_name: this.audit.checklist_template.name, items }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
          .then((response) => {
            this.filledAudit = response.data;
            alert(this.$t('checklistSaved'));
            this.closeModal();
          })
          .catch((error) => {
            console.error('Error saving checklist:', error);
          });
      } else {
        // Create new filled audit
        axios
          .post('/filled-audits', { audit_id: this.audit.id, template_name: this.audit.checklist_template.name, items }, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
          .then((response) => {
            this.filledAudit = response.data;
            alert(this.$t('checklistSaved'));
            this.closeModal();
          })
          .catch((error) => {
            console.error('Error saving checklist:', error);
          });
      }
    },
    loadFilledAudit() {
      axios
        .get(`/filled-audits/${this.audit.id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        .then((response) => {
          this.filledAudit = response.data;
          this.initializeChecklist();
        })
        .catch((error) => {
          console.error('Error fetching filled audit:', error);
        });
    },
    initializeChecklist() {
      if (this.audit && this.audit.checklist_template && this.audit.checklist_template.items) {
        this.audit.checklist_template.items.forEach((item) => {
          this.checklist[item.id] = { score: '' };
        });
        if (this.filledAudit && this.filledAudit.items) {
          this.filledAudit.items.forEach((item) => {
            const checklistItem = this.audit.checklist_template.items.find(it => it.item === item.item);
            if (checklistItem) {
              this.checklist[checklistItem.id].score = item.score;
            }
          });
        }
      }
    },
    getScore(itemId) {
      const checklistItem = this.audit.checklist_template.items.find(it => it.id === itemId);
      const item = this.filledAudit && this.filledAudit.items ? this.filledAudit.items.find(i => i.item === checklistItem.item) : null;
      return item ? item.score : '-';
    },
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
.form-group {
  margin-bottom: 1rem;
}
.save-button {
  margin-top: 1rem;
}
</style>
