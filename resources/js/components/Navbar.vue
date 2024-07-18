<template>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container-fluid">
            <router-link class="navbar-brand" to="/home">{{ $t('Home') }}</router-link>
            <div class="collapse navbar-collapse">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <li class="nav-item">
                        <router-link class="nav-link" to="/home">{{ $t('Home') }}</router-link>
                    </li>
                </ul>
                <ul class="navbar-nav ml-auto">
                    <li class="nav-item">
                        <button @click="logout" class="btn btn-link">{{ $t('Logout') }}</button>
                    </li>
                </ul>
            </div>
        </div>
    </nav>
</template>

<script>
export default {
    methods: {
        logout() {
            localStorage.removeItem('token');
            this.$router.push('/');
        }
    }
}
</script>

<style scoped>
.navbar {
    margin-bottom: 20px;
}
</style>
