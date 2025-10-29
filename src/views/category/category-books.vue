<template>
  <section class="suggestions-section">
    <div class="container">
      <div class="section-header">
        <h2 class="section-title">{{ title }}</h2>
        <a :href="viewMoreLink" class="view-more-link">
          Xem thêm <i class="fas fa-arrow-right"></i>
        </a>
      </div>
      
      <div class="books-grid">
        <div 
          v-for="(book, index) in displayBooks" 
          :key="book.MASACH"
          class="book-card"
          :style="{ animationDelay: `${index * 0.1}s` }"
        >
          <div class="book-card-inner">
            <!-- Book Image -->
            <div class="book-image-wrapper" @click.prevent="viewDetail(book)">
              <img 
                :src="book.URLSACH || book.ANHSACH" 
                :alt="book.TENSACH"
                @error="handleImageError"
                class="book-image"
              >
              <!-- Badges -->
              <div class="book-badges" v-if="book.ISHOT || book.DISCOUNT">
                <span v-if="book.ISHOT" class="badge badge-hot">
                  <i class="fas fa-fire"></i> Hot
                </span>
                <span v-if="book.DISCOUNT" class="badge badge-discount">
                  -{{ book.DISCOUNT }}%
                </span>
              </div>
              <!-- Quick Actions Overlay -->
              <div class="quick-actions">
                <button 
                  class="action-btn wishlist-btn" 
                  @click.stop="toggleWishlist(book)" 
                  :class="{ active: isWished(book.MASACH) }" 
                  :title="isWished(book.MASACH) ? 'Bỏ yêu thích' : 'Thêm yêu thích'"
                >
                  <i :class="isWished(book.MASACH) ? 'fas fa-heart' : 'far fa-heart'"></i>
                </button>
                <button 
                  class="action-btn cart-btn" 
                  @click.stop="handleAddToCart(book)"
                  title="Thêm vào giỏ"
                >
                  <i class="fa-solid fa-basket-shopping"></i>
                </button>
              </div>
            </div>
            
            <!-- Book Info -->
            <div class="book-info">
              <!-- Rating & Price Row -->
              <div class="info-row">
                <div class="book-rating">
                  <i class="fas fa-star"></i>
                  <span>{{ formatRating(book.AVERAGE_RATING) }}</span>
                </div>
                <div class="book-prices">
                  <span class="price-current">{{ formatPrice(book.GIATIEN) }}</span>
                  <span class="price-original" v-if="book.GIAGOC && book.GIAGOC > book.GIATIEN">
                    {{ formatPrice(book.GIAGOC) }}
                  </span>
                </div>
              </div>
              
              <!-- Author -->
              <div class="book-author">
                <i class="fas fa-user-edit"></i>
                {{ book.TACGIA || 'Unknown' }}
              </div>
              
              <!-- Title -->
              <h3 class="book-title">
                <a href="#" @click.prevent="viewDetail(book)" :title="book.TENSACH">
                  {{ book.TENSACH }}
                </a>
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { listBook, getBooksByCategory } from '@/api/book'
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

const resolveAverageRating = (book) => {
  if (!book || typeof book !== 'object') return 0
  const candidates = [
    book.AVERAGE_RATING,
    book.averageRating,
    book.average_rating,
    book.avgRating,
    book.avg_rating,
    book.rating,
    book.RATING,
    book.star,
    book.SAO,
    book.reviewStats?.averageRating,
    book.reviewStats?.average_rating,
    book.reviewSummary?.averageRating,
    book.reviewSummary?.average_rating,
    book.reviewSummary?.average,
    book.review_summary?.average,
    book.statistics?.averageRating,
    book.stats?.averageRating,
    book.reviews?.averageRating
  ]

  for (const candidate of candidates) {
    const num = Number(candidate)
    if (!Number.isNaN(num) && Number.isFinite(num)) {
      if (num < 0) return 0
      return Math.min(5, num)
    }
  }

  return 0
}

// Computed: Filter và giới hạn số lượng sách hiển thị
const displayBooks = computed(() => {
  const filtered = allBooks.value.filter(book => {
    const bookCategory = book.MADANHMUC ?? book.category?.code
    return bookCategory == props.categoryId
  })
  return filtered.slice(0, props.limit)
})

