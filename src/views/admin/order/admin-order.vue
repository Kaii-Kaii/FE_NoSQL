<template>
    <div class="admin-orders">
        <header class="page-header">
            <h1>Quản lý đơn hàng</h1>
            <button class="refresh-btn" type="button" :disabled="loading" @click="fetchOrders">
                <i class="fas fa-sync-alt" aria-hidden="true"></i>
                <span>Làm mới</span>
            </button>
        </header>

        <div class="order-tabs">
            <button
                v-for="tab in statusTabs"
                :key="tab.key"
                type="button"
                class="tab-btn"
                :class="{ active: activeStatus === tab.key }"
                @click="activeStatus = tab.key"
            >
                <span>{{ tab.label }}</span>
                <span class="badge">{{ statusCounts[tab.key] || 0 }}</span>
            </button>
        </div>

        <section v-if="loading" class="state-block">
            <i class="fas fa-spinner fa-spin"></i>
            <p>Đang tải danh sách đơn hàng...</p>
        </section>

        <section v-else-if="error" class="state-block error">
            <i class="fas fa-exclamation-triangle"></i>
            <p>{{ error }}</p>
            <button type="button" class="retry-btn" @click="fetchOrders">Thử lại</button>
        </section>

        <transition-group v-else name="fade" tag="div">
            <div v-if="filteredOrders.length" key="list" class="order-list">
                <article v-for="order in filteredOrders" :key="order.code" class="order-card">
                    <header class="order-head">
                        <div>
                            <div class="order-code">Mã đơn: {{ order.code }}</div>
                            <div class="order-date">{{ formatDate(order.createdAt) }}</div>
                            <div class="customer-line">
                                <span>{{ order.customerName || 'Khách lẻ' }}</span>
                                <span class="divider">•</span>
                                <span>{{ order.customerCode || 'Không rõ mã' }}</span>
                            </div>
                        </div>
                        <span class="order-status" :class="statusClass(order.status)">{{ statusLabel(order.status) }}</span>
                    </header>

                    <div class="order-summary">
                        <div class="summary-left">
                            <span v-if="order.phone" class="summary-line">{{ order.phone }}</span>
                            <span class="summary-line">Thanh toán: {{ order.paymentMethodLabel }}</span>
                        </div>
                        <span class="order-total">{{ formatPrice(order.total) }}</span>
                    </div>

                    <transition name="fade">
                        <section v-if="isExpanded(order.code)" class="order-details">
                            <div v-if="isDetailsLoading(order.code)" class="details-state">
                                <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>
                                <span>Đang tải chi tiết đơn hàng...</span>
                            </div>
                            <template v-else>
                                <table v-if="order.items && order.items.length">
                                    <thead>
                                        <tr>
                                            <th>Tên sách</th>
                                            <th>Mã</th>
                                            <th>SL</th>
                                            <th>Đơn giá</th>
                                            <th>Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in order.items" :key="item.bookCode + item.bookName">
                                            <td>{{ item.bookName }}</td>
                                            <td>{{ item.bookCode }}</td>
                                            <td>{{ item.quantity }}</td>
                                            <td>{{ formatPrice(item.unitPrice) }}</td>
                                            <td>{{ formatPrice(item.lineTotal) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                                <p v-else class="details-empty">Không có sản phẩm trong đơn hàng này.</p>
                            </template>
                        </section>
                    </transition>

                    <footer class="order-actions">
                        <button type="button" class="link-btn" @click="toggleDetails(order.code)">
                            {{ isExpanded(order.code) ? 'Ẩn chi tiết' : 'Xem chi tiết' }}
                        </button>
                        <button
                            v-if="order.status === 'DaDatHang' && order.customerCode"
                            type="button"
                            class="primary-btn"
                            :disabled="isUpdating(order.code)"
                            @click="moveToShipping(order)"
                        >
                            {{ isUpdating(order.code) ? 'Đang cập nhật...' : 'Chuyển sang "Đang giao"' }}
                        </button>
                    </footer>
                </article>
            </div>

            <section v-else key="empty" class="state-block">
                <i class="fas fa-box-open"></i>
                <p>Không có đơn hàng ở trạng thái này.</p>
            </section>
        </transition-group>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAdminOrders, updateAdminOrderStatus, getOrderByCode } from '@/api/order'

const statusTabs = [
    { key: 'DaDatHang', label: 'Đã đặt hàng' },
    { key: 'DangGiao', label: 'Đang giao' },
    { key: 'HoanThanh', label: 'Hoàn thành' }
]

const STATUS_LABEL_MAP = {
    DaDatHang: 'Đã đặt hàng',
    DangGiao: 'Đang giao',
    HoanThanh: 'Hoàn thành'
}

const loading = ref(false)
const error = ref('')
const orders = ref([])
const activeStatus = ref(statusTabs[0].key)
const expandedOrders = ref({})
const updatingMap = ref({})
const detailsLoadingMap = ref({})

const statusCounts = computed(() => {
    return orders.value.reduce(
        (acc, order) => {
            if (typeof acc[order.status] === 'number') {
                acc[order.status] += 1
            }
            return acc
        },
        Object.fromEntries(statusTabs.map((tab) => [tab.key, 0]))
    )
})

const filteredOrders = computed(() => orders.value.filter((order) => order.status === activeStatus.value))

const isExpanded = (code) => Boolean(expandedOrders.value[code])
const toggleDetails = async (code) => {
    const nextState = !expandedOrders.value[code]
    expandedOrders.value = { ...expandedOrders.value, [code]: nextState }
    if (nextState) {
        const target = orders.value.find((order) => order.code === code)
        await ensureOrderDetails(target)
    }
}

const isUpdating = (code) => Boolean(updatingMap.value[code])
const isDetailsLoading = (code) => Boolean(detailsLoadingMap.value[code])

const toKey = (value) =>
    String(value || '')
        .normalize('NFD')
        .replace(/[^a-z0-9]+/gi, '')
        .toLowerCase()

const canonicalStatus = (value) => {
    const key = toKey(value)
    if (!key) return 'DaDatHang'
    if (key.includes('danggiao')) return 'DangGiao'
    if (key.includes('hoanthanh')) return 'HoanThanh'
    if (key.includes('dadathang')) return 'DaDatHang'
    return 'DaDatHang'
}

const statusLabel = (code) => STATUS_LABEL_MAP[code] || code

const normalizeItems = (rawItems) => {
    const list = Array.isArray(rawItems) ? rawItems : []
    return list.map((raw) => {
        const unitPrice = Number(raw.unitPrice ?? raw.dongia ?? raw.price ?? 0)
        const quantity = Number(raw.quantity ?? raw.soluong ?? raw.qty ?? 0)
        const lineTotal = Number(raw.lineTotal ?? raw.thanhtien ?? unitPrice * quantity)
        return {
            bookCode: raw.bookCode ?? raw.masp ?? raw.code ?? '',
            bookName: raw.bookName ?? raw.tensp ?? raw.name ?? 'Không rõ',
            unitPrice,
            quantity,
            lineTotal
        }
    })
}

const interpretPaymentMethod = (value, fallback) => {
    const candidate = String(value || fallback || '').trim()
    const key = toKey(candidate)
    if (key.includes('chuyenkhoan') || key.includes('banktransfer') || key.includes('transfer')) {
        return { code: 'ChuyenKhoan', label: 'Chuyển khoản' }
    }
    if (key.includes('tienmat') || key.includes('cash')) {
        return { code: 'TienMat', label: 'Tiền mặt' }
    }
    return { code: candidate || 'TienMat', label: candidate || 'Tiền mặt' }
}

const normalizeOrder = (raw, index) => {
    const items = normalizeItems(raw.items ?? raw.chitiet ?? raw.orderDetails)
    const createdAt = raw.createdAt ?? raw.ngaylap ?? raw.createdDate ?? raw.created_time ?? ''
    const status = canonicalStatus(raw.status ?? raw.trangthai)
    const total = Number(raw.total ?? raw.tongtien ?? raw.amount ?? items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0))
    const code = raw.code ?? raw.orderCode ?? raw.mahd ?? raw.id ?? `ORDER-${index + 1}`
    const customer = raw.customer ?? raw.customerInfo ?? raw.khachhang ?? {}
    const payment = interpretPaymentMethod(
        raw.paymentMethod ?? raw.hinhthucthanhtoan ?? raw.payment ?? raw.payment_type,
        raw.paymentMethodDisplay ?? raw.paymentMethodLabel
    )

    return {
        code: String(code),
        createdAt,
        status,
        total,
        items,
        paymentMethod: payment.code,
        paymentMethodLabel: payment.label,
        customerCode:
            raw.customerCode ?? raw.makh ?? customer.code ?? customer.customerCode ?? customer.makh ?? customer.id ?? '',
        customerName: raw.customerName ?? raw.tenkh ?? customer.fullName ?? customer.name ?? '',
        phone: raw.phone ?? raw.sdt ?? customer.phone ?? customer.sdt ?? '',
        email: raw.email ?? customer.email ?? ''
    }
}

