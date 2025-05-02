<template>
  <div class="p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <router-link 
        to="/clients" 
        class="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
      >
        <i class="fas fa-user-plus text-emerald-600 mr-3"></i>
        <span class="text-sm font-medium text-gray-900">New Client</span>
      </router-link>
      
      <router-link 
        to="/appointments" 
        class="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
      >
        <i class="fas fa-calendar-plus text-blue-600 mr-3"></i>
        <span class="text-sm font-medium text-gray-900">Schedule Meeting</span>
      </router-link>
      
      <router-link 
        to="/funds" 
        class="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
      >
        <i class="fas fa-chart-line text-purple-600 mr-3"></i>
        <span class="text-sm font-medium text-gray-900">View Fund Performance</span>
      </router-link>
      
      <router-link 
        to="/compliance" 
        class="flex items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-150"
      >
        <i class="fas fa-clipboard-check text-yellow-600 mr-3"></i>
        <span class="text-sm font-medium text-gray-900">Review Compliance</span>
      </router-link>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuickActions'
}
</script>