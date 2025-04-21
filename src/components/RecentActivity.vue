<template>
  <div class="bg-white rounded-lg shadow-soft p-6 transition-all duration-300 hover:shadow-hover">
    <div>
      <h3 class="text-lg font-semibold text-gray-700 mb-4">Recent Client Contacts</h3>
      <div class="overflow-y-auto max-h-[400px] pr-2 scrollbar scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-gray-100 hover:scrollbar-thumb-emerald-300">
        <table class="min-w-full">
          <thead class="sticky top-0 bg-white shadow-sm z-10">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase w-52">Client</th>
              <th class="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Notes</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-if="!activities.length" class="hover:bg-gray-50">
              <td colspan="2" class="px-4 py-4 text-center text-gray-500">No recent contacts found</td>
            </tr>
            <tr v-for="activity in activities" :key="activity.id" class="hover:bg-gray-50">
              <td class="px-4 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">{{ activity.clientName }}</div>
                <div class="text-xs text-gray-500 mt-1">{{ formatDate(activity.date) }}</div>
              </td>
              <td class="px-4 py-4 text-sm text-gray-600">{{ activity.summaryNotes }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject, watch } from 'vue'
import { interactionService } from '../services/database'

export default {
  name: 'RecentActivity',
  setup() {
    const currentUser = inject('currentUser', ref(null))
    const activities = ref([])
    const isLoading = ref(true)

    const loadActivities = async () => {
      if (!currentUser.value?.id) return
      
      isLoading.value = true
      try {
        activities.value = await interactionService.getRecentInteractions(currentUser.value.id)
      } catch (error) {
        console.error('Error loading recent activities:', error)
      } finally {
        isLoading.value = false
      }
    }

    watch(() => currentUser.value?.id, (newId) => {
      if (newId) {
        loadActivities()
      }
    }, { immediate: true })

    const formatDate = (date) => {
      if (!date) return ''
      return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    return {
      activities,
      isLoading,
      formatDate
    }
  }
}
</script>