<template>
  <div class="order-history">
    <div class="order-tabs">
      <button
        v-for="tab in statusTabs"
        :key="tab.key"
        class="tab-btn"
        :class="{ active: activeStatus === tab.key }"
        type="button"
        @click="activeStatus = tab.key"
      >
        <span>{{ tab.label }}</span>
        <span v-if="statusCounts[tab.key] !== undefined" class="badge">{{ statusCounts[tab.key] }}</span>
      </button>
      <button class="refresh-btn" type="button" :disabled="loading" @click="fetchOrders">
        <i class="fas fa-sync-alt" aria-hidden="true"></i>
        <span class="refresh-text">Làm mới</span>
      </button>
    </div>

    <div v-if="!hasCustomerCode" class="order-state">
      <i class="fas fa-user-slash"></i>
      <p>Không tìm thấy mã khách hàng. Vui lòng đăng nhập lại.</p>
    </div>

    <div v-else>
      <div v-if="loading" class="order-state">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Đang tải danh sách đơn hàng...</p>
      </div>

      <div v-else-if="error" class="order-state error">
        <i class="fas fa-exclamation-triangle"></i>
        <p>{{ error }}</p>
        <button type="button" class="retry-btn" @click="fetchOrders">Thử lại</button>
      </div>

      <div v-else>
        <transition-group name="fade" tag="div">
          <div v-if="filteredOrders.length" key="order-list" class="order-list">
            <article v-for="order in filteredOrders" :key="order.code" class="order-card">
              <header class="order-head">
                <div>
                  <div class="order-code">Mã đơn: {{ order.code }}</div>
                  <div class="order-date">Đặt lúc: {{ formatDate(order.createdAt) }}</div>
                  <div
                    v-if="order.status === 'HoanThanh' && order.completedAt"
                    class="order-date order-date--completed"
                  >
                    Hoàn thành lúc: {{ formatDate(order.completedAt) }}
                  </div>
                  <div
                    v-else-if="order.status === 'DaHuy' && order.completedAt"
                    class="order-date order-date--cancelled"
                  >
                    Hủy lúc: {{ formatDate(order.completedAt) }}
                  </div>
                </div>
                <span class="order-status" :class="statusClass(order.status)">{{ order.statusLabel || statusLabel(order.status) }}</span>
              </header>

              <div class="order-summary">
                <div class="summary-left">
                  <span class="summary-line">{{ totalItems(order) }} sản phẩm</span>
                  <span class="summary-line method">Thanh toán: {{ order.paymentMethodLabel }}</span>
                </div>
                <span class="order-total">{{ formatPrice(order.total) }}</span>
              </div>

              <div v-if="order.status === 'DaHuy' && order.cancelReason" class="order-cancel-reason">
                Lý do hủy: {{ order.cancelReason }}
              </div>

              <transition name="fade">
                <section v-if="isExpanded(order.code)" class="order-details">
                  <table>
                    <thead>
                      <tr>
                        <th>Tên sách</th>
                        <th>Mã</th>
                        <th>SL</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in order.items" :key="item.bookCode + item.bookName">
                        <td>{{ item.bookName }}</td>
                        <td>{{ item.bookCode }}</td>
                        <td>{{ item.quantity }}</td>
                        <td>{{ formatPrice(item.unitPrice) }}</td>
                        <td>{{ formatPrice(item.lineTotal) }}</td>
                        <td class="actions-cell">
                          <button
                            v-if="item.bookCode && order.status === 'HoanThanh'"
                            type="button"
                            class="review-btn"
                            @click="goToBookDetails(item.bookCode)"
                          >
                            Đánh giá
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </section>
              </transition>

              <footer class="order-actions">
                <button type="button" class="link-btn" @click="toggleDetails(order.code)">
                  {{ isExpanded(order.code) ? 'Ẩn chi tiết' : 'Xem chi tiết' }}
                </button>
                <button
                  v-if="order.status === 'DangGiao'"
                  type="button"
                  class="confirm-btn"
                  :disabled="isConfirming(order.code)"
                  @click="confirmOrderAndUpdate(order)"
                >
                  {{ isConfirming(order.code) ? 'Đang xác nhận...' : 'Xác nhận đã nhận hàng' }}
                </button>
                <button
                  v-if="order.status === 'DaDatHang'"
                  type="button"
                  class="cancel-btn"
                  :disabled="isCancelling(order.code)"
                  @click="openCancelDialog(order)"
                >
                  {{ isCancelling(order.code) ? 'Đang hủy...' : 'Hủy đơn' }}
                </button>
              </footer>
            </article>
          </div>

          <div v-else key="empty" class="order-state">
            <i class="fas fa-box-open"></i>
            <p>Không có đơn hàng ở trạng thái "{{ statusLabel(activeStatus) }}".</p>
          </div>
        </transition-group>
      </div>
    </div>
  </div>

  <el-dialog
    v-model="cancelDialog.visible"
    title="Hủy đơn hàng"
    width="420px"
    :close-on-click-modal="false"
    :close-on-press-escape="!cancelDialog.submitting"
    class="cancel-dialog"
    @close="closeCancelDialog"
  >
    <div class="cancel-dialog__body">
      <p class="cancel-dialog__summary">
        Bạn đang hủy đơn <strong>{{ cancelDialog.order?.code }}</strong>.
      </p>
      <el-input
        v-model="cancelDialog.reason"
        type="textarea"
        :rows="4"
        maxlength="200"
        show-word-limit
        placeholder="Nhập lý do hủy (ví dụ: Đặt nhầm sản phẩm)"
        :disabled="cancelDialog.submitting"
      />
      <p v-if="cancelDialog.error" class="cancel-dialog__error">{{ cancelDialog.error }}</p>
      <p class="cancel-dialog__hint">Đơn chỉ có thể bị hủy khi vẫn ở trạng thái "Đã đặt hàng".</p>
    </div>
    <template #footer>
      <el-button @click="closeCancelDialog" :disabled="cancelDialog.submitting">Đóng</el-button>
      <el-button type="danger" @click="submitCancel" :loading="cancelDialog.submitting">Xác nhận hủy</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getOrdersByCustomer, confirmOrder as confirmOrderApi, cancelOrder as cancelOrderApi } from '@/api/order'
