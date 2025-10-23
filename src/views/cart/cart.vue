<template>
  <div class="cart-page">
    <div class="container">
      <h1 class="page-title">Giỏ hàng của bạn</h1>

      <div v-if="cart.length === 0" class="empty-state">
        <p>Giỏ hàng đang trống. Hãy thêm vài cuốn sách yêu thích nhé 📚</p>
        <router-link to="/" class="btn-continue">Tiếp tục mua sắm</router-link>
      </div>

      <div v-else>
        <div class="cart-container">
          <div class="cart-main">
            <div class="cart-table">
              <div class="cart-header">
                <div class="col col-image">Image</div>
                <div class="col col-name">Product Name</div>
                <div class="col col-price">Price</div>
                <div class="col col-qty">Quantity</div>
                <div class="col col-total">Total</div>
                <div class="col col-remove">Remove</div>
              </div>

              <div v-for="item in cart" :key="item.masach" class="cart-row">
                <div class="col col-image">
                  <img class="thumb" :src="getImage(item.anhsach)" :alt="item.tensach" />
                </div>
                <div class="col col-name">
                  <h3 class="title" :title="item.tensach">{{ item.tensach }}</h3>
                  <!-- product code hidden by default to keep UI clean; can show on hover if needed -->
                </div>
                <div class="col col-price">{{ formatPrice(item.gia) }}</div>
                <div class="col col-qty">
                  <div class="qty-row">
                    <button class="qty-btn" @click="decrease(item)">-</button>
                    <input class="qty-input" type="number" v-model.number="item.soluong" min="1" @change="onQtyChange(item)" />
                    <button class="qty-btn" @click="increase(item)">+</button>
                  </div>
                </div>
                <div class="col col-total">{{ formatPrice(item.gia * item.soluong) }}</div>
                <div class="col col-remove">
                  <button class="remove" @click="removeItem(item.masach)" aria-label="Xóa">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6h18" stroke="#9AA1A7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#9AA1A7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#9AA1A7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M10 11v6" stroke="#9AA1A7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                      <path d="M14 11v6" stroke="#9AA1A7" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- summary moved below the cart items -->
        <aside class="summary summary-bottom">
          <div class="summary-card">
            <h2>Đơn hàng</h2>
            <div class="discount-row">
            <label for="discount">Mã giảm giá</label>
            <div style="display:flex; gap:8px; margin-top:6px; align-items:center">
              <input id="discount" v-model="discountCode" placeholder="Nhập mã giảm giá" />
              <button class="btn-apply whitespace-nowrap" @click="applyDiscount">Áp dụng</button>
              <button v-if="discountDetail" class="btn-cancel-code whitespace-nowrap" @click="clearDiscount">Hủy mã</button>
            </div>
            <p v-if="discountMessage && !discountDetail" style="color:#b33;margin-top:6px">{{ discountMessage }}</p>

            <!-- payment method selection -->
            <div class="pay-method">
              <div class="pay-label">Phương thức thanh toán</div>
              <div class="pay-toggle" role="tablist" aria-label="Chọn phương thức thanh toán">
                <button
                  type="button"
                  class="pay-option"
                  :class="{ active: paymentMethod === 'Tiền mặt' }"
                  @click="paymentMethod = 'Tiền mặt'"
                  aria-pressed="paymentMethod === 'Tiền mặt'"
                >
                  <span class="icon cash" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="2" y="6" width="20" height="12" rx="2" stroke="#7b8a97" stroke-width="1.5"/>
                      <circle cx="12" cy="12" r="2.75" stroke="#7b8a97" stroke-width="1.5"/>
                      <path d="M2 9c1.6 0 2.4-.8 3-2h14c.6 1.2 1.4 2 3 2" stroke="#7b8a97" stroke-width="1.5"/>
                    </svg>
                  </span>
                  <span>Tiền mặt</span>
                </button>
                <button
                  type="button"
                  class="pay-option"
                  :class="{ active: paymentMethod === 'Chuyển khoản' }"
                  @click="paymentMethod = 'Chuyển khoản'"
                  aria-pressed="paymentMethod === 'Chuyển khoản'"
                >
                  <span class="icon bank" aria-hidden="true">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 10h18M5 10v8m4-8v8m4-8v8m4-8v8M2 10l10-6 10 6" stroke="#7b8a97" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </span>
                  <span>Chuyển khoản</span>
                </button>
              </div>
            </div>
          </div>
          <div class="summary-row">
            <span>Subtotal</span>
            <span>
              <span v-if="discountDetail" style="text-decoration:line-through;color:#999;margin-right:8px">{{ formatPrice(subtotal) }}</span>
              <span v-else>{{ formatPrice(subtotal) }}</span>
            </span>
          </div>
          <div v-if="discountDetail" class="summary-row">
            <span>Giảm ({{ discountDetail?.code }})</span>
            <span>-{{ formatPrice(discountAmount) }}</span>
          </div>
          <div class="summary-row total">
            <strong>Tổng</strong>
            <strong>{{ formatPrice(total) }}</strong>
          </div>

            <div class="summary-actions">
              <button class="btn-checkout" :disabled="savingOrder" @click="checkout">Thanh toán</button>
              <button class="btn-clear" @click="clearCart">Xóa giỏ hàng</button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>

  <!-- QR Modal -->
  <div v-if="showQr" class="qr-modal">
    <div class="qr-backdrop" @click="showQr=false"></div>
    <div class="qr-box">
      <h3>Thanh toán bằng VietQR</h3>
      <img :src="qrUrl" alt="VietQR" class="qr-image" />
      <p class="note">Quét QR bằng ứng dụng ngân hàng để hoàn tất thanh toán.</p>
      <div class="qr-actions">
  <button class="btn-checkout" :disabled="savingOrder" @click="saveOrderAndClear">Đã thanh toán — Lưu đơn</button>
        <button class="btn-clear" @click="showQr=false">Đóng</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCart, saveCart, getCartDiscount, setCartDiscount, clearCartDiscount, getCartDiscountDetail, setCartDiscountDetail, clearCartDiscountDetail } from '@/api/cart'
