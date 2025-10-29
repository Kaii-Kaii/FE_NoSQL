<template>
  <div class="profile-page">
    <div class="container py-5">
      <!-- Loading State -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-3">Đang tải thông tin...</p>
      </div>

      <!-- Profile Content -->
      <div v-else-if="userInfo" class="row g-4">
        <!-- Sidebar -->
        <div class="col-lg-3">
          <div class="profile-sidebar">
            <div class="profile-avatar">
              <div class="avatar-circle" :class="{ 'with-image': !!displayAvatar }">
                <img v-if="displayAvatar" :src="displayAvatar" alt="Avatar" />
                <i v-else class="fas fa-user"></i>
              </div>
              <h4 class="user-name mt-3">{{ userInfo.fullName || 'Người dùng' }}</h4>
              <p class="user-email">{{ userInfo.email }}</p>
            </div>
            <div class="profile-menu">
              <a href="#" @click.prevent="activeTab = 'info'" :class="{ active: activeTab === 'info' }">
                <i class="fas fa-user-circle"></i> Thông tin cá nhân
              </a>
              <a href="#" @click.prevent="activeTab = 'orders'" :class="{ active: activeTab === 'orders' }">
                <i class="fas fa-shopping-bag"></i> Lịch sử đơn hàng
              </a>
              <a href="#" @click.prevent="activeTab = 'password'" :class="{ active: activeTab === 'password' }">
                <i class="fas fa-lock"></i> Đổi mật khẩu
              </a>
              <a href="#" @click.prevent="handleLogout">
                <i class="fas fa-sign-out-alt"></i> Đăng xuất
              </a>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-lg-9">
          <!-- Personal Info Tab -->
          <div v-show="activeTab === 'info'" class="profile-content">
            <div class="content-header">
              <h3><i class="fas fa-user-circle"></i> Thông tin cá nhân</h3>
            </div>
            <div class="content-body">
              <form @submit.prevent="updateProfile">
                <div class="row g-3">
                  <div class="col-12 form-group-animated">
                    <label class="form-label">Ảnh đại diện</label>
                    <div class="avatar-upload">
                      <div class="avatar-preview" :class="{ 'has-image': !!displayAvatar }">
                        <img v-if="displayAvatar" :src="displayAvatar" alt="Avatar preview">
                        <i v-else class="fas fa-user"></i>
                      </div>
                      <div class="avatar-actions">
                        <label class="btn btn-outline-secondary">
                          <i class="fas fa-upload"></i>
                          Chọn ảnh
                          <input
                            ref="avatarInputRef"
                            type="file"
                            class="d-none"
                            accept="image/*"
                            @change="handleAvatarChange"
                          >
                        </label>
                        <button
                          v-if="(displayAvatar && !removeAvatar) || avatarFileUrl"
                          type="button"
                          class="btn btn-outline-danger"
                          @click="handleRemoveAvatar"
                        >
                          <i class="fas fa-trash"></i>
                          Xóa ảnh
                        </button>
                        <button
                          v-if="avatarFileUrl"
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="handleCancelNewAvatar"
                        >
                          <i class="fas fa-undo"></i>
                          Hủy ảnh mới
                        </button>
                        <button
                          v-if="removeAvatar && originalAvatarUrl"
                          type="button"
                          class="btn btn-outline-secondary"
                          @click="handleRestoreAvatar"
                        >
                          <i class="fas fa-undo-alt"></i>
                          Khôi phục ảnh cũ
                        </button>
                      </div>
                    </div>
                    <p class="form-text text-muted mt-2">
                      Hỗ trợ định dạng JPG, PNG (tối đa 5MB).
                      <span v-if="removeAvatar" class="text-danger fw-semibold">Ảnh hiện tại sẽ bị xóa khi lưu.</span>
                    </p>
                  </div>
                  <div class="col-md-6 form-group-animated">
                    <label class="form-label">Họ và tên</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="formData.fullName"
                      placeholder="Nhập họ tên"
                    >
                  </div>
                  <div class="col-md-6 form-group-animated">
                    <label class="form-label">Email</label>
                    <input 
                      type="email" 
                      class="form-control" 
                      v-model="formData.email"
                      placeholder="Nhập email"
                      readonly
                    >
                  </div>
                  <div class="col-md-6 form-group-animated">
                    <label class="form-label">Số điện thoại</label>
                    <input 
                      type="text" 
                      class="form-control" 
                      v-model="formData.phone"
                      placeholder="Nhập số điện thoại"
                    >
                  </div>
                  <div class="col-12 form-group-animated">
                    <label class="form-label">Địa chỉ</label>
                    <textarea 
                      class="form-control" 
                      v-model="formData.address"
                      rows="3"
                      placeholder="Nhập địa chỉ"
                    ></textarea>
                  </div>
                  <div class="col-12">
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="updating"
                    >
                      <i class="fas fa-save"></i>
                      {{ updating ? 'Đang cập nhật...' : 'Cập nhật thông tin' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          <!-- Order History Tab -->
          <div v-show="activeTab === 'orders'" class="profile-content">
            <div class="content-header">
              <h3><i class="fas fa-shopping-bag"></i> Lịch sử đơn hàng</h3>
            </div>
            <div class="content-body">
              <OrderHistory :customer-code="customerCode" :active="activeTab === 'orders'" />
            </div>
          </div>

          <!-- Change Password Tab -->
          <div v-show="activeTab === 'password'" class="profile-content">
            <div class="content-header">
              <h3><i class="fas fa-lock"></i> Đổi mật khẩu</h3>
            </div>
            <div class="content-body">
              <form @submit.prevent="changePassword">
                <div class="row g-3">
                  <div class="col-12 form-group-animated">
                    <label class="form-label">Mật khẩu hiện tại</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      v-model="passwordForm.currentPassword"
                      placeholder="Nhập mật khẩu hiện tại"
                    >
                  </div>
                  <div class="col-12 form-group-animated">
                    <label class="form-label">Mật khẩu mới</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      v-model="passwordForm.newPassword"
                      placeholder="Nhập mật khẩu mới"
                    >
                  </div>
                  <div class="col-12 form-group-animated">
                    <label class="form-label">Xác nhận mật khẩu mới</label>
                    <input 
                      type="password" 
                      class="form-control" 
                      v-model="passwordForm.confirmPassword"
                      placeholder="Nhập lại mật khẩu mới"
                    >
                  </div>
                  <div class="col-12">
                    <button 
                      type="submit" 
                      class="btn btn-primary"
                      :disabled="changingPassword"
                    >
                      <i class="fas fa-key"></i>
                      {{ changingPassword ? 'Đang đổi...' : 'Đổi mật khẩu' }}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <!-- Not Logged In -->
      <div v-else class="text-center py-5">
        <i class="fas fa-user-times" style="font-size: 64px; color: #ddd;"></i>
        <h3 class="mt-4">Bạn chưa đăng nhập</h3>
        <p class="text-muted">Vui lòng đăng nhập để xem thông tin cá nhân</p>
        <router-link to="/login" class="btn btn-primary mt-3">
          <i class="fas fa-sign-in-alt"></i> Đăng nhập
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { getCustomerByCode, updateCustomer } from '@/api/customer'
import { changePassword as changePasswordApi } from '@/api/auth'
import { ElNotification } from 'element-plus'
import OrderHistory from './components/order-history.vue'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const updating = ref(false)
const changingPassword = ref(false)
const activeTab = ref('info')
const userInfo = ref(null)
const avatarInputRef = ref(null)
const avatarFile = ref(null)
const avatarFileUrl = ref('')
const originalAvatarUrl = ref('')
const removeAvatar = ref(false)

const formData = ref({
  fullName: '',
  email: '',
  phone: '',
  address: ''
})

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const MAX_AVATAR_SIZE = 5 * 1024 * 1024 // 5MB limit
const allowedTabs = ['info', 'orders', 'password']

const displayAvatar = computed(() => {
  if (avatarFileUrl.value) return avatarFileUrl.value
  if (removeAvatar.value) return ''
  return originalAvatarUrl.value
})

const syncActiveTabFromRoute = () => {
  const queryTab = typeof route.query.tab === 'string' ? route.query.tab : ''
  if (queryTab && allowedTabs.includes(queryTab) && queryTab !== activeTab.value) {
    activeTab.value = queryTab
  }
}

const resolveAvatarUrl = (avatar) => {
  if (!avatar) return ''
  const value = String(avatar)
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('/')) return value
  if (value.startsWith('uploads/')) return `/${value}`
  // Fallback path; adjust if backend returns specific folder
  return `/uploads/avatars/${value}`
}

const clearAvatarSelection = () => {
  if (avatarFileUrl.value) {
    URL.revokeObjectURL(avatarFileUrl.value)
    avatarFileUrl.value = ''
  }
  avatarFile.value = null
  if (avatarInputRef.value) {
    avatarInputRef.value.value = ''
  }
}

const resetAvatarState = (newOriginal) => {
  clearAvatarSelection()
  removeAvatar.value = false
  originalAvatarUrl.value = newOriginal ? resolveAvatarUrl(newOriginal) : ''
}

const updateCachedUser = (partial) => {
  try {
    const stored = localStorage.getItem('user')
    const base = stored ? JSON.parse(stored) : {}
    const updated = { ...base, ...partial }
    localStorage.setItem('user', JSON.stringify(updated))
  } catch (e) {
    console.warn('Không thể cập nhật bộ nhớ phiên người dùng:', e)
  }
}

// Get current user from localStorage
const currentUser = computed(() => {
  try {
    const userStr = localStorage.getItem('user')
    console.log('currentUser computed - localStorage user:', userStr)
    if (userStr) {
      const user = JSON.parse(userStr)
      console.log('Parsed user:', user)
      return user
    }
  } catch (e) {
    console.error('Error parsing user:', e)
  }
  console.log('currentUser is null')
  return null
})

const customerCode = computed(() => currentUser.value?.code || '')

// Get customer code from current user
const getCustomerCode = () => {
  const code = currentUser.value?.code
  console.log('getCustomerCode called, returning:', code)
  return code || null
}

// Fetch user info
const fetchUserInfo = async () => {
  const customerCode = getCustomerCode()
  
  console.log('Fetching user info for code:', customerCode)
  
  // If no customer code, use localStorage data directly
  if (!customerCode) {
    console.log('No customer code found, using localStorage data')
    if (currentUser.value) {
      userInfo.value = { ...currentUser.value }
      formData.value = {
        fullName: currentUser.value.fullName || '',
        email: currentUser.value.email || '',
        phone: currentUser.value.phone || '',
        address: currentUser.value.address || ''
      }
      resetAvatarState(currentUser.value.avatar)
      console.log('Set userInfo from localStorage:', userInfo.value)
    } else {
      console.log('No currentUser data available')
    }
    return
  }

  loading.value = true
  try {
    const response = await getCustomerByCode(customerCode)
    
    console.log('Customer API response:', response)
    
    // Check if response has data (not null/undefined/empty object)
    if (response && typeof response === 'object' && Object.keys(response).length > 0) {
      userInfo.value = response
      // Load data vào form - map từ API response with fallbacks
      formData.value = {
        fullName: response.fullName || response.name || currentUser.value?.fullName || '',
        email: response.email || currentUser.value?.email || '',
        phone: response.phone || response.dienthoai || currentUser.value?.phone || '',
        address: response.address || response.diachi || currentUser.value?.address || ''
      }
      resetAvatarState(response.avatar || response.avatarUrl || response.avatarPath)
      updateCachedUser({
        fullName: formData.value.fullName,
        email: formData.value.email,
        phone: formData.value.phone,
        address: formData.value.address,
        avatar: response.avatar || response.avatarUrl || response.avatarPath || null
      })
      console.log('Customer info loaded from API:', userInfo.value)
    } else {
      // Fallback to localStorage data
      console.log('API returned empty or invalid, using localStorage')
      if (currentUser.value) {
        userInfo.value = { ...currentUser.value }
        formData.value = {
          fullName: currentUser.value.fullName || '',
          email: currentUser.value.email || '',
          phone: currentUser.value.phone || '',
          address: currentUser.value.address || ''
        }
        resetAvatarState(currentUser.value.avatar)
      }
    }
  } catch (error) {
    console.error('Error fetching customer info:', error)
    // Use localStorage data as fallback
    console.log('Error occurred, using localStorage fallback')
    if (currentUser.value) {
      userInfo.value = { ...currentUser.value }
      formData.value = {
        fullName: currentUser.value.fullName || '',
        email: currentUser.value.email || '',
        phone: currentUser.value.phone || '',
        address: currentUser.value.address || ''
      }
      resetAvatarState(currentUser.value.avatar)
    }
  } finally {
    loading.value = false
  }
}

// Update profile
const updateProfile = async () => {
  const customerCode = getCustomerCode()
  if (!customerCode) return

  updating.value = true
  try {
    const payload = {
      fullName: formData.value.fullName,
      email: formData.value.email,
      phone: formData.value.phone,
      address: formData.value.address,
      removeAvatar: removeAvatar.value,
    }

    if (avatarFile.value) {
      payload.avatarFile = avatarFile.value
    }

    const response = await updateCustomer(customerCode, payload)

    if (response) {
      ElNotification({
        title: 'Thành công',
        message: 'Cập nhật thông tin thành công!',
        type: 'success'
      })

      // Refresh user info và đặt lại trạng thái avatar
      await fetchUserInfo()
      clearAvatarSelection()
      removeAvatar.value = false
    }
  } catch (error) {
    console.error('Error updating profile:', error)
    ElNotification({
      title: 'Lỗi',
      message: error.response?.data?.message || 'Có lỗi khi cập nhật thông tin',
      type: 'error'
    })
  } finally {
    updating.value = false
  }
}

const handleAvatarChange = (event) => {
  try {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      ElNotification({
        title: 'Lỗi',
        message: 'Vui lòng chọn tệp hình ảnh hợp lệ',
        type: 'error'
      })
      clearAvatarSelection()
      return
    }

    if (file.size > MAX_AVATAR_SIZE) {
      ElNotification({
        title: 'Lỗi',
        message: 'Ảnh tối đa 5MB',
        type: 'error'
      })
      clearAvatarSelection()
      return
    }

    clearAvatarSelection()
    avatarFile.value = file
    avatarFileUrl.value = URL.createObjectURL(file)
    removeAvatar.value = false
  } catch (error) {
    console.error('handleAvatarChange error:', error)
    clearAvatarSelection()
  }
}

