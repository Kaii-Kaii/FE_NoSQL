<template>
    <div class="auth-page">
        <div class="auth-split">
            <aside class="promo">
                <div class="promo-inner">
                    <div class="brand">bansach</div>
                    <h2 class="promo-title">Chào mừng trở lại</h2>
                    <p class="promo-sub">Quản lý sách, đơn hàng và doanh thu — mọi thứ gọn gàng trong một nơi.</p>
                    <div class="promo-stats">
                        <div class="stat">
                            <div class="stat-value">30+</div>
                            <div class="stat-label">Tính năng</div>
                        </div>
                        <div class="stat">
                            <div class="stat-value">1000+</div>
                            <div class="stat-label">Sản phẩm</div>
                        </div>
                    </div>
                </div>
            </aside>

            <main class="form-area">
                <div class="form-card">
                    <h3 class="title">Đăng nhập</h3>

                    <el-form ref="formRef" label-width="0" :model="form" :rules="formRules" @keypress.enter="login" class="login-form">
                        <el-form-item prop="username">
                            <el-input v-model="form.username" placeholder="Tên đăng nhập" clearable />
                        </el-form-item>

                        <el-form-item prop="password">
                            <el-input v-model="form.password" type="password" placeholder="Mật khẩu" show-password />
                        </el-form-item>

                        <div class="form-actions">
                            <a class="forgot" @click="handleShowDialogForgotPassword">Quên mật khẩu?</a>
                        </div>

                        <el-button type="primary" class="full-btn" @click="login" :loading="loading">Đăng nhập</el-button>

                        <div class="divider"><span>Hoặc</span></div>

                        <div class="socials">
                            <el-button plain class="social" @click="handleGoogleSignIn">Google</el-button>
                            <el-button plain class="social">Facebook</el-button>
                        </div>

                        <p class="muted">Chưa có tài khoản? <router-link to="/register">Đăng ký ngay</router-link></p>
                    </el-form>
                </div>
            </main>
        </div>
        <DialogForgotPassword ref="dialogForgotPassword" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
import store from '@/store'
import DialogForgotPassword from './dialog-forgot-password.vue';
import { signInWithGooglePopup } from '@/utils/firebase'
import { googleLogin } from '@/api/googleAuth'
import { ElMessage } from 'element-plus'

const form = ref({
    username: '',
    password: ''
})
const formRef = ref(null);
const loading = ref(false);
const formRules = {
    username: [
        { required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' },
    ],
    password: [
        { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
    ]
};
const dialogForgotPassword = ref(null);

// ---------------- Methods ----------------
const login = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            loading.value = true;
            store.dispatch('user/login', form.value).finally(() => {
                loading.value = false;
            });
        }
    });

};

const handleShowDialogForgotPassword = () => {
    dialogForgotPassword.value.showDialog();
};

const handleGoogleSignIn = async () => {
    try {
        loading.value = true
        // Sign in via Firebase popup + get ID token
        const { idToken, user } = await signInWithGooglePopup()

        if (!idToken) throw new Error('Không lấy được ID token từ Google')

        // Send idToken to backend to create / verify user and return session token
        const res = await googleLogin(idToken)
        const resData = res?.data ?? res

        if (!resData || !resData.code) {
            throw new Error(resData?.message || 'Đăng nhập Google thất bại')
        }

        // Persist session similar to normal login
        localStorage.setItem('user', JSON.stringify(resData))
        localStorage.setItem('token', resData.code)

        store.commit('user/SET_CODE', resData.code)
        store.commit('user/SET_FULLNAME', resData.fullName)
        store.commit('user/SET_USERNAME', resData.username)
        store.commit('user/SET_ROLE', resData.role)
        store.commit('user/SET_TOKEN', resData.code)

        ElMessage.success('Đăng nhập bằng Google thành công')

        // redirect same as store login
        const isAdmin = (resData?.role || '').toLowerCase() === 'admin'
        const targetRoute = isAdmin ? { name: 'admin-order' } : { name: 'home' }
        // small delay to let message show
        setTimeout(() => {
            // use router via store actions used elsewhere; using location replace to avoid importing router here
            window.location.href = '#/' + (targetRoute.name === 'admin-order' ? 'admin/orders' : '')
        }, 300)
    } catch (error) {
        console.error('Google sign-in failed', error)
        ElMessage.error(error?.response?.data?.message || error.message || 'Đăng nhập Google thất bại')
    } finally {
        loading.value = false
    }
}

</script>

<style scoped>
.auth-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
    background: linear-gradient(180deg,#f7fbff,#f3f8ff);
}
.auth-split {
    width: 100%;
    max-width: 1100px;
    display: grid;
    grid-template-columns: 1fr 480px;
    gap: 24px;
    align-items: stretch;
}
.promo {
    background: linear-gradient(135deg,#e6f0ff,#f0faf8);
    border-radius: 12px;
    padding: 40px;
    display: flex;
    align-items: center;
}
.promo-inner { width: 100%; }
.brand { font-weight: 700; color: #056; font-size: 20px; margin-bottom: 12px; }
.promo-title { font-size: 28px; margin: 0 0 8px; color: #0b2447 }
.promo-sub { color: #475569; margin-bottom: 20px }
.promo-stats { display:flex; gap: 12px }
.stat { background: rgba(255,255,255,0.6); padding: 12px 16px; border-radius: 10px; text-align:center }
.stat-value { font-weight:700; font-size:18px }
.stat-label { font-size:12px; color:#6b7280 }

.form-area { display:flex; align-items:center; justify-content:center }
.form-card { background: #fff; padding: 28px; border-radius: 12px; box-shadow: 0 6px 24px rgba(16,24,40,0.08); width:100% }
.title { margin: 0 0 12px; font-size:22px }
.login-form { display:flex; flex-direction:column; gap:12px }
.form-actions { display:flex; justify-content:flex-end }
.forgot { color:#1f6feb; cursor:pointer; font-size:13px }
.full-btn { width:100%; padding:10px 12px }
.divider { text-align:center; margin:12px 0; color:#9ca3af }
.socials { display:flex; gap:10px }
.social { flex:1 }
.muted { color:#6b7280; margin-top:10px; text-align:center }

@media (max-width: 880px) {
    .auth-split { grid-template-columns: 1fr; }
    .promo { order: 2 }
    .form-area { order: 1 }
}
</style>