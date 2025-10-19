<template>
    <el-drawer :title="form.MASACH ? 'Chỉnh sửa sách' : 'Thêm mới sách'" direction="rtl" v-model="dialogVisible"
        width="50%">
        <el-form :model="form" label-width="auto" class="mt-4" :rules="formRules" ref="formRef">
            <el-form-item label="Tên sách">
                <el-input v-model="form.TENSACH"></el-input>
            </el-form-item>
            <el-form-item label="Giá tiền">
                <el-input v-model.number="form.GIATIEN" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="Trạng thái">
                <el-select v-model="form.TRANGTHAI" placeholder="Chọn trạng thái">
                    <el-option label="Còn hàng" value="1"></el-option>
                    <el-option label="Đang mượn" value="2"></el-option>
                    <el-option label="Hết hàng" value="0"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="Danh mục">
                <el-select v-model="form.MADANHMUC" placeholder="Chọn danh mục">
                    <el-option v-for="category in categorys" :key="category.MADANHMUC" :label="category.TENDANHMUC" :value="category.MADANHMUC"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="Số lượng">
                <el-input v-model.number="form.SOLUONG" type="number" min="0"></el-input>
            </el-form-item>
            <el-form-item label="Mô tả">
                <el-input v-model="form.MOTA" type="textarea" :rows="3"></el-input>
            </el-form-item>
        </el-form>
        <template #footer class="dialog-footer">
            <el-button @click="dialogVisible = false">Hủy</el-button>
            <el-button @click="handleDeleteBook" v-if="form.MASACH" :loading="formLoading" type="danger">Xóa</el-button>
            <el-button type="primary" @click="submitForm" :loading="formLoading">{{ form.MASACH ? 'Cập nhật' : 'Thêm mới' }}</el-button>
        </template>
    </el-drawer>
</template>

<script setup>
import { ref, defineExpose, defineEmits } from 'vue';
import { insertOrUpdateBook, deleteBook } from '@/api/book';
import { getCategory } from '@/api/category';
import { ElMessage } from 'element-plus';
const dialogVisible = ref(false);
const formDefault = {
    MASACH: '',
    TENSACH: '',
    MADANHMUC: '',
    GIATIEN: 0,
    TRANGTHAI: '',
    SOLUONG: 0,
    MOTA: ''
};
const formRef = ref(null);
const form = ref({ ...formDefault });
const emit = defineEmits(['onSuccess']);
const formLoading = ref(false);
const categorys = ref([]);
const formRules = {
    TENSACH: [
        { required: true, message: 'Vui lòng nhập tên sách', trigger: 'blur' },
    ],
    GIATIEN: [
        { required: true, message: 'Vui lòng nhập giá tiền', trigger: 'blur' },
        { type: 'number', min: 0, message: 'Giá tiền phải là số dương', trigger: ['blur', 'change'] }
    ],
    TRANGTHAI: [
        { required: true, message: 'Vui lòng chọn trạng thái', trigger: 'change' },
    ],
    SOLUONG: [
        { required: true, message: 'Vui lòng nhập số lượng', trigger: 'blur' },
        { type: 'number', min: 0, message: 'Số lượng phải là số dương', trigger: ['blur', 'change'] }
    ]
};

// --------- Methods -----------
const showDialog = (book) => {
    form.value = { ...formDefault }
    if (book) {
        form.value = { ...book };
    }
    getCategory().then(res => {
        categorys.value = res.categories;
    });

    dialogVisible.value = true;
};

const submitForm = () => {
    formRef.value.validate((valid) => {
        if (valid) {
            formLoading.value = true;
            insertOrUpdateBook(form.value).then(() => {
                ElMessage({
                    message: form.value.MASACH ? 'Cập nhật sách thành công' : 'Thêm mới sách thành công',
                    type: 'success',
                });
                dialogVisible.value = false;
            }).finally(() => {
                emit('onSuccess');
                formLoading.value = false;
                dialogVisible.value = false;
            });
        } else {
            console.log('error submit!!');
            return false;
        }
    });
};

const handleDeleteBook = () => {
    deleteBook(form.value.MASACH).then(() => {
        ElMessage({
            message: 'Xóa sách thành công',
            type: 'success',
        });
        emit('onSuccess');
    });
    dialogVisible.value = false;
};
defineExpose({
    showDialog
});
</script>