import axios from 'axios'
import { createOrder } from '@/api/order'
import { emit as emitEvent } from '@/utils/eventBus'
import request from '@/api/request'
// element-plus notification (library already installed per user)
import { ElNotification } from 'element-plus'

const router = useRouter()
const cart = ref([])
const qrUrl = ref('')
const showQr = ref(false)
const discountCode = ref('')
const discountMessage = ref('')
const discountDetail = ref(null)
const paymentMethod = ref('Tiền mặt')
const savingOrder = ref(false)

onMounted(() => {
  cart.value = getCart()
  discountCode.value = getCartDiscount()
  discountDetail.value = getCartDiscountDetail()
})

function getImage(filename) {
  if (!filename) return '/assets/img/cart/cat-img-1.jpg'
  try {
    const s = String(filename || '')
    if (/^https?:\/\//i.test(s)) return s
    return `/uploads/book/${s.replace(/^\/+/, '')}`
  } catch (e) {
    return '/assets/img/cart/cat-img-1.jpg'
  }
}

function formatPrice(v) {
  const n = Number(v || 0)
  return n.toLocaleString('vi-VN') + '₫'
}

// small helper to show success toast
function notifySuccess(title, message) {
  try {
    ElNotification({ title: title || 'Success', message: message || '', type: 'success' })
  } catch (e) {
    // fallback if element-plus not mounted for some reason
    try { alert(message || title || 'Thành công') } catch (_) {}
  }
}

const subtotal = computed(() => cart.value.reduce((s, it) => s + Number(it.gia || 0) * Number(it.soluong || 0), 0))
const discountAmount = computed(() => {
  const d = discountDetail.value
  return d && Number(d.amount) ? Number(d.amount) : 0
})
const total = computed(() => Math.max(0, subtotal.value - discountAmount.value))

function saveAndEmit() {
  saveCart(cart.value)
}

function removeItem(masach) {
  cart.value = cart.value.filter((it) => it.masach !== masach)
  saveAndEmit()
}

function clearCart() {
  cart.value = []
  try { localStorage.removeItem('cart') } catch (e) {}
  try { clearCartDiscount() } catch (e) {}
  try { clearCartDiscountDetail() } catch (e) {}
  // emit a cart-changed event so header updates
  try { if (typeof emitEvent === 'function') emitEvent('cart-changed') } catch (e) {}
}

function increase(item) {
  item.soluong = Number(item.soluong || 0) + 1
  saveAndEmit()
}

function decrease(item) {
  if ((Number(item.soluong) || 1) <= 1) return
  item.soluong = Number(item.soluong) - 1
  saveAndEmit()
}

// clear applied discount code and detail
function clearDiscount() {
  try { setCartDiscount('') } catch (e) {}
  try { clearCartDiscountDetail() } catch (e) {}
  discountDetail.value = null
  discountMessage.value = ''
  // keep the code input but you can also wipe it
  // discountCode.value = ''
}

function onQtyChange(item) {
  if ((Number(item.soluong) || 0) < 1) item.soluong = 1
  saveAndEmit()
}

function getCurrentCustomerCode() {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    return parsed?.code || null
  } catch (e) {
    return null
  }
}

