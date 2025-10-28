<template>
    
  <!--==============================
        Header Area
    ==============================-->
  <header class="vs-header header-layout1 style2">
    <div class="header-middle">
      <div class="container">
        <div class="row justify-content-sm-between justify-content-center align-items-center gx-sm-0">
          <div class="col-auto">
            <div class="header-logo">
              <router-link to="/home"><img src="@/assets/img/dark-logo.svg" alt="Ebukz" class="logo"></router-link>
            </div>
          </div>
          <div class="col-auto">
            <div class="header-inner">
              <div class="header-search-placeholder"></div>
              <div class="header-buttons">
                <router-link to="/wishlist" class="vs-icon wishlist"><i class="fal fa-heart"></i></router-link>
                <div class="header-info">
                  <div class="header-info_icon">
                    <div class="user-login">
                      <router-link to="/home/profile" class="vs-icon" title="Thông tin cá nhân">
                        <i class="fa-solid fa-user"></i>
                      </router-link>
                    </div>
                  </div>
                    <div class="header-cart" @mouseenter="showPreview" @mouseleave="hidePreview">
                  <a href="#" class="vs-icon has-badge" @click.prevent="goToCart"><i class="fa-solid fa-basket-shopping"></i><span
                      class="badge">{{ cartCount }}</span></a>
                  <div class="woocommerce widget_shopping_cart">
                    <div class="widget_shopping_cart_content">
                      <ul class="cart_list">
                        <li v-for="(item, idx) in cartPreview" :key="item.masach || idx" class="mini_cart_item">
                          <a href="#" class="remove" @click.prevent="onRemove(item)" aria-label="Remove from cart"><i class="far fa-times"></i></a>
                          <a href="#" class="img"><img :src="getImage(item.anhsach)" alt="Cart Image"></a>
                          <a href="#" class="product-title">{{ item.tensach }}</a>
                          <span class="amount">{{ formatPrice(item.gia) }}</span>
                          <div class="quantity qty-control">
                            <button class="qty-btn minus" aria-label="Giảm" @click.prevent="decQty(item)">-</button>
                            <input type="number" class="qty-input" :value="item.soluong" min="0" @change="onQtyChange(item, $event.target.value)" />
                            <button class="qty-btn plus" aria-label="Tăng" @click.prevent="incQty(item)">+</button>
                          </div>
                        </li>
                        <li v-if="cartPreview.length === 0" class="mini_cart_item"><p class="text-center">Giỏ hàng trống</p></li>
                      </ul>
                      <p class="total">
                        <strong>Subtotal:</strong>
                        <span class="amount">
                          <span v-if="appliedDiscountDetail" style="text-decoration:line-through;color:#999;margin-right:8px">{{ formatPrice(subtotal) }}</span>
                          <span v-else>{{ formatPrice(subtotal) }}</span>
                        </span>
                      </p>
                      <p v-if="appliedDiscountDetail" class="total" style="margin-top:6px">
                        <strong>Giảm:</strong>
                        <span class="amount">-{{ formatPrice(appliedDiscountDetail.amount || (appliedDiscountDetail.meta?.GIA_TRI || 0)) }}</span>
                      </p>
                      <p v-if="appliedDiscountDetail" class="total" style="margin-top:6px">
                        <strong>Tổng:</strong>
                        <span class="amount">{{ formatPrice(Math.max(0, subtotal - (appliedDiscountDetail.amount || 0))) }}</span>
                      </p>
                      <p class="buttons flex gap-3">
                        <a href="#" class="vs-btn" @click.prevent="goToCart">View cart</a>
                        <a href="#" class="vs-btn checkout" @click.prevent="clearAll">Xóa toàn bộ</a>
                      </p>
                    </div>
                  </div>
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="sticky-wrapper header-bottom">
      <div class="sticky-active">
        <div class="container">
          <div class="menu-top">
            <div class="row justify-content-between align-items-center gx-sm-0">
              <div class="col-xl-auto">
                <div class="menu-inner">
                  <div class="header-category">
                    <button class="category-toggler"><i class="fa-solid fa-bars-sort"></i>Categories</button>
                    <div class="vs-box-nav">
                      <ul>
                        <li><a href="shop.html"><img src="@/assets/img/icons/categori-i-1.svg" alt="icon">Romance</a>
                        </li>
                        <li><a href="shop.html"><img src="@/assets/img/icons/categori-i-2.svg" alt="icon">Thriller</a>
                        </li>
                        <li><a href="shop.html"><img src="@/assets/img/icons/categori-i-3.svg" alt="icon">Fantasy</a>
                        </li>
                        <li><a href="shop.html"><img src="@/assets/img/icons/categori-i-4.svg" alt="icon">Since
                            Fiction</a></li>
                        <li><a href="shop.html"><img src="@/assets/img/icons/categori-i-5.svg" alt="icon">Since</a></li>
                        <li><a href="shop.html"><img src="@/assets/img/icons/categori-i-6.svg" alt="icon">Adventure</a>
                        </li>
                        <li><a href="shop.html"><img src="@/assets/img/icons/categori-i-7.svg" alt="icon">Kids</a></li>
                        <li><a href="shop.html"><img src="@/assets/img/icons/categori-i-8.svg" alt="icon">cartoon &
                            Story</a></li>
                      </ul>
                    </div>
                  </div>
                  <div class="header-logo">
                    <router-link to="/home"><img src="@/assets/img/dark-logo.svg" alt="Ebukz" class="logo"></router-link>
                  </div>
                  <div class="menu-area">
                    <nav class="main-menu menu-style1 d-none d-lg-block">
                      <ul>
                        <li class="menu-item-has-children">
                          <router-link to="/home">Home</router-link>
                          <ul class="sub-menu">
                            <li><router-link to="/home">Home 1</router-link></li>
                            <li><router-link to="/home">Home 2</router-link></li>
                            <li><router-link to="/home">Home 3</router-link></li>
                          </ul>
                        </li>
                        <li class="menu-item-has-children">
                          <a href="shop.html">Shop</a>
                          <ul class="sub-menu">
                            <li><a href="shop.html">Shop</a></li>
                            <li><a href="shop-sidebar.html">Shop Sidebar</a></li>
                            <li><a href="shop-details.html">Shop Details</a></li>
                          </ul>
                        </li>
                        <li class="menu-item-has-children">
                          <a href="vendor.html">Vendor</a>
                          <ul class="sub-menu">
                            <li><a href="vendor.html">Vendor</a></li>
                            <li><a href="vendor-details.html">Vendor Details</a></li>
                          </ul>
                        </li>
                        <li class="menu-item-has-children mega-menu-wrap">
                          <a href="#">Pages</a>
                          <ul class="mega-menu">
                            <li><a href="shop.html">Page List 1</a>
                              <ul>
                                <li><router-link to="/home">Home 1</router-link></li>
                                <li><a href="index-2.html">Home 2</a></li>
                                <li><a href="index-3.html">Home 3</a></li>
                                <li><a href="about.html">About</a></li>
                                <li><a href="contact.html">Contact</a></li>
                              </ul>
                            </li>
                            <li><a href="#">Page List 2</a>
                              <ul>
                                <li><a href="blog.html">Blog</a></li>
                                <li><a href="blog-sidebar.html">Blog Sidebar</a></li>
                                <li><a href="blog-sidebar-2.html">Blog Sidebar 2</a></li>
                                <li><a href="Blog-Standard.html">Blog Standard</a></li>
                                <li><a href="blog-details.html">Blog Details</a></li>
                              </ul>
                            </li>
                            <li><a href="#">Page List 3</a>
                              <ul>
                                <li><a href="cart.html">Cart</a></li>
                                <li><a href="shop.html">Shop</a></li>
                                <li><a href="shop-sidebar.html">Shop Sidebar</a></li>
                                <li><a href="shop-details.html">Shop Details</a></li>
                                <li><a href="404.html">Error Page</a></li>
                              </ul>
                            </li>
                            <li><a href="#">Page List 4</a>
                              <ul>
                                <li><a href="wishlist.html">wishlist</a></li>
                                <li><a href="checkout.html">checkout</a></li>
                                <li><a href="author.html">All Authors</a></li>
                                <li><a href="author-details.html">Author Details</a></li>
                                <li><a href="vendor.html">Vendor</a></li>
                                <li><a href="vendor-details.html">Vendor Details</a></li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                        <li class="menu-item-has-children">
                          <a href="blog.html">Blog</a>
                          <ul class="sub-menu">
                            <li><a href="blog.html">Blog</a></li>
                            <li><a href="blog-sidebar.html">Blog Sidebar</a></li>
                            <li><a href="blog-sidebar-2.html">Blog Sidebar 2</a></li>
                            <li><a href="Blog-Standard.html">Blog Standard</a></li>
                            <li><a href="blog-details.html">Blog Details</a></li>
                          </ul>
                        </li>
                        <li>
                          <a href="contact.html">Contact</a>
                        </li>
                      </ul>
                    </nav>
                    <button class="vs-menu-toggle d-inline-block d-lg-none"><i class="fal fa-bars"></i></button>
                  </div>
                </div>
              </div>
              <div class="col-auto d-xl-block d-none">
                <div class="header-cart" @mouseenter="showPreview" @mouseleave="scheduleHide">
                  <a href="#" class="vs-icon has-badge" @click.prevent="goToCart"><i class="fa-solid fa-basket-shopping"></i><span
                      class="badge">{{ cartCount }}</span></a>
                  <div class="woocommerce widget_shopping_cart" v-if="showCartPreview" @mouseenter="cancelHide" @mouseleave="scheduleHide" @focusin="cancelHide" @focusout="scheduleHide">
                    <div class="widget_shopping_cart_content">
                      <ul class="cart_list">
                        <li v-for="(item, idx) in cartPreview" :key="item.masach || idx" class="mini_cart_item">
                          <a href="#" class="remove" @click.prevent="onRemove(item)" aria-label="Remove from cart"><i class="far fa-times"></i></a>
                          <a href="#" class="img"><img :src="getImage(item.anhsach)" alt="Cart Image"></a>
                          <a href="#" class="product-title">{{ item.tensach }}</a>
                          <span class="amount">{{ formatPrice(item.gia) }}</span>
                          <div class="quantity qty-control">
                            <button class="qty-btn minus" aria-label="Giảm" @click.prevent="decQty(item)">-</button>
                            <input type="number" class="qty-input" :value="item.soluong" min="0" @change="onQtyChange(item, $event.target.value)" />
                            <button class="qty-btn plus" aria-label="Tăng" @click.prevent="incQty(item)">+</button>
                          </div>
                        </li>
                        <li v-if="cartPreview.length === 0" class="mini_cart_item"><p class="text-center">Giỏ hàng trống</p></li>
                      </ul>
                      <p class="total">
                        <strong>Subtotal:</strong>
                        <span class="amount">
                          <span v-if="appliedDiscountDetail" style="text-decoration:line-through;color:#999;margin-right:8px">{{ formatPrice(subtotal) }}</span>
                          <span v-else>{{ formatPrice(subtotal) }}</span>
                        </span>
                      </p>
                      <p v-if="appliedDiscountDetail" class="total" style="margin-top:6px">
                        <strong>Giảm:</strong>
                        <span class="amount">-{{ formatPrice(appliedDiscountDetail.amount || (appliedDiscountDetail.meta?.GIA_TRI || 0)) }}</span>
                      </p>
                      <p v-if="appliedDiscountDetail" class="total" style="margin-top:6px">
                        <strong>Tổng:</strong>
                        <span class="amount">{{ formatPrice(Math.max(0, subtotal - (appliedDiscountDetail.amount || 0))) }}</span>
                      </p>
                      <p class="buttons">
                        <a href="#" class="vs-btn" @click.prevent="goToCart">View cart</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div> -->
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCart, getCartDiscount, getCartDiscountDetail, updateCartItemQuantity, removeFromCart, saveCart, clearCartDiscount, clearCartDiscountDetail } from '@/api/cart'
import { on as onEvent, off as offEvent } from '@/utils/eventBus'

