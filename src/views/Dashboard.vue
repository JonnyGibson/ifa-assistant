<template>
  <div class="space-y-8">
    <!-- Stats Overview Section -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 -mt-14">
      <StatsCard
        title="Total Clients"
        :value="stats.totalClients"
        icon="fa-users"
        icon-bg-color="bg-blue-100"
        icon-text-color="text-blue-600"
        value-color="text-blue-600"
      />
      <StatsCard
        title="Active Portfolios"
        :value="stats.activePortfolios"
        icon="fa-chart-pie"
        icon-bg-color="bg-emerald-100"
        icon-text-color="text-emerald-600"
        value-color="text-emerald-600"
      />
      <StatsCard
        title="Pending Tasks"
        :value="stats.pendingTasks"
        icon="fa-clipboard-list"
        icon-bg-color="bg-yellow-100"
        icon-text-color="text-yellow-600"
        value-color="text-yellow-600"
      />
      <StatsCard
        title="Upcoming Meetings"
        :value="stats.upcomingMeetings"
        icon="fa-calendar"
        icon-bg-color="bg-purple-100"
        icon-text-color="text-purple-600"
        value-color="text-purple-600"
      />
    </div>

    <!-- Quick Actions & Activity Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <QuickActions />
      <RecentActivity />
    </div>

    <!-- Fund Management Overview & Top Clients Section -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <!-- Fund Management Overview -->
      <div class="bg-white rounded-lg shadow-soft p-6 transition-all duration-300 hover:shadow-hover">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Fund Management Overview</h3>
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-emerald-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Total Assets Under Management</p>
            <p class="text-2xl font-bold text-emerald-600">{{ formatCurrency(stats.totalAUM) }}</p>
          </div>
          <div class="bg-blue-50 rounded-lg p-4">
            <p class="text-sm text-gray-600">Average Portfolio Value</p>
            <p class="text-2xl font-bold text-blue-600">{{ formatCurrency(stats.averagePortfolioValue) }}</p>
          </div>
        </div>
        <div class="h-64">
          <canvas ref="categoryChart"></canvas>
        </div>
      </div>
      
      <!-- Top Clients by Portfolio Value -->
      <div class="bg-white rounded-lg shadow-soft p-6 transition-all duration-300 hover:shadow-hover">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Top Clients by Portfolio Value</h3>
        <div class="space-y-4">
          <div v-for="client in stats.topClients" :key="client.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">{{ client.firstName }} {{ client.lastName }}</p>
              <p class="text-sm text-gray-500">{{ client.riskProfile }} Risk Profile</p>
            </div>
            <p class="text-lg font-semibold text-emerald-600">{{ formatCurrency(client.portfolioValue) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Upcoming Appointments Section -->
    <div class="bg-white rounded-lg shadow-soft transition-all duration-300 hover:shadow-hover">
      <UpcomingAppointments />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject, computed, nextTick } from 'vue'
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js'
import { dataService } from '../services/db'
import StatsCard from '../components/StatsCard.vue'
import QuickActions from '../components/QuickActions.vue'
import RecentActivity from '../components/RecentActivity.vue'
import UpcomingAppointments from '../components/UpcomingAppointments.vue'

Chart.register(ArcElement, Tooltip, Legend, PieController)

export default {
  name: 'DashboardView',
  components: {
    StatsCard,
    QuickActions,
    RecentActivity,
    UpcomingAppointments
  },
  setup() {
    const currentUser = inject('currentUser', ref(null))
    const userId = computed(() => currentUser.value?.id)
    
    const stats = ref({
      totalClients: 0,
      activePortfolios: 0,
      pendingTasks: 0,
      upcomingMeetings: 0,
      totalAUM: 0,
      averagePortfolioValue: 0,
      topClients: [],
      categoryDistribution: {}
    })

    const formatCurrency = (value, currencyCode = 'GBP') => {
      if (typeof value !== 'number') return 'N/A';
      return new Intl.NumberFormat('en-GB', { 
        style: 'currency', 
        currency: currencyCode
      }).format(value);
    };

    const categoryChart = ref(null);

    const setupCategoryChart = () => {
      if (!categoryChart.value) return;

      const labels = Object.keys(stats.value.categoryDistribution);
      const data = Object.values(stats.value.categoryDistribution);
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
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                usePointStyle: true
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

    const fetchDashboardData = async () => {
      if (!userId.value) return;

      try {
        // Get clients and their holdings
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

        // Calculate total AUM and category distribution
        let totalAUM = 0;
        const categoryDistribution = {};

        clientHoldings.forEach(client => {
          totalAUM += client.portfolioValue;
          client.holdings.forEach(holding => {
            const category = holding.fund.category;
            categoryDistribution[category] = (categoryDistribution[category] || 0) + holding.currentValue;
          });
        });

        // Update stats
        stats.value.totalAUM = totalAUM;
        stats.value.averagePortfolioValue = totalAUM / clients.length;
        stats.value.categoryDistribution = categoryDistribution;
        stats.value.topClients = clientHoldings
          .sort((a, b) => b.portfolioValue - a.portfolioValue)
          .slice(0, 5);

        // Get total clients
        stats.value.totalClients = clients.length;

        // Get total active portfolios (clients with holdings)
        stats.value.activePortfolios = clientHoldings.filter(client => client.holdings.length > 0).length;

        // Count upcoming meetings (next 7 days)
        const today = new Date();
        const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
        const appointments = await dataService.getAppointments(userId.value);
        stats.value.upcomingMeetings = appointments.filter(
          appt => new Date(appt.startTime) <= nextWeek && new Date(appt.startTime) >= today
        ).length;

        // Get pending compliance items as tasks
        const compliance = await dataService.getComplianceRequirements(userId.value);
        stats.value.pendingTasks = compliance.filter(item => item.status === 'pending').length;

        // Setup chart after data is loaded
        nextTick(() => setupCategoryChart());

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    }

    onMounted(() => {
      if (userId.value) {
        fetchDashboardData();
      }
    })

    return {
      stats,
      formatCurrency,
      categoryChart
    }
  }
}
</script>