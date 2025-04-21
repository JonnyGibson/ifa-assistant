<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <ProgressSpinner />
      <div class="ml-4 text-gray-600">Loading application...</div>
    </div>
    <div v-else-if="dbError" class="flex flex-col items-center justify-center min-h-screen">
      <i class="pi pi-exclamation-triangle text-yellow-500 text-5xl mb-4"></i>
      <h2 class="text-2xl font-bold text-gray-800 mb-2">Connection Error</h2>
      <p class="text-gray-600 mb-6">{{ dbError }}</p>
      <Button 
        @click="window.location.reload()" 
        label="Retry" 
        icon="pi pi-refresh" 
        class="p-button-primary"
      />
    </div>
    <template v-else>
      <LoginForm v-if="!currentUser" @login="handleLogin" />
      
      <div class="flex min-h-screen" v-else>
        <Sidebar :user-email="currentUser?.email" :is-admin="currentUser?.isAdmin" />
        <div class="flex-1">
          <!-- Header with dynamic background -->
          <div class="relative">
            <div class="h-48 bg-gradient-to-r from-emerald-800 to-emerald-600 relative overflow-hidden">
              <div class="absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url('/bg1.jpg')` }"></div>
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-800/40 to-emerald-600/40"></div>
              <div class="h-full flex items-center justify-between px-8 relative">
                <div class="flex items-center space-x-4">
                  <h1 class="text-2xl font-rubik">
                    <span class="text-white font-bold">IFA</span>
                    <span class="text-white/60 mx-2">|</span>
                    <span class="text-white font-bold">Assistant</span>
                  </h1>
                </div>
                <div>
                  <Button 
                    @click="handleLogout" 
                    severity="secondary" 
                    raised
                    icon="pi pi-sign-out" 
                    label="Sign Out" 
                    class="px-6 py-2 bg-white/20 border border-white/30 hover:bg-white/30 transition-colors duration-200 text-white font-medium rounded-lg"
                  />
                </div>
              </div>
            </div>
          </div>
          <!-- Main content -->
          <main class="px-8 -mt-12">
            <router-view></router-view>
          </main>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, provide, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import LoginForm from './components/LoginForm.vue'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import { authService, db } from './services/database'

export default {
  name: 'App',
  components: {
    Sidebar,
    LoginForm,
    Button,
    ProgressSpinner
  },
  setup() {
    const router = useRouter()
    const currentUser = ref(null)
    const isLoading = ref(true)
    const dbError = ref(null)

    console.log('[App] Starting application setup')

    provide('currentUser', currentUser)

    const handleLogin = async (user) => {
      console.log('[App] Handling login:', user)
      currentUser.value = user  // Set user first
      await router.push('/dashboard')  // Then navigate
    }

    const handleLogout = async () => {
      try {
        console.log('[App] Handling logout')
        await authService.logout()
        currentUser.value = null
        router.push('/')
      } catch (error) {
        console.error('[App] Logout failed:', error)
      }
    }

    onMounted(async () => {
      console.log('[App] Component mounted, checking authentication...')
      try {
        // Set a timeout to prevent the app from being stuck in loading state forever
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Authentication check timed out')), 10000)
        })

        // This will resolve if either the auth check succeeds or times out
        await Promise.race([
          (async () => {
            console.log('[App] Checking for current user...')
            const user = await authService.getCurrentUser()
            console.log('[App] Current user:', user)
            
            if (user) {
              currentUser.value = user
            }
          })(),
          timeoutPromise
        ])
      } catch (error) {
        console.error('[App] Error during authentication check:', error)
        dbError.value = 'Failed to connect to database. Please try refreshing the page.'
      } finally {
        console.log('[App] Setting isLoading to false')
        isLoading.value = false
      }
    })

    return {
      currentUser,
      isLoading,
      dbError,
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