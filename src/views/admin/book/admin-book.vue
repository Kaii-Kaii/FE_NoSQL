<template>
    <div class="admin-book">
        <div class="header">
            <h1>Quản lý sách</h1>
            <el-button type="primary" @click="handleCreateOrEditBook()">Thêm mới sách</el-button>
        </div>

        <el-card shadow="never" class="content-card">
            <div class="table-toolbar">
                <el-input
                    v-model="searchKeyword"
                    placeholder="Tìm theo mã hoặc tên sách"
                    clearable
                    class="search-input"
                    @clear="handleSearch"
                    @keyup.enter="handleSearch"
                />
                <el-button type="primary" :loading="loading" @click="handleSearch">
                    <i class="fas fa-search" aria-hidden="true"></i>
                    <span>Tìm kiếm</span>
                </el-button>
            </div>

            <div class="table-area">
            <el-table
                v-loading="loading"
                :data="books"
                stripe
                size="large"
                :row-key="row => row.code"
                empty-text="Không có dữ liệu"
            >
                <el-table-column type="index" label="#" width="60" />
                <el-table-column prop="code" label="Mã sách" width="140" />
                <el-table-column prop="name" label="Tên sách" min-width="220" show-overflow-tooltip />
                <el-table-column prop="author" label="Tác giả" min-width="180" show-overflow-tooltip />
                <el-table-column label="Giá bán" width="120">
                    <template #default="scope">
                        {{ formatPrice(scope.row.price) }}
                    </template>
                </el-table-column>
                <el-table-column prop="inStock" label="Tồn kho" width="100" />
                <el-table-column label="Trạng thái" width="150">
                    <template #default="scope">
                        <el-tag :type="statusTagType(scope.row.status)">
                            {{ scope.row.status || 'Không rõ' }}
                        </el-tag>
                    </template>
                </el-table-column>
                <el-table-column label="Thao tác" width="130" fixed="right">
                    <template #default="scope">
                        <el-button size="small" type="primary" plain @click.stop="openDetails(scope.row)">Chi tiết</el-button>
                    </template>
                </el-table-column>
            </el-table>

            <div class="pagination-wrap">
                <el-pagination
                    class="pagination"
                    background
                    layout="prev, pager, next, sizes, total"
                    :current-page="currentPage"
                    :page-sizes="[5, 10, 20, 50]"
                    :page-size="perPage"
                    :total="total"
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                />
            </div>
            </div>
        </el-card>

        <DialogCreateOrEditBook ref="dialogCreateOrEditBook" @on-success="getList" />
        <el-drawer v-model="detailsVisible" size="50%" :title="currentDetail?.name || 'Chi tiết sách'">
            <div v-if="currentDetail" class="detail-content">
                <div v-if="currentDetail.coverUrl" class="detail-cover">
                    <img :src="currentDetail.coverUrl" alt="Ảnh bìa" />
                </div>
                <section class="detail-section">
                    <h3>Thông tin cơ bản</h3>
                    <ul>
                        <li><strong>Mã sách:</strong> {{ currentDetail.code }}</li>
                        <li><strong>Tên sách:</strong> {{ currentDetail.name }}</li>
                        <li v-if="currentDetail.author"><strong>Tác giả:</strong> {{ currentDetail.author }}</li>
                        <li v-if="currentDetail.publishYear"><strong>Năm xuất bản:</strong> {{ currentDetail.publishYear }}</li>
                    </ul>
                </section>
                <section class="detail-section">
                    <h3>Tình trạng & Giá</h3>
                    <ul>
                        <li><strong>Giá bán:</strong> {{ formatPrice(currentDetail.price) }}</li>
                        <li><strong>Tồn kho:</strong> {{ currentDetail.inStock }}</li>
                        <li><strong>Trạng thái:</strong> {{ currentDetail.status || 'Không rõ' }}</li>
                    </ul>
                </section>
                <section class="detail-section">
                    <h3>Danh mục</h3>
                    <ul>
                        <li><strong>Mã danh mục:</strong> {{ currentDetail.category?.code || '—' }}</li>
                        <li><strong>Tên danh mục:</strong> {{ currentDetail.category?.name || '—' }}</li>
                    </ul>
                </section>
                <section class="detail-section">
                    <h3>Nhà xuất bản</h3>
                    <ul>
                        <li><strong>Mã NXB:</strong> {{ currentDetail.publisher?.code || '—' }}</li>
                        <li><strong>Tên NXB:</strong> {{ currentDetail.publisher?.name || '—' }}</li>
                        <li v-if="currentDetail.publisher?.address"><strong>Địa chỉ:</strong> {{ currentDetail.publisher.address }}</li>
                    </ul>
                </section>
                <section v-if="currentDetail.description" class="detail-section">
                    <h3>Mô tả</h3>
                    <p>{{ currentDetail.description }}</p>
                </section>
            </div>
            <template #footer>
                <div class="detail-footer">
                    <el-button @click="detailsVisible = false">Đóng</el-button>
                    <el-button type="primary" @click="handleCreateOrEditBook(currentDetail)">Chỉnh sửa</el-button>
                    <el-button type="danger" @click="deleteBook(currentDetail?.code)">Xóa</el-button>
                </div>
            </template>
        </el-drawer>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminBooks, deleteAdminBook } from '@/api/book'
