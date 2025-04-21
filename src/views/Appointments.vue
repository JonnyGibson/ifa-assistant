<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Appointment Management</h1>
      <div class="flex space-x-4">
        <button 
          @click="openModal()" 
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center"
        >
          <i class="fas fa-calendar-plus mr-2"></i>New Appointment
        </button>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>

    <!-- Appointments List -->
    <div v-else>
      <div class="mb-4 flex justify-between items-center">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search by client name..." 
          class="border border-gray-300 rounded-lg p-2 text-sm w-full max-w-md"
        />
        <select v-model="filterStatus" class="border border-gray-300 rounded-lg p-2 text-sm">
          <option value="all">All</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
        </select>
      </div>
      <div v-if="appointments.length === 0" class="text-center text-gray-500 py-4">
        No appointments found.
      </div>
      <div v-else class="space-y-4">
        <div 
          v-for="appointment in appointments" 
          :key="appointment.id"
          class="border-l-4 p-4 bg-gray-50 rounded"
          :class="{
            'border-blue-500': appointment.status === 'scheduled',
            'border-green-500': appointment.status === 'completed'
          }"
        >
          <div class="flex justify-between items-start">
            <div>
              <h3 class="font-medium text-gray-900">{{ getClientName(appointment.clientId) }}</h3>
              <p class="text-sm text-gray-500">{{ formatDate(appointment.date) }}</p>
              <p class="text-sm text-gray-600 mt-1">{{ appointment.title }}</p>
            </div>
            <div class="flex space-x-2 flex-shrink-0">
              <button @click="editAppointment(appointment)" class="text-blue-600 hover:text-blue-800"><i class="fas fa-edit"></i></button>
              <button @click="confirmDeleteAppointment(appointment.id)" class="text-red-600 hover:text-red-800"><i class="fas fa-trash-alt"></i></button>
            </div>
          </div>
          <p v-if="appointment.description" class="text-sm text-gray-600 mt-2">{{ appointment.description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, inject, onMounted, watch } from 'vue';
import { clientService, interactionService } from '../services/database';

export default {
  name: 'Appointments',
  setup() {
    const appointments = ref([]);
    const clients = ref([]);
    const isLoading = ref(true);
    const searchQuery = ref('');
    const filterStatus = ref('all');
    const currentUser = inject('currentUser', ref(null));
    const userId = computed(() => currentUser.value?.id);

    const loadAppointments = async () => {
      if (!userId.value) return;
      
      isLoading.value = true;
      try {
        // Get all interactions of type 'Meeting'
        const interactions = await interactionService.getClientInteractions(userId.value);
        const meetingType = await interactionService.getAllInteractionTypes()
          .then(types => types.find(t => t.name === 'Meeting'));

        if (meetingType) {
          appointments.value = interactions
            .filter(interaction => interaction.interactionTypeId === meetingType.id)
            .map(appt => ({
              ...appt,
              status: new Date(appt.date) < new Date() ? 'completed' : 'scheduled'
            }));
        }

        // Get client details for each appointment
        const uniqueClientIds = [...new Set(appointments.value.map(a => a.clientId))];
        const clientDetails = await Promise.all(
          uniqueClientIds.map(id => clientService.getClient(id))
        );
        clients.value = clientDetails.filter(Boolean);

      } catch (error) {
        console.error('Error loading appointments:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const filteredAppointments = computed(() => {
      return appointments.value
        .filter(appointment => {
          const client = clients.value.find(c => c.id === appointment.clientId);
          if (!client) return false;

          const matchesSearch = !searchQuery.value || 
            client.firstName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            client.lastName.toLowerCase().includes(searchQuery.value.toLowerCase());

          const matchesStatus = filterStatus.value === 'all' || 
            appointment.status === filterStatus.value;

          return matchesSearch && matchesStatus;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date));
    });

    const getClientName = (clientId) => {
      const client = clients.value.find(c => c.id === clientId);
      return client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-GB', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    watch(() => userId.value, (newId) => {
      if (newId) {
        loadAppointments();
      }
    }, { immediate: true });

    return {
      appointments: filteredAppointments,
      isLoading,
      searchQuery,
      filterStatus,
      getClientName,
      formatDate
    };
  }
};
</script>