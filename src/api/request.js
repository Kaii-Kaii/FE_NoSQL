import axios from 'axios'

// Tạo instance của Axios
const request = axios.create({
  baseURL: '/api',
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Attach token dynamically before each request so changes to localStorage are respected
request.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    const url = (config.url || '').toLowerCase()
    const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/send-code') || url.includes('/auth/verify-code') || url.includes('/auth/reset-password')

    if (token && !isAuthEndpoint) {
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${token}`
    }

    if (!config.headers) {
      config.headers = {}
    }

    try {
      const storedUser = localStorage.getItem('user')
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        if (parsedUser?.role) {
          // Surface the role for lightweight role-based filters like RoleAuthorizeAttribute
          config.headers['X-Role'] = parsedUser.role
        }
        if (parsedUser?.code) {
          config.headers['X-User-Code'] = parsedUser.code
          config.headers['X-Admin-Code'] = parsedUser.code
        }
        if (parsedUser?.username) {
          config.headers['X-User-Name'] = parsedUser.username
          config.headers['X-Username'] = parsedUser.username
        } else if (parsedUser?.email) {
          config.headers['X-Username'] = parsedUser.email
        }
      }
    } catch (err) {
      console.warn('Unable to parse stored user for role header', err)
    }

    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    return config
  },
  error => Promise.reject(error)
)

request.interceptors.response.use(
  response => {
    const res = response.data
    return res
  },
  error => {
    // Normalize server error payloads so callers can rely on a consistent shape.
    const status = error.response?.status
    const data = error.response?.data

    // Try common locations for a human message
    let message = data?.message || data?.error || null

    // If model/state validation errors exist (e.g. { errors: { field: ['msg'] } })
    if (!message && data && typeof data === 'object') {
      if (data.errors) {
        // pick the first error message we can find
        try {
          const firstKey = Object.keys(data.errors)[0]
          const firstVal = data.errors[firstKey]
          message = Array.isArray(firstVal) ? firstVal[0] : firstVal
        } catch (e) {
          // ignore
        }
      }
    }

    if (!message) message = error.message || 'Server error!'

    // Ensure error.response.data.message exists for existing callers
    error.response = error.response || {}
    error.response.data = error.response.data || {}
    error.response.data.message = message
    error.response.data.raw = data

    // Do NOT show a global message here — let callers decide how to present errors.
    return Promise.reject(error)
  }
)

export default request
