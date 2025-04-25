<template>
  <div class="w-64 bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col">
    <div class="p-4 border-b border-gray-700">
      <div class="flex items-center space-x-2">
          <div>
          <h1 class="text-xl font-rubik">
            <span class="text-emerald-400 font-bold">IFA</span>
            <span class="text-gray-400 mx-1">|</span>
            <span class="text-white font-bold">Assistant</span>
          </h1>
          <p class="text-sm text-gray-400 mt-1">Welcome, {{ userEmail }}</p>
        </div>
      </div>
    </div>
    <nav class="mt-4 flex-grow px-2 space-y-1">
      <!-- Use name for safer routing -->
      <router-link 
        :to="{ name: 'Dashboard' }" 
        class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-emerald-700 hover:text-white transition-colors"
        active-class="bg-emerald-800 text-white"
      >
        <i class="fas fa-tachometer-alt mr-3 flex-shrink-0 h-5 w-5"></i>
        Dashboard
      </router-link>
      <router-link 
        :to="{ name: 'Clients' }" 
        class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-emerald-700 hover:text-white transition-colors"
        active-class="bg-emerald-800 text-white"
      >
        <i class="fas fa-users mr-3 flex-shrink-0 h-5 w-5"></i>
        Clients
      </router-link>
      <router-link 
        :to="{ name: 'Activity' }" 
        class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-emerald-700 hover:text-white transition-colors"
        active-class="bg-emerald-800 text-white"
      >
        <i class="fas fa-list-alt mr-3 flex-shrink-0 h-5 w-5"></i>
        Activity
      </router-link>
       <router-link 
        :to="{ name: 'Funds' }" 
        class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-emerald-700 hover:text-white transition-colors"
        active-class="bg-emerald-800 text-white"
      >
        <i class="fas fa-coins mr-3 flex-shrink-0 h-5 w-5"></i>
        Funds
      </router-link>
      
      <!-- Admin Only Section -->
      <router-link 
        v-if="isAdmin" 
        :to="{ name: 'Settings' }" 
        class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-emerald-700 hover:text-white transition-colors"
        active-class="bg-emerald-800 text-white"
      >
        <i class="fas fa-cog mr-3 flex-shrink-0 h-5 w-5"></i>
        Settings
      </router-link>
      
      <!-- Remove old links -->
      <!-- 
      <router-link to="/documents" ... >Documents</router-link>
      <router-link to="/compliance" ... >Compliance</router-link>
      <router-link to="/appointments" ... >Appointments</router-link>
      <router-link to="/reports" ... >Reports</router-link>
      -->
    </nav>
    <!-- Maybe add logout or user profile link at the bottom -->
    <div class="p-2 border-t border-gray-700 mt-auto">
      <!-- Placeholder for bottom controls -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    userEmail: {
      type: String,
      required: true
    },
    isAdmin: { // Add isAdmin prop
        type: Boolean,
        default: false
    }
  }
  // No need for custom isActive method if using router's built-in active-class
}
</script>