<template>
    <div class="login-container">
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">{{ $t('login') }}</h5>
                <form @submit.prevent="login">
                    <div class="mb-3">
                        <label for="email" class="form-label">{{ $t('email') }}</label>
                        <input type="email" class="form-control" id="email" v-model="email" required>
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">{{ $t('password') }}</label>
                        <input type="password" class="form-control" id="password" v-model="password" required>
                    </div>
                    <button type="submit" class="btn btn-primary">{{ $t('login') }}</button>
                </form>
                <LanguageSelector />
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import LanguageSelector from './LanguageSelector.vue';

export default {
    components: {
        LanguageSelector
    },
    data() {
        return {
            email: '',
            password: ''
        }
    },
    methods: {
        async login() {
            try {
                const response = await this.$axios.post('login', {
                    email: this.email,
                    password: this.password
                });
                localStorage.setItem('token', response.data.token);
                this.$router.push('/home');
            } catch (error) {
                console.error(error);
                alert(this.$t('loginFailed'));
            }
        }
    }
}
</script>

<style scoped>
.login-container {
    max-width: 400px;
    margin: 100px auto;
}
.card {
    padding: 20px;
}
</style>