const router = useRouter()
const cartPreview = ref([])
// simple reactive signal to force recompute when cart changes
const cartSignal = ref(0)
const showCartPreview = ref(false)
const appliedDiscount = ref('')
const appliedDiscountDetail = ref(null)
let hideTimer = null

function refreshPreview() {
  try {
    const c = getCart() || []
    // Show full list in the mini-cart; the list itself will scroll
    cartPreview.value = c
    appliedDiscount.value = getCartDiscount() || ''
    appliedDiscountDetail.value = getCartDiscountDetail()
  } catch (e) {
    cartPreview.value = []
  }
}

function showPreview() {
  refreshPreview()
  cancelHide()
  showCartPreview.value = true
}

function hidePreview() {
  showCartPreview.value = false
}

function scheduleHide() {
  cancelHide()
  hideTimer = setTimeout(() => {
    showCartPreview.value = false
  }, 200) // slight delay so users can move into the panel
}

function cancelHide() {
  if (hideTimer) {
    clearTimeout(hideTimer)
    hideTimer = null
  }
}

function goToCart() {
  router.push({ path: '/home/cart' })
}

// (refreshPreview already declared above)

const cartCount = computed(() => {
  // depend on cartSignal so this computed re-evaluates when we bump the signal
  void cartSignal.value
  try {
    const c = getCart() || []
    // show distinct book count instead of total quantities
    return c.length
  } catch (e) {
    return 0
  }
})

