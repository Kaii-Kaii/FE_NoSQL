<template>
    <HomeHeader></HomeHeader>
    <router-view> </router-view>
    <HomeFooter ></HomeFooter>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue';
import HomeHeader from './home-header.vue';
import HomeFooter from './home-footer.vue';
let styleElements = []
onMounted(async () => {
    const styles = [
        '/src/assets/css/bootstrap.min.css',
        '/src/assets/css/fontawesome.min.css',
        '/src/assets/css/magnific-popup.min.css',
        '/src/assets/css/slick.min.css',
        '/src/assets/css/nice-select.min.css',
        '/src/assets/css/animate.min.css',
        '/src/assets/css/nouislider.css',
        '/src/assets/css/style.css',
        '/src/assets/css/theme-orange.css', // Orange/Pink gradient theme override
    ]

    // thêm <link> vào head
    styles.forEach(href => {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = href
        document.head.appendChild(link)
        styleElements.push(link)
    })
})

onUnmounted(() => {
    // gỡ bỏ toàn bộ link CSS khi rời layout này
    styleElements.forEach(link => link.remove())
    styleElements = []
})
</script>