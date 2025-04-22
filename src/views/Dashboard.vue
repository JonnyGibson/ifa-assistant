<template>
  <div class="space-y-8">
    <div v-if="error" class="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
      <p class="text-red-700">{{ error }}</p>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center min-h-[400px]">
      <i class="pi pi-spin pi-spinner text-4xl text-emerald-500"></i>
    </div>

    <template v-else>
      <!-- Stats Overview Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-14 relative z-10">
        <StatsCard
          title="Total Clients"
          :value="stats.totalClients"
          icon="fa-users"
          icon-bg-color="bg-blue-100"
          icon-text-color="text-blue-600"
          value-color="text-blue-600"
          addLink="/clients"
        />
        <StatsCard
          title="Active Portfolios"
          :value="stats.activePortfolios"
          icon="fa-chart-pie"
          icon-bg-color="bg-emerald-100"
          icon-text-color="text-emerald-600"
          value-color="text-emerald-600"
          subtext="updated in past 3m"
        />
        <StatsCard
          title="Total AUM"
          :value="formatCurrency(stats.totalAUM)"
          icon="fa-wallet"
          icon-bg-color="bg-yellow-100"
          icon-text-color="text-yellow-600"
          value-color="text-yellow-600"
        />
        <StatsCard
          title="Average Portfolio Value"
          :value="formatCurrency(stats.averagePortfolioValue)"
          icon="fa-chart-line"
          icon-bg-color="bg-purple-100"
          icon-text-color="text-purple-600"
          value-color="text-purple-600"
        />
      </div>

      <!-- Portfolio Overview & Activity Section -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Fund Category Distribution -->
        <ChartCard
          title="Fund Category Distribution"
          :data="stats.categoryDistribution"
          :total="stats.totalAUM"
        />

        <!-- Upcoming Appointments -->
        <UpcomingAppointments />
      </div>

      <!-- Top Clients Section -->
      <div class="bg-white rounded-lg shadow-soft p-6 transition-all duration-300 hover:shadow-hover">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Top Clients by Portfolio Value</h3>
        <div v-if="stats.topClients.length > 0" class="space-y-4">
          <div v-for="client in stats.topClients" :key="client.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center space-x-3">
              <p class="font-medium text-gray-900">{{ client.firstName }} {{ client.lastName }}</p>
              <span 
                :class="[
                  'px-2 py-0.5 text-xs leading-5 font-medium rounded-full',
                  {
                    'risk-averse': client.riskProfile === 'Averse',
                    'risk-minimal': client.riskProfile === 'Minimal',
                    'risk-cautious': client.riskProfile === 'Cautious',
                    'risk-open': client.riskProfile === 'Open',
                    'risk-eager': client.riskProfile === 'Eager'
                  }
                ]"
              >{{ client.riskProfile }}</span>
            </div>
            <p class="text-lg font-semibold text-emerald-600">{{ formatCurrency(client.portfolioValue) }}</p>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-4">
          No clients found
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, onMounted, inject } from 'vue';
import { clientService, investmentService } from '../services/database';
import StatsCard from '../components/StatsCard.vue';
import ChartCard from '../components/ChartCard.vue';
import UpcomingAppointments from '../components/UpcomingAppointments.vue';

export default {
  name: 'Dashboard',
  components: {
    StatsCard,
    ChartCard,
    UpcomingAppointments
  },
  setup() {
    const isLoading = ref(true);
    const error = ref('');
    const currentUser = inject('currentUser');

    const stats = ref({
      totalClients: 0,
      activePortfolios: 0,
      totalAUM: 0,
      averagePortfolioValue: 0,
      categoryDistribution: {},
      topClients: []
    });

    const loadDashboardData = async () => {
      if (!currentUser.value) {
        error.value = 'User session not found';
        isLoading.value = false;
        return;
      }
      
      isLoading.value = true;
      error.value = '';
      
      try {
        // Get all clients
        const clients = await clientService.getAllClients();
        
        // If no clients, set empty state and return
        if (!clients || clients.length === 0) {
          stats.value = {
            totalClients: 0,
            activePortfolios: 0,
            totalAUM: 0,
            averagePortfolioValue: 0,
            categoryDistribution: {},
            topClients: []
          };
          return;
        }

        // Get accounts and calculate totals with detailed holdings
        const clientsData = await Promise.all(
          clients.map(async (client) => {
            // Get all accounts for the client
            const accounts = await investmentService.getClientAccounts(client.id);
            
            // Get detailed account data including holdings
            const accountsWithHoldings = await Promise.all(
              accounts.map(account => investmentService.getAccount(account.id))
            );

            // Calculate total portfolio value from holdings
            const portfolioValue = accountsWithHoldings.reduce((sum, account) => {
              if (account.holdings?.length) {
                const accountValue = account.holdings.reduce((holdingSum, holding) => {
                  // Calculate holding value from units * price if currentValue is not available
                  const holdingValue = holding.currentValue || (holding.unitsHeld * holding.fund?.price) || 0;
                  return holdingSum + holdingValue;
                }, 0);
                return sum + accountValue;
              }
              return sum + (account.totalValue || 0);
            }, 0);

            return {
              ...client,
              portfolioValue,
              accounts: accountsWithHoldings
            };
          })
        );

        // Calculate filtered clients with active portfolios only
        const activeClients = clientsData.filter(client => client.portfolioValue > 0);

        // Calculate summary statistics
        const totalAUM = activeClients.reduce((sum, client) => sum + client.portfolioValue, 0);
        const activePortfolios = activeClients.length;
        const averagePortfolioValue = activePortfolios > 0 ? totalAUM / activePortfolios : 0;

        // Calculate category distribution from active portfolios only
        const categoryDistribution = {};
        activeClients.forEach(client => {
          client.accounts.forEach(account => {
            account.holdings?.forEach(holding => {
              if (holding.fund?.category) {
                const category = holding.fund.category;
                const holdingValue = holding.currentValue || (holding.unitsHeld * holding.fund.price) || 0;
                categoryDistribution[category] = (categoryDistribution[category] || 0) + holdingValue;
              }
            });
          });
        });

        // Sort categories by value and limit to top 6
        const sortedCategories = Object.entries(categoryDistribution)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 6)
          .reduce((acc, [key, value]) => {
            acc[key] = value;
            return acc;
          }, {});

        // Get top clients by portfolio value (only include clients with active portfolios)
        const topClients = [...activeClients]
          .sort((a, b) => b.portfolioValue - a.portfolioValue)
          .slice(0, 5);

        // Update stats
        stats.value = {
          totalClients: clients.length,
          activePortfolios,
          totalAUM,
          averagePortfolioValue,
          categoryDistribution: sortedCategories,
          topClients
        };

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        error.value = 'Failed to load dashboard data. Please try refreshing the page.';
      } finally {
        isLoading.value = false;
      }
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value || 0);
    };

    onMounted(() => {
      loadDashboardData();
    });

    return {
      isLoading,
      error,
      stats,
      formatCurrency
    };
  }
};
</script>

<style lang="postcss" scoped>
.risk-averse {
  @apply bg-blue-100 text-blue-800;
}

.risk-minimal {
  @apply bg-green-100 text-green-800;
}

.risk-cautious {
  @apply bg-yellow-100 text-yellow-800;
}

.risk-open {
  @apply bg-orange-100 text-orange-800;
}

.risk-eager {
  @apply bg-red-100 text-red-800;
}
</style>