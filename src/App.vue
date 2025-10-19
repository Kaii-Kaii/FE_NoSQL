<template>
  <router-view></router-view>
</template>

<script setup>
import { onMounted } from 'vue';
import store from '@/store'

onMounted(async () => {
  await store.dispatch('user/refreshToken')
});
</script>
