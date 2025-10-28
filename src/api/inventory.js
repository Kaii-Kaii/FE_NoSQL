import request from './request'

export function fetchImportHistory(params = {}) {
  const query = new URLSearchParams()
  const page = params.page ?? params.pageIndex ?? 1
  const pageSize = params.pageSize ?? params.size ?? params.limit ?? 10
  query.append('page', page)
  query.append('pageSize', pageSize)

  const appendDate = (key, value) => {
    if (!value) return
    query.append(key, value)
  }

  appendDate('fromDate', params.fromDate)
  appendDate('toDate', params.toDate)

  const queryString = query.toString()
  const url = queryString ? `/Admin/inventory/imports/history?${queryString}` : '/Admin/inventory/imports/history'

  return request({
    url,
    method: 'get'
  })
}

export function fetchImports() {
  return request({
    url: '/Admin/inventory/imports',
    method: 'get'
  })
}

export function fetchImportDetail(code) {
  return request({
    url: `/Admin/inventory/imports/${encodeURIComponent(code)}`,
    method: 'get'
  })
}

export function createImport(payload) {
  return request({
    url: '/Admin/inventory/import',
    method: 'post',
    data: payload
  })
}
