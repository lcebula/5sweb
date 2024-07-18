<template>
    <div>
        <Navbar />
        <div class="container">
            <h1>Welcome to Home</h1>
        </div>
    </div>
</template>

<script>
import Navbar from './Navbar.vue';

export default {
    components: {
        Navbar
    }
}
</script>

<style scoped>
.container {
    padding-top: 20px;
}
</style>
