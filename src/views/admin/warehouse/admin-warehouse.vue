<template>
    <div class="admin-warehouse">
        <header class="page-header">
            <div class="header-content">
                <div class="icon-wrapper">
                    <i class="fa-solid fa-warehouse"></i>
                </div>
                <div>
                    <h1>Quản lý kho hàng</h1>
                    <p class="subtitle">Nhập hàng và theo dõi lịch sử</p>
                </div>
            </div>
            <el-button type="primary" size="large" plain :loading="historyLoading" @click="loadHistory" class="refresh-btn">
                <i class="fa-solid fa-sync-alt"></i>
                <span>Làm mới</span>
            </el-button>
        </header>

        <section class="insight-strip">
            <article class="insight-card">
                <div class="insight-icon primary">
                    <i class="fas fa-clipboard-list"></i>
                </div>
                <div class="insight-meta">
                    <span class="insight-label">Tổng phiếu nhập</span>
                    <strong>{{ formatNumber(historyInsights.totalInvoices) }}</strong>
                    <small v-if="historyInsights.visibleInvoices">Hiển thị: {{ historyInsights.visibleInvoices }}</small>
                </div>
            </article>
            <article class="insight-card">
                <div class="insight-icon success">
                    <i class="fas fa-coins"></i>
                </div>
                <div class="insight-meta">
                    <span class="insight-label">Tổng giá trị (đang hiển thị)</span>
                    <strong>{{ formatCurrency(historyInsights.totalAmount) }}</strong>
                    <small v-if="historyInsights.totalQuantity">{{ formatNumber(historyInsights.totalQuantity) }} sản phẩm</small>
                    <small v-else>Chưa có dữ liệu</small>
                </div>
            </article>
            <article class="insight-card">
                <div class="insight-icon info">
                    <i class="fas fa-clock"></i>
                </div>
                <div class="insight-meta">
                    <span class="insight-label">Phiếu gần nhất</span>
                    <strong>{{ historyInsights.lastCreatedAt ? formatDate(historyInsights.lastCreatedAt) : 'Chưa có' }}</strong>
                    <small v-if="dateRange?.length">Theo bộ lọc ngày hiện tại</small>
                    <small v-else>Chưa lọc ngày</small>
                </div>
            </article>
        </section>

        <div class="content-grid">
            <el-card shadow="never" class="import-card">
                <div class="card-header">
                    <h2>Phiếu nhập mới</h2>
                </div>

                <div class="card-scroll import-scroll">
                    <div class="picker-row">
                        <label class="picker-label" for="book-search">Tìm sách để nhập</label>
                        <el-autocomplete
                            id="book-search"
                            v-model="bookQuery"
                            :fetch-suggestions="searchBooks"
                            :debounce="300"
                            :trigger-on-focus="false"
                            :loading="suggestionLoading"
                            clearable
                            placeholder="Nhập tên hoặc mã sách"
                            size="large"
                            :popper-class="'book-suggestion-popper'"
                            @keyup.enter="handleSearchEnter"
                            @clear="handleClearSuggestions"
                            @select="handleSelectBook"
                        >
                            <template #prefix>
                                <i class="fas fa-search"></i>
                            </template>
                            <template #default="{ item }">
                                <div class="suggestion-item">
                                    <strong>{{ item.code }}</strong>
                                    <div class="suggestion-meta">
                                        <span class="suggestion-name">{{ item.name }}</span>
                                        <span v-if="item.inStock !== null" class="suggestion-stock">Tồn: {{ item.inStock }}</span>
                                    </div>
                                    <span v-if="item.suggestPrice" class="suggestion-price">{{ formatCurrency(item.suggestPrice) }}</span>
                                </div>
                            </template>
                            <template #empty>
                                <div class="suggestion-empty">
                                    <i class="fas fa-book"></i>
                                    <span>Không tìm thấy sách phù hợp</span>
                                </div>
                            </template>
                        </el-autocomplete>
                    </div>

                    <div class="import-items" v-loading="submitLoading">
                        <el-empty
                            v-if="!importItems.length"
                            description="Chưa có sách nào được chọn"
                        >
                            <template #image>
                                <i class="fas fa-box-open"></i>
                            </template>
                        </el-empty>
                        <transition-group
                            v-else
                            name="list-fade"
                            tag="div"
                            class="import-row-list"
                        >
                            <div class="import-row" v-for="item in importItems" :key="item.bookCode">
                                <div class="import-row-head">
                                    <div class="import-row-info">
                                        <span class="import-code">{{ item.bookCode || 'Không có mã' }}</span>
                                        <span class="import-name">{{ item.bookName }}</span>
                                        <span v-if="item.inStock !== null" class="import-stock">Tồn kho: {{ formatNumber(item.inStock) }}</span>
                                    </div>
                                    <el-button size="small" type="danger" text @click="removeItem(item.bookCode)">
                                        <i class="fas fa-trash"></i>
                                    </el-button>
                                </div>
                                <div class="import-row-fields">
                                    <div class="import-field">
                                        <label>Giá nhập</label>
                                        <el-input
                                            v-model="item.unitPrice"
                                            type="number"
                                            min="0"
                                            inputmode="decimal"
                                            placeholder="0"
                                            @focus="handleFieldFocus(item, 'unitPrice')"
                                            @blur="handleFieldBlur(item, 'unitPrice')"
                                        >
                                            <template #suffix>₫</template>
                                        </el-input>
                                        <el-link
                                            v-if="item.suggestPrice"
                                            type="primary"
                                            :underline="false"
                                            @click="applySuggestPrice(item)"
                                        >
                                            Dùng gợi ý {{ formatCurrency(item.suggestPrice) }}
                                        </el-link>
                                    </div>
                                    <div class="import-field">
                                        <label>Số lượng</label>
                                        <el-input-number
                                            v-model.number="item.quantity"
                                            :min="1"
                                            :max="9999"
                                            controls-position="right"
                                            size="large"
                                            @focus="handleFieldFocus(item, 'quantity')"
                                            @change="handleQuantityChange(item)"
                                        />
                                    </div>
                                    <div class="import-field import-field-total">
                                        <label>Thành tiền</label>
                                        <strong>{{ formatCurrency(Number(item.quantity || 0) * Number(item.unitPrice || 0)) }}</strong>
                                    </div>
                                </div>
                            </div>
                        </transition-group>
                    </div>

                    <div v-if="importItems.length" class="import-summary">
                        <div class="summary-line">
                            <span>Tổng đầu sách:</span>
                            <strong>{{ importItems.length }}</strong>
                        </div>
                        <div class="summary-line">
                            <span>Tổng số lượng:</span>
                            <strong>{{ totalQuantity }}</strong>
                        </div>
                        <div class="summary-line">
                            <span>Giá trị nhập:</span>
                            <strong>{{ formatCurrency(totalAmount) }}</strong>
                        </div>
                    </div>
                </div>

                <div class="note-row">
                    <label for="import-note">Ghi chú</label>
                    <el-input
                        id="import-note"
                        v-model="note"
                        type="textarea"
                        placeholder="Nhập ghi chú cho phiếu nhập"
                        :rows="3"
                        maxlength="500"
                        show-word-limit
                    />
                </div>

                <div class="action-row">
                    <el-button v-if="importItems.length" type="danger" text class="action-clear" @click="clearImportItems">
                        Xóa tất cả sách đã chọn
                    </el-button>
                    <el-button type="primary" :loading="submitLoading" :disabled="!canSubmit" @click="submitImport">
                        Tạo phiếu nhập
                    </el-button>
                </div>
            </el-card>

            <el-card shadow="never" class="history-card">
                <div class="card-header">
                    <h2>Lịch sử nhập kho</h2>
                </div>

                <div class="card-scroll">
                    <div class="history-header">
                        <el-date-picker
                            v-model="dateRange"
                            type="daterange"
                            unlink-panels
                            range-separator="đến"
                            start-placeholder="Từ ngày"
                            end-placeholder="Đến ngày"
                            value-format="YYYY-MM-DD"
                            size="large"
                            :disabled="historyLoading"
                            @change="handleDateChange"
                        />
                    </div>

                    <div class="history-tools">
                        <el-input
                            v-model="historyKeyword"
                            clearable
                            placeholder="Tìm nhanh theo mã phiếu"
                            size="large"
                        >
                            <template #prefix>
                                <i class="fas fa-search"></i>
                            </template>
                        </el-input>
                    </div>

                    <div class="history-list" v-loading="historyLoading">
                        <el-empty v-if="!filteredHistory.length && !historyLoading" :description="historyEmptyText">
                            <template #image>
                                <i class="fas fa-clipboard-list"></i>
                            </template>
                        </el-empty>
                        <transition-group v-else name="list-fade" tag="div" class="history-items">
                            <article class="history-item" v-for="record in filteredHistory" :key="record.code">
                                <div class="history-item-main">
                                    <div class="history-item-meta">
                                        <span class="history-code">{{ record.code }}</span>
                                        <time class="history-time">{{ formatDate(record.importDate) }}</time>
                                    </div>
                                    <el-button size="small" type="primary" plain @click="showDetail(record.code)">Chi tiết</el-button>
                                </div>
                                <div class="history-item-extra">
                                    <span v-if="record.totalQuantity">SL: {{ formatNumber(record.totalQuantity) }}</span>
                                    <span v-if="record.totalAmount">Giá trị: {{ formatCurrency(record.totalAmount) }}</span>
                                </div>
                            </article>
                        </transition-group>
                    </div>

                    <div class="pagination-row" v-if="historyTotal > historyPageSize">
                        <el-pagination
                            background
                            layout="prev, pager, next, sizes, total"
                            :page-size="historyPageSize"
                            :current-page="historyPage"
                            :total="historyTotal"
                            :page-sizes="[5, 10, 20, 50]"
                            @current-change="handleHistoryPageChange"
                            @size-change="handleHistorySizeChange"
                        />
                    </div>
                </div>
            </el-card>
        </div>
        <el-drawer v-model="detailVisible" size="45%" title="Chi tiết phiếu nhập" class="import-detail-drawer">
            <template v-if="detailLoading">
                <div class="drawer-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <span>Đang tải chi tiết...</span>
                </div>
            </template>
            <template v-else>
                <section v-if="currentImport" class="drawer-summary">
                    <div class="summary-header">
                        <span class="drawer-code">{{ currentImport.code }}</span>
                        <p class="drawer-subtitle">{{ formatDate(currentImport.importDate) }}</p>
                    </div>
                    <div class="summary-meta">
                        <div class="summary-box">
                            <span>Tổng số lượng</span>
                            <strong>{{ formatNumber(currentImport.totalQuantity) }}</strong>
                        </div>
                        <div class="summary-box">
                            <span>Giá trị nhập</span>
                            <strong>{{ formatCurrency(currentImport.totalAmount) }}</strong>
                        </div>
                    </div>
                    <p v-if="currentImport.note" class="drawer-note">
                        <i class="fas fa-sticky-note"></i>
                        {{ currentImport.note }}
                    </p>
                </section>
                <section v-if="currentImport?.items?.length" class="drawer-items">
                    <h3>Danh sách sách</h3>
                    <el-table :data="currentImport.items" size="small" border>
                        <el-table-column type="index" width="50" label="#" />
                        <el-table-column prop="bookCode" label="Mã sách" width="140" />
                        <el-table-column prop="bookName" label="Tên sách" min-width="200" show-overflow-tooltip />
                        <el-table-column prop="unitPrice" label="Giá nhập" width="140">
                            <template #default="scope">{{ formatCurrency(scope.row.unitPrice) }}</template>
                        </el-table-column>
                        <el-table-column prop="quantity" label="Số lượng" width="120" />
                        <el-table-column prop="lineTotal" label="Thành tiền" width="150">
                            <template #default="scope">{{ formatCurrency(scope.row.lineTotal) }}</template>
                        </el-table-column>
                    </el-table>
                </section>
                <p v-else class="drawer-empty">Không có dữ liệu chi tiết.</p>
            </template>
        </el-drawer>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdminBooks } from '@/api/book'
