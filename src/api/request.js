import axios from 'axios'
import { ElMessage } from 'element-plus'

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
    if (token) {
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
      }
    } catch (err) {
      console.warn('Unable to parse stored user for role header', err)
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
    ElMessage.error(error.response?.data?.message || 'Server error!')
    return Promise.reject(error)
  }
)

export default request
