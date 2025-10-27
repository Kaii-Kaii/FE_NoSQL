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
                  <el-button plain class="social" @click="handleGoogleSignIn">Google</el-button>
                  <el-button plain class="social">Facebook</el-button>
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
                  <el-button plain class="social" @click="handleGoogleSignIn">Google</el-button>
                  <el-button plain class="social">Facebook</el-button>
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
.auth-switch-page { min-height: 100vh; display:flex; align-items:center; justify-content:center; padding:24px; background: linear-gradient(180deg,#f7fbff,#f3f8ff)}
.auth-container { width:100%; max-width:1100px; display:grid; grid-template-columns: 1fr 1fr; gap:20px; align-items:stretch; transition: transform 0.6s cubic-bezier(.2,.9,.2,1) }
.panel { border-radius: 12px; overflow:hidden }
.left-panel { background: linear-gradient(135deg,#e6f0ff,#f0faf8); padding: 40px; display:flex; align-items:center }
.panel-inner { width:100% }
.brand { font-weight:700; color:#056; font-size:20px; margin-bottom:12px }
.panel-title { font-size:28px; margin:0 0 8px; color:#0b2447 }
.panel-sub { color:#475569 }
.panel-cta { margin-top:20px }

.right-panel { display:flex; align-items:center; justify-content:center }
.forms-wrap { width:100%; overflow:hidden }
.forms { display:flex; width:200%; transition: transform 0.6s cubic-bezier(.2,.9,.2,1) }
.form-card { width:50%; padding:28px; background:#fff; border-radius:12px; box-shadow: 0 6px 24px rgba(16,24,40,0.08); margin-right:20px }
.title { margin:0 0 12px; font-size:22px }
.form { display:flex; flex-direction:column; gap:12px }
.form-actions { display:flex; justify-content:flex-end }
.forgot { color:#1f6feb; cursor:pointer; font-size:13px }
.full-btn { width:100%; padding:10px 12px }
.divider { text-align:center; margin:12px 0; color:#9ca3af }
.socials { display:flex; gap:10px }
.social { flex:1 }
.muted { color:#6b7280; margin-top:10px; text-align:center }
.server-error { color:#e53935; font-size:13px; margin-top:-6px; margin-bottom:6px }

/* When showing register, shift forms left so register card visible */
.auth-container.show-register .forms { transform: translateX(-50%) }

/* Responsive: stack panels */
@media (max-width: 880px) {
  .auth-container { grid-template-columns: 1fr; }
  .forms { width:200%; }
  .form-card { width:100%; margin-right:0 }
  .auth-container.show-register .forms { transform: translateX(-100%) }
}
</style>
