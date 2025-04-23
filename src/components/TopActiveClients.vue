<template>
  <div class="bg-white rounded-lg shadow-sm p-4">
    <h3 class="text-sm font-semibold text-gray-700 mb-3">Most Active Clients</h3>
    <div class="space-y-3">
      <div v-if="isLoading" class="flex justify-center py-2">
        <div class="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
      <div v-else-if="activeClients.length === 0" class="text-center text-sm text-gray-500 py-2">
        No client activity in the past 6 months
      </div>
      <div v-else v-for="client in activeClients" :key="client.id" 
           class="flex items-center justify-between text-sm p-2 hover:bg-gray-50 rounded-lg transition-colors duration-150">
        <div>
          <router-link :to="{ name: 'ClientDetail', params: { id: client.id }}" 
                      class="font-medium text-gray-900 hover:text-emerald-600">
            {{ client.firstName }} {{ client.lastName }}
          </router-link>
          <div class="text-xs text-gray-500">Last contact: {{ formatDate(client.lastContactDate) }}</div>
        </div>
        <div class="flex items-center">
          <span class="px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
            {{ client.interactionCount }} contacts
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue';
import { clientService, interactionService } from '../services/database';

export default {
  name: 'TopActiveClients',
  setup() {
    const activeClients = ref([]);
    const isLoading = ref(true);
    const currentUser = inject('currentUser', ref(null));

    const loadActiveClients = async () => {
      isLoading.value = true;
      try {
        // Get all clients
        const clients = await clientService.getAllClients();
        
        // Get last 6 months of interactions for each client
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const clientsWithInteractions = await Promise.all(
          clients.map(async (client) => {
            const interactions = await interactionService.getClientInteractions(client.id);
            const recentInteractions = interactions.filter(
              i => new Date(i.date) >= sixMonthsAgo
            );
            
            return {
              ...client,
              interactionCount: recentInteractions.length,
              lastContactDate: recentInteractions.length > 0 
                ? recentInteractions.sort((a, b) => new Date(b.date) - new Date(a.date))[0].date 
                : null
            };
          })
        );

        // Sort by interaction count and get top 5
        activeClients.value = clientsWithInteractions
          .sort((a, b) => b.interactionCount - a.interactionCount)
          .slice(0, 5);

      } catch (error) {
        console.error('Error loading active clients:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const formatDate = (date) => {
      if (!date) return 'Never';
      return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short'
      });
    };

    onMounted(() => {
      if (currentUser.value?.id) {
        loadActiveClients();
      }
    });

    return {
      activeClients,
      isLoading,
      formatDate
    };
  }
};
</script>