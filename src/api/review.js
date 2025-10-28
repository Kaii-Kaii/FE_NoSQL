import request from './request'

const buildHeaders = (customerCode) => {
  const headers = {}
  if (customerCode) {
    headers['X-Customer-Code'] = customerCode
  }
  return headers
}

export function getReviewsByBook(bookCode) {
  if (!bookCode) return Promise.resolve([])
  return request({
    url: `/Reviews/${encodeURIComponent(bookCode)}`,
    method: 'get'
  })
}

export function createReview(payload = {}, customerCode) {
  const body = {
    bookCode: payload.bookCode ?? payload.MASACH ?? payload.code,
    orderCode: payload.orderCode ?? payload.order_code ?? payload.ORDER_CODE,
    rating: payload.rating ?? payload.SAO ?? payload.star ?? 0,
    content: payload.content ?? payload.NOIDUNG ?? payload.message ?? ''
  }

  return request({
    url: '/Reviews',
    method: 'post',
    data: body,
    headers: buildHeaders(customerCode ?? payload.customerCode)
  })
}

export function updateReview(bookCode, reviewId, payload = {}, customerCode) {
  if (!bookCode || !reviewId) {
    return Promise.reject(new Error('Thiếu mã sách hoặc mã đánh giá để cập nhật'))
  }
  const body = {
    rating: payload.rating ?? payload.SAO ?? payload.star ?? 0,
    content: payload.content ?? payload.NOIDUNG ?? payload.message ?? ''
  }

  return request({
    url: `/Reviews/${encodeURIComponent(bookCode)}/${encodeURIComponent(reviewId)}`,
    method: 'put',
    data: body,
    headers: buildHeaders(customerCode ?? payload.customerCode)
  })
}

export function deleteReview(bookCode, reviewId, customerCode) {
  if (!bookCode || !reviewId) {
    return Promise.reject(new Error('Thiếu mã sách hoặc mã đánh giá để xóa'))
  }
  return request({
    url: `/Reviews/${encodeURIComponent(bookCode)}/${encodeURIComponent(reviewId)}`,
    method: 'delete',
    headers: buildHeaders(customerCode)
  })
}
