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
                    <input type="file" @change="onFileChange($event, item.id)" multiple />
                    <div v-if="thumbnails[item.id]" class="thumbnail-container">
                      <img v-for="thumbnail in thumbnails[item.id]" :key="thumbnail" :src="thumbnail" class="img-thumbnail" />
                      <div v-if="loading[item.id]" class="loading-icon">
                        <i class="fas fa-spinner fa-spin"></i>
                      </div>
                    </div>
                  </div>
                  <button type="submit" class="btn btn-primary save-button">{{ $t('save') }}</button>
                </form>
              </div>
              <div v-else>
                <h3>{{ $t('checklist') }}</h3>
                <div v-for="item in checklistItems" :key="item.id" class="form-group">
                  <label :for="'item-' + item.id">{{ item.item }}</label>
                  <p class="form-control-static">{{ getScore(item.id) }}</p>
                  <div>
                    <h5>{{ $t('photos') }}</h5>
                    <div v-if="item.photos && item.photos.length">
                      <div v-for="photo in item.photos" :key="photo.id" class="photo">
                        <img :src="photo.file_path" alt="photo.description" class="img-thumbnail" />
                        <p>{{ photo.description }}</p>
                      </div>
                    </div>
                    <div v-else>
                      <p>{{ $t('noPhotos') }}</p>
                    </div>
                  </div>
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
  import { reactive, toRefs, computed } from 'vue';
  import axios from 'axios';

  export default {
    props: {
      audit: Object,
    },
    setup(props) {
      const state = reactive({
        showModal: false,
        checklist: {},
        filledAudit: null,
        files: {}, // Para armazenar arquivos para cada item
        thumbnails: {}, // Para armazenar URLs dos thumbnails
        loading: {}, // Para rastrear o estado de carregamento
      });

      const checklistItems = computed(() => {
        return props.audit.checklist_template ? props.audit.checklist_template.items : [];
      });

      const onFileChange = (event, itemId) => {
        if (!state.thumbnails[itemId]) {
          state.thumbnails[itemId] = [];
        }

        Array.from(event.target.files).forEach(file => {
          const reader = new FileReader();
          reader.onload = e => {
            state.thumbnails[itemId].push(e.target.result);
          };
          reader.readAsDataURL(file);

          uploadFile(file, itemId); // Faz o upload do arquivo imediatamente
        });
      };

      const uploadFile = (file, itemId) => {
        state.loading[itemId] = true; // Define o estado de carregamento para o item

        const formData = new FormData();
        formData.append('file', file);
        formData.append('description', '');
        formData.append('user_id', localStorage.getItem('user_id')); // Ajuste de acordo com o seu armazenamento de usuário
        formData.append('filled_audit_item_id', itemId);

        axios
          .post('/photos', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          })
          .then(response => {
            console.log('File uploaded:', response.data);
            state.loading[itemId] = false; // Define o estado de carregamento para falso
          })
          .catch(error => {
            console.error('Error uploading file:', error);
            state.loading[itemId] = false; // Define o estado de carregamento para falso
          });
      };

      const showDetails = () => {
        loadFilledAudit();
        state.showModal = true;
      };

      const closeModal = () => {
        state.showModal = false;
      };

      const submitChecklist = () => {
        const items = checklistItems.value.map(item => ({
          item: item.item,
          concept: item.concept,
          score: state.checklist[item.id]?.score,
        }));

        const filledAuditData = {
          audit_id: props.audit.id,
          template_name: props.audit.checklist_template.name,
          items,
        };

        if (state.filledAudit) {
          axios
            .put(`/filled-audits/${state.filledAudit.id}`, filledAuditData)
            .then(response => {
              state.filledAudit = response.data;
              uploadFiles();
              alert(props.$t('checklistSaved'));
            })
            .catch(error => {
              console.error('Error saving checklist:', error);
            });
        } else {
          axios
            .post('/filled-audits', filledAuditData)
            .then(response => {
              state.filledAudit = response.data;
              uploadFiles();
              alert(props.$t('checklistSaved'));
            })
            .catch(error => {
              console.error('Error saving checklist:', error);
            });
        }
      };

      const uploadFiles = () => {
        Object.keys(state.files).forEach(itemId => {
          Array.from(state.files[itemId]).forEach(file => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('description', '');
            formData.append('user_id', localStorage.getItem('user_id')); // Ajuste de acordo com o seu armazenamento de usuário
            formData.append('filled_audit_item_id', itemId);

            axios
              .post('/photos', formData, {
                headers: {
                  'Content-Type': 'multipart/form-data',
                },
              })
              .then(response => {
                console.log('File uploaded:', response.data);
              })
              .catch(error => {
                console.error('Error uploading file:', error);
              });
          });
        });
      };

      const loadFilledAudit = () => {
        axios
          .get(`/filled-audits/${props.audit.id}`, {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
          })
          .then(response => {
            state.filledAudit = response.data;
            initializeChecklist();
          })
          .catch(error => {
            if (error.response && error.response.status === 404) {
              console.warn('No filled audit found:', error);
              state.filledAudit = null;
              initializeChecklist();
            } else {
              console.error('Error fetching filled audit:', error);
            }
          });
      };

      const initializeChecklist = () => {
        if (props.audit && props.audit.checklist_template && props.audit.checklist_template.items) {
          props.audit.checklist_template.items.forEach(item => {
            state.checklist[item.id] = { score: '' };
          });
          if (state.filledAudit && state.filledAudit.items) {
            state.filledAudit.items.forEach(item => {
              const checklistItem = props.audit.checklist_template.items.find(it => it.item === item.item);
              if (checklistItem) {
                state.checklist[checklistItem.id].score = item.score;
              }
            });
          }
        }
      };

      const getScore = itemId => {
        const checklistItem = props.audit.checklist_template.items.find(it => it.id === itemId);
        const item = state.filledAudit && state.filledAudit.items ? state.filledAudit.items.find(i => i.item === checklistItem.item) : null;
        return item ? item.score : '-';
      };

      return {
        ...toRefs(state),
        checklistItems,
        onFileChange,
        uploadFile,
        showDetails,
        closeModal,
        submitChecklist,
        uploadFiles,
        loadFilledAudit,
        initializeChecklist,
        getScore,
      };
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
  .img-thumbnail {
    max-width: 100px;
    margin-right: 10px;
  }
  .photo {
    display: flex;
    align-items: center;
    margin-top: 10px;
  }
  .thumbnail-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
  }
  .loading-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
  }
  </style>