import { fetchImportHistory, fetchImportDetail, createImport } from '@/api/inventory'

const bookQuery = ref('')
const bookSuggestions = ref([])
const suggestionLoading = ref(false)
const importItems = ref([])
const note = ref('')
const submitLoading = ref(false)
const historyItems = ref([])
const historyLoading = ref(false)
const historyPage = ref(1)
const historyPageSize = ref(10)
const historyTotal = ref(0)
const dateRange = ref([])
const historyKeyword = ref('')

const detailVisible = ref(false)
const detailLoading = ref(false)
const currentImport = ref(null)

const totalQuantity = computed(() => importItems.value.reduce((acc, item) => acc + Number(item.quantity || 0), 0))
const canSubmit = computed(() => {
    if (!importItems.value.length) return false
    if (totalQuantity.value <= 0) return false
    return importItems.value.every((item) => Number(item.quantity) > 0 && Number(item.unitPrice) > 0)
})

const filteredHistory = computed(() => {
    const keyword = historyKeyword.value.trim().toLowerCase()
    if (!keyword) return historyItems.value
    return historyItems.value.filter((item) => {
        const fields = [item.code, item.note, item.importDate]
        return fields.some((field) => String(field || '').toLowerCase().includes(keyword))
    })
})

const totalAmount = computed(() => importItems.value.reduce((acc, item) => acc + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0))