import { on as onEvent, emit as emitEvent } from '@/utils/eventBus'

const props = defineProps({
  customerCode: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: false
  }
})

const statusTabs = [
  { key: 'DaDatHang', label: 'Đã đặt hàng' },
  { key: 'DangGiao', label: 'Đang giao' },
  { key: 'HoanThanh', label: 'Hoàn thành' },
  { key: 'DaHuy', label: 'Đã hủy' }
]

const STATUS_LABEL_MAP = {
  DaDatHang: 'Đã đặt hàng',
  DangGiao: 'Đang giao',
  HoanThanh: 'Hoàn thành',
  DaHuy: 'Đã hủy'
}

const loading = ref(false)
const error = ref('')
const orders = ref([])
const activeStatus = ref(statusTabs[0].key)
const expandedOrders = ref({})
const confirmingMap = ref({})
const cancellingMap = ref({})
const cancelDialog = reactive({
  visible: false,
  order: null,
  reason: '',
  submitting: false,
  error: ''
})
let pendingRefresh = false
let disposeOrderEvent = null

const hasCustomerCode = computed(() => Boolean(props.customerCode))

const router = useRouter()

const goToBookDetails = (bookCode) => {
  const code = String(bookCode || '').trim()
  if (!code) return
  router.push({ name: 'book-details', params: { code } })
}

const statusCounts = computed(() => {
  const base = Object.fromEntries(statusTabs.map((tab) => [tab.key, 0]))
  for (const order of orders.value) {
    if (base[order.status] !== undefined) {
      base[order.status] += 1
    }
  }
  return base
})

