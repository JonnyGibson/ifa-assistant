<template>
  <div class="bg-white rounded-lg shadow p-6">
    <h3 class="text-lg font-semibold text-gray-700 mb-4">Upcoming Appointments</h3>
    <div class="space-y-4">
      <div v-for="appointment in appointments" :key="appointment.id" class="border-l-4 border-blue-500 pl-4">
        <p class="font-medium">{{ appointment.clientName }}</p>
        <p class="text-sm text-gray-600">{{ formatDate(appointment.date) }}</p>
        <p class="text-sm text-gray-500">{{ appointment.type }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'UpcomingAppointments',
  props: {
    appointments: {
      type: Array,
      required: true
    }
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString()
    }
  }
}
</script> 