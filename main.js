import { createApp } from 'vue'
import App from './src/App.vue'
import { initializeDatabase, authService } from './src/services/db'

// Create Vue app
const app = createApp(App)

// Initialize the local database
initializeDatabase().catch(console.error)

// Provide auth service to all components
app.provide('auth', authService)

// Mount the app
app.mount('#app') 