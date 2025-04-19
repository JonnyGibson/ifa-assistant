<template>
  <div class="bg-glass backdrop-blur-xs rounded-lg shadow-soft p-6 transition-all duration-300 hover:shadow-hover">
    <h3 class="text-lg font-semibold text-gray-700 mb-4">{{ title }}</h3>
    <div class="h-64">
      <canvas :ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartCard',
  props: {
    title: {
      type: String,
      required: true
    },
    chartRef: {
      type: String,
      required: true
    }
  }
}
</script>