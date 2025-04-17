import { createApp } from 'vue'
import { createClient } from '@supabase/supabase-js'
import Chart from 'chart.js/auto'
import App from './App.vue'
import './assets/main.css'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Create the Vue app
const app = createApp(App)

// Provide Supabase client to all components
app.provide('supabase', supabase)

// Mount the app
app.mount('#app') 