import DialogCreateOrEditBook from './dialog-create-or-edit-book.vue'

const books = ref([])
const loading = ref(false)
const currentPage = ref(1)
const perPage = ref(10)
const total = ref(0)
const searchKeyword = ref('')
const detailsVisible = ref(false)
const currentDetail = ref(null)

const dialogCreateOrEditBook = ref(null)

const extractList = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.items)) return payload.items
    if (Array.isArray(payload?.records)) return payload.records

    const data = payload?.data
    if (Array.isArray(data)) return data
    if (Array.isArray(data?.items)) return data.items
    if (Array.isArray(data?.records)) return data.records
    return []
}

const resolveTotal = (payload, fallback) => {
    const candidates = [payload, payload?.data]
    for (const source of candidates) {
        if (!source) continue
        const value = source.totalItems ?? source.total ?? source.count ?? source.totalCount
        if (value !== undefined) return Number(value)
    }
    return Number(fallback ?? 0)
}

const resolvePage = (payload, fallback) => {
    const candidates = [payload, payload?.data]
    for (const source of candidates) {
        if (!source) continue
        const value = source.pageIndex ?? source.page ?? source.currentPage ?? source.pageNumber
        if (value !== undefined) return Number(value)
    }
    return Number(fallback ?? 1)
}

const normalizeBook = (raw = {}) => {
    const category = raw.category ?? raw.Category ?? {}
    const publisher = raw.publisher ?? raw.Publisher ?? {}
    return {
        code: raw.code ?? raw.Code ?? raw.masach ?? raw.MASACH ?? '',
        name: raw.name ?? raw.Name ?? raw.tensach ?? raw.TENSACH ?? '',
        author: raw.author ?? raw.Author ?? raw.tacgia ?? raw.TACGIA ?? '',
        description: raw.description ?? raw.MOTA ?? raw.descriptionText ?? '',
        coverUrl: raw.coverUrl ?? raw.CoverUrl ?? raw.anhsach ?? '',
        publishYear: Number(raw.publishYear ?? raw.PublishYear ?? raw.namxb ?? raw.NAMXB ?? 0) || 0,
        price: Number(raw.price ?? raw.Price ?? raw.giatien ?? raw.GIATIEN ?? 0) || 0,
        inStock: Number(raw.inStock ?? raw.InStock ?? raw.soluong ?? raw.SOLUONG ?? 0) || 0,
        status: raw.status ?? raw.Status ?? raw.trangthai ?? raw.TRANGTHAI ?? '',
        category: {
            code: category.code ?? category.Code ?? category.MADANHMUC ?? raw.MADANHMUC ?? '',
            name: category.name ?? category.Name ?? category.TENDANHMUC ?? ''
        },
        publisher: {
            code: publisher.code ?? publisher.Code ?? '',
            name: publisher.name ?? publisher.Name ?? '',
            address: publisher.address ?? publisher.Address ?? ''
        }
    }
}

