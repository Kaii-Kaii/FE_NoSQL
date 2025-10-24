<template>
    <el-drawer :title="drawerTitle" direction="rtl" v-model="dialogVisible" size="50%">
        <el-form
            ref="formRef"
            :model="form"
            :rules="formRules"
            label-width="140px"
            class="book-form"
            v-loading="detailsLoading"
        >
            <el-form-item label="Mã sách" prop="code">
                <el-input v-model="form.code" :disabled="isEditing" autocomplete="off" />
            </el-form-item>

            <el-form-item label="Tên sách" prop="name">
                <el-input v-model="form.name" autocomplete="off" />
            </el-form-item>

            <el-form-item label="Tác giả">
                <el-input v-model="form.author" autocomplete="off" />
            </el-form-item>

            <el-form-item label="Năm xuất bản">
                <el-input-number v-model="form.publishYear" :min="0" :max="9999" :controls="false" class="number-input" />
            </el-form-item>

            <el-form-item label="Giá bán" prop="price">
                <el-input-number v-model="form.price" :min="0" :step="1000" :controls="false" class="number-input" />
            </el-form-item>

            <el-form-item label="Tồn kho" prop="inStock">
                <el-input-number v-model="form.inStock" :min="0" :controls="false" class="number-input" />
            </el-form-item>

            <el-form-item label="Trạng thái">
                <el-input v-model="form.status" placeholder="Ví dụ: Available" autocomplete="off" />
            </el-form-item>

            <el-form-item label="Ảnh bìa">
                <div class="cover-field">
                    <el-upload
                        class="cover-upload"
                        drag
                        accept="image/*"
                        :auto-upload="false"
                        :show-file-list="false"
                        :on-change="handleCoverChange"
                    >
                        <div class="upload-placeholder">
                            <span class="upload-icon">+</span>
                            <div class="el-upload__text">Kéo thả hoặc bấm để chọn ảnh</div>
                            <div class="el-upload__tip">Định dạng hỗ trợ: jpg, png, webp</div>
                        </div>
                    </el-upload>
                    <div v-if="coverPreview" class="cover-preview">
                        <img :src="coverPreview" alt="Ảnh bìa" />
                        <el-button text type="danger" @click="handleRemoveCover">Xóa ảnh</el-button>
                    </div>
                </div>
            </el-form-item>

            <el-form-item label="Đường dẫn ảnh (tuỳ chọn)">
                <el-input v-model="form.coverUrl" placeholder="https://..." autocomplete="off" />
            </el-form-item>

            <el-form-item label="Mô tả">
                <el-input v-model="form.description" type="textarea" :rows="4" />
            </el-form-item>

            <el-divider>Mã danh mục</el-divider>
            <el-form-item label="Mã danh mục">
                <el-input v-model="form.categoryCode" autocomplete="off" />
            </el-form-item>
            <el-form-item label="Tên danh mục">
                <el-input v-model="form.categoryName" autocomplete="off" />
            </el-form-item>

            <el-divider>Nhà xuất bản</el-divider>
            <el-form-item label="Mã NXB">
                <el-input v-model="form.publisherCode" autocomplete="off" />
            </el-form-item>
            <el-form-item label="Tên NXB">
                <el-input v-model="form.publisherName" autocomplete="off" />
            </el-form-item>
            <el-form-item label="Địa chỉ NXB">
                <el-input v-model="form.publisherAddress" autocomplete="off" />
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="drawer-footer">
                <el-button @click="dialogVisible = false">Hủy</el-button>
                <el-button v-if="isEditing" type="danger" :loading="formLoading" @click="handleDeleteBook">Xóa</el-button>
                <el-button type="primary" :loading="formLoading" @click="submitForm">
                    {{ isEditing ? 'Cập nhật' : 'Thêm mới' }}
                </el-button>
            </div>
        </template>
    </el-drawer>
</template>

<script setup>
import { ref, reactive, computed, defineExpose, defineEmits, nextTick, watch, onBeforeUnmount } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { createAdminBook, updateAdminBook, deleteAdminBook, getAdminBook } from '@/api/book'

const emit = defineEmits(['onSuccess'])

