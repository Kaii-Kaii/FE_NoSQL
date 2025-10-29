<template>
    <el-dialog v-model="visible" width="480px" :show-close="false" class="forgot-password-dialog">
        <div class="dialog-content">
            <!-- Header -->
            <div class="dialog-header">
                <div class="icon-wrapper">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                    </svg>
                </div>
                <h2 class="title">Quên mật khẩu</h2>
                <p class="subtitle" v-if="!isSent">Nhập email của bạn để nhận mã xác nhận</p>
                <p class="subtitle" v-else>Nhập mã 4 số đã được gửi đến email</p>
            </div>

            <!-- Code Input -->
            <div class="code-section" v-if="isSent">
                <div class="code-inputs">
                    <input 
                        ref="codeInputs"
                        v-for="(digit, index) in form.code" 
                        :key="index" 
                        v-model="form.code[index]"
                        maxlength="1" 
                        type="text"
                        class="code-input"
                        @input="focusNext(index)"
                        @keypress.enter="submitForm"
                        @keydown="onDelete($event, index)"
                    />
                </div>
                <p class="resend-text">
                    Không nhận được mã? 
                    <button type="button" @click="resendCode" class="resend-link">Gửi lại</button>
                </p>
            </div>

            <!-- Email Form -->
            <el-form v-else ref="formRef" :model="form" :rules="formRules" @keypress.enter="submitForm" @submit.prevent class="email-form">
                <el-form-item prop="email">
                    <el-input 
                        v-model="form.email" 
                        placeholder="Nhập email đăng ký"
                        size="large"
                        prefix-icon="Message"
                    />
                </el-form-item>
            </el-form>

            <!-- Actions -->
            <div class="dialog-actions">
                <button @click="visible = false" class="btn btn-cancel">
                    Hủy
                </button>
                <button @click="submitForm" :disabled="loading" class="btn btn-submit">
                    <span v-if="loading" class="loader"></span>
                    <span v-else>{{ isSent ? 'Xác nhận' : 'Gửi email' }}</span>
                </button>
            </div>
        </div>
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
// Resend code
const resendCode = async () => {
    if (!form.value.email) return;
    loading.value = true;
    try {
        await sendCode({ email: form.value.email });
        ElMessage.success('Mã xác nhận đã được gửi lại.');
        form.value.code = ["", "", "", ""];
        if (codeInputs.value?.[0]) {
            codeInputs.value[0].focus();
        }
    } catch (error) {
        ElMessage.error('Không thể gửi lại mã. Vui lòng thử lại.');
    } finally {
        loading.value = false;
    }
};
const submitForm = async () => {
    if (formRef.value && !isSent.value){
        formRef.value.validate().then(() => {
            loading.value = true;
            sendCode({ email: form.value.email }).then(() => {
                ElMessage.success('Mã xác nhận đã được gửi đến email của bạn.');
                form.value.code = ["", "", "", ""];
                isSent.value = true;
                setTimeout(() => {
                    if (codeInputs.value?.[0]) {
                        codeInputs.value[0].focus();
                    }
                }, 100);
            }).catch(() => {
                ElMessage.error('Không thể gửi email. Vui lòng thử lại.');
            }).finally(() => {
                loading.value = false;
            });
        }).catch(() => {
            // Validation failed
        });
    } else if (isSent.value) {
        const enteredCode = form.value.code.join('');
        if (enteredCode.length !== 4) {
            ElMessage.error('Vui lòng nhập đủ 4 số mã xác nhận.');
            return;
        }
        loading.value = true;
        verifyCode({ email: form.value.email, code: enteredCode }).then(() => {
            store.commit('user/SET_CODE', enteredCode);
            router.push({ name: 'reset-password', query: { email: form.value.email, code: enteredCode } });
            visible.value = false;
        }).catch(() => {
            ElMessage.error('Mã xác nhận không đúng.');
        }).finally(() => {
            loading.value = false;
        });
    }
};
defineExpose({
    showDialog
});
</script>

<style scoped>
/* Dialog Overlay */
:deep(.el-dialog) {
    border-radius: 24px;
    overflow: hidden;
    padding: 0;
    background: transparent;
    box-shadow: 0 20px 60px rgba(245, 87, 108, 0.3);
}

:deep(.el-dialog__header) {
    display: none;
}

:deep(.el-dialog__body) {
    padding: 0;
}