const historyInsights = computed(() => {
    const visible = filteredHistory.value
    let lastCreatedAt = null
    let totalQuantity = 0
    let totalAmountVisible = 0

    for (const item of visible) {
        if (item.totalQuantity) totalQuantity += Number(item.totalQuantity)
        if (item.totalAmount) totalAmountVisible += Number(item.totalAmount)
        const created = item.importDate ? new Date(item.importDate) : item.createdAt ? new Date(item.createdAt) : null
        if (created && !Number.isNaN(created.getTime())) {
            if (!lastCreatedAt || created > lastCreatedAt) {
                lastCreatedAt = created
            }
        }
    }

    return {
        totalInvoices: historyTotal.value,
        visibleInvoices: visible.length,
        totalQuantity,
        totalAmount: totalAmountVisible,
        lastCreatedAt
    }
})

const historyEmptyText = computed(() => {
    if (historyKeyword.value.trim() && historyItems.value.length) {
        return 'Không tìm thấy phiếu nhập phù hợp'
    }
    return 'Chưa có phiếu nhập nào'
})

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
    const sources = [payload, payload?.data]
    for (const source of sources) {
        if (!source) continue
        const candidates = [source.totalItems, source.total, source.count, source.totalCount]
        const found = candidates.find((value) => value !== undefined)
        if (found !== undefined) return Number(found)
    }
    return Number(fallback ?? 0)
}