const handleRemoveAvatar = () => {
  clearAvatarSelection()
  removeAvatar.value = Boolean(originalAvatarUrl.value)
}

const handleCancelNewAvatar = () => {
  clearAvatarSelection()
  removeAvatar.value = false
}

const handleRestoreAvatar = () => {
  removeAvatar.value = false
  clearAvatarSelection()
}

// Change password
const changePassword = async () => {
  if (!passwordForm.value.currentPassword || !passwordForm.value.newPassword) {
    ElNotification({
      title: 'Lỗi',
      message: 'Vui lòng điền đầy đủ thông tin',
      type: 'warning'
    })
    return
  }

  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    ElNotification({
      title: 'Lỗi',
      message: 'Mật khẩu xác nhận không khớp',
      type: 'warning'
    })
    return
  }

  if (passwordForm.value.newPassword.length < 6) {
    ElNotification({
      title: 'Lỗi',
      message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      type: 'warning'
    })
    return
  }

  changingPassword.value = true
  try {
    const email = currentUser.value?.email
    if (!email) {
      throw new Error('Thiếu thông tin email tài khoản')
    }

    await changePasswordApi({
      email,
      currentPassword: passwordForm.value.currentPassword,
      newPassword: passwordForm.value.newPassword
    })

    ElNotification({
      title: 'Thành công',
      message: 'Đổi mật khẩu thành công',
      type: 'success'
    })

    // Reset form
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    console.error('Error changing password:', error)
    ElNotification({
      title: 'Lỗi',
      message: error.response?.data?.message || error.message || 'Có lỗi khi đổi mật khẩu',
      type: 'error'
    })
  } finally {
    changingPassword.value = false
  }
}

