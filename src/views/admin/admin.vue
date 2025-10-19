<template>
    <div class="flex">
        <SideBar></SideBar>
        <div class="p-6 flex-1">
            <router-view></router-view>
        </div>
    </div>
</template>

<script setup>
import router from '../../router';
import SideBar from './side-bar.vue';

</script>