const resolvePage = (payload, fallback) => {
    const sources = [payload, payload?.data]
    for (const source of sources) {
        if (!source) continue
        const candidates = [source.pageIndex, source.page, source.currentPage, source.pageNumber]
        const found = candidates.find((value) => value !== undefined)
        if (found !== undefined) return Number(found)
    }
    return Number(fallback ?? 1)
}

const normalizeBook = (raw = {}) => {
    const inStock = raw.inStock ?? raw.InStock ?? raw.soluong ?? raw.SOLUONG ?? null
    const code = raw.code ?? raw.Code ?? raw.masach ?? raw.MASACH ?? ''
    const name = raw.name ?? raw.Name ?? raw.tensach ?? raw.TENSACH ?? ''
    const importPrice = raw.importPrice ?? raw.ImportPrice ?? raw.unitPrice ?? raw.UnitPrice ?? 0
    return {
        code,
        name,
        inStock: inStock !== null ? Number(inStock) : null,
        suggestPrice: Number(importPrice) || 0,
        value: `${code ? code + ' • ' : ''}${name}` || 'Không rõ'
    }
}

const normalizeImportItem = (raw = {}) => {
    const bookCode = raw.bookCode ?? raw.BookCode ?? raw.code ?? raw.Code ?? ''
    const bookName = raw.bookName ?? raw.BookName ?? raw.name ?? raw.Name ?? ''
    const quantity = Number(raw.quantity ?? raw.Quantity ?? raw.soluong ?? raw.SoLuong ?? 0) || 0
    const unitPrice = Number(raw.unitPrice ?? raw.UnitPrice ?? raw.price ?? raw.Price ?? 0) || 0
    const lineTotal = Number(raw.lineTotal ?? raw.LineTotal ?? raw.thanhtien ?? raw.ThanhTien ?? quantity * unitPrice) || 0
    return { bookCode, bookName, quantity, unitPrice, lineTotal }
}