// Logout
const handleLogout = () => {
  try {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    
    ElNotification({
      title: 'Thành công',
      message: 'Đăng xuất thành công!',
      type: 'success'
    })
    
    router.push('/login')
  } catch (error) {
    console.error('Error logging out:', error)
  }
}

watch(
  () => route.query.tab,
  () => {
    syncActiveTabFromRoute()
  }
)

watch(activeTab, (tab) => {
  if (!allowedTabs.includes(tab)) return
  const currentTab = typeof route.query.tab === 'string' ? route.query.tab : undefined
  if (tab === 'info' && !currentTab) return
  if (currentTab === tab) return
  const nextQuery = { ...route.query }
  if (tab === 'info') {
    delete nextQuery.tab
  } else {
    nextQuery.tab = tab
  }
  router.replace({ name: 'profile', query: nextQuery }).catch(() => {})
})

onMounted(() => {
  syncActiveTabFromRoute()
  fetchUserInfo()
})

onUnmounted(() => {
  clearAvatarSelection()
})
</script>

<style scoped>
/* Animations */
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

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 100px 0 50px 0;
  position: relative;
  overflow: hidden;
}

.profile-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
  opacity: 0.3;
  pointer-events: none;
}

.profile-page > .container {
  position: relative;
  z-index: 1;
}

