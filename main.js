import { createApp } from 'vue'
import App from './src/App.vue'
import { db, authService } from './src/services/database'

// Create Vue app
const app = createApp(App)

// Initialize the database
db.initialize().catch(console.error)

// Provide auth service to all components
app.provide('auth', authService)

// Mount the app
app.mount('#app')