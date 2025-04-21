import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { db } from './services/database'
import PrimeVue from 'primevue/config'
import './assets/main.css'
import 'primevue/resources/themes/saga-green/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import '@fortawesome/fontawesome-free/css/all.css'

const app = createApp(App)

app.use(PrimeVue)
app.use(router)

// Initialize database then mount app
Promise.race([
  db.initialize(),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Database initialization timeout')), 5000)
  )
])
.then(() => {
  app.mount('#app')
})
.catch(console.error)