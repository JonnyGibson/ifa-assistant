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
      
      <div v-else class="flex h-screen overflow-hidden">
        <!-- Mobile Menu Button -->
        <button 
          @click="toggleSidebar"
          class="md:hidden fixed top-4 left-4 z-30 p-2 rounded-md bg-white shadow-md"
          aria-label="Toggle menu"
        >
          <i :class="['fas', isSidebarOpen ? 'fa-times' : 'fa-bars']"></i>
        </button>

        <!-- Sidebar -->
        <Sidebar 
          :user-email="currentUser?.email" 
          :is-admin="currentUser?.isAdmin"
          :is-open="isSidebarOpen"
          @close="closeSidebar"
          @logout="handleLogout"
          @refresh="refreshData"
          class="h-full"
        />
        
        <!-- Overlay for mobile -->
        <div 
          v-if="isSidebarOpen" 
          class="md:hidden fixed inset-0 bg-black bg-opacity-50 z-20"
          @click="closeSidebar"
        ></div>

        <!-- Main Content -->
        <div class="flex-1 flex flex-col min-h-screen">
          <!-- Header with dynamic background -->
          <div class="relative">
            <div class="h-36 md:h-48 bg-gradient-to-r from-emerald-800 to-emerald-600 relative overflow-hidden">
              <div class="absolute inset-0 bg-cover bg-center" :style="{ backgroundImage: `url('/bg1.jpg')` }"></div>
              <div class="absolute inset-0 bg-gradient-to-r from-emerald-800/40 to-emerald-600/40"></div>
            </div>
          </div>
          <!-- Main content -->
          <main class="flex-1 px-4 md:px-6 lg:px-8 -mt-12 mb-8 relative max-w-[1920px] mx-auto w-full">
            <router-view></router-view>
          </main>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, provide, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import Sidebar from './components/Sidebar.vue';
import LoginForm from './components/LoginForm.vue';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import { authService, db } from './services/database';

export default {
  name: 'App',
  components: {
    Sidebar,
    LoginForm,
    Button,
    ProgressSpinner
  },
  setup() {
    const router = useRouter();
    const currentUser = ref(null);
    const isLoading = ref(true);
    const dbError = ref(null);
    const isSidebarOpen = ref(false);

    console.log('[App] Starting application setup');

    provide('currentUser', currentUser);

    const handleLogin = async (user) => {
      console.log('[App] Handling login:', user);
      currentUser.value = user;
      await router.push('/dashboard');
    };

    const handleLogout = async () => {
      try {
        console.log('[App] Handling logout');
        await authService.logout();
        currentUser.value = null;
        router.push('/');
      } catch (error) {
        console.error('[App] Logout failed:', error);
      }
    };

    const refreshData = async () => {
      try {
        isLoading.value = true;
        await db.initialize(true);
        window.location.reload();
      } catch (error) {
        console.error('[App] Data refresh failed:', error);
        alert('Failed to refresh data. Please try again.');
      } finally {
        isLoading.value = false;
      }
    };

    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;
    };

    const closeSidebar = () => {
      isSidebarOpen.value = false;
    };

    onMounted(async () => {
      console.log('[App] Component mounted, checking authentication...');
      try {
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Authentication check timed out')), 10000);
        });

        await Promise.race([
          (async () => {
            console.log('[App] Checking for current user...');
            const user = await authService.getCurrentUser();
            console.log('[App] Current user:', user);
            
            if (user) {
              currentUser.value = user;
            }
          })(),
          timeoutPromise
        ]);
      } catch (error) {
        console.error('[App] Error during authentication check:', error);
        dbError.value = 'Failed to connect to database. Please try refreshing the page.';
      } finally {
        console.log('[App] Setting isLoading to false');
        isLoading.value = false;
      }
    });

    return {
      currentUser,
      isLoading,
      dbError,
      handleLogin,
      handleLogout,
      refreshData,
      isSidebarOpen,
      toggleSidebar,
      closeSidebar
    };
  }
};
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