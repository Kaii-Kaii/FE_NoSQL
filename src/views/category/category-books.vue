<template>
  <section class="romance-layout1 space-top">
    <div class="container space-bottom position-relative">
      <div class="title-area2 animation-style1 title-anime">
        <h2 class="sec-title title-anime__title">{{ title }}</h2>
        <a class="vs-btn wow animate__flipInX" data-wow-delay="0.70s" :href="viewMoreLink">View More</a>
      </div>
      <div class="row g-4">
        <div 
          v-for="(book, index) in displayBooks" 
          :key="book.MASACH"
          class="col-xl-2 col-md-4 col-sm-6"
        >
          <div 
            class="product-style1 wow animate__fadeInUp" 
            :data-wow-delay="`0.${30 + index * 10}s`"
          >
            <div class="product-img">
              <img 
                :src="book.URLSACH || book.ANHSACH" 
                :alt="book.TENSACH"
                @error="handleImageError"
              >
              <div class="product-btns">
                <a href="#" class="icon-btn wishlist" @click.prevent="toggleWishlist(book)" :class="{ active: isWished(book.MASACH) }" :title="isWished(book.MASACH) ? 'Bỏ yêu thích' : 'Thêm yêu thích'">
                  <i :class="isWished(book.MASACH) ? 'fas fa-heart' : 'far fa-heart'"></i>
                </a>
                <a href="#" class="icon-btn cart" @click.prevent="handleAddToCart(book)">
                  <i class="fa-solid fa-basket-shopping"></i>
                </a>
              </div>
              <ul class="post-box" v-if="book.ISHOT || book.DISCOUNT">
                <li v-if="book.ISHOT">Hot</li>
                <li v-if="book.DISCOUNT">-{{ book.DISCOUNT }}%</li>
              </ul>
            </div>
            <div class="product-content">
              <div class="product-rating">
                <span class="star"><i class="fas fa-star"></i> (4.5)</span>
                <ul class="price-list">
                  <li v-if="book.GIAGOC && book.GIAGOC > book.GIATIEN">
                    <del>{{ formatPrice(book.GIAGOC) }}</del>
                  </li>
                  <li>{{ formatPrice(book.GIATIEN) }}</li>
                </ul>
              </div>
              <span class="product-author">
                <strong>By:</strong> {{ book.TACGIA || 'Unknown' }}
              </span>
              <h2 class="product-title">
                <a href="#" @click.prevent="viewDetail(book)">{{ book.TENSACH }}</a>
              </h2>
            </div>
          </div>
        </div>
      </div>
      <span class="border-line"></span>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { listBook } from '@/api/book'
import { addToCart } from '@/api/cart'
import { toggleWishlist as toggleWishlistApi, getWishlistIds } from '@/api/wishlist'
import { on as onEvent } from '@/utils/eventBus'
import { ElNotification } from 'element-plus'

// Props
const props = defineProps({
  categoryId: {
    type: Number,
    required: true
  },
  title: {
    type: String,
    default: 'Best Selling Books'
  },
  limit: {
    type: Number,
    default: 6
  },
  viewMoreLink: {
    type: String,
    default: '/home/books'
  }
})

const allBooks = ref([])

// Computed: Filter và giới hạn số lượng sách hiển thị
const displayBooks = computed(() => {
  const filtered = allBooks.value.filter(
    book => book.MADANHMUC === props.categoryId
  )
  return filtered.slice(0, props.limit)
})

// Fetch toàn bộ sách
const fetchBooks = async () => {
  try {
    const response = await listBook({
      page: 1,
      per_page: 100, // Lấy nhiều để đủ data filter
    })
    
    if (response?.data) {
      allBooks.value = Array.isArray(response.data) ? response.data : []
    } else if (Array.isArray(response)) {
      allBooks.value = response
    } else {
      allBooks.value = []
    }
    
    console.log(`Books for category ${props.categoryId}:`, displayBooks.value.length)
  } catch (error) {
    console.error('Error fetching books:', error)
    allBooks.value = []
  }
}

// Format giá tiền
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

// Xử lý lỗi hình ảnh
const handleImageError = (e) => {
  e.target.src = '/src/assets/img/product/default.jpg'
}

// Xem chi tiết sách
const viewDetail = (book) => {
  console.log('View detail:', book)
  alert('Chức năng xem chi tiết đang được phát triển')
}

// Thêm vào giỏ hàng
const handleAddToCart = (book) => {
  try {
    addToCart({
      MASACH: book.MASACH,
      TENSACH: book.TENSACH,
      GIATIEN: book.GIATIEN,
      URLSACH: book.URLSACH ?? book.ANHSACH,
      SOLUONG: 1,
    })
    try { ElNotification({ title: 'Success', message: `Đã thêm vào giỏ: ${book.TENSACH}`, type: 'success' }) } catch (e) {}
  } catch (error) {
    console.error('Error adding to cart:', error)
    try { ElNotification({ title: 'Error', message: 'Có lỗi khi thêm vào giỏ hàng', type: 'error' }) } catch (e) {}
  }
}

// Wishlist reactive ids for current view
const wishlistIds = ref(getWishlistIds())
function isWished(id) { return wishlistIds.value.has(id) }
function toggleWishlist(book) {
  toggleWishlistApi({
    MASACH: book.MASACH,
    TENSACH: book.TENSACH,
    GIATIEN: book.GIATIEN,
    URLSACH: book.URLSACH ?? book.ANHSACH,
  })
  wishlistIds.value = getWishlistIds()
  try {
    const wished = wishlistIds.value.has(book.MASACH)
    ElNotification({
      title: 'Success',
      message: wished ? `Đã thêm vào yêu thích: ${book.TENSACH}` : `Đã bỏ khỏi yêu thích: ${book.TENSACH}`,
      type: 'success'
    })
  } catch (e) {}
}

onMounted(() => {
  fetchBooks()
  try { onEvent('wishlist-changed', () => { wishlistIds.value = getWishlistIds() }) } catch (e) {}
})
</script>

<style scoped>
/* Wishlist active (đã yêu thích) */
.icon-btn.wishlist.active {
  background-color: #ff6b35;
  border-color: transparent;
  color: #fff;
}
.icon-btn.wishlist.active i { color: #fff; }
</style>
