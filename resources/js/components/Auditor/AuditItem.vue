<template>
    <div>
        <button class="btn btn-info btn-sm" @click="showDetails">{{ $t('details') }}</button>

        <div v-if="showModal" class="modal fade show" tabindex="-1" style="display: block;">
            <div class="modal-dialog modal-dialog-scrollable modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">{{ audit.checklist_template.name }}</h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <div v-if="loadingData" class="loading-spinner">
                            <div class="spinner-border" role="status">
                                <span class="visually-hidden">Loading...</span>
                            </div>
                        </div>
                        <div v-else>
                            <div v-if="audit.status !== 'completed'">
                                <h3>{{ $t('fillChecklist') }}</h3>
                                <form @submit.prevent="submitChecklist">
                                    <div v-for="item in filledAuditItems" :key="item.id" class="form-group">
                                        <p v-html="formatDescription(item.item)"></p>
                                        <div class="mt-2">
                                            <label :for="'score-' + item.id" class="form-label">{{ $t('score') }}</label>
                                            <select :id="'score-' + item.id" v-model="checklist[item.id].score" class="form-control" @change="updateScore(item.id, checklist[item.id].score)">
                                                <option v-for="n in 5" :key="n" :value="n">{{ n }}</option>
                                            </select>
                                        </div>
                                        <input type="file" @change="onFileChange($event, item.id)" multiple />
                                        <div v-if="photos[item.id]" class="thumbnail-container">
                                            <div v-for="photo in photos[item.id]" :key="photo.id" class="photo">
                                                <img :src="getPhotoUrl(photo.file_path)" alt="photo.description" class="img-thumbnail" />
                                                <button type="button" class="btn btn-danger btn-sm delete-button" @click="deletePhoto(photo.id)">X</button>
                                            </div>
                                        </div>
                                    </div>
                                    <button type="submit" class="btn btn-primary save-button">{{ $t('save') }}</button>
                                </form>
                            </div>
                            <div v-else>
                                <h3>{{ $t('checklist') }}</h3>
                                <div v-for="item in filledAuditItems" :key="item.id" class="form-group">
                                    <p v-html="formatDescription(item.item)"></p>
                                    <p class="form-control-static">{{ getScore(item.id) }}</p>
                                    <div>
                                        <h5>{{ $t('photos') }}</h5>
                                        <div v-if="photos[item.id] && photos[item.id].length">
                                            <div v-for="photo in photos[item.id]" :key="photo.id" class="photo">
                                                <img :src="getPhotoUrl(photo.file_path)" alt="photo.description" class="img-thumbnail" />
                                                <button type="button" class="btn btn-danger btn-sm delete-button" @click="deletePhoto(photo.id)">X</button>
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
            loadingData: true, // Estado de carregamento
            checklist: {},
            filledAudit: null,
            files: {}, // To store files for each item
            thumbnails: {}, // To store thumbnail URLs
            loading: {}, // To track loading state
            photos: {}, // To store loaded photos for each item
        });

        const filledAuditItems = computed(() => {
            return state.filledAudit ? state.filledAudit.items : [];
        });

        const formatDescription = (description) => {
            return description.replace(/\n/g, '<br>');
        };

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

                uploadFile(file, itemId); // Upload the file immediately
            });
        };

        const uploadFile = (file, itemId) => {
            state.loading[itemId] = true; // Set loading state for the item

            const formData = new FormData();
            formData.append('file', file);
            formData.append('description', '');
            formData.append('filled_audit_item_id', itemId);

            axios
                .post('/photos', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                })
                .then(response => {
                    console.log('File uploaded:', response.data);
                    state.loading[itemId] = false; // Set loading state to false
                    loadPhotos(itemId); // Reload photos to display the newly uploaded thumbnail
                })
                .catch(error => {
                    console.error('Error uploading file:', error);
                    state.loading[itemId] = false; // Set loading state to false
                });
        };

        const loadPhotos = itemId => {
            console.log('Loading photos for item:', itemId);
            axios
                .get(`/photos?filled_audit_item_id=${itemId}`)
                .then(response => {
                    console.log('Photos loaded for item:', itemId, response.data);
                    state.photos[itemId] = response.data;
                    state.photos[itemId].forEach(photo => {
                        console.log('Photo URL:', getPhotoUrl(photo.file_path));
                    });
                })
                .catch(error => {
                    console.error('Error loading photos:', error);
                });
        };

        const showDetails = () => {
            console.log('Showing details for audit:', props.audit.id);
            state.loadingData = true; // Mostrar o spinner ao abrir a modal
            loadFilledAudit();
            state.showModal = true;
        };

        const closeModal = () => {
            state.showModal = false;
        };

        const submitChecklist = () => {
            const items = filledAuditItems.value.map(item => ({
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

        const updateScore = (itemId, score) => {
            const item = filledAuditItems.value.find(it => it.id === itemId);
            if (item) {
                const checklistData = {
                    filled_audit_item_id: itemId,
                    score: score,
                };

                axios
                    .put(`/filled-audit-items/${itemId}`, checklistData)
                    .then(response => {
                        console.log('Score updated:', response.data);
                    })
                    .catch(error => {
                        console.error('Error updating score:', error);
                    });
            }
        };

        const uploadFiles = () => {
            Object.keys(state.files).forEach(itemId => {
                Array.from(state.files[itemId]).forEach(file => {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('description', '');
                    formData.append('filled_audit_item_id', itemId);

                    axios
                        .post('/photos', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                            },
                        })
                        .then(response => {
                            console.log('File uploaded:', response.data);
                            loadPhotos(itemId); // Reload photos to display the newly uploaded thumbnail
                        })
                        .catch(error => {
                            console.error('Error uploading file:', error);
                        });
                });
            });
        };

        const deletePhoto = photoId => {
            axios
                .delete(`/photos/${photoId}`)
                .then(response => {
                    console.log('Photo deleted:', response.data);
                    // Remove the photo from the state
                    Object.keys(state.photos).forEach(itemId => {
                        state.photos[itemId] = state.photos[itemId].filter(photo => photo.id !== photoId);
                    });
                })
                .catch(error => {
                    console.error('Error deleting photo:', error);
                });
        };

        const loadFilledAudit = () => {
            console.log('Loading filled audit for audit:', props.audit.id);
            axios
                .get(`/filled-audits/${props.audit.id}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                })
                .then(response => {
                    console.log('Filled audit loaded:', response.data); // Adicione este log
                    state.filledAudit = response.data;
                    initializeChecklist();
                    // Load photos for each item
                    response.data.items.forEach(item => {
                        loadPhotos(item.id);
                    });
                    state.loadingData = false; // Ocultar o spinner após carregar os dados
                })
                .catch(error => {
                    if (error.response && error.response.status === 404) {
                        console.warn('No filled audit found:', error);
                        state.filledAudit = null;
                        initializeChecklist();
                        state.loadingData = false; // Ocultar o spinner após carregar os dados
                    } else {
                        console.error('Error fetching filled audit:', error);
                    }
                });
        };

        const initializeChecklist = () => {
            console.log('Initializing checklist'); // Adicione este log
            if (props.audit && props.audit.checklist_template && props.audit.checklist_template.items) {
                // Inicialize todos os itens do checklist
                props.audit.checklist_template.items.forEach(item => {
                    if (!state.checklist[item.id]) {
                        state.checklist[item.id] = { score: '' };
                    }
                });

                // Preencha o estado com os itens preenchidos
                if (state.filledAudit && state.filledAudit.items) {
                    state.filledAudit.items.forEach(item => {
                        if (!state.checklist[item.id]) {
                            state.checklist[item.id] = {};
                        }
                        state.checklist[item.id].score = item.score;
                    });
                }
            }
        };

        const getScore = itemId => {
            const checklistItem = props.audit.checklist_template.items.find(it => it.id === itemId);
            const item = state.filledAudit && state.filledAudit.items ? state.filledAudit.items.find(i => i.item === checklistItem.item) : null;
            return item ? item.score : '-';
        };

        const getPhotoUrl = filePath => {
            const serverAddress = 'http://127.0.0.1:8001';
            const url = `${serverAddress}/storage/${filePath}`;
            console.log('Photo URL:', url);
            return url;
        };

        return {
            ...toRefs(state),
            filledAuditItems,
            formatDescription,
            onFileChange,
            uploadFile,
            showDetails,
            closeModal,
            submitChecklist,
            updateScore,
            uploadFiles,
            deletePhoto,
            loadFilledAudit,
            initializeChecklist,
            getScore,
            getPhotoUrl,
        };
    },
};
</script>

<style scoped>
.modal.fade.show {
    display: block;
    background-color: rgba(0, 0, 0, 0.5);
}
.modal-dialog.modal-lg {
    max-width: 80%;
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
    position: relative;
}
.thumbnail-container {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 10px;
}
.delete-button {
    position: absolute;
    top: 5px;
    right: 5px;
}
.loading-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 10px;
}
.loading-spinner {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
}
</style>
