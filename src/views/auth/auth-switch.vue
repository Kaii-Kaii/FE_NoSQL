<template>
  <div class="auth-switch-page">
    <div class="auth-container" :class="{ 'show-register': mode === 'register' }">
      <section class="panel left-panel">
        <div class="panel-inner">
          <div class="brand">bansach</div>
          <h2 class="panel-title">Quản lý sách dễ dàng</h2>
          <p class="panel-sub">Quản lý sách, đơn hàng và báo cáo doanh thu trong một giao diện gọn nhẹ.</p>
          <div class="panel-cta">
            <p v-if="mode === 'login'">Chưa có tài khoản?</p>
            <p v-else>Đã có tài khoản?</p>
            <el-button type="primary" @click="toggle">{{ mode === 'login' ? 'Đăng ký' : 'Đăng nhập' }}</el-button>
          </div>
        </div>
      </section>

      <section class="panel right-panel">
        <div class="forms-wrap">
          <div class="forms" ref="formsEl">
            <!-- Login Form -->
            <div class="form-card login-card">
              <h3 class="title">Đăng nhập</h3>
              <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0" class="form">
                <el-form-item prop="email">
                  <el-input v-model="loginForm.email" placeholder="Email" clearable />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input v-model="loginForm.password" type="password" placeholder="Mật khẩu" show-password />
                </el-form-item>
                <div class="form-actions">
                  <a class="forgot" @click="showForgot">Quên mật khẩu?</a>
                </div>
                <el-button type="primary" class="full-btn" @click="doLogin" :loading="loginLoading">Đăng nhập</el-button>
                <div class="divider"><span>Hoặc</span></div>

                <div class="socials">
                  <el-button plain class="social google-btn" @click="handleGoogleSignIn">
                    <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Đăng nhập với Google</span>
                  </el-button>
                </div>
              </el-form>
            </div>

            <!-- Register Form -->
            <div class="form-card register-card">
              <h3 class="title">Đăng ký</h3>
              <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="0" class="form">
                <el-form-item prop="fullName">
                  <el-input v-model="registerForm.fullName" placeholder="Họ tên" />
                </el-form-item>
                <div v-if="registerServerErrors.fullName" class="server-error">{{ registerServerErrors.fullName }}</div>
                <el-form-item prop="email">
                  <el-input v-model="registerForm.email" placeholder="Email" />
                </el-form-item>
                <div v-if="registerServerErrors.email" class="server-error">{{ registerServerErrors.email }}</div>
                <el-form-item prop="phone">
                  <el-input v-model="registerForm.phone" placeholder="Số điện thoại" />
                </el-form-item>
                <div v-if="registerServerErrors.phone" class="server-error">{{ registerServerErrors.phone }}</div>

                <el-form-item prop="address">
                  <el-input v-model="registerForm.address" placeholder="Địa chỉ" />
                </el-form-item>
                <div v-if="registerServerErrors.address" class="server-error">{{ registerServerErrors.address }}</div>
                <el-form-item prop="password">
                  <el-input v-model="registerForm.password" type="password" placeholder="Mật khẩu" show-password />
                </el-form-item>
                <div v-if="registerServerErrors.password" class="server-error">{{ registerServerErrors.password }}</div>
                <el-button type="primary" class="full-btn" @click="doRegister" :loading="registerLoading">Đăng ký</el-button>
                <div class="divider"><span>Hoặc</span></div>
                <div class="socials">
                  <el-button plain class="social google-btn" @click="handleGoogleSignIn">
                    <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Đăng ký với Google</span>
                  </el-button>
                </div>
              </el-form>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>

  <el-dialog v-model="forgotDialogVisible" title="Quên mật khẩu" width="420px">
    <el-form ref="forgotFormRef" :model="forgotForm" :rules="forgotRules" label-width="0" class="form">
      <el-form-item prop="email">
        <el-input v-model="forgotForm.email" placeholder="Nhập email đăng ký" />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="forgotDialogVisible = false">Hủy</el-button>
        <el-button type="primary" :loading="forgotLoading" @click="submitForgot">Gửi email</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register, resendVerification, forgotPassword } from '@/api/auth'
import store from '@/store'
import { signInWithGooglePopup, signInWithEmail } from '@/utils/firebase'
import { googleLogin } from '@/api/googleAuth'

const router = useRouter()
const route = useRoute()

const initialMode = route.name === 'register' ? 'register' : 'login'
const mode = ref(initialMode)

