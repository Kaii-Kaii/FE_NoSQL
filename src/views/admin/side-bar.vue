<template>
    <section class="admin-sidebar">
        <div class="sidebar-header">
            <div class="title">Trang quản lý</div>
        </div>
        <div class="sidebar-body">
            <router-link to="/admin/order" class=" rounded px-4 py-2 flex gap-3 items-center cursor-pointer" :class="{'text-white bg-gray-700': isActive('dashboard')}">
                <i class="fa-solid fa-clipboard-list"></i>
                <span>Quản lý đơn hàng</span>
            </router-link>
            <router-link to="/admin/book" class=" rounded px-4 py-2 flex gap-3 items-center cursor-pointer" :class="{'text-white bg-gray-700': isActive('books')}">
                <i class="fa-solid fa-book"></i>
                <span>Quản lý sách</span>
            </router-link>
            <router-link to="/admin/report" class=" rounded px-4 py-2 flex gap-3 items-center cursor-pointer" :class="{'text-white bg-gray-700': isActive('reports')}">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Báo cáo, thống kê</span>
            </router-link>
            <router-link to="/admin/warehouse" class=" rounded px-4 py-2 flex gap-3 items-center cursor-pointer" :class="{'text-white bg-gray-700': isActive('warehouse')}">
                <i class="fa-solid fa-warehouse"></i>
                <span>Kho hàng</span>
            </router-link>
            <button type="button" class="mt-auto rounded px-4 py-2 flex gap-3 items-center cursor-pointer text-left text-red-400 hover:text-white hover:bg-red-600 transition-colors" @click="onLogout">
                <i class="fa-solid fa-right-from-bracket"></i>
                <span>Đăng xuất</span>
            </button>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';

const store = useStore();
const route = useRoute();

const adminMenuMap = {
    'admin-order': 'dashboard',
    'admin-book': 'books',
    'admin-report': 'reports',
    'admin-warehouse': 'warehouse',
};

const currentMenu = computed(() => adminMenuMap[route.name] || 'dashboard');

const isActive = (menuKey) => currentMenu.value === menuKey;

const onLogout = async () => {
    await store.dispatch('user/logout');
};
</script>

<style scoped>
.admin-sidebar {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 240px;
    background: #1f2937;
    color: #9ca3af;
}

.sidebar-header {
    height: 64px;
    display: flex;
    align-items: center;
    padding: 0 16px;
    background: #111827;
    color: #f9fafb;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.sidebar-header .title {
    font-size: 16px;
    font-weight: 700;
    text-transform: uppercase;
}

.sidebar-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    overflow-y: auto;
}

.sidebar-body :deep(.router-link-active) {
    background: #374151;
    color: #f9fafb;
}

.sidebar-body a {
    color: inherit;
    border-radius: 8px;
    transition: background 0.2s ease, color 0.2s ease;
}

.sidebar-body a:hover {
    background: #2d3748;
    color: #f9fafb;
}

.sidebar-body button {
    color: inherit;
    border-radius: 8px;
}

@media (max-width: 1024px) {
    .admin-sidebar {
        position: relative;
        height: auto;
        width: 100%;
        flex-direction: row;
    }

    .sidebar-body {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
    }
}
</style>