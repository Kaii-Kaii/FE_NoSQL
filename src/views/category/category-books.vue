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
import { useRouter } from 'vue-router'
import { listBook } from '@/api/book'
import { addToCart } from '@/api/cart'
import { toggleWishlist as toggleWishlistApi, getWishlistIds } from '@/api/wishlist'
import { on as onEvent } from '@/utils/eventBus'
import { ElNotification } from 'element-plus'

// Props
const props = defineProps({
  categoryId: {
    type: [Number, String],
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
const router = useRouter()

// Computed: Filter và giới hạn số lượng sách hiển thị
const displayBooks = computed(() => {
  const filtered = allBooks.value.filter(book => {
    const bookCategory = book.MADANHMUC ?? book.category?.code
    return bookCategory == props.categoryId
  })
  return filtered.slice(0, props.limit)
})

// Fetch toàn bộ sách
const fetchBooks = async () => {
  try {
    const response = await listBook({
      page: 1,
      per_page: 100, // Lấy nhiều để đủ data filter
    })
    
    let booksData = []
    if (response?.data) {
      booksData = Array.isArray(response.data) ? response.data : []
    } else if (Array.isArray(response)) {
      booksData = response
    }

    allBooks.value = booksData.map(book => {
      const fallbackStock = book.inStock ?? book.SOLUONG
      const rawId = book.code || book.MASACH || book._id || book.id
      return {
        ...book,
        MASACH: rawId != null ? String(rawId) : null,
        TENSACH: book.name || book.TENSACH,
        TACGIA: book.author || book.TACGIA || 'Unknown',
        GIATIEN: book.price ?? book.GIATIEN,
        GIAGOC: book.originalPrice ?? book.GIAGOC,
        URLSACH: book.coverUrl || book.image || book.URLSACH || book.ANHSACH,
        ANHSACH: book.coverUrl || book.image || book.ANHSACH || book.URLSACH,
        MADANHMUC: book.category?.code || book.categoryCode || book.MADANHMUC,
        category: book.category || book.categoryData || null,
        ISHOT: book.isHot || book.ISHOT || false,
        DISCOUNT: book.discount || book.DISCOUNT || 0,
        SOLUONG: fallbackStock ?? 0,
        TRANGTHAI: book.status || book.TRANGTHAI || ((fallbackStock ?? 0) > 0 ? 'Còn hàng' : 'Hết hàng')
      }
    })
    
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
  const bookCode = book.MASACH || book.code || book.id || book._id
  if (!bookCode) {
    console.warn('Không tìm thấy mã sách để điều hướng chi tiết:', book)
    try { ElNotification({ title: 'Thông báo', message: 'Không tìm thấy thông tin chi tiết cho sách này.', type: 'warning' }) } catch (e) {}
    return
  }
  router.push(`/home/books/${bookCode}`)
}

// Thêm vào giỏ hàng
const handleAddToCart = (book) => {
  const bookCode = book.MASACH || book.code || book.id || book._id
  if (!bookCode) {
    console.warn('Không tìm thấy mã sách để thêm vào giỏ:', book)
    try { ElNotification({ title: 'Thông báo', message: 'Không tìm thấy thông tin sách để thêm vào giỏ hàng.', type: 'warning' }) } catch (e) {}
    return
  }

  try {
    addToCart({
      MASACH: bookCode,
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
function isWished(id) {
  if (id == null) return false
  return wishlistIds.value.has(String(id))
}
function toggleWishlist(book) {
  const rawId = book.MASACH || book.code || book.id || book._id
  const bookId = rawId != null ? String(rawId) : null
  if (!bookId) {
    console.warn('Không tìm thấy mã sách để cập nhật yêu thích:', book)
    try { ElNotification({ title: 'Thông báo', message: 'Không tìm thấy thông tin sách để cập nhật yêu thích.', type: 'warning' }) } catch (e) {}
    return
  }
  toggleWishlistApi({
    MASACH: bookId,
    TENSACH: book.TENSACH,
    GIATIEN: book.GIATIEN,
    URLSACH: book.URLSACH ?? book.ANHSACH,
  })
  wishlistIds.value = getWishlistIds()
  try {
    const wished = wishlistIds.value.has(bookId)
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
