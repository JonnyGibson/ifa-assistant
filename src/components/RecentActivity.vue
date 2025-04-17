<template>
  <div class="bg-white rounded-lg shadow">
    <div class="p-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold text-gray-700">Recent Activity</h3>
        <button class="text-blue-500 hover:text-blue-700">
          View All
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              <th class="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Client</th>
              <th class="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Note Type</th>
              <th class="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Content</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="activity in activities" :key="activity.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 border-b border-gray-200">{{ activity.clientName }}</td>
              <td class="px-6 py-4 border-b border-gray-200">
                <span :class="getNoteTypeClass(activity.note_type)" class="px-2 py-1 rounded-full text-xs">
                  {{ activity.note_type }}
                </span>
              </td>
              <td class="px-6 py-4 border-b border-gray-200">{{ formatDate(activity.created_at) }}</td>
              <td class="px-6 py-4 border-b border-gray-200">{{ activity.content }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RecentActivity',
  props: {
    activities: {
      type: Array,
      required: true
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    },
    getNoteTypeClass(type) {
      const classes = {
        meeting: 'bg-blue-100 text-blue-800',
        call: 'bg-green-100 text-green-800',
        email: 'bg-yellow-100 text-yellow-800',
        general: 'bg-gray-100 text-gray-800'
      }
      return classes[type] || 'bg-gray-100 text-gray-800'
    }
  }
}
</script> 