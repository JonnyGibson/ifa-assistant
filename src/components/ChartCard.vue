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
      if (chart) {
        chart.destroy();
      }

      const colors = [
        '#10B981', // emerald-500
        '#3B82F6', // blue-500
        '#6366F1', // indigo-500
        '#8B5CF6', // violet-500
        '#EC4899', // pink-500
        '#F59E0B', // amber-500
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

    watch(() => [props.data, props.total], setupChart, { deep: true });

    onMounted(() => {
      if (Object.keys(props.data).length > 0) {
        setupChart();
      }
    });

    return {
      chartCanvas
    };
  }
};
</script>