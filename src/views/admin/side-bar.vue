<template>
    <section class="admin-sidebar">
        <div class="sidebar-header">
            <div class="brand">
                <div class="icon-wrapper">
                    <i class="fa-solid fa-book-open"></i>
                </div>
                <div class="brand-text">
                    <div class="title">Admin Panel</div>
                    <div class="subtitle">Quản lý hệ thống</div>
                </div>
            </div>
        </div>

        <div class="sidebar-body">
            <router-link to="/admin/order" class="menu-item" :class="{ 'active': isActive('dashboard') }">
                <div class="icon-box">
                    <i class="fa-solid fa-clipboard-list"></i>
                </div>
                <span>Đơn hàng</span>
            </router-link>

            <router-link to="/admin/book" class="menu-item" :class="{ 'active': isActive('books') }">
                <div class="icon-box">
                    <i class="fa-solid fa-book"></i>
                </div>
                <span>Quản lý sách</span>
            </router-link>

            <router-link to="/admin/report" class="menu-item" :class="{ 'active': isActive('reports') }">
                <div class="icon-box">
                    <i class="fa-solid fa-chart-pie"></i>
                </div>
                <span>Báo cáo</span>
            </router-link>

            <router-link to="/admin/statistic" class="menu-item" :class="{ 'active': isActive('statistic') }">
                <div class="icon-box">
                    <i class="fa-solid fa-chart-column"></i>
                </div>
                <span>Thống kê</span>
            </router-link>

            <router-link to="/admin/warehouse" class="menu-item" :class="{ 'active': isActive('warehouse') }">
                <div class="icon-box">
                    <i class="fa-solid fa-warehouse"></i>
                </div>
                <span>Kho hàng</span>
            </router-link>

            <button type="button" class="menu-item logout-btn" @click="onLogout">
                <div class="icon-box">
                    <i class="fa-solid fa-right-from-bracket"></i>
                </div>
                <span>Đăng xuất</span>
            </button>
        </div>
    </section>
</template>

<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'

const store = useStore()
const route = useRoute()

// Map route name -> menu key
const adminMenuMap = {
    'admin-order': 'dashboard',
    'admin-book': 'books',
    'admin-report': 'reports',
    'admin-statistic': 'statistic',
    'admin-warehouse': 'warehouse',
}

const currentMenu = computed(() => adminMenuMap[route.name] || 'dashboard')

const isActive = (menuKey) => currentMenu.value === menuKey

const onLogout = async () => {
    await store.dispatch('user/logout')
}
</script>

<style scoped>
.admin-sidebar {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 280px;
    background: linear-gradient(180deg, #ffffff 0%, #fef5fb 100%);
    border-right: 1px solid rgba(245, 87, 108, 0.1);
    box-shadow: 2px 0 12px rgba(245, 87, 108, 0.08);
}

.sidebar-header {
    padding: 24px 20px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    box-shadow: 0 4px 12px rgba(245, 87, 108, 0.2);
}

.brand {
    display: flex;
    align-items: center;
    gap: 12px;
}

.icon-wrapper {
    width: 48px;
    height: 48px;
    background: rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.brand-text {
    flex: 1;
}

.brand-text .title {
    font-size: 20px;
    font-weight: 800;
    color: white;
    letter-spacing: -0.5px;
    margin-bottom: 2px;
}

.brand-text .subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.9);
    font-weight: 500;
}

.sidebar-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 20px 16px;
    overflow-y: auto;
}

.menu-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    color: #666;
    font-size: 15px;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid transparent;
    background: transparent;
    width: 100%;
    text-align: left;
}

.menu-item .icon-box {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: #f5f5f5;
    color: #999;
    transition: all 0.3s ease;
    font-size: 16px;
}

.menu-item span {
    flex: 1;
}

.menu-item:hover {
    background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%);
    color: #f5576c;
    transform: translateX(4px);
}

.menu-item:hover .icon-box {
    background: linear-gradient(135deg, rgba(240, 147, 251, 0.2) 0%, rgba(245, 87, 108, 0.2) 100%);
    color: #f5576c;
    transform: scale(1.05);
}

.menu-item.active {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    font-weight: 600;
    box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.menu-item.active .icon-box {
    background: rgba(255, 255, 255, 0.2);
    color: white;
}

.logout-btn {
    margin-top: auto;
    color: #ef4444;
}

.logout-btn:hover {
    background: linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%);
    color: #dc2626;
}

.logout-btn .icon-box {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;
}

.logout-btn:hover .icon-box {
    background: rgba(239, 68, 68, 0.2);
    color: #dc2626;
}

/* Scrollbar styling */
.sidebar-body::-webkit-scrollbar {
    width: 6px;
}

.sidebar-body::-webkit-scrollbar-track {
    background: transparent;
}

.sidebar-body::-webkit-scrollbar-thumb {
    background: rgba(245, 87, 108, 0.2);
    border-radius: 3px;
}

.sidebar-body::-webkit-scrollbar-thumb:hover {
    background: rgba(245, 87, 108, 0.3);
}

@media (max-width: 1024px) {
    .admin-sidebar {
        position: relative;
        height: auto;
        width: 100%;
        flex-direction: column;
    }

    .sidebar-header {
        padding: 16px 20px;
    }

    .sidebar-body {
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: flex-start;
        padding: 12px;
    }

    .menu-item {
        flex: 1 1 calc(50% - 6px);
        min-width: 140px;
    }

    .logout-btn {
        margin-top: 0;
    }
}
</style>