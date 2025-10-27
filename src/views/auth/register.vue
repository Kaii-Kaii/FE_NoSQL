<template>
    <div class="auth-page">
        <div class="auth-split">
            <aside class="promo">
                <div class="promo-inner">
                    <div class="brand">bansach</div>
                    <h2 class="promo-title">Chào mừng</h2>
                    <p class="promo-sub">Tạo tài khoản quản trị để quản lý sách và đơn hàng nhanh chóng.</p>
                </div>
            </aside>

            <main class="form-area">
                <div class="form-card">
                    <h3 class="title">Đăng ký</h3>

                    <el-form ref="formRef" label-width="0" :model="form" :rules="formRules" class="register-form">
                        <el-form-item prop="fullName">
                            <el-input v-model="form.fullName" placeholder="Họ tên" />
                        </el-form-item>
                        <div v-if="serverErrors.fullName" class="server-error">{{ serverErrors.fullName }}</div>

                        <el-form-item prop="username">
                            <el-input v-model="form.username" placeholder="Tên đăng nhập" />
                        </el-form-item>
                        <div v-if="serverErrors.username" class="server-error">{{ serverErrors.username }}</div>

                        <el-form-item prop="email">
                            <el-input v-model="form.email" placeholder="Email" />
                        </el-form-item>
                        <div v-if="serverErrors.email" class="server-error">{{ serverErrors.email }}</div>

                        <el-form-item prop="phone">
                            <el-input v-model="form.phone" placeholder="Số điện thoại" />
                        </el-form-item>
                        <div v-if="serverErrors.phone" class="server-error">{{ serverErrors.phone }}</div>

                        <el-form-item prop="address">
                            <el-input v-model="form.address" placeholder="Địa chỉ" />
                        </el-form-item>
                        <div v-if="serverErrors.address" class="server-error">{{ serverErrors.address }}</div>

                        <el-form-item prop="password">
                            <el-input v-model="form.password" type="password" placeholder="Mật khẩu" show-password />
                        </el-form-item>
                        <div v-if="serverErrors.password" class="server-error">{{ serverErrors.password }}</div>

                                    <el-button type="primary" class="full-btn" @click="handleRegister" :loading="loading">Đăng ký</el-button>

                                    <div class="divider"><span>Hoặc</span></div>
                                    <div class="socials">
                                        <el-button plain class="social" @click="handleGoogleSignIn">Google</el-button>
                                        <el-button plain class="social">Facebook</el-button>
                                    </div>

                                    <p class="muted">Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link></p>
                    </el-form>
                </div>
            </main>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import router from '@/router';
import { register } from '@/api/auth';
import { ElMessage } from 'element-plus';
import { signInWithGooglePopup } from '@/utils/firebase'
import { googleLogin } from '@/api/googleAuth'
import store from '@/store'

const form = ref({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    address: '',
    password: '',
})
const formRef = ref(null);
const loading = ref(false);
const serverErrors = ref({})
const formRules = {
    fullName: [
        { required: true, message: 'Vui lòng nhập họ tên', trigger: 'blur' },
    ],
    username: [
        { required: true, message: 'Vui lòng nhập tên đăng nhập', trigger: 'blur' },
    ],
    email: [
        { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
        { type: 'email', message: 'Email không hợp lệ', trigger: ['blur', 'change'] }
    ],
    phone: [
        { required: true, message: 'Vui lòng nhập số điện thoại', trigger: 'blur' },
    ],
    password: [
        { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
    ],
    address: [
        { required: true, message: 'Vui lòng nhập địa chỉ', trigger: 'blur' },
    ],

};

// ---------------- Methods ----------------
const handleRegister = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            loading.value = true;
            // clear server errors before submit
            serverErrors.value = {}
            // Build payload that matches backend Swagger example exactly.
            // Backend expects: email, password, fullName, phone, address
            const registerData = {
                email: form.value.email,
                password: form.value.password,
                fullName: form.value.fullName,
                phone: form.value.phone,
                address: form.value.address,
            };
            register(registerData).then(() => {
                ElMessage.success('Đăng ký thành công! Vui lòng đăng nhập.');
                router.push({ name: 'login' });
            }).catch((error) => {
                // If API returned structured validation errors, map them to serverErrors
                const respData = error?.response?.data
                const raw = respData?.raw || respData

                // If server includes `errors` object (e.g. { errors: { email: ['msg'] } })
                if (raw && raw.errors && typeof raw.errors === 'object') {
                    Object.keys(raw.errors).forEach(key => {
                        const val = raw.errors[key]
                        serverErrors.value[key] = Array.isArray(val) ? val[0] : val
                    })
                    // show a general toast as well
                    ElMessage.error(respData?.message || 'Vui lòng kiểm tra các trường nhập');
                } else if (respData?.message) {
                    // generic message
                    ElMessage.error(respData.message)
                } else if (respData?.error) {
                    ElMessage.error(respData.error)
                } else {
                    ElMessage.error('Đăng ký thất bại')
                }
            }).finally(() => {
                loading.value = false;
            });
        }
    });

};

const handleGoogleSignIn = async () => {
    try {
        loading.value = true
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
.promo { background: linear-gradient(135deg,#e6f0ff,#f0faf8); border-radius: 12px; padding: 40px }
.promo-inner { width:100% }
.brand { font-weight:700; color:#056; font-size:20px; margin-bottom:12px }
.promo-title { font-size:28px; margin:0 0 8px; color:#0b2447 }
.promo-sub { color:#475569 }
.form-area { display:flex; align-items:center; justify-content:center }
.form-card { background:#fff; padding:28px; border-radius:12px; box-shadow:0 6px 24px rgba(16,24,40,0.08); width:100% }
.title { margin:0 0 12px; font-size:22px }
.register-form { display:flex; flex-direction:column; gap:12px }
.full-btn { width:100%; padding:10px 12px }
.muted { color:#6b7280; margin-top:10px; text-align:center }

.server-error { color: #e53935; font-size: 13px; margin-top: 4px }

@media (max-width: 880px) {
    .auth-split { grid-template-columns: 1fr; }
    .promo { order: 2 }
    .form-area { order: 1 }
}
</style>