const normalizeImport = (raw = {}) => {
    const itemsSource = raw.items ?? raw.Items ?? raw.details ?? raw.Details ?? raw.lines ?? raw.Lines
    const normalizedItems = Array.isArray(itemsSource) ? itemsSource.map(normalizeImportItem) : []
    const importDate = raw.importDate ?? raw.ImportDate ?? raw.createdAt ?? raw.CreatedAt ?? raw.createdDate ?? raw.CreatedDate ?? ''
    const createdBy = raw.createdBy ?? raw.CreatedBy ?? raw.nguoitao ?? raw.NGUOITAO ?? ''
    const noteValue = raw.note ?? raw.Note ?? raw.ghichu ?? raw.GHICHU ?? ''
    const code = raw.code ?? raw.Code ?? raw.maPhieu ?? raw.MAPHIEU ?? ''
    const totalQuantity = normalizedItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0)
    const totalAmountValue = raw.totalAmount ?? raw.TotalAmount ?? normalizedItems.reduce((acc, item) => acc + Number(item.lineTotal || item.quantity * item.unitPrice || 0), 0)
    return {
        code,
        importDate,
        createdBy,
        note: noteValue,
        items: normalizedItems,
        totalQuantity,
        totalAmount: Number(totalAmountValue) || 0
    }
}

const formatDate = (value) => {
    if (!value) return '—'
    try {
        const date = new Date(value)
        if (Number.isNaN(date.getTime())) return value
        return new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    } catch (error) {
        return value
    }
}

const formatNumber = (value) => Number(value || 0).toLocaleString('vi-VN')
const formatCurrency = (value) => `${Number(value || 0).toLocaleString('vi-VN')}₫`

const searchBooks = async (queryString, cb) => {
    if (!queryString || !queryString.trim()) {
        bookSuggestions.value = []
        cb([])
        suggestionLoading.value = false
        return
    }
    suggestionLoading.value = true
    try {
        const response = await getAdminBooks({ page: 1, pageSize: 10, keyword: queryString.trim() })
        const list = extractList(response).map(normalizeBook)
        bookSuggestions.value = list
        cb(list)
    } catch (error) {
        console.error('searchBooks error', error)
        cb([])
    } finally {
        suggestionLoading.value = false
    }
}

const handleSelectBook = (item) => {
    if (!item?.code) return
    const existing = importItems.value.find((line) => line.bookCode === item.code)
    if (existing) {
        existing.quantity = Number(existing.quantity || 0) + 1
        const suggested = Number(item.suggestPrice) || 0
        if (!existing.suggestPrice && suggested) {
            existing.suggestPrice = suggested
        }
        if (!existing.unitPrice && (existing.suggestPrice || suggested)) {
            existing.unitPrice = existing.suggestPrice || suggested
        }
    } else {
        const suggested = Number(item.suggestPrice) || 0
        importItems.value.push({
            bookCode: item.code,
            bookName: item.name,
            inStock: item.inStock,
            quantity: 1,
            unitPrice: suggested || '',
            suggestPrice: suggested
        })
    }
    bookQuery.value = ''
    bookSuggestions.value = []
}

const handleSearchEnter = () => {
    if (!bookSuggestions.value.length) return
    handleSelectBook(bookSuggestions.value[0])
}

const handleClearSuggestions = () => {
    bookSuggestions.value = []
}

const handleFieldFocus = (row, field) => {
    if (field === 'unitPrice' && (!Number(row.unitPrice) || Number(row.unitPrice) === 0)) {
        row.unitPrice = ''
    }
    if (field === 'quantity' && (!Number(row.quantity) || Number(row.quantity) <= 1)) {
        row.quantity = Number(row.quantity) || 1
    }
}

