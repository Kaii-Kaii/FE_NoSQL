<template>
  <div class="mt-50">
    <!-- Debug: Hiển thị số sách -->
    <div v-if="allBooks.length === 0" class="alert alert-warning">
      Không tìm thấy sách nào. (Total: {{ allBooks.length }})
    </div>
    
    <div class="row gy-30 mb-40">
      <div 
        v-for="book in paginatedBooks" 
        :key="book.MASACH" 
        class="col-xl-6 col-lg-6 col-md-12"
      >
        <div class="product-card-horizontal">
          <!-- Phần ảnh bên trái -->
          <div class="product-img-wrapper">
            <div class="product-img">
              <img 
                :src="book.URLSACH || book.ANHSACH || '@/assets/img/product/product-img-2-1.jpg'" 
                alt="product image"
              >
              <div class="product-btns">
                <a href="#" class="icon-btn wishlist" @click.prevent="toggleWishlist(book)" :class="{ active: isWished(book.MASACH) }" :title="isWished(book.MASACH) ? 'Bỏ yêu thích' : 'Thêm yêu thích'">
                  <i :class="isWished(book.MASACH) ? 'fas fa-heart' : 'far fa-heart'"></i>
                </a>
              </div>
              <ul class="post-box" v-if="book.ISHOT || book.DISCOUNT">
                <li v-if="book.ISHOT">Hot</li>
                <li v-if="book.DISCOUNT">-{{ book.DISCOUNT }}%</li>
              </ul>
            </div>
          </div>

          <!-- Phần thông tin bên phải -->
          <div class="product-content">
            <div class="star-rating">
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
              <i class="fa-solid fa-star"></i>
            </div>
            <span class="product-author"><strong>By:</strong> {{ book.TACGIA || 'Unknown' }}</span>
            <h2 class="product-title">
              <a href="#" @click.prevent="viewDetail(book)">{{ book.TENSACH }}</a>
            </h2>
            <ul class="price-list">
              <li v-if="book.GIAGOC && book.GIAGOC > book.GIATIEN"><del>{{ formatPrice(book.GIAGOC) }}</del></li>
              <li>{{ formatPrice(book.GIATIEN) }}</li>
            </ul>
            <div class="product-btn">
              <a class="vs-btn" href="#" @click.prevent="handleAddToCart(book)">Add To Cart</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div class="vs-pagination pt-30" v-if="totalPages > 1">
      <ul>
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
import { listBook, getAllBooks } from '@/api/book'
import { addToCart } from '@/api/cart'
import { toggleWishlist as toggleWishlistApi, getWishlistIds } from '@/api/wishlist'
import { on as onEvent } from '@/utils/eventBus'
import { ElNotification } from 'element-plus'

// Nhận props từ component cha
const props = defineProps({
  selectedCategory: {
    type: Number,
    default: null
  }
})

const allBooks = ref([]) // Lưu toàn bộ sách
const currentPage = ref(1) // Trang hiện tại cho phân trang frontend
const perPage = 4 // Số sách mỗi trang

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
      // Nếu có category, gọi listBook API thông thường
      const params = {
        page: 1,
        per_page: 100,
      }
      response = await listBook(params)
      console.log('listBook response:', response)
    }

    // Xử lý response - normalize dữ liệu
    let booksData = []
    if (response?.data) {
      booksData = Array.isArray(response.data) ? response.data : []
    } else if (Array.isArray(response)) {
      booksData = response
    } else {
      booksData = []
    }
    
    // Normalize field names: từ API response structure
    allBooks.value = booksData.map(book => ({
      // Từ getAllBooks API hoặc listBook
      MASACH: book._id || book.id || book.MASACH,
      TENSACH: book.name || book.TENSACH,
      TACGIA: book.author || book.TACGIA || 'Unknown',
      GIATIEN: book.price || book.GIATIEN,
      GIAGOC: book.originalPrice || book.GIAGOC,
      URLSACH: book.coverUrl || book.image || book.URLSACH,
      ANHSACH: book.coverUrl || book.image || book.ANHSACH,
      MADANHMUC: book.categoryCode || book.category?.code || book.MADANHMUC,
      MOTA: book.description || book.MOTA,
      ISHOT: book.isHot || book.ISHOT || false,
      DISCOUNT: book.discount || book.DISCOUNT || 0,
      // Keep all original fields
      ...book
    }))
    
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
  console.log('View detail:', book)
  alert('Chức năng xem chi tiết đang được phát triển')
}

