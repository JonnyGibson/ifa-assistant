<template>
  <div class="bg-glass backdrop-blur-xs rounded-lg shadow-soft p-6 mb-6 transition-all duration-300 hover:shadow-hover relative z-20">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <div class="flex justify-between items-start">
          <div>
            <h2 class="text-2xl font-bold text-gray-900">{{ client.firstName }} {{ client.lastName }}</h2>
            <p class="text-sm text-gray-600 mt-1">Client since {{ formatDate(client.createdAt) }}</p>
          </div>
        </div>
        <div class="mt-4 space-y-2">
          <p class="text-sm flex items-center"><i class="fas fa-envelope text-gray-400 w-5 mr-2"></i>{{ client.email }}</p>
          <p class="text-sm flex items-center"><i class="fas fa-phone text-gray-400 w-5 mr-2"></i>{{ client.phone }}</p>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-medium text-gray-500 mb-2 flex items-center">
          <i class="fas fa-location-dot text-gray-400 w-5 mr-2"></i>Address
        </h3>
        <div v-if="client.address" class="pl-7 text-sm space-y-1">
          <p>{{ client.address.street }}</p>
          <p>{{ client.address.city }}</p>
          <p>{{ client.address.postcode }}</p>
          <p>{{ client.address.country }}</p>
        </div>
        <div v-else class="pl-7 text-sm text-gray-400 italic">No address on file</div>
      </div>
      <div>
        <h3 class="text-sm font-medium text-gray-500 mb-2 flex items-center justify-between">
          <div class="flex items-center">
            <i class="fas fa-chart-line text-gray-400 w-5 mr-2"></i>Risk Profile
          </div>
          <button 
            @click="$emit('confirmDeleteClient')" 
            class="text-red-600 hover:text-red-800 transition-colors ml-4"
            title="Delete Client">
            <i class="fas fa-trash"></i>
          </button>
        </h3>
        <div class="pl-7">
          <span :class="['px-3 py-1.5 text-sm rounded-full inline-block', getRiskProfileBadgeClass(client.riskProfile)]">
            {{ client.riskProfile || 'Not Set' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ClientOverviewCard',
  props: {
    client: { type: Object, required: true },
    formatDate: { type: Function, required: true },
    getRiskProfileBadgeClass: { type: Function, required: true }
  }
};
</script>
