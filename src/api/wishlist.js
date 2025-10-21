// src/api/wishlist.js
import { emit as emitEvent } from '@/utils/eventBus'

const STORAGE_KEY = 'wishlist'

// Normalize incoming API product shape (uppercase) to internal lowercase like cart.js
function normalize(product) {
  if (!product) return null
  const rawId = product.MASACH ?? null
  return {
    masach: rawId != null ? String(rawId) : null,
    tensach: product.TENSACH ?? '',
    gia: Number(product.GIATIEN ?? 0),
    anhsach: product.URLSACH ?? product.ANHSACH ?? '',
  }
}

export function getWishlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    // parsed saved with uppercase keys; return normalized
    const normalized = parsed.map((it) => ({
      masach: it.MASACH != null ? String(it.MASACH) : null,
      tensach: it.TENSACH ?? '',
      gia: Number(it.GIATIEN ?? 0),
      anhsach: it.ANHSACH ?? it.URLSACH ?? '',
    }))

    const deduped = []
    const seen = new Set()
    for (const item of normalized) {
      const id = item.masach
      if (!id) {
        deduped.push({ ...item })
        continue
      }
      if (seen.has(id)) {
        continue
      }
      seen.add(id)
      deduped.push({ ...item })
    }
    if (deduped.length !== normalized.length) {
      try { saveWishlist(deduped) } catch (e) {}
    }
    return deduped
  } catch (e) {
    console.warn('getWishlist parse error', e)
    return []
  }
}

export function saveWishlist(list) {
  try {
    const toSave = (list || []).map((it) => ({
      MASACH: it.masach != null ? String(it.masach) : null,
      TENSACH: it.tensach,
      GIATIEN: Number(it.gia || 0),
      ANHSACH: it.anhsach,
    }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    try { if (typeof emitEvent === 'function') emitEvent('wishlist-changed', toSave) } catch (e) {}
  } catch (e) {
    console.warn('saveWishlist failed', e)
  }
}

export function addToWishlist(product) {
  const item = normalize(product)
  if (!item || !item.masach) return getWishlist()
  const list = getWishlist()
  if (!list.find((i) => i.masach === item.masach)) {
    list.push(item)
    saveWishlist(list)
  }
  return list
}

export function removeFromWishlist(masach) {
  try {
    const list = getWishlist()
    const targetId = masach != null ? String(masach) : null
    const next = list.filter((i) => i.masach !== targetId)
    saveWishlist(next)
    return next
  } catch (e) {
    return getWishlist()
  }
}

export function toggleWishlist(product) {
  const item = normalize(product)
  if (!item || !item.masach) return getWishlist()
  const list = getWishlist()
  const exists = list.some((i) => i.masach === item.masach)
  if (exists) {
    return removeFromWishlist(item.masach)
  }
  list.push(item)
  saveWishlist(list)
  return list
}

export function isInWishlist(masach) {
  try {
    const list = getWishlist()
    const targetId = masach != null ? String(masach) : null
    return list.some((i) => i.masach === targetId)
  } catch (e) { return false }
}

export function getWishlistIds() {
  const ids = []
  for (const item of getWishlist()) {
    if (item.masach != null) ids.push(String(item.masach))
  }
  return new Set(ids)
}
