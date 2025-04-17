<template>
  <div class="w-64 bg-gray-800 text-white">
    <div class="p-4">
      <h1 class="text-xl font-bold">IFA Assistant</h1>
      <p class="text-sm text-gray-400">Welcome, {{ userEmail }}</p>
    </div>
    <nav class="mt-6">
      <div class="px-4 space-y-2">
        <router-link 
          to="/" 
          class="block py-2 px-4 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          :class="{ 'bg-gray-700 text-white': isActive('/') }"
        >
          <i class="fas fa-home mr-2"></i>Dashboard
        </router-link>
        <router-link 
          to="/clients" 
          class="block py-2 px-4 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          :class="{ 'bg-gray-700 text-white': isActive('/clients') }"
        >
          <i class="fas fa-users mr-2"></i>Clients
        </router-link>
        <router-link 
          to="/documents" 
          class="block py-2 px-4 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          :class="{ 'bg-gray-700 text-white': isActive('/documents') }"
        >
          <i class="fas fa-file-alt mr-2"></i>Documents
        </router-link>
        <router-link 
          to="/compliance" 
          class="block py-2 px-4 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          :class="{ 'bg-gray-700 text-white': isActive('/compliance') }"
        >
          <i class="fas fa-clipboard-check mr-2"></i>Compliance
        </router-link>
        <router-link 
          to="/appointments" 
          class="block py-2 px-4 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          :class="{ 'bg-gray-700 text-white': isActive('/appointments') }"
        >
          <i class="fas fa-calendar-alt mr-2"></i>Appointments
        </router-link>
        <router-link 
          to="/reports" 
          class="block py-2 px-4 rounded-md text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
          :class="{ 'bg-gray-700 text-white': isActive('/reports') }"
        >
          <i class="fas fa-chart-line mr-2"></i>Reports
        </router-link>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    userEmail: {
      type: String,
      required: true
    }
  },
  methods: {
    isActive(path) {
      return this.$route.path === path || this.$route.path.startsWith(path + '/')
    }
  }
}
</script> 