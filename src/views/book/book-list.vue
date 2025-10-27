<template>
  <div class="book-list-section">
    <!-- Debug: Hiển thị số sách -->
    <div v-if="allBooks.length === 0" class="alert alert-info">
      <i class="fas fa-info-circle"></i>
      Không tìm thấy sách nào. (Total: {{ allBooks.length }})
    </div>
    
    <!-- Books Grid - 3 items per row -->
    <div class="books-grid-3col">
      <div 
        v-for="(book, index) in paginatedBooks" 
        :key="book.MASACH"
        class="book-card-item"
        :style="{ animationDelay: `${index * 0.1}s` }"
      >
        <div class="book-card-inner">
          <!-- Book Image -->
          <div class="book-image-wrapper" @click.prevent="viewDetail(book)">
            <img 
              :src="book.URLSACH || book.ANHSACH || '@/assets/img/product/product-img-2-1.jpg'" 
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
                <span>4.5</span>
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

    <!-- Pagination -->
    <div class="pagination-wrapper" v-if="totalPages > 1">
      <ul class="pagination-list">
        <li>
          <a href="#" @click.prevent="goToPage(currentPage - 1)" :class="{ 'disabled': currentPage === 1 }">
            <i class="far fa-angle-left"></i>
          </a>
        </li>
        <li v-for="page in displayPages" :key="page">
          <a 
            href="#" 
            @click.prevent="goToPage(page)" 
            :class="{ 'active': page === currentPage }"
          >
            {{ page }}
          </a>
        </li>
        <li>
          <a href="#" @click.prevent="goToPage(currentPage + 1)" :class="{ 'disabled': currentPage === totalPages }">
            <i class="far fa-angle-right"></i>
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useRouter } from 'vue-router'
import { listBook, getAllBooks, getBooksByCategory } from '@/api/book'
import { addToCart } from '@/api/cart'
import { toggleWishlist as toggleWishlistApi, getWishlistIds } from '@/api/wishlist'
import { on as onEvent } from '@/utils/eventBus'
import { ElNotification } from 'element-plus'

// Nhận props từ component cha
const props = defineProps({
  selectedCategory: {
    type: [String, Number],
    default: null
  }
})

const router = useRouter()

const allBooks = ref([]) // Lưu toàn bộ sách
const currentPage = ref(1) // Trang hiện tại cho phân trang frontend
const perPage = 12 // Số sách mỗi trang (6 sách x 2 hàng)

// Computed: Filter sách theo category (GIỐNG NHƯ CŨ)
const books = computed(() => {
  // Nếu không có category được chọn, hiển thị tất cả
  if (!props.selectedCategory) {
    return allBooks.value
  }
  
  // Filter sách theo MADANHMUC
  return allBooks.value.filter(book => book.MADANHMUC === props.selectedCategory)
})

// Computed: Tổng số trang dựa trên kết quả đã filter
const totalPages = computed(() => {
  return Math.ceil(books.value.length / perPage)
})

// Computed: Sách hiển thị ở trang hiện tại (sau khi filter)
const paginatedBooks = computed(() => {
  const start = (currentPage.value - 1) * perPage
  const end = start + perPage
  return books.value.slice(start, end)
})

// Computed: Các số trang hiển thị trong pagination
const displayPages = computed(() => {
  const pages = []
  const maxDisplay = 5 // Số trang tối đa hiển thị
  
  let start = Math.max(1, currentPage.value - Math.floor(maxDisplay / 2))
  let end = Math.min(totalPages.value, start + maxDisplay - 1)
  
  // Điều chỉnh lại start nếu end đã chạm giới hạn
  if (end - start < maxDisplay - 1) {
    start = Math.max(1, end - maxDisplay + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  
  return pages
})

// Lấy toàn bộ danh sách sách từ API
const fetchBooks = async () => {
  try {
    let response
    
    // Nếu không có category được chọn, gọi getAllBooks để lấy tất cả
    if (!props.selectedCategory) {
      response = await getAllBooks()
      console.log('getAllBooks response:', response)
    } else {
      // Nếu có category được truyền là mã (string), gọi API theo mã danh mục
      if (typeof props.selectedCategory === 'string' || typeof props.selectedCategory === 'number') {
        // Prefer calling category-specific endpoint when a code is provided
        try {
          const code = String(props.selectedCategory)
          response = await getBooksByCategory(code, 1, 100)
          console.log('getBooksByCategory response:', response)
        } catch (err) {
          console.warn('getBooksByCategory failed, falling back to listBook', err)
          const params = { page: 1, per_page: 100, MADANHMUC: props.selectedCategory }
          response = await listBook(params)
          console.log('listBook response (fallback):', response)
        }
      } else {
        // Fallback behaviour
        const params = {
          page: 1,
          per_page: 100,
        }
        response = await listBook(params)
        console.log('listBook response:', response)
      }
    }

    // Xử lý response - normalize dữ liệu
    let booksData = []
    // Normalize different response shapes:
    // - { items: [...] , total, page, pageSize }
    // - { data: [...] }
    // - array
    if (response?.items && Array.isArray(response.items)) {
      booksData = response.items
    } else if (response?.data && Array.isArray(response.data)) {
      booksData = response.data
    } else if (Array.isArray(response)) {
      booksData = response
    } else {
      booksData = []
    }
    
    // Normalize field names: từ API response structure
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
        MOTA: book.description || book.MOTA,
        ISHOT: book.isHot || book.ISHOT || false,
        DISCOUNT: book.discount || book.DISCOUNT || 0,
        SOLUONG: fallbackStock ?? 0,
        TRANGTHAI: book.status || book.TRANGTHAI || ((fallbackStock ?? 0) > 0 ? 'Còn hàng' : 'Hết hàng')
      }
    })
    
    console.log('All books loaded:', allBooks.value.length)
    console.log('First book:', allBooks.value[0])
  } catch (error) {
    console.error('Error fetching books:', error)
    allBooks.value = []
  }
}

