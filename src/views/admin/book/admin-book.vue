<template>
    <h1>Quản lý sách</h1>
    <div class="my-3">
        <el-button type="primary" @click="handleCreateOrEditBook(null)">Thêm mới sách</el-button>
    </div>
    <div class="my-5">
        <el-table  height="500" :data="books" style="width: 100%" size="large" class="w-full" @row-click="(row) => { handleCreateOrEditBook(row) }">
            <el-table-column prop="MASACH" label="Mã sách" width="100" />
            <el-table-column prop="TENSACH" label="Tên sách" />
            <el-table-column prop="GIATIEN" label="Giá tiền" />
            <el-table-column prop="TRANGTHAI" label="Trạng thái" />
            <el-table-column prop="SOLUONG" label="Số lượng" />
        </el-table>
        <el-pagination style="margin-top: 20px; text-align: right;" background layout="prev, pager, next, sizes, total"
            :current-page="currentPage" :page-sizes="[5, 10, 20, 50]" :page-size="perPage" :total="total"
            @size-change="handleSizeChange" @current-change="handleCurrentChange" />
    </div>
    <DialogCreateOrEditBook ref="dialogCreateOrEditBook" @on-success="getList"></DialogCreateOrEditBook>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { listBook } from '@/api/book';
import DialogCreateOrEditBook from './dialog-create-or-edit-book.vue';
const books = ref([]);

// Phân trang
const currentPage = ref(1);
const perPage = ref(10);
const total = ref(0);
const dialogCreateOrEditBook = ref(null);

// --------- Methods -----------
const getList = () => {    
    listBook({ per_page: perPage.value, page: currentPage.value }).then(res => {
        books.value = res.data;
        total.value = res.total;
        currentPage.value = res.current_page;
    });

}

// Khi chuyển trang
const handleCurrentChange = (newPage) => {
  currentPage.value = newPage;
  getList();
};

// Khi thay đổi số bản ghi mỗi trang
const handleSizeChange = (newSize) => {    
  perPage.value = newSize;
  currentPage.value = 1;
  getList();

};


const handleCreateOrEditBook = (book) => {
    dialogCreateOrEditBook.value.showDialog(book);
}
onMounted(() => {
    getList();
});

</script>