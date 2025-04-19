<template>
  <div class="bg-white rounded-lg shadow-soft p-6 transition-all duration-300 hover:shadow-hover">
    <div>
      <h3 class="text-lg font-semibold text-gray-700 mb-4">Recent Client Contacts</h3>
      <div class="overflow-y-auto max-h-[400px] pr-2 scrollbar scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-gray-100 hover:scrollbar-thumb-emerald-300">
        <table class="min-w-full">
          <thead class="sticky top-0 bg-white shadow-sm z-10">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-52">Client</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="!interactions.length" class="hover:bg-gray-50">
              <td colspan="2" class="px-4 py-4 text-center text-gray-500">No recent contacts found</td>
            </tr>
            <tr v-for="interaction in interactions" :key="interaction.id" class="hover:bg-gray-50">
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ interaction.clientName }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ formatDate(interaction.date) }}</div>
              </td>
              <td class="px-4 py-4 text-sm text-gray-600">{{ interaction.summaryNotes }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject, computed, watch } from 'vue'
import { dataService } from '../services/db'

export default {
  name: 'RecentActivity',
  setup() {
    const interactions = ref([]);
    const isLoading = ref(true);
    const currentUser = inject('currentUser', ref(null));
    const userId = computed(() => currentUser.value?.id);

    const fetchRecentInteractions = async () => {
      if (!userId.value) return;
      try {
        const [allInteractions, clients] = await Promise.all([
          dataService.getAllInteractions(userId.value),
          dataService.getClients(userId.value)
        ]);

        const clientMap = new Map(clients.map(c => [c.id, `${c.firstName} ${c.lastName}`]));

        interactions.value = allInteractions
          .map(interaction => ({
            ...interaction,
            clientName: clientMap.get(interaction.clientId) || 'Unknown Client'
          }))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 20);
      } catch (error) {
        console.error('Error fetching recent interactions:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const formatDate = (date) => {
      if (!date) return 'N/A';
      const d = new Date(date);
      if (isNaN(d.getTime())) return 'Invalid Date';
      
      return d.toLocaleDateString('en-GB', { 
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).split('/').reverse().join('-');
    };

    onMounted(() => {
      if (userId.value) {
        fetchRecentInteractions();
      } else {
        const unwatch = watch(userId, (newId) => {
          if (newId) {
            fetchRecentInteractions();
            unwatch();
          }
        });
      }
    });

    return {
      interactions,
      isLoading,
      formatDate
    };
  }
}
</script>