// Thêm vào giỏ hàng
const handleAddToCart = (book) => {
  try {
    // Sử dụng đúng cấu trúc API với uppercase keys như trong home.vue
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

// Wishlist state
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
/* Layout ngang - ảnh trái, thông tin phải */
.product-card-horizontal {
  display: flex;
  flex-direction: row;
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  transition: all 0.3s;
  height: 100%;
}

.product-card-horizontal:hover {
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.12);
  transform: translateY(-3px);
}

/* Wrapper cho phần ảnh */
.product-img-wrapper {
  flex-shrink: 0;
  width: 195px;
}

/* Container ảnh với kích thước cố định 195x310 */
.product-img {
  position: relative;
  width: 195px;
  height: 310px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff; /* Nền màu trắng */
}

.product-img img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
}

/* Wishlist button */
.product-btns {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.icon-btn.wishlist {
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.3s;
  border: none;
  text-decoration: none;
  color: #666;
}

.icon-btn.wishlist:hover {
  background-color: #ff6b35;
  color: white;
  transform: scale(1.1);
}

/* Active (đã yêu thích) */
.icon-btn.wishlist.active {
  background-color: #ff6b35;
  color: #fff;
}
.icon-btn.wishlist.active i {
  color: #fff;
}

.icon-btn.wishlist i {
  font-size: 16px;
}

/* Hot/Discount badges */
.post-box {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 10;
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  gap: 5px;
}

.post-box li {
  display: inline-block;
  padding: 4px 10px;
  background-color: #ff6b35;
  color: white;
  font-size: 11px;
  font-weight: 600;
  border-radius: 4px;
}

.post-box li:first-child {
  background-color: #e74c3c;
}

.post-box li:last-child {
  background-color: #3498db;
}

/* Phần content bên phải */
.product-content {
  flex: 1;
  padding: 25px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0; /* Để text truncate hoạt động */
}

/* Star rating */
.star-rating {
  margin-bottom: 8px;
  display: flex;
  gap: 2px;
}

.star-rating i {
  color: #ffc107;
  font-size: 14px;
}

/* Author */
.product-author {
  display: block;
  font-size: 13px;
  color: #7f8c8d;
  margin-bottom: 10px;
}

.product-author strong {
  color: #2c3e50;
}

/* Title */
.product-title {
  margin-bottom: 12px;
  min-height: 50px;
}

.product-title a {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.3;
  color: #2c3e50;
  text-decoration: none;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 0.3s;
}

.product-title a:hover {
  color: #d17057;
}

/* Price list */
.price-list {
  margin-bottom: 15px;
  padding: 0;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 10px;
}

.price-list li {
  font-size: 22px;
  font-weight: 700;
  color: #d17057;
}

.price-list li del {
  font-size: 16px;
  color: #95a5a6;
  font-weight: 400;
  text-decoration: line-through;
}

/* Button */
.product-btn {
  margin-top: auto;
}

.vs-btn {
  display: inline-block;
  padding: 12px 30px;
  background-color: #d17057;
  color: white;
  text-align: center;
  border-radius: 50px;
  font-size: 15px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.vs-btn:hover {
  background-color: #b85d47;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(209, 112, 87, 0.3);
  color: white;
}

/* Responsive */
@media (max-width: 768px) {
  .product-card-horizontal {
    flex-direction: column;
  }
  
  .product-img-wrapper {
    width: 100%;
  }
  
  .product-img {
    width: 100%;
    height: 400px;
  }
}

/* Pagination Styles */
.vs-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 30px 0;
  margin-top: 20px;
}

.vs-pagination ul {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 8px;
}

.vs-pagination li {
  display: inline-block;
}

.vs-pagination a {
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

.vs-pagination a:hover:not(.disabled):not(.active) {
  background-color: #d17057;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(209, 112, 87, 0.3);
}

.vs-pagination a.active {
  background-color: #d17057;
  color: white;
  border-color: #d17057;
  cursor: default;
  box-shadow: 0 4px 12px rgba(209, 112, 87, 0.4);
}

.vs-pagination a.disabled {
  background-color: #e9ecef;
  color: #adb5bd;
  cursor: not-allowed;
  opacity: 0.6;
}

.vs-pagination a i {
  font-size: 16px;
}
</style>
