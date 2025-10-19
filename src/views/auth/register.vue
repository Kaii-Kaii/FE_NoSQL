<template>
    <div class="bg-white min-h-screen min-w-screen">
        <div class="bg-white shadow-2xl rounded-lg p-8 max-w-md mx-auto mt-20">
            <h2 class="text-2xl font-bold mb-6 text-center">Đăng ký</h2>
            <el-form ref="formRef" label-width="auto" :model="form" :rules="formRules">
                <el-form-item label="Họ tên" class="mb-6" prop="fullName">
                    <el-input v-model="form.fullName" placeholder="Nhập họ tên"></el-input>
                </el-form-item>
                <el-form-item label="Tên đăng nhập" class="mb-6" prop="username">
                    <el-input v-model="form.username" placeholder="Nhập tên đăng nhập"></el-input>
                </el-form-item>
                <el-form-item label="Email" class="mb-6" prop="email">
                    <el-input v-model="form.email" placeholder="Nhập email"></el-input>
                </el-form-item>
                <el-form-item label="Số điện thoại" class="mb-6" prop="phone">
                    <el-input v-model="form.phone" placeholder="Nhập số điện thoại"></el-input>
                </el-form-item>
                <el-form-item label="Địa chỉ" class="mb-10" prop="address">
                    <el-input v-model="form.address" placeholder="Nhập địa chỉ"></el-input>
                </el-form-item>
                <el-form-item label="Mật khẩu" class="mb-10" prop="password">
                    <el-input v-model="form.password" type="password" placeholder="Nhập mật khẩu"></el-input>
                </el-form-item>
                <el-button type="primary" class="w-full" @click="handleRegister" :loading="loading">Đăng ký</el-button>
            </el-form>
            <p class="my-3 text-sm">Đã có tài khoản?
                <router-link to="/login">
                    <span class="font-bold text-blue-500 underline">Đăng nhập ngay</span>
                </router-link>
            </p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';
import router from '@/router';
import { register } from '@/api/auth';
import { ElMessage } from 'element-plus';

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
            const registerData = {
                fullName: form.value.fullName,
                username: form.value.username,
                email: form.value.email,
                phone: form.value.phone,
                address: form.value.address,
                password: form.value.password,
            };
            register(registerData).then(() => {
                ElMessage.success('Đăng ký thành công! Vui lòng đăng nhập.');
                router.push({ name: 'login' });
            }).catch((error) => {
                ElMessage.error(error.response?.data?.message || 'Đăng ký thất bại');
            }).finally(() => {
                loading.value = false;
            });
        }
    });

};

</script>