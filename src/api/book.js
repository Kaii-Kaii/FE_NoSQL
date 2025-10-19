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