const extractList = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.data)) return payload.data
    if (Array.isArray(payload?.items)) return payload.items
    if (Array.isArray(payload?.results)) return payload.results
    return []
}

const formatPrice = (value) => {
    const amount = Number(value || 0)
    return amount.toLocaleString('vi-VN') + '₫'
}

const formatDate = (value) => {
    if (!value) return 'Không rõ thời gian'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return String(value)
    return new Intl.DateTimeFormat('vi-VN', {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(date)
}

const statusClass = (status) => {
    switch (status) {
        case 'DangGiao':
            return 'status-shipping'
        case 'HoanThanh':
            return 'status-completed'
        default:
            return 'status-default'
    }
}

const ensureOrderDetails = async (order) => {
    if (!order) return
    const hasItems = Array.isArray(order.items) && order.items.length > 0
    if (hasItems) return
    if (detailsLoadingMap.value[order.code]) return

    detailsLoadingMap.value = { ...detailsLoadingMap.value, [order.code]: true }
    try {
        const response = await getOrderByCode(order.code)
        const raw = response?.data && !Array.isArray(response.data) ? response.data : response
        const normalized = normalizeOrder(raw, 0)
        orders.value = orders.value.map((o) =>
            o.code === order.code
                ? {
                      ...o,
                      items: normalized.items,
                      total: normalized.total || o.total,
                      paymentMethod: normalized.paymentMethod || o.paymentMethod,
                      paymentMethodLabel: normalized.paymentMethodLabel || o.paymentMethodLabel
                  }
                : o
        )
    } catch (err) {
        console.error('load order details error', err)
        ElMessage.error(err?.response?.data?.message || err?.message || 'Không thể tải chi tiết đơn hàng')
    } finally {
        detailsLoadingMap.value = { ...detailsLoadingMap.value, [order.code]: false }
    }
}

const fetchOrders = async () => {
    if (loading.value) return
    loading.value = true
    error.value = ''
    try {
        const response = await getAdminOrders({ page: 1, pageSize: 200 })
        const list = extractList(response)
        orders.value = list.map((order, index) => normalizeOrder(order, index)).sort((a, b) => {
            const dateA = new Date(a.createdAt)
            const dateB = new Date(b.createdAt)
            return (dateB.getTime() || 0) - (dateA.getTime() || 0)
        })
    } catch (err) {
        console.error('fetchOrders error', err)
        error.value = err?.response?.data?.message || err?.message || 'Không thể tải đơn hàng'
    } finally {
        loading.value = false
    }
}

const moveToShipping = async (order) => {
    if (!order.customerCode || isUpdating(order.code)) {
        if (!order.customerCode) {
            ElMessage.error('Không tìm thấy mã khách hàng của đơn hàng này.')
        }
        return
    }

    updatingMap.value = { ...updatingMap.value, [order.code]: true }
    try {
        await updateAdminOrderStatus(order.customerCode, order.code, 'DangGiao')
        ElMessage.success('Đã chuyển đơn sang trạng thái "Đang giao"')
        orders.value = orders.value.map((o) =>
            o.code === order.code ? { ...o, status: 'DangGiao' } : o
        )
    } catch (err) {
        console.error('update status error', err)
        ElMessage.error(err?.response?.data?.message || err?.message || 'Không thể cập nhật trạng thái đơn hàng')
    } finally {
        updatingMap.value = { ...updatingMap.value, [order.code]: false }
    }
}

onMounted(fetchOrders)
</script>

<style scoped>
.admin-orders {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
}

.page-header h1 {
    font-size: 24px;
    font-weight: 700;
    color: #1f2937;
}

.refresh-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    border-radius: 8px;
    border: none;
    background: #2563eb;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
}

.refresh-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.refresh-btn:not(:disabled):hover {
    background: #1d4ed8;
}

.order-tabs {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
}

.tab-btn {
    padding: 10px 18px;
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    background: #fff;
    cursor: pointer;
    font-weight: 600;
    color: #374151;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.2s ease;
}

.tab-btn.active {
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff;
    border-color: transparent;
    box-shadow: 0 8px 16px rgba(37, 99, 235, 0.25);
}

.badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
}