const dialogVisible = ref(false)
const formRef = ref(null)
const formLoading = ref(false)
const detailsLoading = ref(false)
const currentCode = ref('')

const defaultForm = () => ({
    code: '',
    name: '',
    author: '',
    publishYear: new Date().getFullYear(),
    price: 0,
    inStock: 0,
    status: '',
    description: '',
    coverUrl: '',
    coverFile: null,
    categoryCode: '',
    categoryName: '',
    publisherCode: '',
    publisherName: '',
    publisherAddress: ''
})

const form = reactive(defaultForm())
const coverPreview = ref('')

const formRules = {
    code: [{ required: true, message: 'Vui lòng nhập mã sách', trigger: 'blur' }],
    name: [{ required: true, message: 'Vui lòng nhập tên sách', trigger: 'blur' }],
    price: [{ type: 'number', min: 0, message: 'Giá phải lớn hơn hoặc bằng 0', trigger: ['blur', 'change'] }],
    inStock: [{ type: 'number', min: 0, message: 'Tồn kho phải lớn hơn hoặc bằng 0', trigger: ['blur', 'change'] }]
}

const isEditing = computed(() => Boolean(currentCode.value))
const drawerTitle = computed(() => (isEditing.value ? 'Chỉnh sửa sách' : 'Thêm mới sách'))

const resetForm = () => {
    revokePreview()
    Object.assign(form, defaultForm())
}

const revokePreview = () => {
    if (coverPreview.value && coverPreview.value.startsWith('blob:')) {
        URL.revokeObjectURL(coverPreview.value)
    }
    coverPreview.value = ''
}

const normalizeToForm = (raw = {}) => ({
    code: raw.code ?? raw.Code ?? raw.masach ?? raw.MASACH ?? '',
    name: raw.name ?? raw.Name ?? raw.tensach ?? raw.TENSACH ?? '',
    author: raw.author ?? raw.Author ?? raw.tacgia ?? raw.TACGIA ?? '',
    publishYear: Number(raw.publishYear ?? raw.PublishYear ?? raw.namxb ?? raw.NAMXB ?? new Date().getFullYear()),
    price: Number(raw.price ?? raw.Price ?? raw.giatien ?? raw.GIATIEN ?? 0) || 0,
    inStock: Number(raw.inStock ?? raw.InStock ?? raw.soluong ?? raw.SOLUONG ?? 0) || 0,
    status: raw.status ?? raw.Status ?? raw.trangthai ?? raw.TRANGTHAI ?? '',
    description: raw.description ?? raw.MOTA ?? raw.descriptionText ?? '',
    coverUrl: raw.coverUrl ?? raw.CoverUrl ?? raw.anhsach ?? '',
    coverFile: null,
    categoryCode:
        raw.category?.code ?? raw.category?.Code ?? raw.Category?.code ?? raw.Category?.Code ?? raw.MADANHMUC ?? '',
    categoryName:
        raw.category?.name ?? raw.category?.Name ?? raw.Category?.name ?? raw.Category?.Name ?? raw.TENDANHMUC ?? '',
    publisherCode:
        raw.publisher?.code ?? raw.publisher?.Code ?? raw.Publisher?.code ?? raw.Publisher?.Code ?? '',
    publisherName:
        raw.publisher?.name ?? raw.publisher?.Name ?? raw.Publisher?.name ?? raw.Publisher?.Name ?? '',
    publisherAddress:
        raw.publisher?.address ?? raw.publisher?.Address ?? raw.Publisher?.address ?? raw.Publisher?.Address ?? ''
})

const cleanObject = (obj = {}) => {
    const copy = { ...obj }
    Object.keys(copy).forEach((key) => {
        const value = copy[key]
        if (value === '' || value === null || value === undefined) {
            delete copy[key]
        }
    })
    return copy
}

