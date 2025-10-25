import request from './request'

export function getDailyRevenue(year, month) {
  const params = {}
  if (year !== undefined) params.year = year
  if (month !== undefined) params.month = month
  return request({
    url: '/Stats/revenue/daily',
    method: 'get',
    params
  })
}

export function getDailyBooksSold(year, month) {
  const params = {}
  if (year !== undefined) params.year = year
  if (month !== undefined) params.month = month
  return request({
    url: '/Stats/books-sold/daily',
    method: 'get',
    params
  })
}

export function getRevenue(year, month) {
  const params = {}
  if (year !== undefined) params.year = year
  if (month !== undefined) params.month = month
  return request({
    url: '/Stats/revenue',
    method: 'get',
    params
  })
}

export function getTopBooks(limit = 10) {
  return request({
    url: `/Stats/top-books?limit=${encodeURIComponent(limit)}`,
    method: 'get'
  })
}
