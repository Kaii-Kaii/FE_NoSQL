<template>
  <div class="row g-4 mb-20 filter-menu-active">
    <!-- Loading & empty states -->
    <div v-if="isLoading" class="col-12 text-center">
      <p class="text-muted">Đang tải danh mục...</p>
    </div>
    
    <!-- Nút "Tất cả" để xem tất cả sách -->
    <div class="col-xl-2 col-lg-3 col-md-4 col-6">
      <div 
        class="categorie-style1 wow animate__fadeInUp" 
        :class="{ active: selectedCategory === null }"
        @click="selectAllCategories()"
        data-wow-delay="0.20s"
      >
        <img 
          src="/src/assets/img/categoris/catigori-1-6.png" 
          alt="All categories"
          @error="handleImageError"
        >
        <h4 class="categorie-title">Tất cả</h4>
      </div>
    </div>
    <!-- Top categories (analytics) - hiển thị 5 loại sau ô "Tất cả" -->
    <div 
      v-for="(t, idx) in topCategories" 
      :key="`top-${t.categoryCode || t.categoryName || t.category}-${idx}`" 
      class="col-xl-2 col-lg-3 col-md-4 col-6"
    >
      <div 
        class="categorie-style1 wow animate__fadeInUp" 
        :class="{ active: isTopCategoryActive(t) }"
        data-wow-delay="0.22s"
        @click="selectTopCategory(t)"
        style="cursor: pointer;"
      >
        <img 
          :src="getTopCategoryImage(t, idx)" 
          :alt="t.categoryName || t.category"
          @error="handleImageError"
        >
        <h4 class="categorie-title">{{ t.categoryName || t.category }}</h4>
      </div>
    </div>
    
    <div 
      v-for="category in categories" 
      :key="category.MADANHMUC"
      class="col-xl-2 col-lg-3 col-md-4 col-6"
    >
      <div 
        class="categorie-style1 wow animate__fadeInUp" 
        :class="{ active: isCategoryActive(category.MADANHMUC) }"
        @click="selectCategory(category)"
        data-wow-delay="0.30s"
      >
        <img 
          :src="getCategoryImage(category)" 
          :alt="category.TENDANHMUC"
          @error="handleImageError"
        >
        <h4 class="categorie-title">{{ category.TENDANHMUC }}</h4>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getCategory } from '@/api/category'
import { getTopCategories } from '@/api/book'

const categories = ref([])
const selectedCategory = ref(null)
const topCategories = ref([])
const isLoading = ref(true)

const emit = defineEmits(['category-selected'])

const toCodeString = (value) => {
  if (value === undefined || value === null) return null
  const str = String(value).trim()
  return str.length ? str : null
}

const toCompareKey = (value) => {
  const str = toCodeString(value)
  return str ? str.toLowerCase() : ''
}

const isCategoryActive = (code) => {
  return selectedCategory.value !== null && selectedCategory.value === toCodeString(code)
}

const isTopCategoryActive = (top) => {
  const code = resolveTopCategoryCode(top)
  if (code === null) return false
  if (selectedCategory.value === null) return false
  return selectedCategory.value === code
}

// Lấy danh sách categories từ API
const fetchCategories = async () => {
  const hadCategories = categories.value.length > 0
  if (!hadCategories) {
    isLoading.value = true
  }
  try {
  const response = await getCategory()
    
    console.log('Categories API Response:', response)

    // API trả về { categories: [...] }
    if (response?.categories) {
      categories.value = response.categories
    } else if (response?.data?.categories) {
      categories.value = response.data.categories
    } else if (Array.isArray(response)) {
      categories.value = response
    } else if (response?.data && Array.isArray(response.data)) {
      categories.value = response.data
    } else {
      categories.value = []
    }
    
    console.log('Parsed Categories:', categories.value)
    console.log('Categories count:', categories.value.length)
  } catch (error) {
    console.error('Error fetching categories:', error)
    // Keep existing categories so UI doesn't blank out
    // categories.value = []
  }

  // Lấy top categories (analytics) — hiển thị 5 loại sau ô "Tất cả"
  try {
    const top = await getTopCategories(5)
    // Expect: [{ categoryCode, categoryName, totalSold }, ...]
    if (Array.isArray(top)) {
      topCategories.value = top.slice(0, 5)
    } else if (top?.data && Array.isArray(top.data)) {
      topCategories.value = top.data.slice(0, 5)
    } else {
      topCategories.value = []
    }
  } catch (err) {
    console.warn('Unable to load top categories:', err)
    // keep previous top categories when request fails
  }
  if (!hadCategories || categories.value.length) {
    isLoading.value = false
  }
}

