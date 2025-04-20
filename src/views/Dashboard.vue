<template>
  <div class="space-y-8">
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
        title="Pending Tasks"
        :value="stats.pendingTasks"
        icon="fa-clipboard-list"
        icon-bg-color="bg-yellow-100"
        icon-text-color="text-yellow-600"
        value-color="text-yellow-600"
        addLink="/compliance"
      />
      <StatsCard
        title="Upcoming Meetings"
        :value="stats.upcomingMeetings"
        icon="fa-calendar"
        icon-bg-color="bg-purple-100"
        icon-text-color="text-purple-600"
        value-color="text-purple-600"
        addLink="/appointments"
      />
    </div>

    <!-- Portfolio Overview & Activity Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Fund Category Distribution -->
      <div class="bg-white rounded-lg shadow-soft p-6 transition-all duration-300 hover:shadow-hover">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-semibold text-gray-800">Fund Category Distribution</h3>
          <div class="text-sm text-gray-500">
            Total AUM: {{ formatCurrency(stats.totalAUM) }}
          </div>
        </div>
        <div class="h-[300px] relative">
          <canvas ref="categoryChart"></canvas>
        </div>
      </div>

      <!-- Upcoming Appointments -->
      <div class="bg-white rounded-lg shadow-soft transition-all duration-300 hover:shadow-hover">
        <RecentActivity />
      </div>
    </div>

    <!-- Top Clients Section -->
    <div class="bg-white rounded-lg shadow-soft p-6 transition-all duration-300 hover:shadow-hover">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Top Clients by Portfolio Value</h3>
      <div class="space-y-4">
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
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject, computed, nextTick, watch } from 'vue';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
import StatsCard from '../components/StatsCard.vue';
import RecentActivity from '../components/RecentActivity.vue';
import { dataService } from '../services/db';

Chart.register(ArcElement, Tooltip, Legend, PieController);

export default {
  name: 'DashboardView',
  components: {
    StatsCard,
    RecentActivity
  },
  setup() {
    const currentUser = inject('currentUser', ref(null));
    const userId = computed(() => currentUser.value?.id);

    const stats = ref({
      totalClients: 0,
      activePortfolios: 0,
      pendingTasks: 0,
      upcomingMeetings: 0,
      totalAUM: 0,
      averagePortfolioValue: 0,
      topClients: [],
      categoryDistribution: {}
    });

    const formatCurrency = (value, currencyCode = 'GBP') => {
      if (typeof value !== 'number') return 'N/A';
      return new Intl.NumberFormat('en-GB', { 
        style: 'currency', 
        currency: currencyCode
      }).format(value);
    };

    const categoryChart = ref(null);

    const setupCategoryChart = () => {
      if (!categoryChart.value || !stats.value.categoryDistribution) return;

      const existingChart = Chart.getChart(categoryChart.value);
      if (existingChart) {
        existingChart.destroy();
      }

      const sortedCategories = Object.entries(stats.value.categoryDistribution)
        .sort(([, a], [, b]) => b - a)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      const labels = Object.keys(sortedCategories);
      const data = Object.values(sortedCategories);
      const colors = [
        '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', 
        '#EC4899', '#F59E0B', '#84CC16', '#14B8A6'
      ];

      new Chart(categoryChart.value, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 1,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                usePointStyle: true,
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    };

    watch(() => stats.value.categoryDistribution, () => {
      nextTick(setupCategoryChart);
    }, { deep: true });

    const fetchDashboardData = async () => {
      if (!userId.value) return;

      try {
        const clients = await dataService.getClients(userId.value);
        const clientHoldings = await Promise.all(
          clients.map(async client => {
            const holdings = await dataService.getHoldingsForClient(client.id);
            const portfolioValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
            return {
              ...client,
              portfolioValue,
              holdings
            };
          })
        );

        let totalAUM = 0;
        const categoryDistribution = {};

        clientHoldings.forEach(client => {
          totalAUM += client.portfolioValue;
          client.holdings.forEach(holding => {
            const category = holding.fund.category;
            categoryDistribution[category] = (categoryDistribution[category] || 0) + holding.currentValue;
          });
        });

        stats.value.totalAUM = totalAUM;
        stats.value.averagePortfolioValue = totalAUM / clients.length;
        stats.value.categoryDistribution = categoryDistribution;
        stats.value.topClients = clientHoldings
          .sort((a, b) => b.portfolioValue - a.portfolioValue)
          .slice(0, 5);

        stats.value.totalClients = clients.length;
        stats.value.activePortfolios = clientHoldings.filter(client => client.holdings.length > 0).length;

        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const appointments = await dataService.getAppointments(userId.value);
        stats.value.upcomingMeetings = appointments.filter(
          appt => new Date(appt.startTime) <= nextWeek && new Date(appt.startTime) >= today
        ).length;

        const compliance = await dataService.getComplianceRequirements(userId.value);
        stats.value.pendingTasks = compliance.filter(item => item.status === 'pending').length;

        nextTick(() => setupCategoryChart());

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    onMounted(() => {
      if (userId.value) {
        fetchDashboardData();
      }
    });

    return {
      stats,
      formatCurrency,
      categoryChart
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