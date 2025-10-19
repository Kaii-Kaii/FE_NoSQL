<template>
  <div class="row g-4 mb-40 filter-menu-active">
    <!-- Debug info -->
    <div v-if="categories.length === 0" class="col-12 text-center">
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
          src="/src/assets/img/categoris/catigori-1-1.png" 
          alt="All categories"
          @error="handleImageError"
        >
        <h4 class="categorie-title">Tất cả</h4>
      </div>
    </div>
    
    <div 
      v-for="category in categories" 
      :key="category.MADANHMUC"
      class="col-xl-2 col-lg-3 col-md-4 col-6"
    >
      <div 
        class="categorie-style1 wow animate__fadeInUp" 
        :class="{ active: selectedCategory === category.MADANHMUC }"
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

const categories = ref([])
const selectedCategory = ref(null)

// Lấy danh sách categories từ API
const fetchCategories = async () => {
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
    categories.value = []
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

// Xử lý lỗi ảnh
const handleImageError = (e) => {
  console.log('Image error:', e.target.src)
  e.target.src = '/src/assets/img/categoris/catigori-1-1.png'
}

// Xử lý khi click vào category
const selectCategory = (category) => {
  selectedCategory.value = category.MADANHMUC
  console.log('Selected category:', category)
  
  // Emit event với MADANHMUC để component cha có thể lọc sách
  emit('category-selected', category.MADANHMUC)
}

// Xử lý khi click "Tất cả" - hiển thị tất cả sách
const selectAllCategories = () => {
  selectedCategory.value = null
  console.log('Show all categories')
  
  // Emit null để hiển thị tất cả sách
  emit('category-selected', null)
}

// Emit để gửi event lên component cha
const emit = defineEmits(['category-selected'])

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
}

.categorie-style1:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.categorie-style1.active {
  background-color: #f0f0f0;
  border: 2px solid #d17057;
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


<style scoped>
.categorie-style1 {
  cursor: pointer;
  transition: all 0.3s ease;
}

.categorie-style1:hover {
  transform: translateY(-5px);
}

.categorie-style1.active {
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
