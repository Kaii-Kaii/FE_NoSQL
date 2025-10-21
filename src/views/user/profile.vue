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
              <div class="avatar-circle">
                <i class="fas fa-user"></i>
              </div>
              <h4 class="user-name mt-3">{{ userInfo.fullName || 'Người dùng' }}</h4>
              <p class="user-email">{{ userInfo.email }}</p>
            </div>
            <div class="profile-menu">
              <a href="#" @click.prevent="activeTab = 'info'" :class="{ active: activeTab === 'info' }">
                <i class="fas fa-user-circle"></i> Thông tin cá nhân
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCustomerByCode, updateCustomer } from '@/api/customer'
import { changePassword as changePasswordApi } from '@/api/auth'
import { ElNotification } from 'element-plus'

const router = useRouter()

const loading = ref(false)
const updating = ref(false)
const changingPassword = ref(false)
const activeTab = ref('info')
const userInfo = ref(null)

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
    const response = await updateCustomer(customerCode, formData.value)

    if (response) {
      ElNotification({
        title: 'Thành công',
        message: 'Cập nhật thông tin thành công!',
        type: 'success'
      })

      // Update localStorage
      const updatedUser = { ...currentUser.value, ...formData.value }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      
      // Refresh user info
      await fetchUserInfo()
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
    const username = currentUser.value?.username
    if (!username) {
      throw new Error('Thiếu thông tin tài khoản')
    }

    await changePasswordApi({
      username,
      oldPassword: passwordForm.value.currentPassword,
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

onMounted(() => {
  fetchUserInfo()
})
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 80px 0 30px 0;
  margin-top: 40px;
}

/* Sidebar */
.profile-sidebar {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 100px;
}

.profile-avatar {
  text-align: center;
  padding-bottom: 20px;
  border-bottom: 2px solid #ecf0f1;
}

.avatar-circle {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #d17057, #b85d47);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  color: white;
  font-size: 48px;
  box-shadow: 0 4px 12px rgba(209, 112, 87, 0.3);
}

.user-name {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  margin-top: 15px;
  margin-bottom: 5px;
}

.user-email {
  color: #7f8c8d;
  font-size: 14px;
  margin: 0;
}

.profile-menu {
  margin-top: 20px;
}

.profile-menu a {
  display: block;
  padding: 12px 15px;
  color: #2c3e50;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.3s;
  font-weight: 500;
}

.profile-menu a:hover {
  background-color: #f8f9fa;
  color: #d17057;
  transform: translateX(5px);
}

.profile-menu a.active {
  background-color: #d17057;
  color: white;
}

.profile-menu a i {
  margin-right: 10px;
  width: 20px;
  text-align: center;
}

/* Content */
.profile-content {
  background: white;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.content-header {
  padding-bottom: 20px;
  border-bottom: 2px solid #ecf0f1;
  margin-bottom: 25px;
}

.content-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
}

.content-header i {
  color: #d17057;
  margin-right: 10px;
}

.content-body {
  padding-top: 10px;
}

/* Form */
.form-group-animated {
  position: relative;
}

.form-label {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  font-size: 14px;
  display: inline-block;
  transition: all 0.3s ease;
}

.form-group-animated:focus-within .form-label {
  color: #ff6347;
  transform: translateX(3px);
}

.form-control {
  border: 2px solid #e0e0e0;
  border-radius: 10px;
  padding: 14px 18px;
  font-size: 15px;
  background-color: #ffffff;
  transition: all 0.3s ease;
  width: 100%;
}

.form-control:hover {
  border-color: #ffb399;
  background-color: #fffbf8;
  box-shadow: 0 2px 8px rgba(255, 127, 80, 0.08);
}

.form-control:focus {
  outline: none;
  border-color: #ff7f50;
  background-color: #fff5f0;
  box-shadow: 0 0 0 5px rgba(255, 127, 80, 0.12), 0 4px 12px rgba(255, 127, 80, 0.15);
  transform: translateY(-2px);
}

select.form-control {
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 15px center;
  padding-right: 40px;
}

select.form-control:focus {
  background-color: #fff5f0;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ff7f50' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
}

textarea.form-control {
  resize: vertical;
  min-height: 100px;
}

textarea.form-control:focus {
  background-color: #fff5f0;
}

input[type="date"].form-control::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: opacity(0.6);
  transition: filter 0.3s ease;
}

input[type="date"].form-control:focus::-webkit-calendar-picker-indicator {
  filter: opacity(1) sepia(0.5) saturate(3) hue-rotate(-10deg);
}

.btn-primary {
  background-color: #d17057;
  border: none;
  padding: 12px 30px;
  border-radius: 50px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  background-color: #b85d47;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(209, 112, 87, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary i {
  margin-right: 8px;
}

/* Responsive */
@media (max-width: 991px) {
  .profile-sidebar {
    position: relative;
    top: 0;
    margin-bottom: 20px;
  }
}

@media (max-width: 576px) {
  .avatar-circle {
    width: 100px;
    height: 100px;
    font-size: 40px;
  }

  .user-name {
    font-size: 18px;
  }

  .profile-content {
    padding: 20px;
  }

  .content-header h3 {
    font-size: 20px;
  }
}
</style>
