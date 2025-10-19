<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-100">
        <div class="bg-white p-8 rounded shadow-md w-full max-w-lg">
            <h2 class="text-2xl font-bold mb-6 text-center">Đổi mật khẩu</h2>
            <el-form :model="form" :rules="formRules" ref="formRef" label-width="auto">
                <el-form-item label="Mật khẩu mới" class="mb-6" prop="newPassword">
                    <el-input v-model="form.newPassword" type="password" placeholder="Nhập mật khẩu mới"></el-input>
                </el-form-item>
                <el-form-item label="Xác nhận mật khẩu mới" class="mb-10" prop="confirmNewPassword">
                    <el-input v-model="form.confirmNewPassword" type="password" placeholder="Xác nhận mật khẩu mới"></el-input>
                </el-form-item>
                <el-button type="primary" class="w-full" @click="submitForm" :loading="loading">Đổi mật khẩu</el-button>
            </el-form>
        </div>
    </div>
</template>


<script setup>
import { ref } from 'vue';
import { resetPassword } from '@/api/auth';
import { ElMessage } from 'element-plus';
import router from '@/router';
import { useRoute } from 'vue-router'
const route = useRoute();
const form = ref({
    email: route.query.email || '',
    newPassword: '',
    confirmNewPassword: '',
    code: route.query.code || ''
})
const formRef = ref(null);
const loading = ref(false);
const formRules = {
    newPassword: [
        { required: true, message: 'Vui lòng nhập mật khẩu mới', trigger: 'blur' },
    ],
    confirmNewPassword: [
        { required: true, message: 'Vui lòng xác nhận mật khẩu mới', trigger: 'blur' },
        {
            validator: (rule, value, callback) => {
                if (value !== form.value.newPassword) {
                    callback(new Error('Mật khẩu xác nhận không khớp'));
                } else {
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]
};
// ---------------- Methods ----------------
const submitForm = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            loading.value = true;
            resetPassword({email: form.value.email, newPassword: form.value.newPassword, code: form.value.code}).then(() => {
                ElMessage.success('Đổi mật khẩu thành công. Vui lòng đăng nhập lại.');
                router.push({ name: 'login' });
            }).finally(() => {
                loading.value = false;
            });
        }
    });
};
</script>