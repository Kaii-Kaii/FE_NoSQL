import request from './request'

// Lấy thông tin khách hàng theo mã
export function getCustomerByCode(code) {
  return request({
    url: `/Customers/${code}`,
    method: 'get'
  })
}

// Cập nhật thông tin khách hàng (hỗ trợ upload avatar)
export function updateCustomer(code, data) {
  const formData = new FormData()

  if (data.fullName !== undefined) formData.append('FullName', data.fullName)
  if (data.email !== undefined) formData.append('Email', data.email)
  if (data.phone !== undefined) formData.append('Phone', data.phone)
  if (data.address !== undefined) formData.append('Address', data.address)

  if (data.removeAvatar !== undefined) {
    formData.append('RemoveAvatar', data.removeAvatar ? 'true' : 'false')
  }

  if (data.avatarFile instanceof File) {
    formData.append('Avatar', data.avatarFile)
  }

  return request({
    url: `/Customers/${encodeURIComponent(code)}`,
    method: 'put',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
