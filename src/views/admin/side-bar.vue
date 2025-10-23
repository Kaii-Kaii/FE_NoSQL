<template>
    <section>
        <div>
            <div class="h-16 w-full bg-gray-700 text-white flex items-center px-4">
                <div class="text-lg font-bold uppercase">Trang quản lý</div>
            </div>  
        </div>
        <div class="h-screen w-60 bg-gray-800 text-gray-500 flex flex-col p-4 gap-3">
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