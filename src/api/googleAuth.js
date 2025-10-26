import request from './request'

// Backend expects POST /api/GoogleAuth/login with { idToken }
export function googleLogin(idToken) {
  return request({
    url: '/GoogleAuth/login',
    method: 'post',
    data: { idToken }
  })
}
