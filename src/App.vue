<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="isLoading" class="flex items-center justify-center min-h-screen">
      <ProgressSpinner />
    </div>
    <template v-else>
      <LoginForm v-if="!isAuthenticated" @login="handleLogin" />
      
      <div class="flex min-h-screen" v-else>
        <Sidebar :user-email="userEmail" :is-admin="isAdmin" />
        <div class="flex-1">
          <!-- Header with dynamic background -->
          <div class="relative">
            <div class="h-48 bg-gradient-to-r from-emerald-800 to-emerald-600 relative overflow-hidden">
              <div class="absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url('/bg${currentBgIndex}.jpg')` }"></div>
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
import { ref, computed, watch, provide, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from './services/db'
import LoginForm from './components/LoginForm.vue'
import Sidebar from './components/Sidebar.vue'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'

export default {
  name: 'App',
  components: {
    LoginForm,
    Sidebar,
    Button,
    ProgressSpinner
  },
  setup() {
    console.log('[App.vue] setup() called');
    const router = useRouter();
    const isAuthenticated = ref(false);
    const isLoading = ref(true);
    const currentUser = ref(null);
    const loading = ref(false);

    // Provide the currentUser ref to child components
    provide('currentUser', currentUser);

    const userEmail = computed(() => currentUser.value?.email || '');
    const isAdmin = computed(() => currentUser.value?.isAdmin || false);

    const currentBgIndex = ref(1);

    // Rotate background images on route change
    watch(() => router.currentRoute.value.path, () => {
      currentBgIndex.value = ((currentBgIndex.value % 4) + 1);
    });

    const checkAuth = async () => {
      console.log('[App.vue] checkAuth() starting...');
      isLoading.value = true;
      try {
        const token = localStorage.getItem('auth_token');
        if (token) {
          const user = await authService.getCurrentUser(token);
          if (user) {
            currentUser.value = user;
            isAuthenticated.value = true;
            console.log('[App.vue] User authenticated from stored token', user);
          } else {
            // Invalid or expired token
            localStorage.removeItem('auth_token');
            currentUser.value = null;
            isAuthenticated.value = false;
            console.log('[App.vue] Invalid token, user logged out');
          }
        } else {
          currentUser.value = null;
          isAuthenticated.value = false;
          console.log('[App.vue] No token found, user not authenticated');
        }
      } catch (error) {
        console.error('[App.vue] Error checking auth:', error);
        currentUser.value = null;
        isAuthenticated.value = false;
        localStorage.removeItem('auth_token'); // Clear potentially bad token
      } finally {
        isLoading.value = false;
        console.log('[App.vue] checkAuth() completed. isAuthenticated:', isAuthenticated.value);
      }
    };

    const handleLogin = async (loginData) => {
      console.log('[App.vue] handleLogin() called');
      loading.value = true;
      try {
        const { user, token } = await authService.login(loginData.email, loginData.password);
        
        localStorage.setItem('auth_token', token);
        currentUser.value = user;
        isAuthenticated.value = true;
        console.log('[App.vue] Login successful');
        router.push('/');
      } catch (error) {
        console.error('[App.vue] Error logging in:', error);
        currentUser.value = null;
        isAuthenticated.value = false;
        localStorage.removeItem('auth_token');
        throw error; // Re-throw to let LoginForm handle UI feedback
      } finally {
        loading.value = false;
      }
    };

    const handleLogout = async () => {
      console.log('[App.vue] handleLogout() called');
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          await authService.logout(token);
        } catch (error) {
          console.error('[App.vue] Error during server logout, proceeding with client logout:', error);
        }
        localStorage.removeItem('auth_token');
      }
      currentUser.value = null;
      isAuthenticated.value = false;
      console.log('[App.vue] Logout successful');
      router.push('/login'); // Redirect to login page after logout
    };

    // Watch for changes in authentication state to redirect if necessary
    watch(isAuthenticated, (newValue, oldValue) => {
      if (oldValue === true && newValue === false) {
        // User was logged in, now logged out
        if (router.currentRoute.value.meta.requiresAuth || router.currentRoute.value.meta.requiresAdmin) {
          router.push('/login');
        }
      }
    });

    onMounted(() => {
      console.log('[App.vue] onMounted() called');
      checkAuth();
    });

    return {
      isAuthenticated,
      isLoading,
      userEmail,
      isAdmin,
      handleLogin,
      handleLogout,
      loading,
      currentBgIndex
    };
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