const handleFieldBlur = (row, field) => {
    if (field === 'unitPrice') {
        const value = Number(row.unitPrice)
        if (Number.isFinite(value) && value > 0) {
            row.unitPrice = value
        } else if (row.suggestPrice) {
            row.unitPrice = Number(row.suggestPrice)
        } else {
            row.unitPrice = ''
        }
    }
    if (field === 'quantity') {
        const value = Number(row.quantity)
        row.quantity = value >= 1 ? Math.round(value) : 1
    }
}

const handleQuantityChange = (row) => {
    const value = Number(row.quantity)
    if (!Number.isFinite(value) || value < 1) {
        row.quantity = 1
    }
}

const applySuggestPrice = (row) => {
    if (!row) return
    const suggested = Number(row.suggestPrice)
    if (suggested > 0) {
        row.unitPrice = suggested
    }
}

const removeItem = (code) => {
    importItems.value = importItems.value.filter((item) => item.bookCode !== code)
}

const clearImportItems = () => {
    importItems.value = []
}

const submitImport = async () => {
    if (!canSubmit.value) {
        ElMessage.warning('Vui lòng chọn ít nhất một sách và số lượng hợp lệ.')
        return
    }

    const payload = {
        items: importItems.value.map((item) => ({
            bookCode: item.bookCode,
            quantity: Number(item.quantity || 0),
            unitPrice: Number(item.unitPrice || 0)
        })),
        note: note.value?.trim() || undefined
    }

    if (payload.items.some((line) => line.unitPrice <= 0)) {
        ElMessage.warning('Vui lòng nhập giá nhập cho từng sách trước khi tạo phiếu.')
        return
    }

    submitLoading.value = true
    try {
        await createImport(payload)
        ElMessage.success('Đã tạo phiếu nhập thành công')
        importItems.value = []
        note.value = ''
        loadHistory()
    } catch (error) {
        console.error('submitImport error', error)
        ElMessage.error(error?.response?.data?.message || 'Không thể tạo phiếu nhập')
    } finally {
        submitLoading.value = false
    }
}

const buildDateParams = () => {
    if (!Array.isArray(dateRange.value) || dateRange.value.length !== 2) return {}
    const [from, to] = dateRange.value
    if (!from || !to) return {}
    const fromDate = `${from}T00:00:00`
    const toDate = `${to}T23:59:59`
    return { fromDate, toDate }
}

const loadHistory = async () => {
    historyLoading.value = true
    try {
        const params = {
            page: historyPage.value,
            pageSize: historyPageSize.value,
            ...buildDateParams()
        }
        const response = await fetchImportHistory(params)
        const list = extractList(response).map(normalizeImport)
        historyItems.value = list
        historyTotal.value = resolveTotal(response, list.length)
        historyPage.value = resolvePage(response, historyPage.value)
    } catch (error) {
        console.error('loadHistory error', error)
        ElMessage.error(error?.response?.data?.message || 'Không thể tải lịch sử nhập kho')
    } finally {
        historyLoading.value = false
    }
}

const handleHistoryPageChange = (page) => {
    historyPage.value = page
    loadHistory()
}

const handleHistorySizeChange = (size) => {
    historyPageSize.value = size
    historyPage.value = 1
    loadHistory()
}

const handleDateChange = () => {
    historyPage.value = 1
    loadHistory()
}

const showDetail = async (code) => {
    if (!code) return
    detailVisible.value = true
    detailLoading.value = true
    try {
        const response = await fetchImportDetail(code)
        const payload = response?.data ?? response
        const base = historyItems.value.find((item) => item.code === code)
        currentImport.value = normalizeImport({ ...base, ...payload })
    } catch (error) {
        console.error('showDetail error', error)
        ElMessage.error(error?.response?.data?.message || 'Không thể tải chi tiết phiếu nhập')
        detailVisible.value = false
    } finally {
        detailLoading.value = false
    }
}

onMounted(() => {
    loadHistory()
})
</script>

<style scoped>
.admin-warehouse {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-height: calc(100vh - 80px);
}

