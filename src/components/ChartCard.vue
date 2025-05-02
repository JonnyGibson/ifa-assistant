<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">{{ title }}</h3>
    <div class="h-64">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

// Register required Chart.js components
Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

export default {
  name: 'ChartCard',
  props: {
    title: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      required: true
    },
    total: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const chartCanvas = ref(null);
    let chart = null;

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value || 0);
    };

    const setupChart = () => {
      if (!chartCanvas.value || !props.data || Object.keys(props.data).length === 0) {
        return;
      }

      if (chart) {
        chart.destroy();
      }

      const colors = [
        '#10B981', // emerald-500 for UK Stock
        '#3B82F6', // blue-500 for Non-UK Stock
        '#6366F1', // indigo-500 for UK Bond
        '#8B5CF6', // violet-500 for Non-UK Bond
        '#64748B', // slate-500 for Cash
        '#F59E0B', // amber-500 for Other
      ];

      const labels = Object.keys(props.data);
      const values = Object.values(props.data);

      chart = new Chart(chartCanvas.value, {
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
                  return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    };

    // Watch for changes in both data and total, also check for chart canvas availability
    watch([() => props.data, () => props.total, chartCanvas], () => {
      if (chartCanvas.value && Object.keys(props.data).length > 0) {
        setupChart();
      }
    }, { deep: true });

    // Setup chart on mount if data is available
    onMounted(() => {
      if (chartCanvas.value && Object.keys(props.data).length > 0) {
        setupChart();
      }
    });

    return {
      chartCanvas
    };
  }
};
</script>