<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
      <div class="flex space-x-4">
        <button 
          @click="generateReport"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 flex items-center"
          disabled 
        >
          <i class="fas fa-download mr-2"></i>Generate Report (TBD)
        </button>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>

    <template v-else>
      <!-- Key Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100">
              <i class="fas fa-users text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Clients</p>
              <p class="text-2xl font-semibold text-blue-600">{{ stats.totalClients }}</p>
            </div>
          </div>
        </div>
         <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-emerald-100">
              <i class="fas fa-calendar-check text-emerald-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Appointments</p>
              <p class="text-2xl font-semibold text-emerald-600">{{ stats.totalAppointments }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100">
              <i class="fas fa-tasks text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Open Tasks</p>
              <p class="text-2xl font-semibold text-yellow-600">{{ stats.openTasks }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100">
              <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Overdue Compliance</p>
              <p class="text-2xl font-semibold text-red-600">{{ stats.overdueCompliance }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Content Sections -->
      <div class="space-y-8">
        <!-- Client Activity -->
        <section class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Client Activity</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full">
               <thead>
                    <tr class="bg-gray-50">
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-if="recentActivity.length === 0">
                        <td colspan="4" class="px-4 py-3 text-center text-gray-500">No recent activity found.</td>
                    </tr>
                    <tr v-for="item in recentActivity" :key="item.id">
                        <td class="px-4 py-3 whitespace-nowrap text-sm">{{ formatDate(item.date) }}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm">{{ item.clientName }}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm">{{ item.type }}</td>
                        <td class="px-4 py-3 text-sm">{{ item.details }}</td>
                    </tr>
                </tbody>
            </table>
          </div>
        </section>

        <!-- Add more report sections/charts here as needed -->
         <!-- Example: Compliance Status Breakdown -->
        <section class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Compliance Status</h2>
             <div class="overflow-x-auto">
                 <table class="min-w-full">
                     <thead>
                        <tr class="bg-gray-50">
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                     <tbody class="bg-white divide-y divide-gray-200">
                         <tr v-if="complianceItems.length === 0">
                            <td colspan="4" class="px-4 py-3 text-center text-gray-500">No compliance items found.</td>
                         </tr>
                         <tr v-for="item in complianceItems" :key="item.id">
                             <td class="px-4 py-3 whitespace-nowrap text-sm">{{ item.title }}</td>
                             <td class="px-4 py-3 whitespace-nowrap text-sm">{{ item.category }}</td>
                             <td class="px-4 py-3 whitespace-nowrap text-sm">{{ formatDate(item.dueDate) }}</td>
                             <td class="px-4 py-3 whitespace-nowrap">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(item.status)">
                                    {{ item.status }}
                                </span>
                             </td>
                         </tr>
                     </tbody>
                 </table>
             </div>
        </section>

      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted, computed, inject } from 'vue';
import { clientService, investmentService } from '../services/database';

export default {
  name: 'Reports',
  setup() {
    const isLoading = ref(true);
    const stats = ref({
      totalClients: 0,
      totalAppointments: 0,
      openTasks: 0,
      overdueCompliance: 0
    });
    const recentActivity = ref([]);
    const complianceItems = ref([]);

    const currentUser = inject('currentUser', ref(null)); 
    const userId = computed(() => currentUser.value?.id);

    const fetchData = async () => {
      if (!userId.value) return;
      isLoading.value = true;
      try {
        // Fetch all client data
        const clients = await clientService.getAllClients();
        
        // Get accounts and total values
        const clientAccounts = await Promise.all(
          clients.map(client => investmentService.getClientAccounts(client.id))
        );

        // Calculate total AUM and average portfolio value
        const totalAUM = clientAccounts.reduce((total, accounts) => {
          return total + accounts.reduce((acc, account) => acc + (account.totalValue || 0), 0);
        }, 0);

        const activePortfolios = clientAccounts.filter(accounts => accounts.length > 0).length;
        const averagePortfolioValue = activePortfolios > 0 ? totalAUM / activePortfolios : 0;

        // Calculate category distribution
        const categoryDistribution = {};
        clientAccounts.forEach(accounts => {
          accounts.forEach(account => {
            account.holdings?.forEach(holding => {
              const category = holding.fund.category;
              categoryDistribution[category] = (categoryDistribution[category] || 0) + holding.currentValue;
            });
          });
        });

        // Get top clients by portfolio value
        const clientsWithValues = clients.map(client => ({
          ...client,
          portfolioValue: clientAccounts
            .find(accounts => accounts.some(acc => acc.clientId === client.id))
            ?.reduce((sum, acc) => sum + (acc.totalValue || 0), 0) || 0
        })).sort((a, b) => b.portfolioValue - a.portfolioValue);

        const topClients = clientsWithValues.slice(0, 5);

        // Update stats
        stats.value = {
          totalAUM,
          averagePortfolioValue,
          categoryDistribution,
          topClients,
          totalClients: clients.length,
          activePortfolios
        };

      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        isLoading.value = false;
      }
    };

    onMounted(() => {
      if (userId.value) {
        fetchData();
      }
    });

    return {
      isLoading,
      stats,
      recentActivity,
      complianceItems
    };
  }
};
</script>