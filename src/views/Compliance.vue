<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Compliance Management</h1>
      <div class="flex space-x-4">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search clients..."
          class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>

    <template v-else>
      <!-- Compliance Table -->
      <div class="bg-white rounded-lg shadow-md overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr class="bg-gray-50">
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Review Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Risk Assessment Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Assessment Status</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="filteredCompliance.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">No clients found matching criteria.</td>
            </tr>
            <tr v-for="status in filteredCompliance" :key="status.clientId" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ status.clientName }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(status.lastReviewDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(status.reviewStatus)">
                  {{ status.reviewStatus }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(status.lastRiskAssessmentDate) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(status.riskAssessmentStatus)">
                  {{ status.riskAssessmentStatus }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, inject, onMounted } from 'vue';
import { clientService, interactionService } from '../services/database';

export default {
  name: 'ComplianceView',
  setup() {
    const clients = ref([]);
    const interactions = ref([]);
    const isLoading = ref(true);
    const searchQuery = ref('');
    const currentUser = inject('currentUser', ref(null));

    const loadComplianceData = async () => {
      isLoading.value = true;
      try {
        // Get all clients
        clients.value = await clientService.getAllClients();

        // Get all clients' interactions
        const clientIds = clients.value.map(c => c.id);
        const allInteractions = await Promise.all(
          clientIds.map(id => interactionService.getClientInteractions(id))
        );
        interactions.value = allInteractions.flat();

      } catch (error) {
        console.error('Error loading compliance data:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const clientComplianceStatus = computed(() => {
      return clients.value.map(client => {
        const clientInteractions = interactions.value.filter(i => i.clientId === client.id);
        const lastReview = clientInteractions
          .filter(i => i.type?.category === 'review')
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        const lastRiskAssessment = clientInteractions
          .filter(i => i.type?.name === 'Risk Assessment')
          .sort((a, b) => new Date(b.date) - new Date(a.date))[0];

        const daysUntilReviewDue = lastReview 
          ? Math.ceil((new Date(lastReview.date).getTime() + (365 * 24 * 60 * 60 * 1000) - Date.now()) / (24 * 60 * 60 * 1000))
          : -365;

        const daysUntilRiskAssessmentDue = lastRiskAssessment
          ? Math.ceil((new Date(lastRiskAssessment.date).getTime() + (365 * 24 * 60 * 60 * 1000) - Date.now()) / (24 * 60 * 60 * 1000))
          : -365;

        return {
          clientId: client.id,
          clientName: `${client.firstName} ${client.lastName}`,
          lastReviewDate: lastReview?.date || null,
          daysUntilReviewDue,
          reviewStatus: daysUntilReviewDue > 30 ? 'compliant' : daysUntilReviewDue > 0 ? 'due-soon' : 'overdue',
          lastRiskAssessmentDate: lastRiskAssessment?.date || null,
          daysUntilRiskAssessmentDue,
          riskAssessmentStatus: daysUntilRiskAssessmentDue > 30 ? 'compliant' : daysUntilRiskAssessmentDue > 0 ? 'due-soon' : 'overdue'
        };
      });
    });

    const filteredCompliance = computed(() => {
      if (!searchQuery.value) return clientComplianceStatus.value;

      const query = searchQuery.value.toLowerCase();
      return clientComplianceStatus.value.filter(status => 
        status.clientName.toLowerCase().includes(query)
      );
    });

    const formatDate = (date) => {
      if (!date) return 'Never';
      return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };

    const getStatusClass = (status) => {
      switch (status) {
        case 'compliant': return 'bg-green-100 text-green-800';
        case 'due-soon': return 'bg-yellow-100 text-yellow-800';
        case 'overdue': return 'bg-red-100 text-red-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    onMounted(() => {
      if (currentUser.value?.id) {
        loadComplianceData();
      }
    });

    return {
      filteredCompliance,
      isLoading,
      searchQuery,
      formatDate,
      getStatusClass
    };
  }
};
</script>