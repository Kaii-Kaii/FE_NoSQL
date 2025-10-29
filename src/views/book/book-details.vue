<template>
  <div class="book-details-page">
    <!-- Main Content -->
    <main class="book-details-content">
      <div class="container py-5" v-if="loading">
        <div class="text-center">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-3">Đang tải thông tin sách...</p>
        </div>
      </div>

      <div class="container py-5" v-else-if="book">
        <!-- Breadcrumb -->
        <nav aria-label="breadcrumb" class="mb-4">
          
        </nav>

        <!-- Book Details -->
        <div class="row g-5">
          <!-- Left: Book Image -->
          <div class="col-lg-5">
            <div class="book-image-wrapper">
              <img 
                :src="book.URLSACH || book.ANHSACH" 
                :alt="book.TENSACH"
                class="book-detail-image"
                @error="handleImageError"
              >
              <!-- Wishlist Button -->
              <button 
                @click="handleAddToWishlist" 
                class="btn-wishlist-top"
                :class="{ 'active': isWished }"
                :title="isWished ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'"
              >
                <i :class="isWished ? 'fas fa-heart' : 'far fa-heart'"></i>
              </button>
              <ul class="book-badges" v-if="book.ISHOT || book.DISCOUNT">
                <li v-if="book.ISHOT" class="badge-hot">Hot</li>
                <li v-if="book.DISCOUNT" class="badge-discount">-{{ book.DISCOUNT }}%</li>
              </ul>
            </div>
          </div>

          <!-- Right: Book Information -->
          <div class="col-lg-7">
            <div class="book-info">
              <!-- Category -->
              <span class="book-category" v-if="categoryName">
                <i class="fas fa-bookmark"></i> {{ categoryName }}
              </span>

              <!-- Title -->
              <h1 class="book-title">{{ book.TENSACH }}</h1>

              <!-- Author -->
              <p class="book-author">
                <i class="fas fa-user-edit"></i>
                <strong>Tác giả:</strong> {{ book.TACGIA || 'Chưa cập nhật' }}
              </p>

              <!-- Rating -->
              <div class="book-rating">
                <div class="stars">
                  <i 
                    v-for="star in 5" 
                    :key="star"
                    class="fas fa-star"
                    :class="{ 'filled': star <= Math.round(reviewStats.average_rating || 0) }"
                  ></i>
                </div>
                <span class="rating-text">
                  ({{ reviewStats.average_rating ? reviewStats.average_rating.toFixed(1) : '0.0' }} - 
                  {{ reviewStats.total_reviews || 0 }} đánh giá)
                </span>
              </div>

              <!-- Price -->
              <div class="book-price">
                <div class="price-wrapper">
                  <span class="current-price">{{ formatPrice(book.GIATIEN) }}</span>
                  <span class="original-price" v-if="book.GIAGOC && book.GIAGOC > book.GIATIEN">
                    {{ formatPrice(book.GIAGOC) }}
                  </span>
                  <span class="save-amount" v-if="book.GIAGOC && book.GIAGOC > book.GIATIEN">
                    Tiết kiệm {{ formatPrice(book.GIAGOC - book.GIATIEN) }}
                  </span>
                </div>
              </div>

              <!-- Stock Status -->
              <div class="stock-status">
                <i class="fas fa-check-circle"></i>
                <span>{{ book.TRANGTHAI || book.status || (book.SOLUONG > 0 ? 'Còn hàng' : 'Hết hàng') }}</span>
              </div>

              <!-- Quantity Selector -->
              <div class="quantity-selector">
                <label>Số lượng:</label>
                <div class="quantity-controls">
                  <button @click="decreaseQuantity" class="qty-btn" type="button">
                    <i class="fas fa-minus"></i>
                  </button>
                  <span class="qty-display">{{ quantity }}</span>
                  <button @click="increaseQuantity" class="qty-btn" type="button">
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <!-- Action Buttons -->
              <div class="action-buttons">
                <button @click="handleAddToCart" class="btn-add-to-cart">
                  <i class="fas fa-shopping-cart"></i>
                  Thêm vào giỏ hàng
                </button>
                <button @click="handleBuyNow" class="btn-buy-now">
                  <i class="fas fa-bolt"></i>
                  Mua ngay
                </button>
              </div>

              <!-- Book Meta Info -->
              <div class="book-meta">
                <div class="meta-item" v-if="book.SOLUONG">
                  <h5><i class="fas fa-warehouse"></i> Tồn kho</h5>
                  <p>{{ book.SOLUONG }} quyển</p>
                </div>
                <div class="meta-item" v-if="book.publishYear">
                  <h5><i class="fas fa-calendar-alt"></i> Năm xuất bản</h5>
                  <p>{{ book.publishYear }}</p>
                </div>
                <div class="meta-item" v-if="book.publisher?.name">
                  <h5><i class="fas fa-building"></i> Nhà xuất bản</h5>
                  <p>
                    {{ book.publisher.name }}
                    <span v-if="book.publisher.address"> - {{ book.publisher.address }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Additional Information Tabs -->
        <div class="additional-info mt-5">
          <ul class="nav nav-tabs" role="tablist">
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link"
                :class="{ active: activeTab === 'description' }"
                @click="activeTab = 'description'"
                type="button"
              >
                Mô tả chi tiết
              </button>
            </li>
            <li class="nav-item" role="presentation">
              <button 
                class="nav-link"
                :class="{ active: activeTab === 'reviews' }"
                @click="activeTab = 'reviews'"
                type="button"
              >
                Đánh giá ({{ reviewStats.total_reviews || 0 }})
              </button>
            </li>
          </ul>
          <div class="tab-content">
            <div class="tab-pane fade" :class="{ 'show active': activeTab === 'description' }" id="description">
              <div class="tab-content-wrapper">
                <p>{{ book.MOTA || 'Chưa có mô tả chi tiết cho sách này.' }}</p>
              </div>
            </div>
            <div class="tab-pane fade" :class="{ 'show active': activeTab === 'reviews' }" id="reviews">
              <div class="tab-content-wrapper">
                <!-- Review Stats Summary -->
                <div class="review-stats-summary" v-if="reviewStats.total_reviews > 0">
                  <div class="row align-items-center">
                    <div class="col-md-4 text-center">
                      <div class="average-rating">
                        <h2 class="rating-number">{{ reviewStats.average_rating.toFixed(1) }}</h2>
                        <div class="stars-large">
                          <i 
                            v-for="star in 5" 
                            :key="star"
                            class="fas fa-star"
                            :class="{ 'filled': star <= Math.round(reviewStats.average_rating) }"
                          ></i>
                        </div>
                        <p class="total-reviews">{{ reviewStats.total_reviews }} đánh giá</p>
                      </div>
                    </div>
                    <div class="col-md-8">
                      <div class="rating-bars">
                        <div v-for="star in [5, 4, 3, 2, 1]" :key="star" class="rating-bar-item">
                          <span class="star-label">{{ star }} <i class="fas fa-star"></i></span>
                          <div class="progress">
                            <div 
                              class="progress-bar" 
                              :style="{ width: getStarPercentage(star) + '%' }"
                            ></div>
                          </div>
                          <span class="star-count">{{ getStarCount(star) }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Add/Edit Review Form -->
                <div class="add-review-section mt-4" v-if="currentUser">
                  <div v-if="userExistingReview">
                    <h4>Chỉnh sửa đánh giá của bạn</h4>
                    <div class="alert alert-info mb-3">
                      <i class="fas fa-info-circle"></i>
                      Bạn đã đánh giá sách này trước đó. Bạn có thể chỉnh sửa hoặc xóa đánh giá của mình.
                    </div>
                  </div>
                  <h4 v-else>Viết đánh giá của bạn</h4>
                  
                  <div class="review-form">
                    <div class="rating-input mb-3">
                      <label>Đánh giá của bạn:</label>
                      <div class="star-rating-input">
                        <i 
                          v-for="star in 5" 
                          :key="star"
                          class="far fa-star"
                          :class="{ 'fas filled': star <= newReview.SAO }"
                          @click="setRating(star)"
                          @mouseenter="hoverRating = star"
                          @mouseleave="hoverRating = 0"
                          :style="{ color: (star <= (hoverRating || newReview.SAO)) ? '#ffc107' : '#ddd' }"
                        ></i>
                      </div>
                    </div>
                    <div class="mb-3">
                      <label>Nội dung đánh giá:</label>
                      <textarea 
                        v-model="newReview.NOIDUNG"
                        class="form-control"
                        rows="4"
                        placeholder="Chia sẻ cảm nhận của bạn về cuốn sách này..."
                      ></textarea>
                    </div>
                    <div class="d-flex gap-2">
                      <button 
                        @click="submitReview"
                        class="btn btn-primary"
                        :disabled="!newReview.SAO || !newReview.NOIDUNG.trim() || submittingReview"
                      >
                        <i :class="userExistingReview ? 'fas fa-edit' : 'fas fa-paper-plane'"></i> 
                        {{ submittingReview ? 'Đang xử lý...' : (userExistingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá') }}
                      </button>
                      <button 
                        v-if="userExistingReview"
                        @click="deleteUserReview"
                        class="btn btn-danger"
                        :disabled="submittingReview"
                      >
                        <i class="fas fa-trash"></i> Xóa đánh giá
                      </button>
                    </div>
                  </div>
                </div>
                <div class="add-review-section mt-4" v-else>
                  <p class="text-muted">
                    <i class="fas fa-info-circle"></i>
                    Vui lòng <router-link to="/login" class="text-primary">đăng nhập</router-link> để viết đánh giá
                  </p>
                </div>

                <!-- Reviews List -->
                <div class="reviews-list mt-4">
                  <h4>Tất cả đánh giá</h4>
                  <div v-if="loadingReviews" class="text-center py-4">
                    <div class="spinner-border text-primary" role="status">
                      <span class="visually-hidden">Đang tải...</span>
                    </div>
                  </div>
                  <div v-else-if="reviews.length === 0" class="text-center py-4 text-muted">
                    <i class="fas fa-comments" style="font-size: 48px; opacity: 0.3;"></i>
                    <p class="mt-3">Chưa có đánh giá nào cho sách này</p>
                  </div>
                  <div v-else>
                    <div 
                      v-for="review in reviews" 
                      :key="review.MADANHGIA"
                      class="review-item"
                    >
                      <div class="review-header">
                        <div class="reviewer-info">
                          <div class="reviewer-avatar">
                            <img
                              v-if="hasReviewerAvatar(review)"
                              :src="getReviewerAvatar(review)"
                              :alt="getReviewerName(review)"
                              class="avatar-image"
                              @error="onReviewerAvatarError(review)"
                            />
                            <i v-else class="fas fa-user-circle"></i>
                          </div>
                          <div>
                            <h6 class="reviewer-name">{{ getReviewerName(review) }}</h6>
                            <div class="review-stars">
                              <i 
                                v-for="star in 5" 
                                :key="star"
                                class="fas fa-star"
                                :class="{ 'filled': star <= review.SAO }"
                              ></i>
                            </div>
                          </div>
                        </div>
                        <div class="review-date">
                          {{ formatDate(review.NGAYTAO) }}
                        </div>
                      </div>
                      <div class="review-content">
                        <p>{{ review.NOIDUNG }}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Related Books Section -->
        <div v-if="book && book.MADANHMUC" class="mt-5">
          <CategoryBooks 
              :categoryId="book.MADANHMUC"
              :title="`Sách gợi ý:`"
              :limit="5"
              :viewMoreLink="`/home/books?category=${book.MADANHMUC}`"
            />
        </div>
      </div>

      <!-- Error State -->
      <div class="container py-5" v-else>
        <div class="text-center">
          <i class="fas fa-exclamation-triangle text-warning" style="font-size: 64px;"></i>
          <h3 class="mt-4">Không tìm thấy thông tin sách</h3>
          <p class="text-muted">Sách bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
          <router-link to="/home/books" class="btn btn-primary mt-3">
            <i class="fas fa-arrow-left"></i> Quay lại danh sách sách
          </router-link>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBookByCode } from '@/api/book'
import { addToCart } from '@/api/cart'
import { toggleWishlist, isInWishlist } from '@/api/wishlist'
import { getReviewsByBook, createReview, updateReview, deleteReview } from '@/api/review'
import { getOrdersByCustomer } from '@/api/order'
import { ElNotification } from 'element-plus'
import CategoryBooks from '@/views/category/category-books.vue'

const route = useRoute()
const router = useRouter()

const book = ref(null)
const loading = ref(true)
const quantity = ref(1)
const isWished = ref(false)

// Tab state
const activeTab = ref('description')

// Review related states
const reviews = ref([])
const loadingReviews = ref(false)
const defaultReviewStats = {
  total_reviews: 0,
  average_rating: 0,
  five_star: 0,
  four_star: 0,
  three_star: 0,
  two_star: 0,
  one_star: 0
}
const reviewStats = ref({ ...defaultReviewStats })
const newReview = ref({
  NOIDUNG: '',
  SAO: 0,
  MASACH: null,
  MANGUOIDUNG: null
})
const hoverRating = ref(0)
const submittingReview = ref(false)
const userExistingReview = ref(null) // Lưu đánh giá hiện tại của user nếu có
const eligibleOrders = ref([])
const selectedOrderCode = ref('')
const loadingEligibleOrders = ref(false)

// Get current user from localStorage
const currentUser = computed(() => {
  try {
    const userStr = localStorage.getItem('user')
    if (userStr) {
      const user = JSON.parse(userStr)
      return user
    }
  } catch (e) {
    console.error('Error parsing user from localStorage:', e)
  }
  return null
})

const customerCode = computed(() => {
  const user = currentUser.value
  if (!user) return null
  return (
    user.code ||
    user.customerCode ||
    user.customer_code ||
    user.MAKH ||
    user.customerID ||
    null
  )
})

const resolveCurrentUserIdentifier = () => {
  if (customerCode.value) return customerCode.value
  const user = currentUser.value
  if (!user) return null
  return (
    user.id ||
    user.ID ||
    user.MANGUOIDUNG ||
    user.manguoidung ||
    user.MA_NGUOI_DUNG ||
    user.userId ||
    null
  )
}

// Computed để lấy tên danh mục (có thể cải thiện bằng cách gọi API category)
const categoryName = computed(() => {
  if (!book.value) return ''
  if (book.value.category?.name) {
    return book.value.category.name
  }
  if (!book.value.MADANHMUC) return ''
  // Mapping tạm thời, sau này có thể gọi API để lấy tên chính xác
  const categories = {
    1: 'Sách thiếu nhi',
    2: 'Truyện tranh',
    3: 'Khoa học',
    // Thêm các category khác nếu cần
  }
  return categories[book.value.MADANHMUC] || 'Danh mục khác'
})

const normalizeBook = (rawBook) => {
  if (!rawBook) return null
  const fallbackStock = rawBook.inStock ?? rawBook.SOLUONG ?? 0
  const rawId = rawBook.code ?? rawBook.MASACH ?? rawBook.id
  return {
    ...rawBook,
    MASACH: rawId != null ? String(rawId) : null,
    TENSACH: rawBook.name || rawBook.TENSACH,
    TACGIA: rawBook.author || rawBook.TACGIA,
    GIATIEN: rawBook.price ?? rawBook.GIATIEN ?? 0,
    GIAGOC: rawBook.originalPrice ?? rawBook.GIAGOC ?? undefined,
    URLSACH: rawBook.coverUrl || rawBook.URLSACH || rawBook.ANHSACH,
    ANHSACH: rawBook.coverUrl || rawBook.ANHSACH || rawBook.URLSACH,
    SOLUONG: fallbackStock,
    TRANGTHAI: rawBook.status || rawBook.TRANGTHAI || (fallbackStock > 0 ? 'Còn hàng' : 'Hết hàng'),
    MADANHMUC: rawBook.category?.code || rawBook.categoryCode || rawBook.MADANHMUC,
    MOTA: rawBook.description || rawBook.MOTA,
    publishYear: rawBook.publishYear || rawBook.PUBLISHYEAR,
    category: rawBook.category || rawBook.categoryData || null,
    publisher: rawBook.publisher || rawBook.publisherData || null,
    SOLD: rawBook.sold ?? rawBook.SOLD ?? 0
  }
}

// Fetch book details
const fetchBookDetail = async (bookCodeParam) => {
  loading.value = true
  try {
    const rawCode = bookCodeParam ?? route.params.code ?? route.params.id
    if (!rawCode) {
      book.value = null
      return
    }

    const response = await getBookByCode(rawCode)
    const rawBook = response?.data ?? response
    const normalizedBook = normalizeBook(rawBook)

    if (normalizedBook) {
      book.value = normalizedBook
      isWished.value = isInWishlist(normalizedBook.MASACH)
      quantity.value = 1

      if (currentUser.value) {
        const userId = currentUser.value.id || 
                       currentUser.value.ID || 
                       currentUser.value.MANGUOIDUNG || 
                       currentUser.value.manguoidung || 
                       currentUser.value.MA_NGUOI_DUNG

        newReview.value = {
          NOIDUNG: '',
          SAO: 0,
          MASACH: normalizedBook.MASACH,
          MANGUOIDUNG: userId
        }
        userExistingReview.value = null
      }
    } else {
      book.value = null
      isWished.value = false
      reviews.value = []
      reviewStats.value = { ...defaultReviewStats }
    }
  } catch (error) {
    console.error('Error fetching book detail:', error)
    book.value = null
    isWished.value = false
    reviews.value = []
    reviewStats.value = { ...defaultReviewStats }
  } finally {
    loading.value = false
  }
}

// Format price
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(price)
}

// Handle image error
const handleImageError = (e) => {
  e.target.src = '/src/assets/img/product/default.jpg'
}

// Quantity controls
const increaseQuantity = () => {
  if (quantity.value < 99) { // Giới hạn max 99
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// Add to cart
const handleAddToCart = () => {
  if (!book.value || !book.value.MASACH) {
    try {
      ElNotification({
        title: 'Lỗi',
        message: 'Không tìm thấy thông tin sách để thêm vào giỏ hàng',
        type: 'error',
        duration: 3000
      })
    } catch (e) {
      alert('Không tìm thấy thông tin sách để thêm vào giỏ hàng')
    }
    return
  }

  try {
    addToCart({
      MASACH: book.value.MASACH,
      TENSACH: book.value.TENSACH,
      GIATIEN: book.value.GIATIEN,
      URLSACH: book.value.URLSACH ?? book.value.ANHSACH,
      SOLUONG: quantity.value,
    })
    
    // Hiển thị notification thành công
    try {
      ElNotification({
        title: 'Thành công',
        message: `Đã thêm ${quantity.value} quyển "${book.value.TENSACH}" vào giỏ hàng!`,
        type: 'success',
        duration: 3000
      })
    } catch (e) {
      // Fallback nếu ElNotification không hoạt động
      alert(` Đã thêm ${quantity.value} quyển "${book.value.TENSACH}" vào giỏ hàng!`)
    }
  } catch (error) {
    console.error('Error adding to cart:', error)
    try {
      ElNotification({
        title: 'Lỗi',
        message: error?.message ? `Có lỗi khi thêm vào giỏ hàng: ${error.message}` : 'Có lỗi khi thêm vào giỏ hàng',
        type: 'error',
        duration: 3000
      })
    } catch (e) {
      alert(error?.message ? `Có lỗi khi thêm vào giỏ hàng: ${error.message}` : '❌ Có lỗi khi thêm vào giỏ hàng')
    }
  }
}

// Buy now - Thêm vào giỏ và chuyển ngay đến trang giỏ hàng
const handleBuyNow = () => {
  if (!book.value || !book.value.MASACH) {
    try {
      ElNotification({
        title: 'Lỗi',
        message: 'Không tìm thấy thông tin sách để mua',
        type: 'error',
        duration: 3000
      })
    } catch (e) {
      alert('Không tìm thấy thông tin sách để mua')
    }
    return
  }

  try {
    addToCart({
      MASACH: book.value.MASACH,
      TENSACH: book.value.TENSACH,
      GIATIEN: book.value.GIATIEN,
      URLSACH: book.value.URLSACH ?? book.value.ANHSACH,
      SOLUONG: quantity.value,
    })
    
    // Chuyển ngay đến trang giỏ hàng
    router.push('/home/cart')
  } catch (error) {
    console.error('Error buying now:', error)
    try {
      ElNotification({
        title: 'Lỗi',
        message: error?.message ? `Có lỗi khi mua hàng: ${error.message}` : 'Có lỗi khi mua hàng',
        type: 'error',
        duration: 3000
      })
    } catch (e) {
      alert(error?.message ? `Có lỗi khi mua hàng: ${error.message}` : ' Có lỗi khi mua hàng')
    }
  }
}

// Add to wishlist - Toggle wishlist
const handleAddToWishlist = () => {
  if (!book.value || !book.value.MASACH) {
    try {
      ElNotification({
        title: 'Lỗi',
        message: 'Không tìm thấy thông tin sách để thêm vào yêu thích',
        type: 'error',
        duration: 2000
      })
    } catch (e) {
      alert('Không tìm thấy thông tin sách để thêm vào yêu thích')
    }
    return
  }

  try {
    toggleWishlist({
      MASACH: book.value.MASACH,
      TENSACH: book.value.TENSACH,
      GIATIEN: book.value.GIATIEN,
      URLSACH: book.value.URLSACH ?? book.value.ANHSACH,
    })
    
    // Update local state
    isWished.value = !isWished.value
    
    // Hiển thị notification
    try {
      ElNotification({
        title: isWished.value ? 'Đã thêm vào yêu thích' : 'Đã xóa khỏi yêu thích',
        message: book.value.TENSACH,
        type: isWished.value ? 'success' : 'info',
        duration: 2000
      })
    } catch (e) {
      alert(isWished.value ? '❤️ Đã thêm vào yêu thích!' : '💔 Đã xóa khỏi yêu thích!')
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error)
    try {
      ElNotification({
        title: 'Lỗi',
        message: error?.message ? `Có lỗi khi cập nhật danh sách yêu thích: ${error.message}` : 'Có lỗi khi cập nhật danh sách yêu thích',
        type: 'error',
        duration: 2000
      })
    } catch (e) {
      alert(error?.message ? `Có lỗi khi cập nhật danh sách yêu thích: ${error.message}` : 'Có lỗi khi cập nhật danh sách yêu thích')
    }
  }
}

// Fetch reviews for current book
const fetchReviews = async () => {
  if (!book.value?.MASACH) return
  
  loadingReviews.value = true
  try {
    const response = await getReviewsByBook(book.value.MASACH)
    const reviewsData = Array.isArray(response) ? response : response?.data ?? []
  reviews.value = reviewsData.map((review, index) => normalizeReviewItem(review, index))
    recalculateReviewStats()
    checkUserExistingReview()
  } catch (error) {
    console.error('Error fetching reviews:', error)
    reviews.value = []
    reviewStats.value = { ...defaultReviewStats }
  } finally {
    loadingReviews.value = false
  }
}

// Kiểm tra user đã có đánh giá chưa
const checkUserExistingReview = () => {
  if (!currentUser.value) {
    userExistingReview.value = null
    ensureDefaultOrderSelection()
    return
  }

  const userId = resolveCurrentUserIdentifier()
  if (!userId) {
    userExistingReview.value = null
    ensureDefaultOrderSelection()
    return
  }

  const normalizedUser = String(userId).trim().toUpperCase()
  const existingReview = reviews.value.find((review) => {
    const reviewUser = review.MANGUOIDUNG ?? review.customerCode ?? review.raw?.customerCode
    if (!reviewUser) return false
    return String(reviewUser).trim().toUpperCase() === normalizedUser
  })

  if (existingReview) {
    userExistingReview.value = existingReview
    // Load dữ liệu đánh giá cũ vào form
    newReview.value = {
      NOIDUNG: existingReview.NOIDUNG,
      SAO: existingReview.SAO,
      MASACH: existingReview.MASACH,
      MANGUOIDUNG: existingReview.MANGUOIDUNG
    }
    selectedOrderCode.value = existingReview.ORDERCODE || ''
  } else {
    userExistingReview.value = null
    // Reset form nếu chưa có đánh giá
    newReview.value = {
      NOIDUNG: '',
      SAO: 0,
      MASACH: book.value?.MASACH,
      MANGUOIDUNG: userId
    }
    ensureDefaultOrderSelection()
  }
}

// Get star count by rating
const getStarCount = (star) => {
  const starMap = {
    5: 'five_star',
    4: 'four_star',
    3: 'three_star',
    2: 'two_star',
    1: 'one_star'
  }
  return reviewStats.value[starMap[star]] || 0
}

// Get star percentage
const getStarPercentage = (star) => {
  if (reviewStats.value.total_reviews === 0) return 0
  const count = getStarCount(star)
  return (count / reviewStats.value.total_reviews) * 100
}

const recalculateReviewStats = () => {
  const list = Array.isArray(reviews.value) ? reviews.value : []
  if (!list.length) {
    reviewStats.value = { ...defaultReviewStats }
    return
  }

  const nextStats = {
    total_reviews: list.length,
    average_rating: 0,
    five_star: 0,
    four_star: 0,
    three_star: 0,
    two_star: 0,
    one_star: 0
  }

  let totalRating = 0
  list.forEach((review) => {
    const rating = Number(review?.SAO ?? review?.rating ?? 0) || 0
    totalRating += rating
    const rounded = Math.round(rating)
    switch (rounded) {
      case 5:
        nextStats.five_star += 1
        break
      case 4:
        nextStats.four_star += 1
        break
      case 3:
        nextStats.three_star += 1
        break
      case 2:
        nextStats.two_star += 1
        break
      default:
        nextStats.one_star += 1
        break
    }
  })

  nextStats.average_rating = totalRating / list.length
  reviewStats.value = nextStats
}

const normalizeKey = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '')
    .toLowerCase()

const canonicalOrderStatus = (value) => {
  const key = normalizeKey(value)
  if (!key) return ''
  if (key.includes('hoanthanh') || key.includes('completed') || key.includes('success')) {
    return 'HoanThanh'
  }
  if (key.includes('danggiao') || key.includes('shipping') || key.includes('ship')) {
    return 'DangGiao'
  }
  if (key.includes('dadathang') || key.includes('pending')) {
    return 'DaDatHang'
  }
  return key
}

const pickFirstTruthy = (values = []) => {
  for (const value of values) {
    if (!value) continue
    const text = String(value).trim()
    if (text) return text
  }
  return ''
}

const normalizeReviewItem = (raw = {}, index = 0) => {
  const id = raw.reviewId ?? raw.id ?? raw.MADANHGIA ?? raw.code ?? `REVIEW-${index + 1}`
  const customer =
    raw.customerCode ??
    raw.customer_code ??
    raw.customerId ??
    raw.customer_id ??
    raw.MANGUOIDUNG ??
    raw.userId ??
    raw.nguoi_dung?.MANGUOIDUNG ??
    null

  const avatarUrl = pickFirstTruthy([
    raw.avatarUrl,
    raw.avatarURL,
    raw.avatar_url,
    raw.reviewerAvatar,
    raw.reviewer_avatar,
    raw.customerAvatar,
    raw.customer_avatar,
    raw.nguoi_dung?.ANHDAIDIEN,
    raw.nguoi_dung?.avatar,
    raw.nguoi_dung?.avatarUrl,
    raw.nguoi_dung?.avatar_url
  ])

  return {
    MADANHGIA: String(id),
    SAO: Number(raw.rating ?? raw.SAO ?? raw.stars ?? 0) || 0,
    NOIDUNG: raw.content ?? raw.NOIDUNG ?? raw.message ?? '',
    MANGUOIDUNG: customer,
    MASACH:
      raw.bookCode ??
      raw.book_code ??
      raw.MASACH ??
      raw.masach ??
      raw.book?.code ??
      raw.book?.MASACH ??
      null,
    ORDERCODE: raw.orderCode ?? raw.order_code ?? raw.ORDERCODE ?? null,
    NGAYTAO: raw.createdAt ?? raw.created_at ?? raw.NGAYTAO ?? raw.createdDate ?? raw.created_time ?? null,
    reviewerName:
      raw.reviewerName ??
      raw.reviewer ??
      raw.customerName ??
      raw.customer_name ??
      raw.nguoi_dung?.TENNGUOIDUNG ??
      raw.nguoi_dung?.HOTEN ??
      raw.nguoi_dung?.EMAIL ??
      'Người dùng',
    nguoi_dung: raw.nguoi_dung ?? null,
    AVATAR: avatarUrl,
    avatarUrl,
    avatar: avatarUrl,
    raw
  }
}

const normalizeOrderItems = (rawItems) => {
  if (!Array.isArray(rawItems)) return []
  return rawItems.map((item) => {
    const code =
      item.bookCode ??
      item.book_code ??
      item.code ??
      item.book?.code ??
      item.BookCode ??
      item.MASACH ??
      item.masp ??
      item.masach ??
      item.book?.MASACH ??
      ''
    return {
      bookCode: code ? String(code).trim().toUpperCase() : ''
    }
  })
}

const normalizeOrderForReview = (order, index = 0) => {
  const orderCode =
    order.code ??
    order.orderCode ??
    order.order_code ??
    order.mahd ??
    order.ID ??
    order.id ??
    `ORDER-${index + 1}`
  const createdAt = order.createdAt ?? order.created_at ?? order.createdDate ?? order.ngaylap ?? null

  return {
    orderCode: String(orderCode),
    status: canonicalOrderStatus(order.status ?? order.trangthai ?? order.Status),
    createdAt,
    items: normalizeOrderItems(order.items ?? order.chitiet ?? order.orderDetails ?? order.details ?? [])
  }
}

const formatOrderLabel = (order) => {
  const date = order.createdAt ? formatDate(order.createdAt) : 'Không rõ thời gian'
  return `${order.orderCode} • ${date}`
}

const ensureDefaultOrderSelection = () => {
  if (userExistingReview.value?.ORDERCODE) {
    selectedOrderCode.value = userExistingReview.value.ORDERCODE
    return
  }
  const firstOrder = eligibleOrders.value[0]
  selectedOrderCode.value = firstOrder ? firstOrder.orderCode : ''
}

const fetchEligibleOrders = async (customer, bookCode) => {
  if (!customer || !bookCode) {
    eligibleOrders.value = []
    if (!userExistingReview.value) {
      selectedOrderCode.value = ''
    }
    return
  }

  loadingEligibleOrders.value = true
  try {
    const response = await getOrdersByCustomer(customer)
    const rawList = Array.isArray(response) ? response : response?.data ?? []
    const normalizedOrders = rawList.map((order, index) => normalizeOrderForReview(order, index))
    const targetCode = String(bookCode).trim().toUpperCase()
    const eligible = normalizedOrders.filter((order) => {
      if (order.status !== 'HoanThanh') return false
      return order.items.some((item) => item.bookCode === targetCode)
    })
    const mapped = eligible.map((order) => ({
      orderCode: order.orderCode,
      createdAt: order.createdAt,
      label: formatOrderLabel(order)
    }))
    eligibleOrders.value = mapped
    ensureDefaultOrderSelection()
  } catch (error) {
    console.error('fetchEligibleOrders error', error)
    eligibleOrders.value = []
    if (!userExistingReview.value) {
      selectedOrderCode.value = ''
    }
  } finally {
    loadingEligibleOrders.value = false
  }
}

// Set rating for new review
const setRating = (star) => {
  newReview.value.SAO = star
}

// Resolve reviewer display name from various payload shapes
const getReviewerName = (review = {}) => {
  const candidateStrings = [
    review.reviewerName,
    review.reviewer_name,
    review.customerName,
    review.customer_name,
    review.raw?.reviewerName,
    review.raw?.reviewer_name,
    review.raw?.customerName,
    review.raw?.customer_name,
    review.raw?.nguoi_dung?.TENNGUOIDUNG,
    review.raw?.nguoi_dung?.TEN,
    review.raw?.nguoi_dung?.HOTEN,
    review.raw?.nguoi_dung?.EMAIL
  ]

  for (const value of candidateStrings) {
    if (!value) continue
    const name = String(value).trim()
    if (name) return name
  }

  if (review.nguoi_dung) {
    const fromNested = [
      review.nguoi_dung.TENNGUOIDUNG,
      review.nguoi_dung.TEN,
      review.nguoi_dung.HOTEN,
      review.nguoi_dung.EMAIL
    ]
    for (const value of fromNested) {
      if (!value) continue
      const name = String(value).trim()
      if (name) return name
    }
  }

  return 'Người dùng'
}

const getReviewerAvatar = (review = {}) => {
  const candidates = [
    review.avatarUrl,
    review.AVATAR,
    review.avatar,
    review.avatar_url,
    review.raw?.avatarUrl,
    review.raw?.avatar_url,
    review.raw?.reviewerAvatar,
    review.raw?.reviewer_avatar,
    review.raw?.customerAvatar,
    review.raw?.customer_avatar,
    review.nguoi_dung?.ANHDAIDIEN,
    review.nguoi_dung?.avatar,
    review.nguoi_dung?.avatarUrl,
    review.nguoi_dung?.avatar_url
  ]

  return pickFirstTruthy(candidates)
}

const avatarErrorMap = ref({})

const hasReviewerAvatar = (review = {}) => {
  const id = review?.MADANHGIA
  if (id && avatarErrorMap.value[id]) return false
  return Boolean(getReviewerAvatar(review))
}

const onReviewerAvatarError = (review = {}) => {
  const id = review?.MADANHGIA
  if (!id) return
  avatarErrorMap.value = { ...avatarErrorMap.value, [id]: true }
  const target = reviews.value.find((item) => item.MADANHGIA === id)
  if (target) {
    target.avatarUrl = ''
    target.AVATAR = ''
    target.avatar = ''
  }
}

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  } catch (e) {
    return dateStr
  }
}

// Submit new review or update existing review
const submitReview = async () => {
  if (!currentUser.value) {
    ElNotification({
      title: 'Lỗi',
      message: 'Vui lòng đăng nhập để đánh giá',
      type: 'error'
    })
    return
  }

  const customer = resolveCurrentUserIdentifier()
  if (!customer) {
    ElNotification({
      title: 'Lỗi',
      message: 'Không tìm thấy thông tin khách hàng để gửi đánh giá',
      type: 'error'
    })
    return
  }

  if (!newReview.value.SAO || !newReview.value.NOIDUNG.trim()) {
    ElNotification({
      title: 'Lỗi',
      message: 'Vui lòng chọn số sao và nhập nội dung đánh giá',
      type: 'warning'
    })
    return
  }

  if (!userExistingReview.value && !selectedOrderCode.value) {
    ElNotification({
      title: 'Thiếu thông tin',
      message: 'Vui lòng chọn đơn hàng đã mua sách này để đánh giá',
      type: 'warning'
    })
    return
  }

  submittingReview.value = true
  try {
    const reviewData = {
      rating: newReview.value.SAO,
      content: newReview.value.NOIDUNG.trim()
    }

    if (userExistingReview.value) {
      // Cập nhật đánh giá cũ
      await updateReview(book.value.MASACH, userExistingReview.value.MADANHGIA, reviewData, customer)
      
      ElNotification({
        title: 'Thành công',
        message: 'Đánh giá của bạn đã được cập nhật!',
        type: 'success'
      })
    } else {
      // Tạo đánh giá mới
      await createReview(
        {
          bookCode: book.value.MASACH,
          orderCode: selectedOrderCode.value,
          rating: reviewData.rating,
          content: reviewData.content,
          customerCode: customer
        },
        customer
      )
      
      ElNotification({
        title: 'Thành công',
        message: 'Đánh giá của bạn đã được gửi!',
        type: 'success'
      })
    }

    // Refresh reviews và danh sách đơn đủ điều kiện
    await Promise.all([
      fetchReviews(),
      fetchEligibleOrders(customerCode.value, book.value?.MASACH)
    ])
  } catch (error) {
    console.error('Error submitting review:', error)
    ElNotification({
      title: 'Lỗi',
      message: error.response?.data?.message || 'Có lỗi khi gửi đánh giá',
      type: 'error'
    })
  } finally {
    submittingReview.value = false
  }
}

// Delete user's review
const deleteUserReview = async () => {
  if (!userExistingReview.value) return

  const customer = resolveCurrentUserIdentifier()
  if (!customer) {
    ElNotification({
      title: 'Lỗi',
      message: 'Không tìm thấy thông tin khách hàng để xóa đánh giá',
      type: 'error'
    })
    return
  }

  submittingReview.value = true
  try {
    await deleteReview(book.value.MASACH, userExistingReview.value.MADANHGIA, customer)

    ElNotification({
      title: 'Thành công',
      message: 'Đã xóa đánh giá của bạn',
      type: 'success'
    })

    // Reset form và state
    userExistingReview.value = null
    newReview.value = {
      NOIDUNG: '',
      SAO: 0,
      MASACH: book.value?.MASACH,
      MANGUOIDUNG: customer
    }
    selectedOrderCode.value = ''

    await Promise.all([
      fetchReviews(),
      fetchEligibleOrders(customerCode.value, book.value?.MASACH)
    ])
  } catch (error) {
    console.error('Error deleting review:', error)
    ElNotification({
      title: 'Lỗi',
      message: error.response?.data?.message || 'Có lỗi khi xóa đánh giá',
      type: 'error'
    })
  } finally {
    submittingReview.value = false
  }
}

onMounted(async () => {
  await fetchBookDetail()
  if (book.value) {
    await fetchReviews()
  }
})

watch(
  () => [customerCode.value, book.value?.MASACH],
  async ([code, bookCode]) => {
    await fetchEligibleOrders(code, bookCode)
  },
  { immediate: true }
)

watch(
  () => route.params.code ?? route.params.id,
  async (newCode, oldCode) => {
    if (!newCode || newCode === oldCode) return

    await fetchBookDetail(newCode)
    if (book.value) {
      await fetchReviews()
    } else {
      reviews.value = []
      reviewStats.value = { ...defaultReviewStats }
    }
  }
)
</script>

<style scoped>
.book-details-page {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.book-details-content {
  padding-top: 30px;
}

/* Breadcrumb */
.breadcrumb {
  background-color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.breadcrumb-item a {
  color: #f5576c;
  text-decoration: none;
  transition: color 0.3s;
}

.breadcrumb-item a:hover {
  color: #f093fb;
}

.breadcrumb-item.active {
  color: #6c757d;
}

/* Book Image */
.book-image-wrapper {
  position: relative;
  background: white;
  padding: 30px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.book-detail-image {
  max-width: 100%;
  height: auto;
  max-height: 600px;
  object-fit: contain;
  border-radius: 8px;
}

/* Wishlist Button on Image */
.btn-wishlist-top {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background-color: white;
  color: #f5576c;
  font-size: 22px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.btn-wishlist-top:hover {
  transform: scale(1.15);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%);
}

.btn-wishlist-top.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  animation: heartBeat 0.5s;
}

.btn-wishlist-top.active:hover {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
}

.book-badges {
  position: absolute;
  top: 20px;
  left: 20px;
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 5;
}

.book-badges li {
  padding: 8px 15px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 13px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.badge-hot {
  background: linear-gradient(135deg, #ff6b6b, #ee5a24);
  color: white;
}

.badge-discount {
  background: linear-gradient(135deg, #f39c12, #e67e22);
  color: white;
}

/* Book Info */
.book-info {
  background: white;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.book-category {
  display: inline-block;
  color: #f5576c;
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 15px;
  padding: 6px 15px;
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.15) 0%, rgba(245, 87, 108, 0.15) 100%);
  border-radius: 20px;
}

.book-category i {
  margin-right: 5px;
}

.book-title {
  font-size: 36px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 20px;
  line-height: 1.3;
}

.book-author {
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 20px;
}

.book-author i {
  margin-right: 8px;
  color: #f5576c;
}

.book-author strong {
  color: #2c3e50;
}

/* Rating */
.book-rating {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 25px;
  padding-bottom: 25px;
  border-bottom: 2px solid #ecf0f1;
}

.stars i {
  color: #ffc107;
  font-size: 18px;
  margin-right: 3px;
}

.rating-text {
  color: #7f8c8d;
  font-size: 15px;
}

/* Price */
.book-price {
  margin-bottom: 25px;
  padding-bottom: 25px;
  border-bottom: 2px solid #ecf0f1;
}

.price-wrapper {
  display: flex;
  align-items: center;
  gap: 15px;
  flex-wrap: wrap;
}

.current-price {
  font-size: 36px;
  font-weight: 700;
  color: #f5576c;
  display: inline-block;
  padding: 2px 0;
  line-height: 1.2;
}

.original-price {
  font-size: 22px;
  color: #95a5a6;
  text-decoration: line-through;
}

.save-amount {
  background-color: #e8f5e9;
  color: #27ae60;
  padding: 6px 15px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

/* Stock Status */
.stock-status {
  margin-bottom: 25px;
  padding: 12px 20px;
  background-color: #e8f5e9;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.stock-status i {
  color: #27ae60;
  font-size: 18px;
}

.stock-status span {
  color: #27ae60;
  font-weight: 600;
  font-size: 15px;
}

/* Quantity Selector */
.quantity-selector {
  margin-bottom: 30px;
  display: flex;
  align-items: center;
  gap: 15px;
}

.quantity-selector label {
  font-weight: 600;
  color: #2c3e50;
  font-size: 16px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  overflow: hidden;
}

.qty-btn {
  width: 45px;
  height: 45px;
  border: none;
  background-color: #f8f9fa;
  color: #2c3e50;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 16px;
}

.qty-btn:hover {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.qty-display {
  min-width: 70px;
  height: 45px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #2c3e50;
  background-color: white;
  user-select: none;
  padding: 0 20px;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 15px;
  margin-bottom: 30px;
  flex-wrap: wrap;
}

.action-buttons button {
  padding: 15px 30px;
  border: none;
  border-radius: 50px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.btn-add-to-cart {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  flex: 1;
  justify-content: center;
}

.btn-add-to-cart:hover {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.5);
}

.btn-buy-now {
  background-color: #27ae60;
  color: white;
  flex: 1;
  justify-content: center;
}

.btn-buy-now:hover {
  background-color: #229954;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(39, 174, 96, 0.4);
}

/* Animation for heart */
@keyframes heartBeat {
  0%, 100% { transform: scale(1); }
  25% { transform: scale(1.25); }
  50% { transform: scale(1.1); }
  75% { transform: scale(1.2); }
}

/* Book Meta */
.book-meta {
  border-top: 2px solid #ecf0f1;
  padding-top: 25px;
}

.meta-item {
  margin-bottom: 20px;
}

.meta-item h5 {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-item h5 i {
  color: #f5576c;
}

.meta-item p {
  color: #7f8c8d;
  line-height: 1.6;
  margin-bottom: 0;
}

/* Tabs */
.additional-info {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.nav-tabs {
  border-bottom: 2px solid #ecf0f1;
}

.nav-tabs .nav-link {
  border: none;
  color: #7f8c8d;
  font-weight: 600;
  padding: 15px 30px;
  cursor: pointer;
  background: transparent;
  transition: all 0.3s;
}

.nav-tabs .nav-link:hover {
  color: #f5576c;
  border-bottom: 3px solid #f5576c;
}

.nav-tabs .nav-link.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-bottom: 3px solid #f5576c;
  border-radius: 8px 8px 0 0;
}

.tab-content-wrapper {
  padding: 30px 0;
}

.tab-content-wrapper p {
  color: #7f8c8d;
  line-height: 1.8;
  font-size: 15px;
}

.table {
  margin-bottom: 0;
}

.table th {
  background-color: #f8f9fa;
  color: #2c3e50;
  font-weight: 600;
}

/* Review Styles */
.review-stats-summary {
  background-color: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.average-rating {
  padding: 20px;
}

.rating-number {
  font-size: 64px;
  font-weight: 700;
  color: #f5576c;
  margin-bottom: 10px;
}

.stars-large i {
  font-size: 24px;
  color: #ddd;
  margin: 0 2px;
}

.stars-large i.filled {
  color: #ffc107;
}

.total-reviews {
  color: #7f8c8d;
  margin-top: 10px;
  font-size: 16px;
}

.rating-bars {
  padding: 20px 0;
}

.rating-bar-item {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 12px;
}

.star-label {
  min-width: 60px;
  font-weight: 600;
  color: #2c3e50;
}

.star-label i {
  color: #ffc107;
  font-size: 14px;
}

.rating-bar-item .progress {
  flex: 1;
  height: 12px;
  background-color: #ecf0f1;
  border-radius: 6px;
}

.rating-bar-item .progress-bar {
  background-color: #ffc107;
  border-radius: 6px;
  transition: width 0.3s;
}

.star-count {
  min-width: 40px;
  text-align: right;
  color: #7f8c8d;
  font-size: 14px;
}

/* Add Review Section */
.add-review-section {
  background-color: #f8f9fa;
  padding: 25px;
  border-radius: 12px;
  margin-bottom: 30px;
}

.add-review-section h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}

.add-review-section .alert {
  border-radius: 8px;
  border: none;
  padding: 12px 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.add-review-section .alert-info {
  background-color: #e3f2fd;
  color: #1976d2;
}

.add-review-section .alert i {
  font-size: 18px;
}

.review-form label {
  display: block;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.star-rating-input {
  display: flex;
  gap: 8px;
  margin-top: 10px;
}

.star-rating-input i {
  font-size: 32px;
  cursor: pointer;
  transition: all 0.2s;
  color: #ddd;
}

.star-rating-input i:hover {
  transform: scale(1.2);
}

.star-rating-input i.filled {
  color: #ffc107;
}

.review-form textarea {
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  padding: 12px;
  font-size: 15px;
  resize: vertical;
  transition: border-color 0.3s;
}

.review-form textarea:focus {
  outline: none;
  border-color: #d17057;
  box-shadow: 0 0 0 3px rgba(209, 112, 87, 0.1);
}

.review-form .btn-primary {
  background-color: #d17057;
  border: none;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s;
}

.review-form .btn-primary:hover:not(:disabled) {
  background-color: #b85d47;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(209, 112, 87, 0.4);
}

.review-form .btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.review-form .btn-danger {
  background-color: #e74c3c;
  border: none;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s;
}

.review-form .btn-danger:hover:not(:disabled) {
  background-color: #c0392b;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.review-form .btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.review-form .d-flex {
  display: flex;
}

.review-form .gap-2 {
  gap: 10px;
}

/* Reviews List */
.reviews-list h4 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
}

.review-item {
  background-color: #fff;
  border: 1px solid #ecf0f1;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  transition: box-shadow 0.3s;
}

.review-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.reviewer-info {
  display: flex;
  gap: 15px;
  align-items: center;
}

.reviewer-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d17057;
  font-size: 32px;
}

.reviewer-avatar .avatar-image {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.reviewer-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 5px;
  font-size: 16px;
}

.review-stars i {
  color: #ddd;
  font-size: 14px;
  margin-right: 2px;
}

.review-stars i.filled {
  color: #ffc107;
}

.review-date {
  color: #95a5a6;
  font-size: 14px;
}

.review-content p {
  color: #7f8c8d;
  line-height: 1.8;
  font-size: 15px;
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .book-details-content {
    padding-top: 20px;
  }

  .book-title {
    font-size: 28px;
  }

  .current-price {
    font-size: 28px;
  }

  .book-info {
    padding: 25px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .action-buttons button {
    width: 100%;
  }

  .rating-number {
    font-size: 48px;
  }

  .review-header {
    flex-direction: column;
    gap: 10px;
  }
}
</style>