.page-header {
    background: white;
    padding: 24px;
    border-radius: 16px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 20px;
    box-shadow: 0 2px 12px rgba(245, 87, 108, 0.08);
    border: 1px solid rgba(245, 87, 108, 0.1);
}

.header-content {
    display: flex;
    align-items: center;
    gap: 16px;
}

.page-header .icon-wrapper {
    width: 56px;
    height: 56px;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.page-header h1 {
    font-size: 28px;
    font-weight: 800;
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    margin: 0 0 4px;
    letter-spacing: -0.5px;
}

.page-header .subtitle {
    font-size: 14px;
    color: #666;
    margin: 0;
}

.refresh-btn {
    background: white !important;
    border: 2px solid rgba(245, 87, 108, 0.3) !important;
    color: #f5576c !important;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 8px;
}

.refresh-btn:hover {
    background: linear-gradient(135deg, rgba(240, 147, 251, 0.1) 0%, rgba(245, 87, 108, 0.1) 100%) !important;
    border-color: #f5576c !important;
    transform: translateY(-1px);
}

.insight-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 16px;
}

.insight-card {
    display: flex;
    align-items: center;
    gap: 16px;
    background: white;
    border: 2px solid rgba(245, 87, 108, 0.1);
    padding: 20px;
    border-radius: 16px;
    box-shadow: 0 2px 12px rgba(245, 87, 108, 0.08);
    transition: all 0.3s ease;
}

.insight-card:hover {
    border-color: rgba(245, 87, 108, 0.2);
    box-shadow: 0 4px 16px rgba(245, 87, 108, 0.12);
    transform: translateY(-2px);
}

.insight-icon {
    width: 52px;
    height: 52px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: #fff;
    font-size: 20px;
}

.insight-icon.primary {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
    box-shadow: 0 4px 12px rgba(245, 87, 108, 0.3);
}

.insight-icon.success {
    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
}

.insight-icon.info {
    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
    box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
}

.insight-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #1f2937;
}

.insight-label {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #999;
    font-weight: 600;
}

.insight-meta strong {
    font-size: 24px;
    font-weight: 800;
    color: #f5576c;
}

.insight-meta small {
    color: #6b7280;
    font-size: 12px;
}

.content-grid {
    display: grid;
    gap: 24px;
    align-items: stretch;
    grid-auto-rows: minmax(0, 1fr);
}

@media (min-width: 992px) {
    .content-grid {
        grid-template-columns: minmax(0, 1.7fr) minmax(0, 1fr);
    }
}

@media (min-width: 1400px) {
    .content-grid {
        grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
    }
}

.import-card,
.history-card {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.card-header h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #111827;
}

.import-card :deep(.el-card__body),
.history-card :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 24px;
    height: 100%;
}

.card-scroll {
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    gap: 20px;
    overflow-y: auto;
    padding-right: 4px;
    min-height: 0;
}

@media (min-width: 992px) {
    .card-scroll {
        max-height: calc(100vh - 360px);
    }

    .history-card .card-scroll {
        max-height: calc(100vh - 300px);
    }
}

.card-scroll::-webkit-scrollbar {
    width: 6px;
}

.card-scroll::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.55);
    border-radius: 999px;
}

.picker-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.picker-label {
    font-weight: 600;
    color: #4b5563;
}

.suggestion-item {
    display: grid;
    grid-template-columns: 80px 1fr auto;
    gap: 8px;
    align-items: center;
}

.suggestion-item strong {
    font-weight: 600;
}

.suggestion-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.suggestion-name {
    color: #1f2937;
}

.suggestion-stock {
    color: #6b7280;
    font-size: 12px;
}

.suggestion-price {
    font-weight: 600;
    color: #16a34a;
}

.suggestion-empty {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    color: #6b7280;
}


.import-items {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.import-row-list {
    display: flex;
    flex-direction: column;
}

.import-row {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px 4px;
    border-bottom: 1px solid #e2e8f0;
}

.import-row:first-child {
    border-top: 1px solid #e2e8f0;
}

.import-row:last-child {
    border-bottom: none;
}

.import-row-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
}

