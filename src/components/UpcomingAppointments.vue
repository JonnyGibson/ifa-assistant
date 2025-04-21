<template>
  <div class="bg-glass backdrop-blur-xs p-6 transition-all duration-300">
    <h3 class="text-lg font-semibold text-gray-700 mb-4">Upcoming Appointments</h3>
    <div class="space-y-4 max-h-[400px] overflow-y-auto pr-2">
      <div v-if="loading" class="flex justify-center p-4">
        <i class="pi pi-spin pi-spinner text-emerald-500 text-2xl"></i>
      </div>
      <template v-else>
        <div v-if="appointments && appointments.length > 0">
          <div v-for="appointment in appointments" :key="appointment.id" class="border-l-4 border-blue-500 pl-4 mb-4">
            <p class="font-medium">{{ appointment.client?.firstName }} {{ appointment.client?.lastName }}</p>
            <p class="text-sm text-gray-600">{{ formatDate(appointment.date) }}</p>
            <p class="text-sm text-gray-500">{{ appointment.type?.name }}</p>
          </div>
        </div>
        <div v-else class="text-center text-gray-500 py-4">
          No upcoming appointments
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, inject, computed } from 'vue';
import { interactionService } from '../services/database';

export default {
  name: 'UpcomingAppointments',
  setup() {
    const loading = ref(true);
    const appointments = ref([]);
    const currentUser = inject('currentUser', ref(null));
    const userId = computed(() => currentUser.value?.id);

    const fetchData = async () => {
      if (!userId.value) return;
      loading.value = true;
      try {
        const now = new Date();
        const upcomingAppointments = await interactionService.getUpcomingInteractions(now);
        appointments.value = upcomingAppointments
          .slice(0, 10) // Limit to 10 appointments
          .sort((a, b) => new Date(a.date) - new Date(b.date));
      } catch (error) {
        console.error('Error fetching appointments:', error);
      } finally {
        loading.value = false;
      }
    };

    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    onMounted(() => {
      if (userId.value) {
        fetchData();
      }
    });

    return {
      appointments,
      loading,
      formatDate
    };
  }
};
</script>

<style scoped>
.bg-glass {
  background: rgba(255, 255, 255, 0.9);
}

.backdrop-blur-xs {
  backdrop-filter: blur(2px);
}

/* Custom scrollbar styles */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #10b981 #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #10b981;
  border-radius: 3px;
}
</style>