function checkout() {
  if (cart.value.length === 0) {
    alert('Giỏ hàng trống')
    return
  }
  // If payment method is bank transfer, show QR modal. Otherwise save order immediately (cash)
  if (paymentMethod.value === 'Chuyển khoản') {
    const amount = total.value
    const addInfo = encodeURIComponent(`thanh toan don hang`)
    const url = `https://img.vietqr.io/image/vietcombank-KaiiKaii-print.png?amount=${amount}&addInfo=${addInfo}&accountName=${encodeURIComponent('Dang Quoc Khang')}`
    qrUrl.value = url
    showQr.value = true
  } else {
    // cash: save order immediately
    saveOrderAndClear()
  }
}

async function saveOrderAndClear() {
  if (savingOrder.value) return
  try {
    savingOrder.value = true

    const customerCode = getCurrentCustomerCode()
    if (!customerCode) {
      ElNotification({ title: 'Warning', message: 'Vui lòng đăng nhập trước khi lưu đơn hàng', type: 'warning' })
      showQr.value = false
      return
    }

    if (!cart.value.length) {
      ElNotification({ title: 'Warning', message: 'Giỏ hàng trống, không thể tạo đơn hàng', type: 'warning' })
      showQr.value = false
      return
    }

      const methodDisplay = paymentMethod.value || 'Tiền mặt'
      const methodCode = methodDisplay === 'Chuyển khoản' ? 'ChuyenKhoan' : 'TienMat'

    const payload = {
      customerCode,
      items: cart.value.map((item) => ({
        bookCode: String(item.masach),
        quantity: Number(item.soluong) || 1
      })),
        paymentMethod: methodCode,
        paymentMethodDisplay: methodDisplay
    }

    if (discountCode.value) {
      payload.discountCode = discountCode.value
    }

    const res = await createOrder(payload)

    if (res && typeof res === 'object' && 'success' in res && res.success === false) {
      throw new Error(res.message || 'Tạo đơn hàng thất bại')
    }

    const orderCode = res?.code || res?.orderCode || res?.data?.code || null
    notifySuccess('Success', orderCode ? `Đã tạo đơn hàng ${orderCode}` : 'Đã tạo đơn hàng thành công')

    clearCart()
    try {
      if (typeof emitEvent === 'function') {
        emitEvent('books-changed')
          emitEvent('order-updated', { code: orderCode, status: 'DaDatHang', paymentMethod: methodCode, paymentMethodDisplay: methodDisplay })
      }
    } catch (e) {}
    showQr.value = false
    try {
      await router.push({ name: 'profile', query: { tab: 'orders' } })
    } catch (err) {
      console.warn('Navigation to orders history failed:', err)
    }
  } catch (e) {
    console.error(e)
    ElNotification({ title: 'Error', message: e?.message || 'Có lỗi khi lưu đơn hàng', type: 'error' })
  } finally {
    savingOrder.value = false
  }
}

async function applyDiscount() {
  // Validate discount by fetching discounts list and applying rules client-side
  const code = String(discountCode.value || '').trim()
  if (!code) {
    discountMessage.value = 'Vui lòng nhập mã giảm giá'
    return
  }
  discountMessage.value = 'Đang kiểm tra mã...'
  try {
    // call backend validate endpoint which returns exact discount amount and code info
    const res = await request({ url: '/discounts/validate', method: 'post', data: { ma_code: code, tongtien: subtotal.value } })
    // response from DiscountController::validateCode: { success: true, discount, code }
    if (!res || !res.success) {
      discountMessage.value = res?.message || 'Mã giảm giá không hợp lệ'
      return
    }
    const amount = Number(res.discount || 0)
    const detail = { code, amount, meta: res.code || null }
    setCartDiscount(code)
    setCartDiscountDetail(detail)
    discountDetail.value = detail
    discountMessage.value = ''
    notifySuccess('Success', `Áp dụng mã ${code} thành công`)
  } catch (e) {
    console.error(e)
    discountMessage.value = e?.response?.data?.message || 'Lỗi khi kiểm tra mã'
  }
}
</script>