const subtotal = computed(() => {
  void cartSignal.value
  try {
    const c = getCart() || []
    return c.reduce((sum, it) => sum + (Number(it.gia || 0) * (Number(it.soluong) || 0)), 0)
  } catch (e) {
    return 0
  }
})

// listen for global cart changes so header stays in sync
function onCartChanged() {
  // refresh preview and bump signal so computed values update
  refreshPreview()
  cartSignal.value = (cartSignal.value || 0) + 1
}

onMounted(() => {
  // init preview
  refreshPreview()
  // subscribe to cart-changed events via event bus
  try { onEvent('cart-changed', onCartChanged) } catch (e) {}
})

onUnmounted(() => {
  try { offEvent('cart-changed', onCartChanged) } catch (e) {}
  cancelHide()
})

function formatPrice(v) {
  const n = Number(v || 0)
  return n.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })
}

function getImage(filename) {
  if (!filename) return require('@/assets/img/cart/cat-img-1.jpg')
  // if API returns a full URL (starts with http) use it directly
  try {
    const s = String(filename || '')
    if (/^https?:\/\//i.test(s)) return s
    // otherwise treat as uploaded filename
    return `/uploads/book/${s.replace(/^\/+/, '')}`
  } catch (e) {
    return require('@/assets/img/cart/cat-img-1.jpg')
  }
}

function onQtyChange(item, value) {
  const raw = String(value ?? '').trim()
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n) || Number.isNaN(n)) return
  if (n <= 0) {
    // qty <= 0 means remove
    removeFromCart(item.masach)
  } else {
    updateCartItemQuantity(item.masach, n)
  }
  // refresh quick preview immediately
  refreshPreview()
  // bump signal to update computed values
  cartSignal.value = (cartSignal.value || 0) + 1
}

