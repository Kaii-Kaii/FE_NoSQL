import request from './request'

// Tạo đơn hàng mới từ giỏ hàng của khách
export async function createOrder(payload) {
  return request({ url: '/Orders', method: 'post', data: payload })
}

// Lấy danh sách đơn hàng theo mã khách hàng
export async function getOrdersByCustomer(customerCode) {
  return request({ url: `/Orders/by-customer/${encodeURIComponent(customerCode)}`, method: 'get' })
}

// Khách xác nhận đã nhận hàng thành công
export async function confirmOrder(customerCode, orderCode) {
  return request({
    url: `/Orders/${encodeURIComponent(customerCode)}/orders/${encodeURIComponent(orderCode)}/confirm`,
    method: 'put'
  })
}

// Khách hủy đơn hàng với lý do
export async function cancelOrder(customerCode, orderCode, reason) {
  const payload = {}
  if (reason !== undefined && reason !== null) {
    payload.reason = reason
  }
  return request({
    url: `/Orders/${encodeURIComponent(customerCode)}/orders/${encodeURIComponent(orderCode)}/cancel`,
    method: 'put',
    data: payload
  })
}

// Lấy chi tiết đơn hàng theo mã
export async function getOrderByCode(orderCode) {
  return request({
    url: `/Orders/${encodeURIComponent(orderCode)}`,
    method: 'get'
  })
}

// Lấy danh sách đơn hàng cho trang quản trị
export async function getAdminOrders(params = {}) {
  const {
    page = 1,
    pageSize = 100,
    status,
    fromDate,
    toDate,
    customerCode,
    keyword
  } = params
  const query = { page, pageSize }
  const optionalParams = {
    status,
    fromDate,
    toDate,
    customerCode,
    keyword
  }
  Object.entries(optionalParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query[key] = value
    }
  })
  return request({
    url: '/Admin/orders',
    method: 'get',
    params: query
  })
}

// Cập nhật trạng thái đơn hàng trên trang quản trị
export async function updateAdminOrderStatus(customerCode, orderCode, status) {
  return request({
    url: `/Admin/orders/${encodeURIComponent(customerCode)}/${encodeURIComponent(orderCode)}/status`,
    method: 'put',
    params: {
      status,
      customerCode,
      orderCode
    },
    data: {
      status,
      Status: status,
      customerCode,
      orderCode
    }
  })
}

export default {
  createOrder,
  getOrdersByCustomer,
  confirmOrder,
  cancelOrder,
  getOrderByCode,
  getAdminOrders,
  updateAdminOrderStatus
}