const buildPayload = () => {
    const payload = {
        code: form.code?.trim(),
        name: form.name?.trim(),
        author: form.author?.trim(),
        publishYear: Number(form.publishYear) || 0,
        price: Number(form.price) || 0,
        inStock: Number(form.inStock) || 0,
        status: form.status?.trim(),
        description: form.description?.trim(),
        coverUrl: form.coverUrl?.trim()
    }

    const category = cleanObject({
        code: form.categoryCode?.trim(),
        name: form.categoryName?.trim()
    })

    const publisher = cleanObject({
        code: form.publisherCode?.trim(),
        name: form.publisherName?.trim(),
        address: form.publisherAddress?.trim()
    })

    if (Object.keys(category).length) {
        payload.category = category
    }
    if (Object.keys(publisher).length) {
        payload.publisher = publisher
    }

    if (!payload.description) delete payload.description
    if (!payload.coverUrl) delete payload.coverUrl
    if (!payload.author) delete payload.author
    if (!payload.status) delete payload.status

    if (form.coverFile instanceof File) {
        payload.coverFile = form.coverFile
    }

    return payload
}

const submitForm = () => {
    formRef.value?.validate(async (valid) => {
        if (!valid) return
        formLoading.value = true
        try {
            const payload = buildPayload()
            if (isEditing.value) {
                await updateAdminBook(currentCode.value, payload)
                ElMessage.success('Cập nhật sách thành công')
            } else {
                await createAdminBook(payload)
                ElMessage.success('Thêm mới sách thành công')
            }
            dialogVisible.value = false
            emit('onSuccess')
        } catch (error) {
            console.error('submitForm error', error)
            ElMessage.error(error?.response?.data?.message || 'Không thể lưu sách')
        } finally {
            formLoading.value = false
        }
    })
}

const handleDeleteBook = async () => {
    if (!isEditing.value || !currentCode.value) return
    try {
        await ElMessageBox.confirm('Bạn có chắc muốn xóa sách này?', 'Xác nhận', {
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            type: 'warning'
        })
        formLoading.value = true
        await deleteAdminBook(currentCode.value)
        ElMessage.success('Đã xóa sách')
        dialogVisible.value = false
        emit('onSuccess')
    } catch (error) {
            if (error !== 'cancel' && error !== 'close') {
            console.error('delete book error', error)
            ElMessage.error(error?.response?.data?.message || 'Không thể xóa sách')
        }
    } finally {
        formLoading.value = false
    }
}

const applyFormData = (raw) => {
    const normalized = normalizeToForm(raw)
    Object.assign(form, defaultForm(), normalized)
    coverPreview.value = normalized.coverUrl || ''
}

const showDialog = async (book) => {
    resetForm()
    dialogVisible.value = true
    currentCode.value = book?.code ?? ''

    await nextTick()
    formRef.value?.clearValidate?.()

    if (currentCode.value) {
        detailsLoading.value = true
        try {
            const detail = await getAdminBook(currentCode.value)
            applyFormData(detail?.data ?? detail)
        } catch (error) {
            console.warn('Không tải được chi tiết sách, dùng dữ liệu hiện tại.', error)
            applyFormData(book)
        } finally {
            detailsLoading.value = false
        }
    } else if (book) {
        applyFormData(book)
    }
}

const handleCoverChange = (uploadFile) => {
    if (!uploadFile?.raw) return false
    revokePreview()
    form.coverFile = uploadFile.raw
    coverPreview.value = URL.createObjectURL(uploadFile.raw)
    return false
}

const handleRemoveCover = () => {
    revokePreview()
    form.coverFile = null
    form.coverUrl = ''
}

watch(dialogVisible, (visible) => {
    if (!visible) {
        form.coverFile = null
        revokePreview()
    }
})

onBeforeUnmount(() => {
    revokePreview()
})

defineExpose({ showDialog })
</script>

<style scoped>
.book-form {
    padding-right: 16px;
}

.drawer-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.number-input {
    width: 100%;
}

.cover-field {
    display: flex;
    gap: 16px;
    align-items: flex-start;
    flex-wrap: wrap;
}

.cover-upload {
    width: 220px;
}

.upload-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 12px 0;
    color: #909399;
}

.upload-icon {
    font-size: 28px;
    line-height: 1;
}

.cover-preview {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
}

.cover-preview img {
    max-width: 160px;
    border-radius: 6px;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
}
</style>