<template>
  <div class="bg-white rounded-lg shadow-md p-4 sm:p-5 lg:p-6">
    <div class="space-y-3">
      <div class="flex items-center">
        <div :class="[iconBgColor, 'p-2.5 sm:p-3 rounded-full flex-shrink-0']">
          <i :class="['fas', icon, iconTextColor]" class="text-lg sm:text-xl"></i>
        </div>
        <div class="ml-3 sm:ml-4">
          <p class="text-xs sm:text-sm font-medium text-gray-600">{{ title }}</p>
        </div>
        <router-link
          v-if="addLink"
          :to="addLink"
          class="ml-auto flex items-center justify-center p-1.5 sm:p-2 hover:bg-gray-50 rounded-lg transition-colors duration-150 group"
        >
          <i :class="['fas fa-plus', iconTextColor]" class="text-xs sm:text-sm"></i>
          <span class="ml-1 text-xs sm:text-sm font-medium text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150">Add</span>
        </router-link>
      </div>
      <div>
        <div>
          <div>
            <p :class="['text-xl sm:text-2xl font-semibold tracking-tight', valueColor]">{{ value }}</p>
          </div>
        </div>
        <p v-if="subtext" class="text-xs text-gray-500 mt-0.5">{{ subtext }}</p>
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
    },
    addLink: {
      type: String,
      default: ''
    }
  }
}
</script>