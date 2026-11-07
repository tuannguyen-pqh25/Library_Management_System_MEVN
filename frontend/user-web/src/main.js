import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import '@fortawesome/fontawesome-free/css/all.min.css'
import './style.css'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initTheme } from './services/theme.service'

initTheme()

createApp(App).use(router).mount('#app')
