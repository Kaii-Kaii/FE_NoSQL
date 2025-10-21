import request from './request'

// Fetch all reviews for a specific book code
export function getReviewsByBook(bookCode) {
  if (!bookCode) {
    return Promise.resolve([])
  }
  return request({
    url: `/Reviews/book/${encodeURIComponent(bookCode)}`,
    method: 'get'
  })
}

// Fetch aggregated review statistics for a book
export function getReviewStatsByBook(bookCode) {
  if (!bookCode) {
    return Promise.resolve({})
  }
  return request({
    url: `/Reviews/book/${encodeURIComponent(bookCode)}/stats`,
    method: 'get'
  })
}

// Create new review
export function createReview(payload) {
  return request({
    url: '/Reviews',
    method: 'post',
    data: payload
  })
}

// Update existing review
export function updateReview(reviewId, payload) {
  return request({
    url: `/Reviews/${encodeURIComponent(reviewId)}`,
    method: 'put',
    data: payload
  })
}

// Delete review by id
export function deleteReview(reviewId) {
  return request({
    url: `/Reviews/${encodeURIComponent(reviewId)}`,
    method: 'delete'
  })
}