const loginForm = ref({ email: '', password: '' })
const registerForm = ref({ fullName: '', email: '', phone: '', address: '', password: '' })
const registerServerErrors = ref({})
const forgotDialogVisible = ref(false)
const forgotForm = ref({ email: '' })
const forgotFormRef = ref(null)
const forgotLoading = ref(false)
const forgotRules = {
  email: [
    { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
    { type: 'email', message: 'Email không hợp lệ', trigger: ['blur', 'change'] }
  ]
}

const loginFormRef = ref(null)
const registerFormRef = ref(null)

const loginLoading = ref(false)
const registerLoading = ref(false)

const loginRules = {
  email: [{ required: true, message: 'Vui lòng nhập email', trigger: 'blur' }, { type: 'email', message: 'Email không hợp lệ', trigger: ['blur', 'change'] }],
  password: [{ required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' }]
}
const registerRules = {
  fullName: [{ required: true, message: 'Vui lòng nhập họ tên', trigger: 'blur' }],
  // username is generated/optional in this flow
  email: [{ required: true, message: 'Vui lòng nhập email', trigger: 'blur' }, { type: 'email', message: 'Email không hợp lệ', trigger: ['blur', 'change'] }],
  phone: [{ required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' }],
  address: [{ required: true, message: 'Vui lòng nhập địa chỉ', trigger: 'blur' }],
  password: [{ required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' }]
}

const formsEl = ref(null)

const slideToMode = () => {
  // CSS handles slide via parent .show-register class
}

const toggle = () => {
  mode.value = mode.value === 'login' ? 'register' : 'login'
  // update route without reloading component so URL reflects state
  router.replace({ name: mode.value })
}

const doLogin = () => {
  loginFormRef.value.validate(async (valid) => {
    if (!valid) return
    loginLoading.value = true
    try {
      const payload = {
        email: loginForm.value.email,
        password: loginForm.value.password,
        username: loginForm.value.email // backend accepts email or username; send both to be safe
      }
  await store.dispatch('user/login', payload)
    } catch (e) {
        const msg = e?.response?.data?.message || e.message || 'Đăng nhập thất bại'
        ElMessage.error(msg)

        // If error indicates account not verified, attempt to resend verification via Firebase
        try {
          const lower = (msg || '').toLowerCase()
          if (lower.includes('xác minh') || lower.includes('chua xac minh') || lower.includes('chưa xác minh')) {
            // try sign in with Firebase to obtain idToken, then call backend resend-verification
            const { idToken } = await signInWithEmail(loginForm.value.email, loginForm.value.password)
            if (idToken) {
              await resendVerification({ idToken })
              ElMessage.success('Đã gửi lại email xác minh. Vui lòng kiểm tra hộp thư của bạn.')
            }
          }
        } catch (inner) {
          console.warn('Resend verification failed', inner)
        }
    } finally {
      loginLoading.value = false
    }
  })
}

const doRegister = () => {
  registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    registerLoading.value = true
    registerServerErrors.value = {}
    try {
      const payload = {
        email: registerForm.value.email,
        password: registerForm.value.password,
        fullName: registerForm.value.fullName,
        phone: registerForm.value.phone || '',
        address: registerForm.value.address || ''
      }

      const resData = await register(payload)

      ElMessage.success(resData?.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.')
      mode.value = 'login'
      router.replace({ name: 'login' })
    } catch (e) {
      console.error('Register failed', e)
      const respData = e?.response?.data
      const raw = respData?.raw || respData

      let message = respData?.message || respData?.error || e.message || 'Đăng ký thất bại'

      if (raw && raw.errors && typeof raw.errors === 'object') {
        Object.keys(raw.errors).forEach((key) => {
          const val = raw.errors[key]
          registerServerErrors.value[key] = Array.isArray(val) ? val[0] : val
        })
        if (!message || message === 'Đăng ký thất bại') {
          message = 'Vui lòng kiểm tra lại các trường thông tin.'
        }
      } else {
        const lower = String(message).toLowerCase()
        if (lower.includes('email') && (lower.includes('exist') || lower.includes('exit') || lower.includes('đã tồn'))) {
          registerServerErrors.value.email = 'Email đã tồn tại'
          message = 'Email đã tồn tại'
        }
      }

      ElMessage.error(message)
    } finally {
      registerLoading.value = false
    }
  })
}

const handleGoogleSignIn = async () => {
  // set appropriate loading indicator depending on current mode
  const activeLoading = mode.value === 'login' ? loginLoading : registerLoading
  try {
    activeLoading.value = true
    const { idToken } = await signInWithGooglePopup()
    if (!idToken) throw new Error('Không lấy được ID token từ Google')

    const res = await googleLogin(idToken)
    const resData = res?.data ?? res

    if (!resData || !resData.code) {
      throw new Error(resData?.message || 'Đăng nhập Google thất bại')
    }

    localStorage.setItem('user', JSON.stringify(resData))
    localStorage.setItem('token', resData.code)

    store.commit('user/SET_CODE', resData.code)
    store.commit('user/SET_FULLNAME', resData.fullName)
    store.commit('user/SET_USERNAME', resData.username)
    store.commit('user/SET_ROLE', resData.role)
    store.commit('user/SET_TOKEN', resData.code)

    ElMessage.success('Đăng nhập bằng Google thành công')

    const isAdmin = (resData?.role || '').toLowerCase() === 'admin'
    const target = isAdmin ? { name: 'admin-order' } : { name: 'home' }
    setTimeout(() => router.replace(target), 300)
  } catch (error) {
    console.error('Google sign-in failed', error)
    ElMessage.error(error?.response?.data?.message || error.message || 'Đăng nhập Google thất bại')
  } finally {
    activeLoading.value = false
  }
}

const showForgot = () => {
  forgotForm.value.email = loginForm.value.email || ''
  forgotDialogVisible.value = true
}

const submitForgot = () => {
  if (!forgotFormRef.value) return
  forgotFormRef.value.validate(async (valid) => {
    if (!valid) return
    try {
      forgotLoading.value = true
      await forgotPassword({ email: forgotForm.value.email })
      ElMessage.success('Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.')
      forgotDialogVisible.value = false
    } catch (error) {
      const msg = error?.response?.data?.message || error?.response?.data?.error || error.message || 'Gửi email đặt lại mật khẩu thất bại'
      ElMessage.error(msg)
    } finally {
      forgotLoading.value = false
    }
  })
}

onMounted(() => {
  // sync with route if user navigates directly
  mode.value = route.name === 'register' ? 'register' : 'login'
})
</script>

<style scoped>
/* Main Container */
.auth-switch-page { 
  min-height: 100vh; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  padding: 24px; 
  background: linear-gradient(135deg, #ffeef8 0%, #ffe5f1 25%, #fff0f5 50%, #ffeef8 75%, #ffe5f1 100%);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
  position: relative;
  overflow: hidden;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* Floating decoration elements */
.auth-switch-page::before {
  content: '';
  position: absolute;
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(240, 147, 251, 0.15) 0%, transparent 70%);
  border-radius: 50%;
  top: -200px;
  right: -200px;
  animation: float 20s ease-in-out infinite;
}

.auth-switch-page::after {
  content: '';
  position: absolute;
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(245, 87, 108, 0.12) 0%, transparent 70%);
  border-radius: 50%;
  bottom: -150px;
  left: -150px;
  animation: float 18s ease-in-out infinite reverse;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(30px, -30px) rotate(5deg); }
  50% { transform: translate(0, -50px) rotate(0deg); }
  75% { transform: translate(-30px, -30px) rotate(-5deg); }
}

/* Auth Container */
.auth-container { 
  width: 100%; 
  max-width: 1100px; 
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 30px; 
  align-items: stretch; 
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  z-index: 1;
}

/* Panel Base */
.panel { 
  border-radius: 24px; 
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(240, 147, 251, 0.25);
}

/* Left Panel - Brand & Info */
.left-panel { 
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 40px 30px; 
  display: flex; 
  align-items: center;
  position: relative;
  overflow: hidden;
}

.left-panel::before {
  content: '';
  position: absolute;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  top: -100px;
  right: -100px;
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.5; }
  50% { transform: scale(1.2); opacity: 0.8; }
}

.panel-inner { 
  width: 100%;
  position: relative;
  z-index: 1;
}

.brand { 
  font-weight: 800; 
  color: #fff; 
  font-size: 26px; 
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand::before {
  content: '📚';
  font-size: 28px;
}

.panel-title { 
  font-size: 26px; 
  margin: 0 0 10px; 
  color: #fff;
  font-weight: 700;
  line-height: 1.3;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.panel-sub { 
  color: rgba(255, 255, 255, 0.95);
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.panel-cta { 
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.panel-cta p {
  color: rgba(255, 255, 255, 0.95);
  margin-bottom: 12px;
  font-size: 14px;
}

.panel-cta :deep(.el-button) {
  background: white;
  color: #f5576c;
  border: none;
  font-weight: 600;
  padding: 10px 24px;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.panel-cta :deep(.el-button:hover) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

/* Right Panel - Forms */
.right-panel { 
  display: flex; 
  align-items: center; 
  justify-content: center;
  background: white;
  border-radius: 24px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.08);
}

.forms-wrap { 
  width: 100%; 
  overflow: hidden;
  padding: 12px;
}

.forms { 
  display: flex; 
  width: 200%; 
  transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-card { 
  width: 50%; 
  padding: 24px 20px; 
  margin-right: 20px;
}

.title { 
  margin: 0 0 16px; 
  font-size: 28px;
  font-weight: 800;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(245, 87, 108, 0.1);
}

.form { 
  display: flex; 
  flex-direction: column; 
  gap: 10px;
}

/* Form Item Styling */
.form :deep(.el-form-item) {
  margin-bottom: 0;
}

.form :deep(.el-input__wrapper) {
  border-radius: 12px;
  padding: 10px 14px;
  box-shadow: 0 2px 8px rgba(240, 147, 251, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.2);
}

.form :deep(.el-input__wrapper.is-focus) {
  border-color: #f5576c;
  box-shadow: 0 4px 16px rgba(245, 87, 108, 0.25);
}

.form :deep(.el-input__inner) {
  font-size: 15px;
}

.form-actions { 
  display: flex; 
  justify-content: flex-end;
  margin: 4px 0;
}

.forgot { 
  color: #f5576c; 
  cursor: pointer; 
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.forgot:hover {
  color: #f093fb;
  text-decoration: underline;
}

/* Primary Button */
.full-btn { 
  width: 100%; 
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 12px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  color: white;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(245, 87, 108, 0.3);
  margin-top: 4px;
}

.full-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 24px rgba(245, 87, 108, 0.4);
  background: linear-gradient(135deg, #f5576c 0%, #f093fb 100%);
}

.full-btn:active {
  transform: translateY(0);
}

/* Divider */
.divider { 
  text-align: center; 
  margin: 16px 0 12px; 
  color: #9ca3af;
  position: relative;
  font-size: 13px;
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: linear-gradient(to right, transparent, #e5e7eb, transparent);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.divider span {
  background: white;
  padding: 0 12px;
  position: relative;
}

/* Social Buttons */
.socials { 
  display: flex; 
  gap: 12px;
  justify-content: center;
}

.social { 
  flex: 1;
  border-radius: 12px;
  padding: 10px 16px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #374151;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-width: 200px;
}

.social:hover {
  border-color: #f093fb;
  color: #f5576c;
  background: rgba(240, 147, 251, 0.05);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(240, 147, 251, 0.2);
}

.google-btn {
  position: relative;
}

.google-icon {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.google-btn:hover .google-icon {
  transform: scale(1.1);
}

.google-btn span {
  font-size: 14px;
  font-weight: 600;
}

/* Server Error Messages */
.server-error { 
  color: #ef4444; 
  font-size: 12px; 
  margin-top: -6px; 
  margin-bottom: 2px;
  padding-left: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.server-error::before {
  content: '⚠';
  font-size: 14px;
}

/* Animation States */
.auth-container.show-register .forms { 
  transform: translateX(-50%);
}

/* Dialog Styling */
:deep(.el-dialog) {
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

:deep(.el-dialog__header) {
  padding: 24px 24px 16px;
  border-bottom: 1px solid #f3f4f6;
}

:deep(.el-dialog__title) {
  font-size: 20px;
  font-weight: 600;
  color: #1f2937;
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 24px;
  border-top: 1px solid #f3f4f6;
}

/* Responsive Design */
@media (max-width: 880px) {
  .auth-container { 
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .left-panel {
    padding: 40px 30px;
  }
  
  .brand {
    font-size: 28px;
  }
  
  .panel-title {
    font-size: 26px;
  }
  
  .forms { 
    width: 200%; 
  }
  
  .form-card { 
    width: 100%; 
    margin-right: 0;
    padding: 30px 20px;
  }
  
  .auth-container.show-register .forms { 
    transform: translateX(-100%);
  }
}

@media (max-width: 640px) {
  .auth-switch-page {
    padding: 16px;
  }
  
  .left-panel {
    padding: 30px 24px;
  }
  
  .brand {
    font-size: 24px;
  }
  
  .panel-title {
    font-size: 22px;
  }
  
  .title {
    font-size: 24px;
  }
  
  .form-card {
    padding: 24px 16px;
  }
}
</style>
