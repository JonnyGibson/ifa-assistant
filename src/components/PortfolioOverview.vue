<template>
  <div class="mb-6">
    <div class="bg-glass backdrop-blur-xs rounded-lg shadow-soft p-6 h-full transition-all duration-300 hover:shadow-hover">
      <h3 class="text-lg font-semibold text-gray-800 mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <span>Portfolio Overview</span>
        <div class="flex flex-wrap items-center gap-4">
          <slot name="update-fund-prices"></slot>
          <span class="text-lg font-semibold text-emerald-600" aria-label="Total portfolio value">
            {{ formatCurrency(totalPortfolioValue) }}
          </span>
        </div>
      </h3>
      <div v-if="holdings.length > 0" class="mt-4 mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div class="min-h-[300px] flex flex-col">
          <h4 class="text-sm font-medium text-gray-600 mb-2">Category Distribution</h4>
          <div class="relative flex-1">
            <canvas ref="categoryChart"></canvas>
          </div>
        </div>
        <div class="min-h-[300px] flex flex-col">
          <h4 class="text-sm font-medium text-gray-600 mb-2">Asset Allocation</h4>
          <div class="space-y-3 flex-1 flex flex-col justify-center">
            <div v-for="(value, type) in portfolioAssetAllocation" :key="type" class="flex justify-between items-center">
              <span class="text-sm font-medium">{{ formatAssetType(type) }}</span>
              <div class="flex items-center gap-2">
                <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    class="h-full rounded-full" 
                    :class="getAssetAllocationColor(type)"
                    :style="{ width: `${value}%` }"
                  ></div>
                </div>
                <span class="text-sm text-gray-600">{{ value.toFixed(1) }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <slot name="accounts"></slot>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

// Register required Chart.js components
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export default {
  name: 'PortfolioOverview',
  props: {
    holdings: { type: Array, required: true },
    totalPortfolioValue: { type: Number, required: true },
    portfolioAssetAllocation: { type: Object, required: true },
    formatCurrency: { type: Function, required: true },
    formatAssetType: { type: Function, required: true },
    getAssetAllocationColor: { type: Function, required: true }
  },
  setup(props) {
    const categoryChart = ref(null);
    let chart = null;

    const setupChart = () => {
      const ctx = categoryChart.value?.getContext('2d');
      if (!ctx || !props.holdings.length) return;

      if (chart) {
        chart.destroy();
      }

      // Calculate category distribution
      const categoryDistribution = props.holdings.reduce((acc, holding) => {
        if (holding.fund?.category) {
          const category = holding.fund.category;
          const value = holding.currentValue || (holding.unitsHeld * holding.fund.price) || 0;
          acc[category] = (acc[category] || 0) + value;
        }
        return acc;
      }, {});

      const colors = [
        '#10B981', // emerald-500
        '#3B82F6', // blue-500
        '#6366F1', // indigo-500
        '#8B5CF6', // violet-500
        '#EC4899', // pink-500
        '#F59E0B', // amber-500
      ];

      const labels = Object.keys(categoryDistribution);
      const values = Object.values(categoryDistribution);

      chart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 1,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          plugins: {
            legend: {
              position: 'right',
              labels: {
                usePointStyle: true,
                font: {
                  size: 12
                },
                color: '#374151' // text-gray-700
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${props.formatCurrency(value)} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    };

    watch(() => [props.holdings, props.totalPortfolioValue], setupChart, { deep: true });

    onMounted(() => {
      if (props.holdings.length > 0) {
        setupChart();
      }
    });

    return {
      categoryChart
    };
  }
};
</script>