function onRemove(item) {
  removeFromCart(item.masach)
  refreshPreview()
  cartSignal.value = (cartSignal.value || 0) + 1
}

function incQty(item) {
  const next = Number(item.soluong || 0) + 1
  updateCartItemQuantity(item.masach, next)
  refreshPreview()
  cartSignal.value = (cartSignal.value || 0) + 1
}

function decQty(item) {
  const next = Number(item.soluong || 0) - 1
  if (next <= 0) {
    removeFromCart(item.masach)
  } else {
    updateCartItemQuantity(item.masach, next)
  }
  refreshPreview()
  cartSignal.value = (cartSignal.value || 0) + 1
}

function clearAll() {
  // empty cart and clear any applied discounts
  try {
    saveCart([])
    clearCartDiscount()
    clearCartDiscountDetail()
  } catch (e) {}
  refreshPreview()
  cartSignal.value = (cartSignal.value || 0) + 1
}
</script>

<style scoped>
/* layout adjustments now that search input is moved elsewhere */
.header-inner {
  display: flex;
  align-items: center;
  gap: 18px;
}

.header-search-placeholder {
  flex: 1 1 auto;
  min-width: 0;
}

/* Quantity controls inside cart preview */
.qty-control {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
  max-width: 100%;
  flex-wrap: nowrap;        /* keep controls on one line */
  white-space: nowrap;      /* avoid wrapping */
}

