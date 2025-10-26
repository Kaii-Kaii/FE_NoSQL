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
                <el-form-item prop="username">
                  <el-input v-model="loginForm.username" placeholder="Tên đăng nhập" clearable />
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
                <el-form-item prop="username">
                  <el-input v-model="registerForm.username" placeholder="Tên đăng nhập" />
                </el-form-item>
                <el-form-item prop="email">
                  <el-input v-model="registerForm.email" placeholder="Email" />
                </el-form-item>
                <el-form-item prop="password">
                  <el-input v-model="registerForm.password" type="password" placeholder="Mật khẩu" show-password />
                </el-form-item>
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
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { register } from '@/api/auth'
import store from '@/store'
import { signInWithGooglePopup } from '@/utils/firebase'
import { googleLogin } from '@/api/googleAuth'

const router = useRouter()
const route = useRoute()

const initialMode = route.name === 'register' ? 'register' : 'login'
const mode = ref(initialMode)

const loginForm = ref({ username: '', password: '' })
const registerForm = ref({ fullName: '', username: '', email: '', password: '' })

const loginFormRef = ref(null)
const registerFormRef = ref(null)

const loginLoading = ref(false)
const registerLoading = ref(false)

const loginRules = {
  username: [{ required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' }],
  password: [{ required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' }]
}
const registerRules = {
  fullName: [{ required: true, message: 'Vui lòng nhập họ tên', trigger: 'blur' }],
  username: [{ required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' }],
  email: [{ required: true, message: 'Vui lòng nhập email', trigger: 'blur' }, { type: 'email', message: 'Email không hợp lệ', trigger: ['blur', 'change'] }],
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
      await store.dispatch('user/login', loginForm.value)
      ElMessage.success('Đăng nhập thành công')
      router.push({ name: 'home' })
    } catch (e) {
      ElMessage.error(e?.response?.data?.message || 'Đăng nhập thất bại')
    } finally {
      loginLoading.value = false
    }
  })
}

const doRegister = () => {
  registerFormRef.value.validate(async (valid) => {
    if (!valid) return
    registerLoading.value = true
    try {
      await register({
        fullName: registerForm.value.fullName,
        username: registerForm.value.username,
        email: registerForm.value.email,
        password: registerForm.value.password
      })
      ElMessage.success('Đăng ký thành công! Vui lòng đăng nhập.')
      // switch to login view
      mode.value = 'login'
      router.replace({ name: 'login' })
    } catch (e) {
      ElMessage.error(e?.response?.data?.message || 'Đăng ký thất bại')
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
  router.push({ name: 'reset-password' })
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