.state-block {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 10px;
    padding: 40px 20px;
    color: #6b7280;
    border: 1px dashed #d1d5db;
    border-radius: 10px;
}

.state-block.error {
    color: #b91c1c;
    border-color: #fca5a5;
}

.retry-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: #ef4444;
    color: #fff;
    cursor: pointer;
}

.order-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.order-card {
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    padding: 18px;
    background: #fff;
    display: flex;
    flex-direction: column;
    gap: 14px;
    box-shadow: 0 2px 6px rgba(55, 65, 81, 0.08);
}

.order-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 14px;
}

.order-code {
    font-weight: 700;
    color: #111827;
}

.order-date {
    font-size: 14px;
    color: #6b7280;
}

.customer-line {
    font-size: 13px;
    color: #4b5563;
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
}

.customer-line .divider {
    color: #9ca3af;
}

.order-status {
    padding: 6px 12px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
}

.status-default {
    background: #fef3c7;
    color: #92400e;
}

.status-shipping {
    background: #dbeafe;
    color: #1d4ed8;
}

.status-completed {
    background: #dcfce7;
    color: #166534;
}

.order-summary {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.summary-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
    color: #4b5563;
    font-size: 14px;
}

.order-total {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
}

.order-details table {
    width: 100%;
    border-collapse: collapse;
}

.order-details th,
.order-details td {
    padding: 10px;
    border: 1px solid #e5e7eb;
    text-align: left;
    font-size: 14px;
}

.details-state {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: center;
    padding: 16px;
    color: #2563eb;
}

.details-empty {
    margin: 10px 0;
    color: #6b7280;
    font-style: italic;
}

.order-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
}

.link-btn {
    background: none;
    border: none;
    color: #2563eb;
    font-weight: 600;
    cursor: pointer;
}

.primary-btn {
    padding: 8px 16px;
    border-radius: 8px;
    border: none;
    background: linear-gradient(135deg, #2563eb, #1d4ed8);
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s ease;
}

.primary-btn:disabled {
    opacity: 0.7;
    cursor: not-allowed;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 768px) {
    .order-summary {
        flex-direction: column;
        align-items: flex-start;
    }

    .order-actions {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>