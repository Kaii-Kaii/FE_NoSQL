<template>
    <div class="bg-white min-h-screen min-w-screen">
        <div class="bg-white shadow-2xl rounded-lg p-8 max-w-md mx-auto mt-20">
            <h2 class="text-2xl font-bold mb-6 text-center">Đăng nhập</h2>
            <el-form ref="formRef" label-width="auto" :model="form" :rules="formRules" @keypress.enter="login">
                <el-form-item label="Tên đăng nhập" class="mb-6" prop="username">
                    <el-input v-model="form.username" placeholder="Nhập tên đăng nhập"></el-input>
                </el-form-item>
                <el-form-item label="Mật khẩu" class="mb-10" prop="password">
                    <el-input v-model="form.password" type="password" placeholder="Nhập mật khẩu"></el-input>
                </el-form-item>
                <p class="text-sm mb-2 text-right underline text-blue-500 cursor-pointer"
                    @click="handleShowDialogForgotPassword">Quên mật khẩu?</p>
                <el-button type="primary" class="w-full" @click="login" :loading="loading">Đăng nhập</el-button>
            </el-form>
            <p class="my-3 text-sm">Chưa có tài khoản?
                <router-link to="/register">
                    <span class="font-bold text-blue-500 underline">Đăng ký ngay</span>
                </router-link>
            </p>
        </div>
    </div>
    <DialogForgotPassword ref="dialogForgotPassword"></DialogForgotPassword>
</template>

<script setup>
import { ref } from 'vue';
import store from '@/store'
import DialogForgotPassword from './dialog-forgot-password.vue';

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

</script>