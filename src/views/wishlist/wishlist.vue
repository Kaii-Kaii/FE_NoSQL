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
          <img :src="getImage(it.anhsach)" :alt="it.tensach" class="thumb" @click.prevent="viewDetail(it)" />
          <div class="meta">
            <h3 class="title" :title="it.tensach"><a href="#" @click.prevent="viewDetail(it)" style="color:inherit;text-decoration:none">{{ it.tensach }}</a></h3>
            <div class="author">By: {{ it.tacgia || it.TACGIA || it.author || 'Unknown' }}</div>
            <p class="desc">{{ truncate(it.mota || it.MOTA || it.description) }}</p>
            <div class="price">{{ formatPrice(it.gia) }}</div>
          </div>
          <div class="actions">
            <button class="btn remove" @click="onRemove(it)">Bỏ yêu thích</button>
            <button class="btn add" @click="onAddToCart(it)">Thêm vào giỏ</button>
            <button class="btn" @click.prevent="viewDetail(it)" style="background:#6c757d; color:#fff">Xem chi tiết</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getWishlist, removeFromWishlist } from '@/api/wishlist'
import { addToCart } from '@/api/cart'
import { getBookByCode } from '@/api/book'
import { ElNotification } from 'element-plus'

const router = useRouter()
const items = ref([])

async function load() {
  const raw = getWishlist() || []
  // initially show stored items
  items.value = raw

  // fetch details for each item concurrently to enrich author/description/cover
  const codes = raw.map((i) => i.masach).filter(Boolean)
  if (codes.length === 0) return

  try {
    const detailPromises = codes.map((c) => getBookByCode(c).catch(() => null))
    const details = await Promise.all(detailPromises)

    items.value = raw.map((it, idx) => {
      const det = details[idx] || details.find((d) => d && (String(d.MASACH || d.code || d.id) === String(it.masach))) || null
      return {
        ...it,
        tacgia: it.tacgia || det?.TACGIA || det?.Author || det?.author || det?.AuthorName || it.tacgia,
        mota: it.mota || det?.MOTA || det?.Description || det?.description || it.mota,
        anhsach: it.anhsach || det?.URLSACH || det?.ANHSACH || det?.CoverUrl || it.anhsach,
      }
    })
  } catch (e) {
    console.warn('Failed to fetch wishlist details', e)
  }
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

function viewDetail(it) {
  const code = it.masach || it.MASACH || it.code || it.id
  if (!code) return
  router.push({ name: 'book-details', params: { code } })
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

function truncate(s, l = 140) {
  if (!s) return ''
  const str = String(s)
  return str.length > l ? str.slice(0, l).trim() + '…' : str
}

onMounted(load)
</script>

<style scoped>
/* Increase top spacing so content isn't hidden under the fixed header */
.wishlist-page { 
  padding: 140px 0 80px; 
  background: linear-gradient(135deg, #f5f7fa 0%, #f9fafb 100%);
  min-height: 100vh;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title { 
  font-size: 32px; 
  font-weight: 700;
  margin-bottom: 32px; 
  color: #1a202c;
  text-align: center;
  position: relative;
  padding-bottom: 16px;
}

.page-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: linear-gradient(90deg, #d17057 0%, #e89b87 100%);
  border-radius: 2px;
}

.empty { 
  text-align: center;
  padding: 60px 20px;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.06);
}

.empty p {
  color: #666;
  font-size: 18px;
  margin-bottom: 24px;
}

.btn { 
  display: inline-block; 
  padding: 12px 24px; 
  border-radius: 8px; 
  background: #d17057; 
  color: #fff; 
  text-decoration: none; 
  border: none; 
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(209, 112, 87, 0.3);
}

.btn:hover {
  background: #c15e46;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(209, 112, 87, 0.4);
}

.btn:active {
  transform: translateY(0);
}

.grid { 
  display: grid; 
  grid-template-columns: 1fr; 
  gap: 20px; 
}

.card { 
  background: #fff; 
  border-radius: 16px; 
  padding: 20px; 
  box-shadow: 0 2px 12px rgba(0,0,0,0.04); 
  display: flex; 
  flex-direction: row; 
  gap: 20px; 
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(0,0,0,0.04);
}

.card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  transform: translateY(-4px);
  border-color: rgba(209, 112, 87, 0.2);
}

.thumb { 
  width: 140px; 
  height: 200px; 
  object-fit: cover; 
  border-radius: 12px; 
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  cursor: pointer;
  transition: all 0.3s ease;
}

.thumb:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

.meta { 
  flex: 1; 
  display: flex; 
  flex-direction: column; 
  justify-content: center;
  min-width: 0;
  padding: 8px 0;
}

.title { 
  font-size: 18px; 
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1a202c;
  line-height: 1.4;
}

.title a {
  transition: color 0.2s ease;
}

.title a:hover {
  color: #d17057;
}

.author { 
  font-size: 14px; 
  color: #718096; 
  margin-bottom: 8px;
  font-weight: 500;
}

.desc { 
  font-size: 14px; 
  color: #4a5568; 
  margin: 8px 0 12px 0;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.price { 
  color: #d17057; 
  font-weight: 700; 
  font-size: 20px;
  margin-bottom: 0;
}

.actions { 
  display: flex; 
  flex-direction: column;
  gap: 10px; 
  align-items: stretch;
  min-width: 140px;
}

.actions .btn {
  width: 100%;
  text-align: center;
  padding: 10px 16px;
  font-size: 13px;
  white-space: nowrap;
}

.btn.remove { 
  background: #e53e3e;
  box-shadow: 0 2px 8px rgba(229, 62, 62, 0.3);
}

.btn.remove:hover {
  background: #c53030;
  box-shadow: 0 4px 12px rgba(229, 62, 62, 0.4);
}

.btn.add { 
  background: #d17057;
  box-shadow: 0 2px 8px rgba(209, 112, 87, 0.3);
}

.btn.add:hover {
  background: #c15e46;
  box-shadow: 0 4px 12px rgba(209, 112, 87, 0.4);
}

/* Responsive Design */
@media (max-width: 768px) {
  .wishlist-page {
    padding: 120px 0 60px;
  }
  
  .page-title {
    font-size: 24px;
    margin-bottom: 24px;
  }
  
  .card {
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  }
  
  .thumb {
    width: 100%;
    max-width: 200px;
    height: 280px;
    margin: 0 auto;
  }
  
  .meta {
    text-align: center;
  }
  
  .actions {
    flex-direction: row;
    width: 100%;
    min-width: auto;
  }
  
  .actions .btn {
    flex: 1;
    padding: 12px 8px;
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .actions {
    flex-direction: column;
  }
  
  .actions .btn {
    width: 100%;
  }
}
</style>
