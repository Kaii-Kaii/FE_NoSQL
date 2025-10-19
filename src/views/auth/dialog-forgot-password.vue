<template>
    <el-dialog title="Quên mật khẩu" v-model="visible" width="40%">
        <div class="grid grid-cols-4 gap-2 mb-4" v-if="isSent">
            <el-input ref="codeInputs" v-for="(digit, index) in form.code" :key="index" v-model="form.code[index]"
                maxlength="1" class="w-12 h-12 !text-2xl font-bold" @input="focusNext(index)"
                @keypress.enter="submitForm"
                @keydown="onDelete($event, index)" input-style="text-align: center;" />
        </div>
        <el-form v-else ref="formRef" :model="form" label-width="auto" :rules="formRules" @keypress.enter="submitForm"
            @submit.prevent>
            <el-form-item label="Email" class="mb-6" prop="email">
                <el-input v-model="form.email" placeholder="Nhập email"></el-input>
            </el-form-item>
            <span>Vui lòng nhập email để nhận mã pin đặt lại mật khẩu.</span>
        </el-form>
        <template #footer>
            <span class="dialog-footer">
                <el-button @click="visible = false">Hủy</el-button>
                <el-button type="primary" @click="submitForm" :loading="loading">{{ isSent ? 'Xác nhận' : 'Gửi'
                    }}</el-button>
            </span>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, defineExpose } from 'vue';
import { sendCode, verifyCode } from '@/api/auth';
import { ElMessage } from 'element-plus';
import router from '@/router';
import store from '@/store'

const visible = ref(false);
const defaultForm = {
    email: '',
    code: ["", "", "", ""]
};
const form = ref({ ...defaultForm });
const isSent = ref(false);
const codeInputs = ref(null);
const loading = ref(false);
const formRef = ref(null);
const formRules = {
    email: [
        { required: true, message: 'Vui lòng nhập email', trigger: 'blur' },
        { type: 'email', message: 'Email không hợp lệ', trigger: ['blur', 'change'] }
    ],
    code: [
        { required: true, message: 'Vui lòng nhập mã xác nhận', trigger: 'blur' },
        { len: 4, message: 'Mã xác nhận gồm 4 ký tự', trigger: 'blur' }
    ]
};
// ---------------- Methods ----------------
const showDialog = () => {
    visible.value = true;
    isSent.value = false;
    form.value = { ...defaultForm };
};
// Xử lý nhập code
const focusNext = (index) => {
    if (form.value.code[index] && index < form.value.code.length - 1) {
        codeInputs.value[index + 1].focus();
    }
};
// Xử lý phím backspace
const onDelete = (event, index) => {
    if (event.key === "Backspace" && !form.value.code[index] && index > 0) {
        codeInputs.value[index - 1].focus();
    }
};
const submitForm = async () => {
    if (formRef.value){
        formRef.value.validate().then(() => {
            loading.value = true;
            if (!isSent.value) {
                sendCode({ email: form.value.email }).then(() => {
                    ElMessage.success('Mã xác nhận đã được gửi đến email của bạn.');
                    form.value.code = ["", "", "", ""];
                    isSent.value = true;
                }).finally(() => {
                    loading.value = false;
                });
            }
        })
    }
    if (isSent.value) {
        const enteredCode = form.value.code.join('');
        verifyCode({ email: form.value.email, code: enteredCode }).then(() => {
            store.commit('user/SET_CODE', enteredCode);
            router.push({ name: 'reset-password', query: { email: form.value.email, code: enteredCode } });
            visible.value = false;
        }).finally(() => {
            loading.value = false;
        });
    }
};
defineExpose({
    showDialog
});
</script>