.qty-input {
  display: inline-block;    /* avoid block-level wrap */
  width: 56px !important;   /* override theme widths if any */
  height: 28px;
  text-align: center;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background: #fff;
  outline: none;
  box-sizing: border-box;
}

/* Hide spinners for number input */
.qty-input::-webkit-outer-spin-button,
.qty-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.qty-input[type=number] {
  appearance: textfield;
  -moz-appearance: textfield;
}

.qty-btn {
  flex: 0 0 auto;           /* prevent shrinking */
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e5e5e5;
  border-radius: 4px;
  background: #fff;
  color: #333;
  font-weight: 700;
  line-height: 1;
  cursor: pointer;
  transition: all .15s ease;
}
.qty-btn:hover {
  background: #f5f5f5;
}

/* Keep remove icon aligned nicely */
.mini_cart_item .remove {
  float: right;
  color: #333;
}
.mini_cart_item .remove:hover {
  color: #e74c3c;
}

/* Make mini-cart list scrollable and compact so totals/buttons are visible */
.woocommerce.widget_shopping_cart .widget_shopping_cart_content {
  display: flex;
  flex-direction: column;
  max-height: 70vh; /* safety cap on very small screens */
  /* prevent horizontal scroll leaking but don't clip controls */
  overflow-x: hidden;
}

.woocommerce.widget_shopping_cart .cart_list {
  flex: 1 1 auto;
  max-height: 56vh; /* scroll area for items (more room for totals/buttons) */
  overflow-y: auto;
  overflow-x: hidden; /* no horizontal scroll */
  padding-right: 6px; /* room for scrollbar */
  padding-left: 6px;  /* avoid left-edge clipping of minus button */
}

/* Compact item styles */
.mini_cart_item {
  padding: 10px 0;
  overflow: visible; /* ensure inner controls aren't clipped */
}
.mini_cart_item .img img {
  width: 48px;
  height: 48px;
  object-fit: cover;
}
.mini_cart_item .product-title {
  font-size: 14px;
  line-height: 1.3;
}
.mini_cart_item .amount {
  font-size: 14px;
}

/* Compact totals and buttons area */
.woocommerce.widget_shopping_cart .total {
  margin: 6px 0;
  font-size: 14px;
}
.woocommerce.widget_shopping_cart .total strong {
  font-size: 15px;
}
.woocommerce.widget_shopping_cart .buttons {
  display: flex;
  gap: 10px;
  margin-top: 8px;
}
.woocommerce.widget_shopping_cart .buttons .vs-btn {
  padding: 8px 14px;
  font-size: 14px;
  border-radius: 8px;
}

/* Avoid horizontal overflow in item content */
.mini_cart_item .product-title {
  display: block;
  word-break: break-word;
}
</style>