.import-row-info {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.import-code {
    font-size: 13px;
    font-weight: 700;
    color: #6366f1;
    letter-spacing: 0.08em;
}

.import-name {
    font-size: 15px;
    font-weight: 600;
    color: #0f172a;
}

.import-stock {
    font-size: 12px;
    color: #64748b;
}

.import-row-fields {
    display: grid;
    gap: 12px;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    align-items: end;
}

.import-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.import-field label {
    font-size: 13px;
    font-weight: 600;
    color: #4b5563;
}

.import-field :deep(.el-input__inner),
.import-field :deep(.el-input-number__inner) {
    font-weight: 600;
    text-align: right;
    padding-right: 12px;
}

.import-field :deep(.el-input-number) {
    width: 100%;
}

.import-field :deep(.el-link) {
    font-size: 12px;
    padding: 0;
}

.import-field-total strong {
    font-size: 18px;
    color: #2563eb;
}

.list-fade-enter-active,
.list-fade-leave-active {
    transition: all 0.2s ease;
}

.list-fade-enter-from,
.list-fade-leave-to {
    opacity: 0;
    transform: translateY(6px);
}

.import-summary {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    background: linear-gradient(135deg, #eff6ff 0%, #e0f2fe 100%);
    color: #0f172a;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.summary-line {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    font-size: 14px;
}

.summary-line strong {
    font-weight: 700;
    color: #1d4ed8;
}

.note-row {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex-shrink: 0;
}

.note-row label {
    font-weight: 600;
    color: #4b5563;
}

.action-row {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    flex-wrap: wrap;
    flex-shrink: 0;
}

.action-row .action-clear {
    margin-right: auto;
}

.history-header {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

@media (min-width: 768px) {
    .history-header {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
}


.history-tools {
    display: flex;
    gap: 12px;
    margin-top: 4px;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.history-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.history-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 16px;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: #fff;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05);
}

.history-item-main {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.history-item-meta {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.history-code {
    font-size: 15px;
    font-weight: 700;
    color: #1f2937;
    letter-spacing: 0.06em;
}

.history-time {
    font-size: 13px;
    color: #64748b;
}

.history-item-extra {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    font-size: 13px;
    color: #64748b;
}

.history-item-extra span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.pagination-row {
    display: flex;
    justify-content: flex-end;
}

.drawer-loading,
.drawer-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    color: #6b7280;
}

.import-detail-drawer :deep(.el-drawer__header) {
    margin-bottom: 0;
    padding: 20px 24px 0;
}

.import-detail-drawer :deep(.el-drawer__body) {
    background: #f8fafc;
    padding: 0 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.drawer-summary {
    display: flex;
    flex-direction: column;
    gap: 16px;
    background: #ffffff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 12px 32px rgba(15, 23, 42, 0.08);
}

.summary-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
}

.drawer-code {
    display: inline-block;
    font-size: 20px;
    font-weight: 700;
    color: #1f2937;
    letter-spacing: 0.04em;
}

.drawer-subtitle {
    margin: 0;
    color: #64748b;
    font-size: 14px;
}

.summary-meta {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 12px;
}

.summary-box {
    background: #f1f5f9;
    border-radius: 12px;
    padding: 12px 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.6);
}

.summary-box span {
    font-size: 12px;
    text-transform: uppercase;
    color: #64748b;
    letter-spacing: 0.08em;
    font-weight: 600;
}

.summary-box strong {
    font-size: 20px;
    color: #2563eb;
}

.drawer-note {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin: 0;
    font-size: 14px;
    line-height: 1.6;
    color: #0f172a;
    background: #ecfeff;
    border: 1px solid #67e8f9;
    border-radius: 12px;
    padding: 12px 14px;
}

.drawer-note i {
    color: #0891b2;
    margin-top: 2px;
}

.drawer-items {
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #ffffff;
    border-radius: 16px;
    padding: 20px;
    box-shadow: 0 10px 28px rgba(15, 23, 42, 0.06);
}

.drawer-items h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #0f172a;
}

.drawer-empty {
    background: #ffffff;
    border-radius: 12px;
    padding: 24px;
    color: #6b7280;
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}
</style>