// Fetch sách (ưu tiên gọi server khi có categoryCode)
const fetchBooks = async () => {
  try {
    let booksData = []

    // If a categoryId is provided, try to fetch from server by categoryCode
    if (props.categoryId) {
      try {
        const res = await getBooksByCategory(props.categoryId, 1, Math.max(props.limit || 5, 5))
        // server may return { items: [...] } or { data: [...] } or an array
        if (Array.isArray(res)) {
          booksData = res
        } else if (res?.items && Array.isArray(res.items)) {
          booksData = res.items
        } else if (res?.data && Array.isArray(res.data)) {
          booksData = res.data
        } else if (res?.data?.items && Array.isArray(res.data.items)) {
          booksData = res.data.items
        } else {
          booksData = []
        }
      } catch (err) {
        console.warn('getBooksByCategory failed, falling back to listBook:', err)
        // fallback to listBook below
      }
    }

    // If we don't have data yet, fetch the large list and filter client-side (fallback)
    if (!booksData || booksData.length === 0) {
      const response = await listBook({ page: 1, per_page: 100 })
      if (response?.data && Array.isArray(response.data)) {
        booksData = response.data
      } else if (Array.isArray(response)) {
        booksData = response
      } else {
        booksData = []
      }
    }

    allBooks.value = booksData.map(book => {
      const fallbackStock = book.inStock ?? book.SOLUONG
      const rawId = book.code || book.MASACH || book._id || book.id
      const rating = resolveAverageRating(book)
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
        TRANGTHAI: book.status || book.TRANGTHAI || ((fallbackStock ?? 0) > 0 ? 'Còn hàng' : 'Hết hàng'),
        AVERAGE_RATING: rating,
        averageRating: rating
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

const formatRating = (rating) => {
  const num = Number(rating)
  if (!Number.isNaN(num) && Number.isFinite(num) && num > 0) {
    return num.toFixed(1)
  }
  return '0'
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
/* Suggestions Section */
.suggestions-section {
  padding: 60px 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Section Header */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 3px solid #e9ecef;
}

.section-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  position: relative;
  padding-left: 20px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 40px;
  background: linear-gradient(180deg, #f093fb 0%, #f5576c 100%);
  border-radius: 3px;
}

.view-more-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  text-decoration: none;
  border-radius: 50px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(209, 112, 87, 0.3);
}

.view-more-link:hover {
  background-color: #b85d47;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(209, 112, 87, 0.4);
  color: white;
}

.view-more-link i {
  font-size: 12px;
  transition: transform 0.3s ease;
}

.view-more-link:hover i {
  transform: translateX(4px);
}

/* Books Grid */
.books-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 24px;
}

@media (max-width: 1200px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  }
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .books-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Book Card */
.book-card {
  animation: fadeInUp 0.6s ease forwards;
  opacity: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.book-card-inner {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.book-card-inner:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

/* Book Image */
.book-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 140%;
  overflow: hidden;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  cursor: pointer;
}

.book-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.book-card-inner:hover .book-image {
  transform: scale(1.08);
}

/* Book Badges */
.book-badges {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 2;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
}

.badge-hot {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.badge-discount {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

/* Quick Actions Overlay */
.quick-actions {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  gap: 12px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 3;
}

.book-card-inner:hover .quick-actions {
  opacity: 1;
}

.action-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: white;
  color: #2c3e50;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.action-btn:hover {
  transform: scale(1.15);
}

.wishlist-btn:hover {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.wishlist-btn.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  animation: heartBeat 0.5s;
}

@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.25); }
  50% { transform: scale(1.1); }
  75% { transform: scale(1.2); }
}

.cart-btn:hover {
  background-color: #27ae60;
  color: white;
}

/* Book Info */
.book-info {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

/* Rating */
.book-rating {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ffc107;
  font-size: 13px;
  font-weight: 600;
}

.book-rating i {
  font-size: 14px;
}

.book-rating span {
  color: #2c3e50;
}

/* Prices */
.book-prices {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.price-current {
  font-size: 16px;
  font-weight: 700;
  color: #f5576c;
  line-height: 1;
}

.price-original {
  font-size: 12px;
  color: #95a5a6;
  text-decoration: line-through;
  line-height: 1;
}

/* Author */
.book-author {
  font-size: 12px;
  color: #7f8c8d;
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.book-author i {
  font-size: 11px;
  color: #f5576c;
}

/* Title */
.book-title {
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  flex: 1;
}

.book-title a {
  color: #2c3e50;
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  transition: color 0.3s ease;
}

.book-title a:hover {
  color: #f5576c;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .suggestions-section {
    padding: 40px 0;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 30px;
  }
  
  .section-title {
    font-size: 24px;
  }
  
  .section-title::before {
    height: 30px;
  }
  
  .view-more-link {
    width: 100%;
    justify-content: center;
  }
  
  .book-info {
    padding: 12px;
    gap: 8px;
  }
  
  .price-current {
    font-size: 14px;
  }
  
  .book-title {
    font-size: 13px;
  }
  
  .book-author {
    font-size: 11px;
  }
}

@media (max-width: 480px) {
  .section-title {
    font-size: 20px;
  }
  
  .book-badges {
    top: 8px;
    left: 8px;
  }
  
  .badge {
    padding: 4px 8px;
    font-size: 10px;
  }
  
  .action-btn {
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
}
</style>