/* Dialog Content */
.dialog-content {
    background: linear-gradient(135deg, rgba(240, 147, 251, 0.05) 0%, rgba(245, 87, 108, 0.05) 100%);
    padding: 40px 32px 32px;
    position: relative;
    overflow: hidden;
}

.dialog-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

/* Header */
.dialog-header {
    text-align: center;
    margin-bottom: 32px;
}

.icon-wrapper {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: pulse 2s ease-in-out infinite;
    box-shadow: 0 8px 24px rgba(245, 87, 108, 0.3);
}

.icon-wrapper svg {
    width: 40px;
    height: 40px;
    color: white;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 8px 24px rgba(245, 87, 108, 0.3);
    }
    50% {
        transform: scale(1.05);
        box-shadow: 0 12px 32px rgba(245, 87, 108, 0.4);
    }
}

.title {
    font-size: 28px;
    font-weight: 800;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 12px;
    letter-spacing: -0.5px;
}

.subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
    line-height: 1.5;
}

/* Code Section */
.code-section {
    margin-bottom: 24px;
}

.code-inputs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 16px;
}

.code-input {
    width: 100%;
    height: 64px;
    font-size: 32px;
    font-weight: 700;
    text-align: center;
    border: 2px solid #e0e0e0;
    border-radius: 12px;
    background: white;
    transition: all 0.3s ease;
    color: #333;
}

.code-input:focus {
    outline: none;
    border-color: #f5576c;
    box-shadow: 0 0 0 4px rgba(245, 87, 108, 0.1);
    transform: translateY(-2px);
}

.code-input:not(:placeholder-shown) {
    border-color: #f093fb;
    background: linear-gradient(135deg, rgba(240, 147, 251, 0.05) 0%, rgba(245, 87, 108, 0.05) 100%);
}

.resend-text {
    text-align: center;
    font-size: 14px;
    color: #666;
    margin: 0;
}

.resend-link {
    background: none;
    border: none;
    color: #f5576c;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    text-decoration: none;
    transition: all 0.3s ease;
}

.resend-link:hover:not(:disabled) {
    color: #f093fb;
    text-decoration: underline;
}

.resend-link:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Email Form */
.email-form {
    margin-bottom: 24px;
}

:deep(.el-form-item) {
    margin-bottom: 0;
}

:deep(.el-input__wrapper) {
    padding: 12px 16px;
    border-radius: 12px;
    border: 2px solid #e0e0e0;
    transition: all 0.3s ease;
    background: white;
}

:deep(.el-input__wrapper:hover) {
    border-color: #f093fb;
}

:deep(.el-input__wrapper.is-focus) {
    border-color: #f5576c;
    box-shadow: 0 0 0 4px rgba(245, 87, 108, 0.1);
}

:deep(.el-input__inner) {
    font-size: 15px;
    color: #333;
}

:deep(.el-input__inner::placeholder) {
    color: #999;
}

:deep(.el-input__prefix) {
    color: #999;
}

:deep(.el-input__wrapper.is-focus .el-input__prefix) {
    color: #f5576c;
}

/* Dialog Actions */
.dialog-actions {
    display: flex;
    gap: 12px;
    margin-top: 24px;
}

.btn {
    flex: 1;
    padding: 12px 20px;
    border-radius: 12px;
    font-size: 15px;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-cancel {
    background: #f5f5f5;
    color: #666;
}

.btn-cancel:hover:not(:disabled) {
    background: #e0e0e0;
    transform: translateY(-1px);
}

.btn-submit {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    color: white;
    box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.btn-submit:hover:not(:disabled) {
    box-shadow: 0 6px 16px rgba(245, 87, 108, 0.4);
    transform: translateY(-2px);
}

.btn-submit:active:not(:disabled) {
    transform: translateY(0);
}

/* Loader */
.loader {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.6s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 640px) {
    :deep(.el-dialog) {
        width: 90% !important;
        margin: 0 auto;
    }

    .dialog-content {
        padding: 32px 24px 24px;
    }

    .icon-wrapper {
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
    }

    .icon-wrapper svg {
        width: 32px;
        height: 32px;
    }

    .title {
        font-size: 24px;
    }

    .subtitle {
        font-size: 13px;
    }

    .code-inputs {
        gap: 8px;
    }

    .code-input {
        height: 56px;
        font-size: 28px;
        border-radius: 10px;
    }

    .btn {
        padding: 11px 18px;
        font-size: 14px;
    }
}
</style>
