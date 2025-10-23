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

export default { createOrder, getOrdersByCustomer, confirmOrder }