/* Loading State */
.spinner-border {
  width: 50px;
  height: 50px;
  border-width: 4px;
}

/* Sidebar */
.profile-sidebar {
  background: white;
  border-radius: 20px;
  padding: 35px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 100px;
  animation: slideInLeft 0.6s ease-out;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.profile-avatar {
  text-align: center;
  padding-bottom: 25px;
  border-bottom: 2px solid rgba(245, 87, 108, 0.2);
  position: relative;
}

.avatar-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
  font-size: 56px;
  box-shadow: 0 8px 25px rgba(245, 87, 108, 0.4);
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  border: 4px solid white;
}

.avatar-circle:hover {
  transform: scale(1.08);
  box-shadow: 0 12px 35px rgba(245, 87, 108, 0.5);
}

.avatar-circle::after {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  z-index: -1;
  opacity: 0.3;
  filter: blur(10px);
}

.avatar-circle.with-image {
  background: white;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.avatar-circle.with-image::after {
  display: none;
}

.avatar-circle.with-image img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.user-name {
  font-size: 22px;
  font-weight: 700;
  color: #2c3e50;
  margin-top: 20px;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.user-email {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
  font-weight: 500;
}

.profile-menu {
  margin-top: 25px;
}

.profile-menu a {
  display: flex;
  align-items: center;
  padding: 15px 18px;
  color: #2c3e50;
  text-decoration: none;
  border-radius: 12px;
  margin-bottom: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-weight: 600;
  font-size: 15px;
  position: relative;
  overflow: hidden;
}

.profile-menu a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 4px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  transform: scaleY(0);
  transition: transform 0.3s ease;
}

.profile-menu a:hover {
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%);
  color: #f5576c;
  transform: translateX(8px);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.15);
}

