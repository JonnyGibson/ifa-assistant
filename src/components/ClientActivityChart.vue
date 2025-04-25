<!-- src/components/ClientActivityChart.vue -->
<template>
  <div class="bg-glass backdrop-blur-xs rounded-lg shadow-soft p-6 transition-all duration-300 hover:shadow-hover">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Client Activity</h3>
    <div class="h-[300px]">
      <canvas ref="activityChart"></canvas>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue';
import { Chart } from 'chart.js/auto';

export default {
  name: 'ClientActivityChart',
  props: {
    data: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const activityChart = ref(null);
    const chart = ref(null);

    const setupChart = () => {
      const ctx = activityChart.value?.getContext('2d');
      if (!ctx || !props.data || !Array.isArray(props.data)) return;
      
      if (chart.value) {
        chart.value.destroy();
      }

      // Process data by month and type
      const monthlyDataByType = props.data.reduce((acc, interaction) => {
        if (!interaction?.date || !interaction?.type?.name) return acc;
        
        const date = new Date(interaction.date);
        const month = date.getMonth();
        const type = interaction.type.name.toLowerCase();
        
        if (!acc[type]) {
          acc[type] = Array(12).fill(0);
        }
        acc[type][month]++;
        
        return acc;
      }, {});

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Define colors using RGB values to ensure distinct colors
      const definedTypes = {
        'phone call': {
          color: 'rgb(220, 38, 38)',         // Red
          order: 1,
          label: 'Phone Call'
        },
        'annual review': {
          color: 'rgb(0, 0, 255)',           // Pure Blue
          order: 2,
          label: 'Annual Review'
        },
        'fact find': {
          color: 'rgb(0, 128, 0)',           // Pure Green
          order: 3,
          label: 'Fact Find'
        },
        'document submission': {
          color: 'rgb(128, 0, 128)',         // Pure Purple
          order: 4,
          label: 'Document Submission'
        },
        'meeting': {
          color: 'rgb(255, 215, 0)',         // Gold
          order: 5,
          label: 'Meeting'
        },
        'email': {
          color: 'rgb(255, 140, 0)',         // Dark Orange
          order: 6,
          label: 'Email'
        },
        'risk assessment': {                 // Added to match the exact case from data
          color: 'rgb(255, 0, 255)',         // Magenta
          order: 7,
          label: 'Risk Assessment'
        }
      };

      // Create datasets for each interaction type
      const datasets = Object.entries(monthlyDataByType)
        .map(([type, data]) => {
          const typeConfig = definedTypes[type] || {
            color: 'rgb(239, 68, 68)',  // Red-500 for unknown types
            order: 99,
            label: type.charAt(0).toUpperCase() + type.slice(1)
          };
          
          return {
            label: typeConfig.label,
            data: data,
            backgroundColor: typeConfig.color.replace('rgb', 'rgba').replace(')', ', 0.8)'),
            borderColor: typeConfig.color,
            borderWidth: 1,
            order: typeConfig.order,
            borderRadius: 4,
            barPercentage: 0.9,
            categoryPercentage: 0.8
          };
        })
        .sort((a, b) => a.order - b.order);

      chart.value = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: months,
          datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 15
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              stacked: true
            },
            y: {
              stacked: true,
              beginAtZero: true,
              ticks: {
                stepSize: 1
              }
            }
          }
        }
      });
    };

    watch(() => props.data, setupChart, { deep: true });

    onMounted(setupChart);

    return {
      activityChart
    };
  }
};
</script>