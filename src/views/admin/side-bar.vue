<template>
    <section>
        <div>
            <div class="h-16 w-full bg-gray-700 text-white flex items-center px-4">
                <div class="text-lg font-bold uppercase">Trang quản lý</div>
            </div>  
        </div>
        <div class="h-screen w-60 bg-gray-800 text-gray-500 flex flex-col p-4 gap-3">
            <router-link to="/admin/order" class=" rounded px-4 py-2 flex gap-3 items-center cursor-pointer" :class="{'text-white bg-gray-700': selectedMenu === 'dashboard'}" @click="selectedMenu = 'dashboard'">
                <i class="fa-solid fa-clipboard-list"></i>
                <span>Quản lý đơn hàng</span>
            </router-link>
            <router-link to="/admin/book" class=" rounded px-4 py-2 flex gap-3 items-center cursor-pointer" :class="{'text-white bg-gray-700': selectedMenu === 'books'}" @click="selectedMenu = 'books'">
                <i class="fa-solid fa-book"></i>
                <span>Quản lý sách</span>
            </router-link>
            <router-link to="/admin/report" class=" rounded px-4 py-2 flex gap-3 items-center cursor-pointer" :class="{'text-white bg-gray-700': selectedMenu === 'reports'}" @click="selectedMenu = 'reports'">
                <i class="fa-solid fa-chart-pie"></i>
                <span>Báo cáo, thống kê</span>
            </router-link>
            <router-link to="/admin/warehouse" class=" rounded px-4 py-2 flex gap-3 items-center cursor-pointer" :class="{'text-white bg-gray-700': selectedMenu === 'warehouse'}" @click="selectedMenu = 'warehouse'">
                <i class="fa-solid fa-warehouse"></i>
                <span>Kho hàng</span>
            </router-link>
        </div>
    </section>
</template>

<script setup>
import { ref } from 'vue';

const selectedMenu = ref('dashboard');
</script>