<template>
  <div class="bg-glass backdrop-blur-xs rounded-lg shadow-soft p-6 transition-all duration-300 hover:shadow-hover">
    <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ title }}</h3>
    <div class="h-64">
      <canvas ref="chart"></canvas>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import Chart from 'chart.js/auto';

export default {
  name: 'ChartCard',
  props: {
    title: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    },
    total: {
      type: Number,
      default: 0
    }
  },
  setup(props) {
    const chart = ref(null);
    let chartInstance = null;

    const createChart = () => {
      if (!chart.value || !props.data) return;

      const labels = Object.keys(props.data);
      const values = Object.values(props.data);

      if (chartInstance) {
        chartInstance.destroy();
      }

      chartInstance = new Chart(chart.value, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data: values,
            backgroundColor: [
              '#10B981', // emerald-500
              '#3B82F6', // blue-500
              '#F59E0B', // amber-500
              '#8B5CF6', // violet-500
              '#EC4899', // pink-500
              '#6366F1', // indigo-500
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      });
    };

    onMounted(() => {
      createChart();
    });

    watch([() => props.data, () => props.total], () => {
      createChart();
    }, { deep: true });

    return {
      chart
    };
  }
}
</script>