<style scoped>
.cart-page .container {
  max-width: 1100px;
  margin: 36px auto;
  padding: 0 16px;
}
.page-title { font-size: 28px; margin-bottom: 18px; }
.empty-state { text-align: center; padding: 40px; border: 1px dashed #ddd; border-radius: 8px; }
.btn-continue { display:inline-block; margin-top:12px; padding:8px 14px; background:#007bff; color:#fff; border-radius:6px; }
.cart-grid { display:flex; gap:24px; align-items:flex-start; }
.cart-items { flex:1; }
.cart-row { display:flex; gap:16px; align-items:center; padding:14px; border-radius:10px; background:#fff; box-shadow:0 6px 18px rgba(11,22,40,0.03); margin-bottom:12px; }
.cart-row .thumb { width:92px; height:124px; object-fit:cover; border-radius:6px; }
.cart-row .info { flex:1; }
.cart-row .title { font-size:16px; margin:0 0 6px 0; }
.cart-row .meta { font-size:12px; color:#777; margin-bottom:8px }
.cart-row .price { color:#d9534f; font-weight:700; margin-bottom:8px }
.qty-row { display:flex; align-items:center; gap:8px }
.qty-btn { width:34px; height:34px; border-radius:6px; border:1px solid #e3e7ef; background:#fff; cursor:pointer; color: black }
.qty-input { width:64px; text-align:center; padding:6px; border:1px solid #eee; border-radius:6px }
.line-right { width:140px; text-align:right }
.line-right .sub { font-weight:700; margin-bottom:10px }
.remove { background:transparent; color:#777; border:none; cursor:pointer }
.summary { width:320px; padding:20px; border-radius:10px; background:linear-gradient(180deg,#fff,#f8fbff); box-shadow:0 6px 18px rgba(11,22,40,0.04) }
.summary h2 { margin-top:0 }
.summary-row { display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px dashed #eee }
.summary-row.total { border-bottom:none; font-size:18px; margin-top:10px }
.summary-actions { display:flex; gap:10px; margin-top:16px }
.btn-checkout { flex:1; padding:10px 12px; background:#ff8a66; color:#fff; border:none; border-radius:8px; cursor:pointer; box-shadow:0 6px 18px rgba(255,138,102,0.18) }
.btn-checkout:hover { background:#ff704d }
.btn-checkout[disabled] { opacity:0.6; cursor:not-allowed }
.btn-clear { flex:1; padding:10px 12px; background:#fff; border:1px solid #f2bdb3; color:#c0392b; border-radius:8px; cursor:pointer }

@media (max-width: 900px) {
  .cart-grid { flex-direction:column }
  .summary { width:100% }
}

/* QR modal */
.qr-modal { position:fixed; inset:0; display:flex; align-items:center; justify-content:center; z-index:1000 }
.qr-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.45) }
.qr-box { position:relative; z-index:1010; background:#fff; padding:20px; border-radius:12px; width:360px; max-width:95%; text-align:center }
.qr-image { width:260px; height:260px; object-fit:contain; margin:10px auto }
.qr-actions { display:flex; gap:10px; margin-top:12px }
.note { font-size:13px; color:#444 }

/* New table-like cart layout */
  /* container should match outer .container width and not exceed it */
  .cart-container { display:flex; gap:28px; align-items:flex-start; width:100%; margin:0 auto; padding:0; justify-content:space-between }
  /* reserve space for summary (340px) and let main take remaining space reliably */
  .cart-main { flex: 1 1 auto; min-width:0; margin-right:28px }
.cart-table { width:100% }

/* Header labels */
.cart-header { display:flex; gap:12px; padding:14px 18px; background:#fdeeee; color:#6b6b6b; font-weight:700; border-radius:8px }
.cart-header .col { padding:0 8px; display:flex; align-items:center }

.cart-row { display:flex; gap:16px; align-items:flex-start; padding:18px; margin:18px 0; background:#fff; border-radius:10px; box-shadow:0 6px 18px rgba(11,22,40,0.03) }
.cart-row .col { padding:0 8px; display:flex; align-items:center }
.col-image { width:120px; flex:0 0 120px }
.col-image .thumb { width:100px; height:130px; object-fit:cover; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.06) }
.col-name { flex:1 1 320px; min-width:180px }
.col-name .title { font-size:16px; margin:0 0 6px 0; line-height:1.3; color:#123; display:-webkit-box; -webkit-line-clamp:2; line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; text-overflow:ellipsis; }
.col-name .meta { font-size:13px; color:#888; display:inline-block; max-width:100%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap }

/* hide product code (meta) visually to reduce clutter */
.col-name .meta { display:none }
.col-price { width:120px; flex:0 0 120px; justify-content:center; color:#444 }
.col-qty { width:160px; flex:0 0 160px; justify-content:center }
.col-total { width:140px; flex:0 0 140px; justify-content:center; font-weight:700 }
.col-remove { width:80px; flex:0 0 80px; justify-content:center }

/* Quantity controls */
.qty-row { display:flex; gap:8px; align-items:center }
.qty-btn { width:36px; height:36px; border-radius:8px; border:1px solid #e6e6e6; background:#fff; cursor:pointer }
.qty-input { width:56px; text-align:center; padding:8px; border-radius:8px; border:1px solid #eee }

.remove { background:transparent; border:none; color:#9aa; cursor:pointer; font-size:18px; padding:6px; border-radius:8px }
.remove svg { transition: stroke 150ms ease, transform 150ms ease }
.remove:hover { background:rgba(217,84,79,0.06) }
.remove:hover svg { stroke:#d9534f; transform:translateY(-2px) }

/* Footer area: coupon + actions */
.cart-footer { display:flex; flex-direction:column; gap:14px; margin:12px 0 }
.coupon { display:flex; gap:12px; align-items:center }
.coupon input { padding:10px 12px; border-radius:999px; border:1px solid #f0e0e0; width:260px }
.btn-apply { background:#ff8a66; color:#fff; border:none; padding:10px 16px; border-radius:999px; cursor:pointer }
.btn-cancel-code { background:#fff; color:#c0392b; border:1px solid #f2bdb3; padding:10px 14px; border-radius:999px; cursor:pointer }
.actions { display:flex; gap:12px }
.btn-update { background:#fff; border:1px solid #e6a6a6; padding:10px 18px; border-radius:999px }
.btn-continue { display:inline-flex; align-items:center; padding:10px 18px; background:#ff8a66; color:#fff; border-radius:999px }

/* Summary column: sticky on desktop */
.summary { width:340px; padding:22px; border-radius:12px; background:linear-gradient(180deg,#fff,#f8fbff); box-shadow:0 8px 30px rgba(11,22,40,0.06); height:fit-content }
.summary h2 { margin-top:0 }

/* when summary is moved to bottom, make it full width and non-sticky */
.summary-bottom { width:100%; position:relative; margin-top:20px; display:flex; justify-content:center }

/* card inside bottom summary to match previous summary visual weight */
.summary-bottom .summary-card { width:100%; padding:18px 20px; border-radius:12px; background:linear-gradient(180deg,#fff,#f8fbff); box-shadow:0 8px 30px rgba(11,22,40,0.06) }
.summary-bottom .discount-row { display:block }
.summary-bottom input#discount { width:100%; padding:10px 12px; border-radius:8px; border:1px solid #eee; box-sizing:border-box }
.summary-bottom .btn-apply { padding:10px 14px }
.summary-bottom .summary-actions { display:flex; gap:12px; margin-top:16px }
.summary-bottom label { cursor:pointer }
.summary-bottom input[type="radio"] { accent-color:#ff8a66 }

/* Payment method toggle */
.pay-method { margin-top:14px }
.pay-label { font-size:13px; color:#444; margin-bottom:8px }
.pay-toggle { display:flex; gap:10px }
.pay-option { 
  display:inline-flex; align-items:center; gap:8px; 
  padding:10px 14px; border-radius:10px; border:1px solid #e9eef5; 
  background:#fff; color:#233; cursor:pointer; 
  transition: all .18s ease; box-shadow:0 2px 8px rgba(16,24,40,0.04);
}
.pay-option .icon { display:inline-flex; width:20px; height:20px; align-items:center; justify-content:center }
.pay-option:hover { border-color:#ffd1c2; box-shadow:0 6px 18px rgba(255,138,102,0.15) }
.pay-option.active { background:#ff8a66; border-color:#ff8a66; color:#fff; box-shadow:0 8px 22px rgba(255,138,102,0.35) }
.pay-option.active .icon svg * { stroke:#fff !important }
.pay-option:focus-visible { outline:2px solid #ffb59f; outline-offset:2px }

@media (max-width: 420px) {
  .pay-toggle { flex-direction:column }
}

/* small breakpoint tweaks */
@media (max-width: 720px) {
  .summary-bottom .summary-card { width:100%; padding:16px }
  .summary-bottom .summary-actions { flex-direction:column }
}

/* make layout responsive */
@media (max-width: 1100px) {
  .cart-container { flex-direction:column; padding:0 16px }
  .summary { width:100%; position:relative; top:unset; margin-top:16px }
  .col-image { display:flex; justify-content:center }
}

@media (max-width: 720px) {
  .cart-header { display:none }
  .cart-row { flex-direction:column; gap:12px }
  .col-price, .col-qty, .col-total, .col-remove { width:100%; justify-content:flex-start }
  .col-name { min-width:0 }
}
</style>