.profile-menu a:hover::before {
  transform: scaleY(1);
}

.profile-menu a.active {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
  transform: translateX(8px);
}

.profile-menu a.active::before {
  display: none;
}

.profile-menu a i {
  margin-right: 12px;
  width: 22px;
  text-align: center;
  font-size: 18px;
}

/* Content */
.profile-content {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.6s ease-out;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  min-height: 500px;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-wrap: wrap;
  padding: 25px;
  background: linear-gradient(135deg, rgba(240, 147, 251, 0.05) 0%, rgba(245, 87, 108, 0.05) 100%);
  border-radius: 16px;
  border: 2px dashed rgba(245, 87, 108, 0.3);
}

.avatar-preview {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  color: #95a5a6;
  border: 3px solid white;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.avatar-preview:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.avatar-preview.has-image {
  background: white;
  border-color: rgba(245, 87, 108, 0.3);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  display: block;
}

.avatar-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.btn-outline-secondary,
.btn-outline-danger {
  padding: 10px 20px;
  border-radius: 10px;
  font-weight: 600;
  font-size: 14px;
  transition: all 0.3s ease;
  border: 2px solid;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 140px;
  flex: 1;
}

.btn-outline-secondary {
  border-color: #f5576c;
  color: #f5576c;
  background: white;
}

.btn-outline-secondary:hover {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
}

.btn-outline-danger {
  border-color: #e74c3c;
  color: #e74c3c;
  background: white;
}

.btn-outline-danger:hover {
  background: #e74c3c;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(231, 76, 60, 0.4);
}

.content-header {
  padding-bottom: 25px;
  border-bottom: 3px solid;
  border-image: linear-gradient(90deg, #f093fb 0%, #f5576c 100%) 1;
  margin-bottom: 30px;
  animation: fadeInUp 0.6s ease-out;
}

.content-header h3 {
  font-size: 28px;
  font-weight: 700;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: inline-flex;
  align-items: center;
  gap: 12px;
}

.content-header i {
  font-size: 32px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.content-body {
  padding-top: 10px;
  animation: fadeInUp 0.6s ease-out 0.1s backwards;
}

/* Form */
.form-group-animated {
  position: relative;
  animation: fadeInUp 0.5s ease-out backwards;
}

.form-group-animated:nth-child(1) { animation-delay: 0.1s; }
.form-group-animated:nth-child(2) { animation-delay: 0.15s; }
.form-group-animated:nth-child(3) { animation-delay: 0.2s; }
.form-group-animated:nth-child(4) { animation-delay: 0.25s; }
.form-group-animated:nth-child(5) { animation-delay: 0.3s; }
.form-group-animated:nth-child(6) { animation-delay: 0.35s; }

.form-label {
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 10px;
  font-size: 14px;
  display: inline-block;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-group-animated:focus-within .form-label {
  color: #f5576c;
  transform: translateX(3px);
}

.form-control {
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 15px;
  background-color: #ffffff;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
  font-weight: 500;
}

.form-control:hover {
  border-color: #f5576c;
  background-color: rgba(245, 87, 108, 0.02);
  box-shadow: 0 4px 12px rgba(245, 87, 108, 0.08);
}

.form-control:focus {
  outline: none;
  border-color: #f5576c;
  background-color: rgba(245, 87, 108, 0.05);
  box-shadow: 0 0 0 4px rgba(245, 87, 108, 0.1), 0 6px 20px rgba(245, 87, 108, 0.15);
  transform: translateY(-2px);
}

.form-control:readonly {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

select.form-control {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23f5576c' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  padding-right: 45px;
}

textarea.form-control {
  resize: vertical;
  min-height: 120px;
  line-height: 1.6;
}

.form-text {
  font-size: 13px;
  margin-top: 8px;
  display: block;
}

.btn-primary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  padding: 14px 35px;
  border-radius: 50px;
  font-weight: 700;
  font-size: 15px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  position: relative;
  overflow: hidden;
}

.btn-primary::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: width 0.6s, height 0.6s;
}

.btn-primary:hover:not(:disabled)::before {
  width: 300px;
  height: 300px;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
  transform: translateY(-3px);
  box-shadow: 0 10px 30px rgba(245, 87, 108, 0.5);
}

.btn-primary:active:not(:disabled) {
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.btn-primary i {
  margin-right: 10px;
  position: relative;
  z-index: 1;
}

/* Not Logged In State */
.text-center.py-5 {
  animation: fadeInUp 0.6s ease-out;
}

.text-center.py-5 i {
  color: rgba(255, 255, 255, 0.5);
  animation: pulse 2s ease-in-out infinite;
}

.text-center.py-5 h3 {
  color: white;
  font-weight: 700;
  font-size: 32px;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.text-center.py-5 p {
  color: rgba(255, 255, 255, 0.9);
  font-size: 16px;
}

/* Responsive */
@media (max-width: 991px) {
  .profile-sidebar {
    position: relative;
    top: 0;
    margin-bottom: 30px;
    animation: fadeInUp 0.6s ease-out;
  }
  
  .profile-content {
    animation: fadeInUp 0.6s ease-out 0.2s backwards;
  }
}

@media (max-width: 768px) {
  .profile-page {
    padding: 80px 0 30px 0;
  }
  
  .avatar-circle {
    width: 120px;
    height: 120px;
    font-size: 48px;
  }

  .user-name {
    font-size: 20px;
  }

  .profile-content {
    padding: 25px;
  }

  .content-header h3 {
    font-size: 24px;
  }
  
  .avatar-upload {
    padding: 20px;
  }
  
  .avatar-preview {
    width: 90px;
    height: 90px;
    font-size: 32px;
  }
}

@media (max-width: 576px) {
  .profile-sidebar {
    padding: 25px;
  }
  
  .profile-content {
    padding: 20px;
  }
  
  .avatar-actions {
    width: 100%;
  }
  
  .avatar-actions .btn {
    flex: 1;
    min-width: 0;
  }
  
  .form-control {
    padding: 14px 16px;
  }
  
  .btn-primary {
    width: 100%;
    padding: 14px 25px;
  }
}
</style>
