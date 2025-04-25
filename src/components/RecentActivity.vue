<template>
  <div class="bg-white rounded-lg shadow-soft p-6 transition-all duration-300 hover:shadow-hover">
    <h3 class="text-lg font-semibold text-gray-700 mb-4">Recent Client Contacts</h3>
    <div class="overflow-hidden rounded-lg border border-gray-200">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="!activities.length" class="hover:bg-gray-50">
            <td colspan="4" class="px-6 py-4 text-center text-gray-500">No recent contacts found</td>
          </tr>
          <tr v-for="activity in activities" 
              :key="activity.id" 
              class="hover:bg-gray-50 transition-colors duration-150">
            <td class="px-6 py-4">
              <span class="font-medium text-gray-900">{{ activity.clientName }}</span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-2">
                <i :class="getTypeIcon(activity) + ' text-emerald-500'" aria-hidden="true"></i>
                <span class="text-gray-900">{{ activity.typeName }}</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ formatDate(activity.date) }}
            </td>
            <td class="px-6 py-4 text-sm text-gray-500 max-w-lg truncate">{{ activity.notes }}</td>
          </tr>
        </tbody>
      </table>
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
    const interactionTypeMap = ref({})

    const loadActivities = async () => {
      if (!currentUser.value?.id) return
      
      isLoading.value = true
      try {
        activities.value = await interactionService.getRecentInteractions(currentUser.value.id)
        interactionTypeMap.value = await interactionService.getInteractionTypes()
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

    const getTypeIcon = (activity) => {
      const typeKey = activity.type?.key?.toLowerCase() || 'default'
      const iconMap = {
        meeting: 'fas fa-handshake',
        call: 'fas fa-phone',
        email: 'fas fa-envelope',
        note: 'fas fa-sticky-note',
        review: 'fas fa-search',
        document: 'fas fa-file-alt',
        task: 'fas fa-tasks'
      }
      return iconMap[typeKey] || 'fas fa-comment-dots'
    }

    return {
      activities,
      isLoading,
      formatDate,
      getTypeIcon
    }
  }
}
</script>

<style scoped>
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>