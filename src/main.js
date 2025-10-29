import { createApp } from 'vue'
// Import Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from '@/router/index.js'
import store from '@/store/index.js'
import App from './App.vue'

// Import Orange/Pink Theme (Override default colors)
import '@/assets/css/theme-orange.css'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(store)

// Restore user info từ localStorage khi app load
const initializeAuth = () => {
  try {
    const userStr = localStorage.getItem('user')
  const rawToken = localStorage.getItem('token')
  const token = rawToken === 'undefined' ? null : rawToken
    
    if (userStr && token) {
      const user = JSON.parse(userStr)
      // Restore state
      store.commit('user/SET_CODE', user.code)
      store.commit('user/SET_FULLNAME', user.fullName)
      store.commit('user/SET_USERNAME', user.username)
      store.commit('user/SET_ROLE', user.role)
      if (token) {
        store.commit('user/SET_TOKEN', token)
      }
      console.log('Auth restored from localStorage:', user.username)
    }
  } catch (e) {
    console.error('Error restoring auth:', e)
  }
}

// Initialize auth before mounting
initializeAuth()

app.mount('#app')