const formatPrice = (value) => {
    const amount = Number(value || 0)
    return amount.toLocaleString('vi-VN') + '₫'
}

const statusTagType = (status) => {
    if (!status) return 'info'
    const lowered = String(status).toLowerCase()
    if (lowered.includes('het') || lowered.includes('out')) return 'danger'
    if (lowered.includes('dang') || lowered.includes('pre')) return 'warning'
    return 'success'
}

const getList = async () => {
    loading.value = true
    try {
        const response = await getAdminBooks({
            page: currentPage.value,
            pageSize: perPage.value,
            keyword: searchKeyword.value?.trim() || undefined
        })
        const list = extractList(response)
        books.value = list.map((item) => normalizeBook(item))
        total.value = resolveTotal(response, list.length)
        currentPage.value = resolvePage(response, currentPage.value)
    } catch (error) {
        console.error('getAdminBooks error', error)
        ElMessage.error(error?.response?.data?.message || 'Không thể tải danh sách sách')
    } finally {
        loading.value = false
    }
}

const handleCurrentChange = (page) => {
    currentPage.value = page
    getList()
}

const handleSizeChange = (size) => {
    perPage.value = size
    currentPage.value = 1
    getList()
}

const handleSearch = () => {
    currentPage.value = 1
    getList()
}

const handleCreateOrEditBook = (book) => {
    dialogCreateOrEditBook.value?.showDialog(book ? normalizeBook(book) : null)
}

const openDetails = (book) => {
    currentDetail.value = normalizeBook(book)
    detailsVisible.value = true
}

const deleteBook = async (code) => {
    if (!code) return
    try {
        await ElMessageBox.confirm('Bạn có chắc muốn xóa sách này?', 'Xác nhận', {
            confirmButtonText: 'Xóa',
            cancelButtonText: 'Hủy',
            type: 'warning'
        })
    } catch {
        return
    }

    try {
        await deleteAdminBook(code)
        ElMessage.success('Đã xóa sách')
        detailsVisible.value = false
        getList()
    } catch (error) {
        ElMessage.error(error?.response?.data?.message || 'Không thể xóa sách')
    }
}

onMounted(() => {
    getList()
})

defineExpose({ getList })
</script>

<style scoped>
.admin-book {
    display: flex;
    flex-direction: column;
    gap: 16px;
    /* Make the admin book view fit the viewport so the page doesn't scroll; content-card will scroll internally */
    min-height: calc(100vh - 80px);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.header h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
}

.content-card {
    padding: 16px;
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
}

.table-toolbar {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;
}

.search-input {
    max-width: 320px;
}

.pagination {
    margin-top: 16px;
    justify-content: flex-end;
}

.table-area {
    display: flex;
    flex-direction: column;
    gap: 8px;
    /* allow the table and pagination to scroll inside the card */
    overflow: auto;
    flex: 1 1 auto;
}

.pagination-wrap {
    display: flex;
    justify-content: flex-end;
    padding-top: 8px;
    background: transparent;
}

.header {
    position: sticky;
    top: 0;
    z-index: 20;
    background: #fff;
    padding-top: 6px;
    padding-bottom: 6px;
}

.detail-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.detail-cover {
    display: flex;
    justify-content: center;
}

.detail-cover img {
    max-width: 220px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.2);
}

.detail-section {
    background: #f9fafb;
    border-radius: 8px;
    padding: 16px;
}

.detail-section h3 {
    margin-top: 0;
    margin-bottom: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
}

.detail-section ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    color: #4b5563;
    font-size: 14px;
}

.detail-section p {
    margin: 0;
    color: #4b5563;
    line-height: 1.6;
}

.detail-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}
</style>