// Hàm chuyển trang
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value || page === currentPage.value) {
    return
  }
  currentPage.value = page
}

// Watch selectedCategory để log và RESET về trang 1, sau đó fetch lại data
watch(() => props.selectedCategory, (newCategoryId) => {
  console.log('Category changed to:', newCategoryId)
  console.log('Filtered books count:', books.value.length)
  // Reset về trang 1 khi đổi category
  currentPage.value = 1
  // Fetch lại data khi category thay đổi
  fetchBooks()
}, { immediate: false })

// Format giá tiền
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

// Xử lý lỗi hình ảnh
const handleImageError = (e) => {
  e.target.src = '/img/product/default.jpg'
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
    // Sử dụng đúng cấu trúc API với uppercase keys như trong home.vue
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

// Wishlist state
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
    ElNotification({ title: 'Success', message: wished ? `Đã thêm vào yêu thích: ${book.TENSACH}` : `Đã bỏ khỏi yêu thích: ${book.TENSACH}`, type: 'success' })
  } catch (e) {}
}

onMounted(() => {
  // Load toàn bộ sách một lần
  console.log('BookList mounted, selectedCategory:', props.selectedCategory)
  fetchBooks()
  try { onEvent('wishlist-changed', () => { wishlistIds.value = getWishlistIds() }) } catch (e) {}
})
</script>

<style scoped>
/* Book List Section */
.book-list-section {
  padding: 30px 0;
  min-height: 600px;
}

/* Alert info styling */
.alert-info {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
  font-size: 16px;
  margin-bottom: 30px;
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.alert-info i {
  margin-right: 10px;
  font-size: 18px;
}

/* Books Grid - 6 columns */
.books-grid-3col {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 20px;
  margin-bottom: 50px;
}

/* Book Card Animation */
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

.book-card-item {
  animation: fadeInUp 0.6s ease-out forwards;
  opacity: 0;
}

/* Book Card Inner */
.book-card-inner {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.book-card-inner:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.16);
}

/* Book Image Wrapper */
.book-image-wrapper {
  position: relative;
  width: 100%;
  padding-top: 140%; /* 7:10 aspect ratio for book covers */
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
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
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  animation: fadeInLeft 0.5s ease-out;
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.badge-hot {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.badge-discount {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.badge i {
  font-size: 11px;
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
  z-index: 20;
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
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: scale(1.15);
}

.wishlist-btn:hover {
  background: #d17057;
  color: white;
}

.wishlist-btn.active {
  background: #d17057;
  color: white;
  animation: heartBeat 0.6s ease-in-out;
}

@keyframes heartBeat {
  0%, 100% {
    transform: scale(1);
  }
  25% {
    transform: scale(1.25);
  }
  50% {
    transform: scale(1.1);
  }
  75% {
    transform: scale(1.2);
  }
}

.cart-btn:hover {
  background: #27ae60;
  color: white;
}

/* Book Info */
.book-info {
  padding: 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* Info Row - Rating & Price */
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.book-rating {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #ffc107;
  font-weight: 600;
  font-size: 14px;
}

.book-rating i {
  font-size: 16px;
}

.book-rating span {
  color: #2c3e50;
}

.book-prices {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-current {
  font-size: 20px;
  font-weight: 700;
  color: #d17057;
}

.price-original {
  font-size: 14px;
  color: #95a5a6;
  text-decoration: line-through;
}

/* Book Author */
.book-author {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #7f8c8d;
}

.book-author i {
  font-size: 14px;
  color: #95a5a6;
}

/* Book Title */
.book-title {
  margin: 0;
  font-size: 16px;
  line-height: 1.4;
  min-height: 44px;
}

.book-title a {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 600;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s ease;
}

.book-title a:hover {
  color: #d17057;
}

/* Pagination Wrapper */
.pagination-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 0;
  margin-top: 20px;
}

.pagination-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 8px;
}

.pagination-list li {
  display: inline-block;
}

.pagination-list a {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 45px;
  height: 45px;
  padding: 0 15px;
  background-color: #f8f9fa;
  color: #2c3e50;
  text-decoration: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.pagination-list a:hover:not(.disabled):not(.active) {
  background-color: #d17057;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(209, 112, 87, 0.3);
}

.pagination-list a.active {
  background-color: #d17057;
  color: white;
  border-color: #d17057;
  cursor: default;
  box-shadow: 0 4px 12px rgba(209, 112, 87, 0.4);
}

.pagination-list a.disabled {
  background-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
}

.pagination-list a i {
  font-size: 16px;
}

/* Responsive Design */
@media (max-width: 1400px) {
  .books-grid-3col {
    grid-template-columns: repeat(5, 1fr);
    gap: 18px;
  }
}

@media (max-width: 1200px) {
  .books-grid-3col {
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
  }
}

@media (max-width: 992px) {
  .books-grid-3col {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
  
  .book-title {
    font-size: 15px;
  }
  
  .price-current {
    font-size: 18px;
  }
}

@media (max-width: 768px) {
  .book-list-section {
    padding: 20px 0;
  }
  
  .books-grid-3col {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  
  .book-info {
    padding: 15px;
  }
  
  .action-btn {
    width: 42px;
    height: 42px;
    font-size: 16px;
  }
  
  .quick-actions {
    gap: 10px;
  }
}

@media (max-width: 576px) {
  .books-grid-3col {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .pagination-list a {
    min-width: 40px;
    height: 40px;
    font-size: 14px;
  }
}
</style>
