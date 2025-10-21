import request from './request'

// Lấy thông tin khách hàng theo mã
export function getCustomerByCode(code) {
  return request({
    url: `/Customers/${code}`,
    method: 'get'
  })
}

// Cập nhật thông tin khách hàng
export function updateCustomer(code, data) {
  return request({
    url: `/Customers/${code}`,
    method: 'put',
    data
  })
}