// Lấy hình ảnh category - sử dụng đường dẫn tương đối
const getCategoryImage = (category) => {
  // Nếu API trả về URL ảnh
  if (category.URLHINHANH || category.IMAGE || category.image) {
    return category.URLHINHANH || category.IMAGE || category.image
  }
  
  // Fallback về ảnh mặc định dựa theo MADANHMUC
  const defaultImages = {
    1: '/src/assets/img/categoris/catigori-1-1.png',
    2: '/src/assets/img/categoris/catigori-1-2.png',
    3: '/src/assets/img/categoris/catigori-1-3.png',
    4: '/src/assets/img/categoris/catigori-1-4.png',
    5: '/src/assets/img/categoris/catigori-1-5.png',
    6: '/src/assets/img/categoris/catigori-1-6.png',
  }
  
  return defaultImages[category.MADANHMUC] || '/src/assets/img/categoris/catigori-1-1.png'
}

// Lấy ảnh cho top category (nếu backend chỉ trả tên)
const getTopCategoryImage = (top, idx) => {
  // Thử tìm category tương ứng trong danh sách đã tải để dùng ảnh cụ thể
  try {
    const topName = (top.categoryName || top.category || '').toString().trim().toLowerCase()
    const match = categories.value.find(c => {
      const a = (c.TENDANHMUC || '').toString().trim().toLowerCase()
      return a === topName
    })
    if (match) return getCategoryImage(match)
  } catch (e) {
    // ignore
  }

  // Fallback: chọn ảnh mặc định theo index (1..6)
  const fallbackIndex = (idx % 6) + 1
  const fallback = {
    1: '/src/assets/img/categoris/catigori-1-1.png',
    2: '/src/assets/img/categoris/catigori-1-2.png',
    3: '/src/assets/img/categoris/catigori-1-3.png',
    4: '/src/assets/img/categoris/catigori-1-4.png',
    5: '/src/assets/img/categoris/catigori-1-5.png',
    6: '/src/assets/img/categoris/catigori-1-6.png'
  }
  return fallback[fallbackIndex] || '/src/assets/img/categoris/catigori-1-1.png'
}

// Xử lý lỗi ảnh
const handleImageError = (e) => {
  console.log('Image error:', e.target.src)
  e.target.src = '/src/assets/img/categoris/catigori-1-1.png'
}

// Xử lý khi click vào category
const selectCategory = (category) => {
  const code = toCodeString(category.MADANHMUC)
  selectedCategory.value = code
  console.log('Selected category:', category)
  
  // Emit event với MADANHMUC để component cha có thể lọc sách
  emit('category-selected', code)
}

// Xử lý khi click vào top-category (analytics)
const selectTopCategory = (top) => {
  const resolved = resolveTopCategoryCode(top)
  selectedCategory.value = resolved
  emit('category-selected', resolved)
}

// Xử lý khi click "Tất cả" - hiển thị tất cả sách
const selectAllCategories = () => {
  selectedCategory.value = null
  console.log('Show all categories')
  
  // Emit null để hiển thị tất cả sách
  emit('category-selected', null)
}

function resolveTopCategoryCode(top) {
  if (!top) return null
  const directCode = toCodeString(top.categoryCode ?? top.code ?? top.CategoryCode)
  if (directCode) return directCode

  const topNameKey = toCompareKey(top.categoryName ?? top.category ?? top.name)
  if (topNameKey) {
    const match = categories.value.find((c) => toCompareKey(c.TENDANHMUC) === topNameKey)
    if (match) return toCodeString(match.MADANHMUC)
  }

  const fallback = toCodeString(top.categoryName ?? top.category ?? top.name)
  return fallback
}

onMounted(() => {
  console.log('CategoryGrid mounted, fetching categories...')
  fetchCategories()
})
</script>

<style scoped>
.categorie-style1 {
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  padding: 15px;
  border-radius: 8px;
  border: 2px solid transparent;
}

.categorie-style1:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(240, 147, 251, 0.3);
  border-color: #f093fb;
}

.categorie-style1.active {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%);
  border: 2px solid #f5576c;
  border-radius: 8px;
}

.categorie-title {
  text-transform: capitalize;
  margin-top: 10px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.categorie-style1 img {
  width: 100%;
  height: auto;
  max-width: 80px;
  margin: 0 auto;
  display: block;
}
</style>
