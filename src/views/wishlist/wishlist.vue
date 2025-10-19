<template>
  <div class="wishlist-page">
    <div class="container">
      <h1 class="page-title">Sách yêu thích</h1>

      <div v-if="items.length === 0" class="empty">
        <p>Danh sách yêu thích đang trống.</p>
        <router-link class="btn" to="/">Về trang chủ</router-link>
      </div>

      <div v-else class="grid">
        <div v-for="it in items" :key="it.masach" class="card">
          <img :src="getImage(it.anhsach)" :alt="it.tensach" class="thumb" />
          <div class="meta">
            <h3 class="title" :title="it.tensach">{{ it.tensach }}</h3>
            <div class="price">{{ formatPrice(it.gia) }}</div>
          </div>
          <div class="actions">
            <button class="btn remove" @click="onRemove(it)">Bỏ yêu thích</button>
            <button class="btn add" @click="onAddToCart(it)">Thêm vào giỏ</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getWishlist, removeFromWishlist } from '@/api/wishlist'
import { addToCart } from '@/api/cart'
import { ElNotification } from 'element-plus'

const items = ref([])

function load() {
  items.value = getWishlist()
}

function onRemove(it) {
  removeFromWishlist(it.masach)
  load()
  try { ElNotification({ title: 'Success', message: `Đã bỏ yêu thích: ${it.tensach}`, type: 'success' }) } catch (e) {}
}

function onAddToCart(it) {
  addToCart({
    MASACH: it.masach,
    TENSACH: it.tensach,
    GIATIEN: it.gia,
    ANHSACH: it.anhsach,
    SOLUONG: 1,
  })
  try { ElNotification({ title: 'Success', message: `Đã thêm vào giỏ: ${it.tensach}`, type: 'success' }) } catch (e) {}
}

function getImage(filename) {
  if (!filename) return '/src/assets/img/product/default.jpg'
  try {
    const s = String(filename || '')
    if (/^https?:\/\//i.test(s)) return s
    return `/uploads/book/${s.replace(/^\/+/, '')}`
  } catch (e) {
    return '/src/assets/img/product/default.jpg'
  }
}

function formatPrice(v) {
  const n = Number(v || 0)
  return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

onMounted(load)
</script>

<style scoped>
/* Increase top spacing so content isn't hidden under the fixed header */
.wishlist-page { padding: 200px 0 190px; }
.page-title { font-size: 24px; margin-bottom: 16px; }
.empty { color:#666; }
.btn { display:inline-block; padding:8px 12px; border-radius:6px; background:#d17057; color:#fff; text-decoration:none; border:none; cursor:pointer }
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap:16px; }
.card { background:#fff; border-radius:10px; padding:12px; box-shadow:0 6px 18px rgba(11,22,40,0.05); display:flex; flex-direction:column; gap:10px }
.thumb { width:100%; height:200px; object-fit:cover; border-radius:6px }
.meta { flex:1 }
.title { font-size:16px; margin:0 0 6px 0; }
.price { color:#d17057; font-weight:700 }
.actions { display:flex; gap:8px }
.btn.remove { background:#888 }
.btn.add { background:#d17057 }
</style>
