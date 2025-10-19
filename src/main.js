import { createApp } from 'vue'
// Import Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import router from '@/router/index.js'
import store from '@/store/index.js'
import App from './App.vue'

const app = createApp(App)

app.use(ElementPlus)
app.use(router)
app.use(store)
app.mount('#app')
