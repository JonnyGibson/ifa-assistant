import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { initializeDatabase, authService } from './services/db'
import './assets/main.css'

// Import PrimeVue
import PrimeVue from 'primevue/config'
import 'primevue/resources/themes/lara-light-green/theme.css'
import 'primeicons/primeicons.css'

// Initialize the local database first
initializeDatabase().catch(error => {
  console.error("Failed to initialize database:", error);
});

// Create the Vue app
const app = createApp(App)

// Use PrimeVue
app.use(PrimeVue, {
  ripple: true,
  inputStyle: "filled"
})

// Use plugins
app.use(router)

// Provide our auth service to all components
app.provide('auth', authService)

// Mount the app
app.mount('#app')