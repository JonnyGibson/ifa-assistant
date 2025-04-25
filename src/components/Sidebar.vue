<template>
  <aside 
    :class="[
      'bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col',
      'fixed md:static inset-y-0 left-0 z-10 transform transition-transform duration-300',
      isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
      'w-64'
    ]"
  >
    <div class="p-4 border-b border-gray-700">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-xl font-rubik">
            <span class="text-emerald-400 font-bold">IFA</span>
            <span class="text-gray-400 mx-1">|</span>
            <span class="text-white font-bold">Assistant</span>
          </h1>
          <p class="text-sm text-gray-400 mt-1">{{ userEmail }}</p>
        </div>
        <!-- Close button for mobile -->
        <button 
          @click="$emit('close')"
          class="md:hidden text-gray-400 hover:text-white p-2"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <nav class="mt-4 flex-grow px-2 space-y-1">
      <router-link 
        :to="{ name: 'Dashboard' }" 
        class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-emerald-700 hover:text-white transition-colors"
        active-class="bg-emerald-800 text-white"
        @click="$emit('close')"
      >
        <i class="fas fa-tachometer-alt mr-3 flex-shrink-0 h-5 w-5"></i>
        Dashboard
      </router-link>

      <router-link 
        :to="{ name: 'Clients' }" 
        class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-emerald-700 hover:text-white transition-colors"
        active-class="bg-emerald-800 text-white"
        @click="$emit('close')"
      >
        <i class="fas fa-users mr-3 flex-shrink-0 h-5 w-5"></i>
        Clients
      </router-link>

      <router-link 
        :to="{ name: 'Activity' }" 
        class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-emerald-700 hover:text-white transition-colors"
        active-class="bg-emerald-800 text-white"
        @click="$emit('close')"
      >
        <i class="fas fa-list-alt mr-3 flex-shrink-0 h-5 w-5"></i>
        Activity
      </router-link>

      <router-link 
        :to="{ name: 'Funds' }" 
        class="group flex items-center px-3 py-2 text-sm font-medium rounded-md text-gray-300 hover:bg-emerald-700 hover:text-white transition-colors"
        active-class="bg-emerald-800 text-white"
        @click="$emit('close')"
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
        @click="$emit('close')"
      >
        <i class="fas fa-cog mr-3 flex-shrink-0 h-5 w-5"></i>
        Settings
      </router-link>
    </nav>
  </aside>
</template>

<script>
export default {
  name: 'Sidebar',
  props: {
    userEmail: {
      type: String,
      required: true
    },
    isAdmin: {
      type: Boolean,
      default: false
    },
    isOpen: {
      type: Boolean,
      default: false
    }
  },
  emits: ['close']
}
</script>