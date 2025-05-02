<template>
  <div class="mb-6">
    <div class="bg-glass backdrop-blur-xs rounded-lg shadow-soft p-6 h-full transition-all duration-300 hover:shadow-hover">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-800">Recent Interactions</h3>
      </div>
      <div v-if="interactionsLoading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
      <div v-else-if="interactions.length > 0" class="overflow-hidden rounded-lg border border-gray-200">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="interaction in interactions.slice(0, 5)" :key="interaction.id" class="hover:bg-gray-50 transition-colors duration-150">
              <td class="px-6 py-4">
                <span class="text-sm font-medium text-gray-900">{{ interactionTypeMap[interaction.interactionTypeId]?.name || 'Unknown Type' }}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(interaction.date) }}
              </td>
            </tr>
          </tbody>
        </table>
        <div class="p-4 bg-gray-50 border-t border-gray-200">
          <p class="text-sm text-gray-600">
            Showing last 5 interactions.
            <router-link :to="{ name: 'Activity', query: { clientId: client.id }}" class="text-emerald-600 hover:text-emerald-800 font-medium">
              View all
            </router-link>
          </p>
        </div>
      </div>
      <div v-else class="text-center py-8">
        <i class="fas fa-history text-gray-300 text-3xl mb-2"></i>
        <p class="text-gray-500 text-sm">No recent interactions</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecentInteractions',
  props: {
    interactions: { type: Array, required: true },
    interactionsLoading: { type: Boolean, required: true },
    interactionTypeMap: { type: Object, required: true },
    client: { type: Object, required: true },
    formatDate: { type: Function, required: true }
  }
};
</script>
