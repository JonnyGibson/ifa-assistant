<template>
  <div class="bg-white rounded-lg shadow p-6">
    <div class="flex items-center">
      <div :class="`p-3 rounded-full ${iconBgColor} ${iconTextColor}`">
        <i :class="`fas ${icon} text-2xl`"></i>
      </div>
      <div class="ml-4">
        <h3 class="text-lg font-semibold text-gray-700">{{ title }}</h3>
        <p :class="`text-3xl font-bold ${valueColor}`">{{ value }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'StatsCard',
  props: {
    title: {
      type: String,
      required: true
    },
    value: {
      type: [String, Number],
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    iconBgColor: {
      type: String,
      default: 'bg-blue-100'
    },
    iconTextColor: {
      type: String,
      default: 'text-blue-600'
    },
    valueColor: {
      type: String,
      default: 'text-blue-600'
    }
  }
}
</script> 