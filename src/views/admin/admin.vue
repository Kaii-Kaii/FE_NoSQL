<template>
    <div class="admin-layout">
        <SideBar></SideBar>
        <div class="main-content">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup>
import router from '../../router';
import SideBar from './side-bar.vue';

</script>

<style scoped>
.admin-layout {
    display: flex;
    min-height: 100vh;
    background: linear-gradient(135deg, rgba(240, 147, 251, 0.03) 0%, rgba(245, 87, 108, 0.03) 100%);
}

.main-content {
    flex: 1;
    padding: 24px;
    overflow-x: hidden;
}

@media (max-width: 1024px) {
    .admin-layout {
        flex-direction: column;
    }

    .main-content {
        padding: 16px;
    }
}
</style>