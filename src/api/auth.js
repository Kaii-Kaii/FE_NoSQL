import request from './request'

export function login(data) {
  return request({
    url: '/Auth/login',
    method: 'post',
    data
  })
}

export function register(data) {
  return request({
    url: '/Auth/register',
    method: 'post',
    data
  })
}

export function sendCode(data) {
  return request({
    url: '/Auth/send-code',
    method: 'post',
    data
  })
}

export function verifyCode(data) {
  return request({
    url: '/Auth/verify-code',
    method: 'post',
    data
  })
}

export function resetPassword(data) {
  return request({
    url: '/Auth/reset-password',
    method: 'post',
    data
  })
}


export function refreshToken() {
  return request({
    url: '/Auth/refresh',
    method: 'get',
  })
}

