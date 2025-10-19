import request from './request'

// createOrder: send order payload to backend and return response.data (uses request interceptors)
export async function createOrder(payload) {
  return request({ url: '/order', method: 'post', data: payload })
}

export default { createOrder }
