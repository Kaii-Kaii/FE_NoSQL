// src/api/cart.js
import { emit as emitEvent } from '@/utils/eventBus'

export function getCart() {
  try {
    const cart = localStorage.getItem("cart");
    if (!cart) return [];
    const parsed = JSON.parse(cart);
    if (!Array.isArray(parsed)) return [];
    // Expect stored items in API shape (MASACH, TENSACH, GIATIEN, ANHSACH/URLSACH, SOLUONG)
    // Return normalized lowercase shape used by components
    const normalized = parsed.map((it) => ({
      masach: it.MASACH != null ? String(it.MASACH) : null,
      tensach: it.TENSACH ?? "",
      gia: Number(it.GIATIEN ?? 0),
      anhsach: it.URLSACH ?? it.ANHSACH ?? "",
      soluong: Number(it.SOLUONG ?? 1), // default 1 nếu BE không trả
    }))

    const merged = []
    const indexById = new Map()
    for (const item of normalized) {
      if (!item.masach) {
        merged.push({ ...item })
        continue
      }
      if (!indexById.has(item.masach)) {
        indexById.set(item.masach, merged.length)
        merged.push({ ...item })
      } else {
        const idx = indexById.get(item.masach)
        merged[idx].soluong = Number(merged[idx].soluong || 0) + Number(item.soluong || 0)
        // prefer to keep latest metadata if it exists
        merged[idx].tensach = item.tensach || merged[idx].tensach
        merged[idx].gia = item.gia || merged[idx].gia
        merged[idx].anhsach = item.anhsach || merged[idx].anhsach
      }
    }
    if (merged.length !== normalized.length) {
      // Persist deduplicated results back to storage so future reads stay clean
      try { saveCart(merged) } catch (e) {}
    }
    return merged
  } catch (e) {
    console.warn("getCart: failed to parse cart from localStorage", e);
    return [];
  }
}

export function saveCart(cart) {
  try {
    // Ensure we save the normalized shape
    // Save using API field names so backend/client agree on shape
    const toSave = (cart || []).map((it) => ({
      MASACH: it.masach != null ? String(it.masach) : null,
      TENSACH: it.tensach,
      GIATIEN: Number(it.gia || 0),
      ANHSACH: it.anhsach,
      SOLUONG: Number(it.soluong || 0),
    }));
    localStorage.setItem("cart", JSON.stringify(toSave));
    // notify other parts of the app that cart changed
    try {
      // notify other parts of the app that cart changed via event bus
      if (typeof emitEvent === 'function') emitEvent('cart-changed', toSave)
    } catch (e) {
      // ignore
    }
  } catch (e) {
    console.warn("saveCart: failed to save cart", e);
  }
}

export function addToCart(product) {
  const cart = getCart();
  // Incoming product must follow API fields (MASACH, TENSACH, GIATIEN, URLSACH/ANHSACH, SOLUONG)
  const rawId = product.MASACH ?? null;
  const normalizedId = rawId != null ? String(rawId) : null;
  const p = {
    masach: normalizedId,
    tensach: product.TENSACH ?? "",
    gia: Number(product.GIATIEN ?? 0),
    anhsach: product.URLSACH ?? product.ANHSACH ?? "",
    soluong: Number(product.SOLUONG ?? 1),
  };

  const existing = cart.find((item) => item.masach === p.masach);
  if (existing) {
    existing.soluong = Number(existing.soluong || 0) + Number(p.soluong || 1);
  } else {
    cart.push(p);
  }
  saveCart(cart);
  return cart;
}

// Update quantity of a cart item; if qty <= 0, remove the item
export function updateCartItemQuantity(masach, qty) {
  try {
    const newQty = Math.max(0, Number(qty || 0));
    const cart = getCart();
    const targetId = masach != null ? String(masach) : null;
    const idx = cart.findIndex((it) => it.masach === targetId);
    if (idx === -1) return cart;
    if (newQty <= 0) {
      cart.splice(idx, 1);
    } else {
      cart[idx].soluong = newQty;
    }
    saveCart(cart);
    return cart;
  } catch (e) {
    console.warn('updateCartItemQuantity failed', e);
    return getCart();
  }
}

// Remove an item from cart by MASACH
export function removeFromCart(masach) {
  try {
    const cart = getCart();
    const targetId = masach != null ? String(masach) : null;
    const next = cart.filter((it) => it.masach !== targetId);
    saveCart(next);
    return next;
  } catch (e) {
    console.warn('removeFromCart failed', e);
    return getCart();
  }
}

// Discount helpers: store the applied discount code separately from items
export function getCartDiscount() {
  try {
    const s = localStorage.getItem('cart_discount')
    if (!s) return ''
    return String(s || '')
  } catch (e) {
    return ''
  }
}

export function setCartDiscount(code) {
  try {
    if (code == null || code === '') {
      localStorage.removeItem('cart_discount')
    } else {
      localStorage.setItem('cart_discount', String(code))
    }
    // also emit cart-changed so UI updates
    try { if (typeof emitEvent === 'function') emitEvent('cart-changed') } catch (e) {}
  } catch (e) {
    console.warn('setCartDiscount failed', e)
  }
}

export function clearCartDiscount() {
  try { localStorage.removeItem('cart_discount') } catch (e) {}
  try { if (typeof emitEvent === 'function') emitEvent('cart-changed') } catch (e) {}
}

export function getCartDiscountDetail() {
  try {
    const s = localStorage.getItem('cart_discount_detail')
    if (!s) return null
    return JSON.parse(s)
  } catch (e) {
    return null
  }
}

export function setCartDiscountDetail(detail) {
  try {
    if (!detail) {
      localStorage.removeItem('cart_discount_detail')
    } else {
      localStorage.setItem('cart_discount_detail', JSON.stringify(detail))
    }
    try { if (typeof emitEvent === 'function') emitEvent('cart-changed') } catch (e) {}
  } catch (e) {
    console.warn('setCartDiscountDetail failed', e)
  }
}

export function clearCartDiscountDetail() {
  try { localStorage.removeItem('cart_discount_detail') } catch (e) {}
  try { if (typeof emitEvent === 'function') emitEvent('cart-changed') } catch (e) {}
}
