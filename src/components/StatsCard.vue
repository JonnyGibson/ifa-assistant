<template>
  <div class="bg-white rounded-lg shadow-md p-6">
    <div class="flex items-center">
      <div :class="iconBgColor" class="p-3 rounded-full">
        <i :class="['fas', icon, iconTextColor]" class="text-xl"></i>
      </div>
      <div class="ml-4">
        <p class="text-sm font-medium text-gray-600">{{ title }}</p>
        <p :class="['text-2xl font-semibold', valueColor]">{{ value }}</p>
        <p v-if="subtext" class="text-xs text-gray-500 mt-1">{{ subtext }}</p>
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
      type: [Number, String],
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
    },
    subtext: {
      type: String,
      default: ''
    }
  }
}
</script>