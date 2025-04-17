import { createApp } from 'vue'
import App from './src/App.vue'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Create Vue app
const app = createApp(App)

// Provide Supabase client to all components
app.provide('supabase', supabase)

// Mount the app
app.mount('#app') 