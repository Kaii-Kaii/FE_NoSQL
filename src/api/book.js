import request from "./request";

// Lấy danh sách tất cả sách
export function getAllBooks() {
  return request({
    url: '/Books/all',
    method: 'get'
  })
}

// Lấy top sách bán chạy (mặc định 5)
export function getTopBooks(limit = 5) {
  return request({
    url: `/Stats/top-books?limit=${limit}`,
    method: 'get'
  })
}

export function getBookByCode(code) {
  return request({
    url: `/Books/${encodeURIComponent(code)}`,
    method: 'get'
  })
}

export function listBook(data) {
  // Build query params
  let url = `/book-list?per_page=${data.per_page}&page=${data.page}`;

  // Thêm filter theo category nếu có - backend sử dụng MADANHMUC
  if (data.MADANHMUC) {
    url += `&MADANHMUC=${data.MADANHMUC}`;
  }

  return request({
    url: url,
    method: "get",
  });
}

export function insertOrUpdateBook(data) {
  return request({
    url: "/book",
    method: "post",
    data,
  });
}

export function deleteBook(id) {
  return request({
    url: `/book?id=${id}`,
    method: "delete",
  });
}

// --- Admin book management APIs ---
export function getAdminBooks(params = {}) {
  const { page = 1, pageSize = 10, keyword, status } = params
  const query = new URLSearchParams()
  query.append('page', page)
  query.append('pageSize', pageSize)
  if (keyword) query.append('keyword', keyword)
  if (status) query.append('status', status)

  return request({
    url: `/Admin/books?${query.toString()}`,
    method: 'get'
  })
}

export function getAdminBook(code) {
  return request({
    url: `/Admin/books/${encodeURIComponent(code)}`,
    method: 'get'
  })
}

export function createAdminBook(payload) {
  const data = payload instanceof FormData ? payload : buildBookFormData(payload)
  return request({
    url: '/Admin/books',
    method: 'post',
    data
  })
}

export function updateAdminBook(code, payload) {
  const data = payload instanceof FormData ? payload : buildBookFormData(payload)
  return request({
    url: `/Admin/books/${encodeURIComponent(code)}`,
    method: 'put',
    data
  })
}

export function deleteAdminBook(code) {
  return request({
    url: `/Admin/books/${encodeURIComponent(code)}`,
    method: 'delete'
  })
}

function buildBookFormData(payload = {}) {
  const formData = new FormData()
  const appendIfDefined = (key, value) => {
    if (value !== undefined && value !== null && value !== '') {
      formData.append(key, value)
    }
  }

  appendIfDefined('Code', payload.code ?? payload.Code ?? payload.masach ?? payload.MASACH)
  appendIfDefined('Name', payload.name ?? payload.Name ?? payload.tensach ?? payload.TENSACH)
  appendIfDefined('Author', payload.author ?? payload.Author ?? payload.tacgia ?? payload.TACGIA)
  appendIfDefined('PublishYear', payload.publishYear ?? payload.PublishYear ?? payload.namxb ?? payload.NAMXB)
  appendIfDefined('Price', payload.price ?? payload.Price ?? payload.giatien ?? payload.GIATIEN)
  appendIfDefined('InStock', payload.inStock ?? payload.InStock ?? payload.soluong ?? payload.SOLUONG)
  appendIfDefined('Description', payload.description ?? payload.MOTA)
  appendIfDefined('Status', payload.status ?? payload.Status ?? payload.trangthai ?? payload.TRANGTHAI)

  const category = payload.category ?? payload.Category
  if (category) {
    appendIfDefined('Category.Code', category.code ?? category.Code ?? category.MADANHMUC)
    appendIfDefined('Category.Name', category.name ?? category.Name ?? category.TENDANHMUC)
  } else {
    appendIfDefined('Category.Code', payload.categoryCode ?? payload.MADANHMUC)
    appendIfDefined('Category.Name', payload.categoryName ?? payload.TENDANHMUC)
  }

  const publisher = payload.publisher ?? payload.Publisher
  if (publisher) {
    appendIfDefined('Publisher.Code', publisher.code ?? publisher.Code)
    appendIfDefined('Publisher.Name', publisher.name ?? publisher.Name)
    appendIfDefined('Publisher.Address', publisher.address ?? publisher.Address)
  } else {
    appendIfDefined('Publisher.Code', payload.publisherCode)
    appendIfDefined('Publisher.Name', payload.publisherName)
    appendIfDefined('Publisher.Address', payload.publisherAddress)
  }

  let hasCoverFile = false
  if (payload.cover instanceof File) {
    formData.append('Cover', payload.cover)
    hasCoverFile = true
  } else if (payload.coverFile instanceof File) {
    formData.append('Cover', payload.coverFile)
    hasCoverFile = true
  }

  if (!hasCoverFile) {
    appendIfDefined('CoverUrl', payload.coverUrl ?? payload.CoverUrl ?? payload.anhsach ?? payload.AnhSach)
  }

  return formData
}

