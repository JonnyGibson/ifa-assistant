<template>
  <div class="flex items-center gap-1">
    <i v-if="icon" :class="[icon, textColor]" style="font-size: 0.8rem"></i>
    <span :class="[textColor, 'font-medium']">{{ formattedValue }}</span>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'PerformanceBadge',
  props: {
    value: {
      type: Number,
      required: true
    }
  },
  setup(props) {
    const textColor = computed(() => {
      return props.value >= 0 ? 'text-green-600' : 'text-red-600'
    })

    const icon = computed(() => {
      return props.value >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down'
    })

    const formattedValue = computed(() => {
      return props.value >= 0 ? `+${props.value.toFixed(2)}%` : `${props.value.toFixed(2)}%`
    })

    return {
      textColor,
      icon,
      formattedValue
    }
  }
}
</script>