<template>
  <div class="w-64 bg-gray-800 text-white">
    <div class="p-4">
      <h1 class="text-xl font-bold">IFA Assistant</h1>
      <p class="text-sm text-gray-400">Welcome, {{ userEmail }}</p>
    </div>
    <nav class="mt-6">
      <div class="px-4 space-y-2">
        <a href="#" class="block py-2 px-4 bg-gray-700 rounded-md text-white">
          <i class="fas fa-home mr-2"></i>Dashboard
        </a>
        <a href="#" class="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded-md">
          <i class="fas fa-users mr-2"></i>Clients
        </a>
        <a href="#" class="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded-md">
          <i class="fas fa-file-alt mr-2"></i>Documents
        </a>
        <a href="#" class="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded-md">
          <i class="fas fa-clipboard-check mr-2"></i>Compliance
        </a>
        <a href="#" class="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded-md">
          <i class="fas fa-calendar-alt mr-2"></i>Appointments
        </a>
        <a href="#" class="block py-2 px-4 text-gray-300 hover:bg-gray-700 rounded-md">
          <i class="fas fa-chart-line mr-2"></i>Reports
        </a>
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
  }
}
</script> 