const filteredOrders = computed(() =>
  orders.value.filter((order) => order.status === activeStatus.value)
)

const isExpanded = (code) => Boolean(expandedOrders.value[code])
const toggleDetails = (code) => {
  expandedOrders.value = { ...expandedOrders.value, [code]: !expandedOrders.value[code] }
}

const isConfirming = (code) => Boolean(confirmingMap.value[code])
const isCancelling = (code) => Boolean(cancellingMap.value[code])

watch(
  () => cancelDialog.reason,
  () => {
    if (cancelDialog.error) {
      cancelDialog.error = ''
    }
  }
)

const toKey = (value) =>
  String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/gi, '')
    .toLowerCase()

const canonicalStatus = (value) => {
  const key = toKey(value)
  if (!key) return 'DaDatHang'
  if (key.includes('danggiao')) return 'DangGiao'
  if (key.includes('hoanthanh')) return 'HoanThanh'
  if (key.includes('dahuy') || key.includes('huy')) return 'DaHuy'
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
  const candidate = String(value || '').trim() || String(fallback || '').trim()
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
  const items = normalizeItems(raw.items ?? raw.chitiet)
  const createdAt = raw.createdAt ?? raw.ngaylap ?? raw.createdDate ?? ''
  const completedAt =
    raw.completedAt ?? raw.completedDate ?? raw.ngayHoanThanh ?? raw.thoigianhoanthanh ?? raw.thoigianhoanThanh ?? ''
  const status = canonicalStatus(raw.status ?? raw.trangthai)
  const total = Number(raw.total ?? raw.tongtien ?? items.reduce((sum, item) => sum + Number(item.lineTotal || 0), 0))
  const code = raw.code ?? raw.orderCode ?? raw.mahd ?? raw.id ?? `ORDER-${index + 1}`
  const payment = interpretPaymentMethod(
    raw.paymentMethod ?? raw.hinhThucThanhToan ?? raw.hinhthucthanhtoan ?? raw.payment ?? raw.payment_type,
    raw.paymentMethodDisplay ?? raw.paymentMethodLabel
  )

  return {
    code: String(code),
    createdAt,
    status,
    statusLabel: statusLabel(status),
    total,
    items,
    paymentMethod: payment.code,
    paymentMethodLabel: payment.label,
    completedAt,
    cancelReason: raw.cancelReason ?? raw.lyDoHuy ?? raw.reason ?? ''
  }
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

const totalItems = (order) => order.items.reduce((sum, item) => sum + Number(item.quantity || 0), 0)

const statusClass = (status) => {
  switch (status) {
    case 'DangGiao':
      return 'status-shipping'
    case 'HoanThanh':
      return 'status-completed'
    case 'DaHuy':
      return 'status-cancelled'
    default:
      return 'status-default'
  }
}

const fetchOrders = async () => {
  if (!props.customerCode || !props.active) {
    pendingRefresh = Boolean(props.customerCode)
    return
  }

  if (loading.value) return

  loading.value = true
  error.value = ''
  try {
    const response = await getOrdersByCustomer(props.customerCode)
    const list = Array.isArray(response) ? response : response?.data ?? []
    orders.value = list.map((order, index) => normalizeOrder(order, index)).sort((a, b) => {
      const dateA = new Date(a.completedAt || a.createdAt)
      const dateB = new Date(b.completedAt || b.createdAt)
      return (dateB.getTime() || 0) - (dateA.getTime() || 0)
    })
    pendingRefresh = false
  } catch (err) {
    console.error('fetchOrders error', err)
    error.value = err?.response?.data?.message || err?.message || 'Không thể tải đơn hàng'
  } finally {
    loading.value = false
  }
}

const confirmOrderAndUpdate = async (order) => {
  if (!props.customerCode || isConfirming(order.code)) return

  confirmingMap.value = { ...confirmingMap.value, [order.code]: true }
  try {
    await confirmOrderApi(props.customerCode, order.code)
    ElMessage.success('Đã xác nhận đơn hàng thành công')

    orders.value = orders.value.map((o) =>
      o.code === order.code
        ? {
            ...o,
            status: 'HoanThanh',
            statusLabel: statusLabel('HoanThanh'),
            completedAt: new Date().toISOString(),
            cancelReason: ''
          }
        : o
    )
    emitEvent('order-updated', { code: order.code, status: 'HoanThanh' })
  } catch (err) {
    console.error('confirmOrder error', err)
    ElMessage.error(err?.response?.data?.message || err?.message || 'Không thể xác nhận đơn hàng')
  } finally {
    confirmingMap.value = { ...confirmingMap.value, [order.code]: false }
  }
}

const openCancelDialog = (order) => {
  if (!props.customerCode || isCancelling(order.code)) return
  cancelDialog.order = order
  cancelDialog.reason = ''
  cancelDialog.error = ''
  cancelDialog.visible = true
}

const closeCancelDialog = () => {
  if (cancelDialog.submitting) return
  cancelDialog.visible = false
  cancelDialog.order = null
  cancelDialog.reason = ''
  cancelDialog.error = ''
}

const submitCancel = async () => {
  if (!cancelDialog.order || cancelDialog.submitting) return
  const trimmed = cancelDialog.reason.trim()
  if (!trimmed) {
    cancelDialog.error = 'Vui lòng nhập lý do hủy đơn hàng.'
    return
  }
  if (trimmed.length < 5) {
    cancelDialog.error = 'Lý do nên có ít nhất 5 ký tự để chúng tôi hỗ trợ bạn tốt hơn.'
    return
  }
  cancelDialog.error = ''
  await cancelOrder(cancelDialog.order, trimmed)
}

const cancelOrder = async (order, reason) => {
  const reasonText = String(reason || '').trim()
  cancellingMap.value = { ...cancellingMap.value, [order.code]: true }
  cancelDialog.submitting = true
  try {
    await cancelOrderApi(props.customerCode, order.code, reasonText)
    ElMessage.success('Đã hủy đơn hàng thành công')
    orders.value = orders.value.map((o) =>
      o.code === order.code
        ? {
            ...o,
            status: 'DaHuy',
            statusLabel: statusLabel('DaHuy'),
            cancelReason: reasonText,
            completedAt: new Date().toISOString()
          }
        : o
    )
    emitEvent('order-updated', { code: order.code, status: 'DaHuy' })
    closeCancelDialog()
  } catch (err) {
    console.error('cancelOrder error', err)
    ElMessage.error(err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Không thể hủy đơn hàng')
  } finally {
    cancellingMap.value = { ...cancellingMap.value, [order.code]: false }
    cancelDialog.submitting = false
  }
}

watch(
  () => props.active,
  (active) => {
    if (active && props.customerCode) {
      if (pendingRefresh || !orders.value.length) {
        fetchOrders()
      }
    }
  }
)

watch(
  () => props.customerCode,
  (code) => {
    if (code && props.active) {
      fetchOrders()
    } else if (!code) {
      orders.value = []
    }
  }
)

onMounted(() => {
  if (props.active && props.customerCode) {
    fetchOrders()
  }
  disposeOrderEvent = onEvent('order-updated', () => {
    if (props.active && props.customerCode) {
      fetchOrders()
    } else {
      pendingRefresh = true
    }
  })
})

onBeforeUnmount(() => {
  if (disposeOrderEvent) {
    disposeOrderEvent()
    disposeOrderEvent = null
  }
})
</script>

<style scoped>
.order-history {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.tab-btn {
  padding: 10px 18px;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
  color: #34495e;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.tab-btn.active {
  background: linear-gradient(135deg, #d17057, #b85d47);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 8px 16px rgba(209, 112, 87, 0.25);
}

.badge {
  background: rgba(255, 255, 255, 0.2);
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 12px;
}

.tab-btn.active .badge {
  background: rgba(255, 255, 255, 0.35);
}

.refresh-btn {
  margin-left: auto;
  padding: 9px 14px;
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  background: #f7f7f7;
  color: #555;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn:not(:disabled):hover {
  background: #fff;
  border-color: #d17057;
  color: #d17057;
}

.refresh-text {
  display: none;
}

@media (min-width: 576px) {
  .refresh-text {
    display: inline-flex;
    align-items: center;
  }
}

.order-state {
  background: #fff7f4;
  border: 1px dashed #f1c4b7;
  border-radius: 10px;
  padding: 30px 20px;
  text-align: center;
  color: #c06c52;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.order-state.error {
  border-color: #f5a294;
  color: #a94442;
}

.order-state i {
  font-size: 28px;
}

.retry-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  background: #d17057;
  color: #fff;
  cursor: pointer;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #f0e4de;
  padding: 20px;
  box-shadow: 0 8px 20px rgba(209, 112, 87, 0.08);
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.order-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
}

.order-code {
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 4px;
}

.order-date {
  color: #7f8c8d;
  font-size: 13px;
}

.order-date--completed {
  color: #1b7d43;
  font-weight: 600;
}

.order-date--cancelled {
  color: #b91c1c;
  font-weight: 600;
}

.order-status {
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
}

.status-default {
  background: rgba(209, 112, 87, 0.15);
  color: #b24f32;
}

.status-shipping {
  background: rgba(54, 162, 235, 0.2);
  color: #1c6ca1;
}

.status-completed {
  background: rgba(46, 204, 113, 0.18);
  color: #1b7d43;
}

.status-cancelled {
  background: rgba(248, 113, 113, 0.18);
  color: #b91c1c;
}

.order-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #f9fafb;
  font-weight: 600;
  color: #2c3e50;
}

.summary-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-weight: 500;
}

.summary-line {
  color: #2c3e50;
}

.summary-line.method {
  font-size: 13px;
  color: #7f8c8d;
}

.order-total {
  color: #d17057;
}

.order-cancel-reason {
  margin: 6px 16px 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #fef2f2;
  color: #b91c1c;
  font-size: 14px;
  line-height: 1.4;
}

.order-details {
  border-top: 1px dashed #f1d5cb;
  padding-top: 12px;
}

.order-details table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.order-details th,
.order-details td {
  padding: 8px 4px;
  text-align: left;
}

.order-details thead {
  background: #fdf3ef;
  color: #b85d47;
}

.order-details .actions-cell {
  text-align: right;
  min-width: 110px;
}

.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  flex-wrap: wrap;
}

.review-btn {
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid transparent;
  background: linear-gradient(135deg, #d17057, #b85d47);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.review-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(184, 93, 71, 0.25);
}

.review-btn:active {
  transform: translateY(0);
  box-shadow: none;
}

.link-btn {
  border: none;
  background: transparent;
  color: #d17057;
  font-weight: 600;
  cursor: pointer;
}

.confirm-btn {
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #ff9966, #ff5e62);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.confirm-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.confirm-btn:not(:disabled):hover {
  transform: translateY(-1px);
}

.cancel-btn {
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  background: linear-gradient(135deg, #f87171, #ef4444);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease;
}

.cancel-btn:not(:disabled):hover {
  transform: translateY(-1px);
  background: linear-gradient(135deg, #ef4444, #dc2626);
}

.cancel-dialog :deep(.el-dialog__body) {
  padding-top: 8px;
}

.cancel-dialog__body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.cancel-dialog__summary {
  margin: 0;
  font-size: 14px;
  color: #374151;
}

.cancel-dialog__hint {
  margin: 0;
  font-size: 13px;
  color: #6b7280;
}

.cancel-dialog__error {
  margin: -4px 0 0;
  font-size: 13px;
  color: #dc2626;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
