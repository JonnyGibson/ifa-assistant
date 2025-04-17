<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>
    <template v-else>
      <LoginForm v-if="!isAuthenticated" @login="handleLogin" />
      
      <div v-else class="min-h-screen flex">
        <Sidebar :user-email="userEmail" />
        <div class="flex-1">
          <div class="relative">
            <div class="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-800/90">
              <img 
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
                alt="Financial Dashboard Background"
                class="w-full h-64 object-cover mix-blend-overlay"
              />
            </div>
            <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div class="flex justify-between items-center">
                <div>
                  <h1 class="text-3xl font-bold text-white mb-6">{{ $route.name || 'Dashboard' }}</h1>
                </div>
                <div class="flex items-center space-x-4">
                  <button @click="handleLogout" class="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                  </button>
                </div>
              </div>
            </div>
          </div>

          <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-16">
            <router-view></router-view>
          </main>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { supabase } from './supabase'
import LoginForm from './components/LoginForm.vue'
import Sidebar from './components/Sidebar.vue'

export default {
  name: 'App',
  components: {
    LoginForm,
    Sidebar
  },
  setup() {
    console.log('[App.vue] setup() called'); // Log setup start
    const isAuthenticated = ref(false)
    const isLoading = ref(true)
    const userEmail = ref('')

    const checkAuth = async () => {
      console.log('[App.vue] checkAuth() starting...'); // Log auth check start
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error
        
        isAuthenticated.value = !!session
        if (session?.user) {
          userEmail.value = session.user.email
        }
        console.log('[App.vue] checkAuth() completed. isAuthenticated:', isAuthenticated.value); // Log auth check result
      } catch (error) {
        console.error('[App.vue] Error checking auth:', error)
        isAuthenticated.value = false
      } finally {
        isLoading.value = false
        console.log('[App.vue] isLoading set to false');
      }
    }

    const handleLogin = async (loginData) => {
      console.log('[App.vue] handleLogin() called');
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginData.email,
          password: loginData.password
        })
        if (error) throw error
        
        isAuthenticated.value = true
        userEmail.value = data.user.email
        console.log('[App.vue] Login successful');
      } catch (error) {
        console.error('[App.vue] Error logging in:', error)
        throw error // Re-throw to indicate failure to LoginForm
      }
    }

    const handleLogout = async () => {
      console.log('[App.vue] handleLogout() called');
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        
        isAuthenticated.value = false
        userEmail.value = ''
        console.log('[App.vue] Logout successful');
      } catch (error) {
        console.error('[App.vue] Error logging out:', error)
      }
    }

    onMounted(() => {
      console.log('[App.vue] onMounted() called'); // Log mount
      checkAuth()
      
      // Listen for auth state changes
      supabase.auth.onAuthStateChange((event, session) => {
        console.log('[App.vue] onAuthStateChange triggered:', { event, session }); // Log auth state change
        isAuthenticated.value = !!session
        if (session?.user) {
          userEmail.value = session.user.email
        } else {
          userEmail.value = ''
        }
      })
    })

    return {
      isAuthenticated,
      isLoading,
      userEmail,
      handleLogin,
      handleLogout
    }
  }
}
</script>

<style>
#app {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #10b981;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #059669;
}
</style> 