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

    <!-- Calendar and Schedule View -->
    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Calendar Section -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-800">Calendar</h2>
            <div class="flex space-x-2">
              <button @click="previousMonth" class="p-2 text-gray-600 hover:text-gray-800">
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="text-lg font-medium">{{ currentMonthYear }}</span>
              <button @click="nextMonth" class="p-2 text-gray-600 hover:text-gray-800">
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <div v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" class="text-center text-sm font-medium text-gray-500 py-2">
              {{ day }}
            </div>
            <div 
              v-for="(day, index) in calendarDays" 
              :key="index"
              class="border border-gray-200 p-2 min-h-[100px]"
              :class="{
                'bg-gray-50': !day.isCurrentMonth,
                'bg-emerald-50': isSelectedDate(day.date),
                'hover:bg-gray-50': day.isCurrentMonth
              }"
              @click="selectDate(day.date)"
            >
              <div class="flex justify-between items-center">
                <span class="text-sm" :class="{'text-gray-400': !day.isCurrentMonth, 'font-semibold': isToday(day.date)}">
                  {{ day.day }}
                </span>
                <span v-if="getAppointmentsCount(day.date) > 0" class="text-xs bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5">
                  {{ getAppointmentsCount(day.date) }}
                </span>
              </div>
              <div class="mt-1 space-y-1 overflow-hidden">
                <div 
                  v-for="appointment in getAppointmentsForDay(day.date)" 
                  :key="appointment.id"
                  class="text-xs p-1 rounded truncate cursor-pointer"
                  :class="getAppointmentClass(appointment)"
                  @click.stop="editAppointment(appointment)"
                >
                  {{ formatTime(appointment.startTime) }} - {{ appointment.clientName || 'N/A' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Selected Date Schedule Section -->
      <div class="space-y-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Schedule for {{ formatDate(selectedDate) }}</h2>
          <div v-if="isLoadingAppointments" class="text-center py-4">
             <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500 mx-auto"></div>
          </div>
          <div v-else class="space-y-4">
            <div 
              v-for="appointment in selectedDateAppointments" 
              :key="appointment.id"
              class="border-l-4 p-4 bg-gray-50 rounded"
              :class="getAppointmentBorderClass(appointment)"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium text-gray-900">{{ appointment.clientName || 'Unknown Client' }}</h3>
                  <p class="text-sm text-gray-500">{{ formatTime(appointment.startTime) }} - {{ formatTime(appointment.endTime) }}</p>
                  <p class="text-sm text-gray-600 mt-1">{{ appointment.title }}</p>
                </div>
                <div class="flex space-x-2 flex-shrink-0">
                  <button @click="editAppointment(appointment)" class="text-blue-600 hover:text-blue-800"><i class="fas fa-edit"></i></button>
                  <button @click="confirmDeleteAppointment(appointment.id)" class="text-red-600 hover:text-red-800"><i class="fas fa-trash-alt"></i></button>
                </div>
              </div>
              <p v-if="appointment.description" class="text-sm text-gray-600 mt-2">{{ appointment.description }}</p>
            </div>
            <p v-if="selectedDateAppointments.length === 0" class="text-gray-500 text-center py-4">
              No appointments scheduled for this day.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Appointment Modal (Add/Edit) -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 class="text-2xl font-bold mb-6">{{ editingAppointment ? 'Edit Appointment' : 'New Appointment' }}</h2>
        <form @submit.prevent="saveAppointment">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-gray-700 mb-1 text-sm font-medium">Client</label>
              <select v-model="appointmentForm.clientId" class="w-full border border-gray-300 rounded-lg p-2 text-sm" required>
                <option disabled value="">Select Client</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.firstName }} {{ client.lastName }}
                </option>
              </select>
            </div>
             <div>
              <label class="block text-gray-700 mb-1 text-sm font-medium">Appointment Title</label>
              <input v-model="appointmentForm.title" type="text" class="w-full border border-gray-300 rounded-lg p-2 text-sm" required/>
            </div>
            <div>
              <label class="block text-gray-700 mb-1 text-sm font-medium">Date</label>
              <input v-model="appointmentForm.date" type="date" class="w-full border border-gray-300 rounded-lg p-2 text-sm" required/>
            </div>
             <div>
              <label class="block text-gray-700 mb-1 text-sm font-medium">Status</label>
               <select v-model="appointmentForm.status" class="w-full border border-gray-300 rounded-lg p-2 text-sm" required>
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 mb-1 text-sm font-medium">Start Time</label>
              <input v-model="appointmentForm.startTime" type="time" class="w-full border border-gray-300 rounded-lg p-2 text-sm" required/>
            </div>
            <div>
              <label class="block text-gray-700 mb-1 text-sm font-medium">End Time</label>
              <input v-model="appointmentForm.endTime" type="time" class="w-full border border-gray-300 rounded-lg p-2 text-sm" required/>
            </div>
            <div class="md:col-span-2">
              <label class="block text-gray-700 mb-1 text-sm font-medium">Description/Notes</label>
              <textarea v-model="appointmentForm.description" class="w-full border border-gray-300 rounded-lg p-2 text-sm" rows="3"></textarea>
            </div>
          </div>
          <div class="flex justify-end space-x-4 mt-6">
            <button type="button" @click="closeModal" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg">
              {{ editingAppointment ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, inject } from 'vue'
import { dataService } from '../services/db' // Use our data service

const defaultAppointmentForm = () => ({
  clientId: '',
  title: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  status: 'scheduled',
  userId: null
});

export default {
  name: 'Appointments',
  setup() {
    const appointments = ref([]);
    const clients = ref([]);
    const isLoading = ref(true);
    const isLoadingAppointments = ref(false);
    const showModal = ref(false);
    const editingAppointment = ref(null);
    const appointmentForm = ref(defaultAppointmentForm());
    const currentDate = ref(new Date());
    const selectedDate = ref(new Date().toISOString().split('T')[0]); // YYYY-MM-DD

    const currentUser = inject('currentUser', ref(null)); 
    const userId = computed(() => currentUser.value?.id);

    const fetchAppointments = async () => {
      if (!userId.value) return;
      isLoadingAppointments.value = true;
      try {
        appointments.value = await dataService.getAppointments(userId.value);
        // Optionally enrich with client names if not done in dataService
        await enrichAppointmentsWithClientNames(); 
      } catch (error) {
        console.error('Error fetching appointments:', error);
        alert('Failed to load appointments.');
      } finally {
        isLoadingAppointments.value = false;
      }
    };

    const fetchClients = async () => {
      if (!userId.value) return;
      try {
        clients.value = await dataService.getClients(userId.value);
      } catch (error) {
        console.error('Error fetching clients:', error);
        alert('Failed to load clients for dropdown.');
      }
    };

    // Helper to add client names to appointments
    const enrichAppointmentsWithClientNames = async () => {
      if (clients.value.length === 0) await fetchClients(); // Ensure clients are loaded
      const clientMap = new Map(clients.value.map(c => [c.id, `${c.firstName} ${c.lastName}`]));
      appointments.value = appointments.value.map(appt => ({
        ...appt,
        clientName: clientMap.get(appt.clientId) || 'Unknown Client'
      }));
    };

    // Calendar logic
    const currentMonthYear = computed(() => {
      return currentDate.value.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    });

    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear();
      const month = currentDate.value.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const lastDayOfMonth = new Date(year, month + 1, 0);
      const daysInMonth = lastDayOfMonth.getDate();
      const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

      const days = [];
      // Days from previous month
      const prevMonthLastDay = new Date(year, month, 0).getDate();
      for (let i = startDayOfWeek - 1; i >= 0; i--) {
        const date = new Date(year, month - 1, prevMonthLastDay - i);
        days.push({ day: prevMonthLastDay - i, date: date.toISOString().split('T')[0], isCurrentMonth: false });
      }

      // Days in current month
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        days.push({ day, date: date.toISOString().split('T')[0], isCurrentMonth: true });
      }

      // Days from next month
      const remainingCells = 42 - days.length; // Assuming 6 rows
      for (let i = 1; i <= remainingCells; i++) {
        const date = new Date(year, month + 1, i);
        days.push({ day: i, date: date.toISOString().split('T')[0], isCurrentMonth: false });
      }
      return days;
    });

    const previousMonth = () => {
      currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() - 1));
    };

    const nextMonth = () => {
      currentDate.value = new Date(currentDate.value.setMonth(currentDate.value.getMonth() + 1));
    };

    const isToday = (dateStr) => {
      return dateStr === new Date().toISOString().split('T')[0];
    };

    const isSelectedDate = (dateStr) => {
        return dateStr === selectedDate.value;
    };

    const selectDate = (dateStr) => {
      selectedDate.value = dateStr;
    };

    const getAppointmentsForDay = (dateStr) => {
      return appointments.value.filter(appt => appt.date === dateStr);
    };

    const getAppointmentsCount = (dateStr) => {
      return getAppointmentsForDay(dateStr).length;
    };

    // Schedule logic
    const selectedDateAppointments = computed(() => {
      return appointments.value
        .filter(appt => appt.date === selectedDate.value)
        .sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    // Modal and Form logic
    const openModal = (appointment = null) => {
      if (appointment) {
        editingAppointment.value = appointment;
        // Format date and time correctly for input fields
        appointmentForm.value = {
          ...appointment,
          date: appointment.date, // Already YYYY-MM-DD
          startTime: appointment.startTime, // Already HH:mm
          endTime: appointment.endTime, // Already HH:mm
        };
      } else {
        editingAppointment.value = null;
        appointmentForm.value = defaultAppointmentForm();
        appointmentForm.value.date = selectedDate.value; // Default to selected date
      }
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      editingAppointment.value = null;
      appointmentForm.value = defaultAppointmentForm();
    };

    const saveAppointment = async () => {
      if (!userId.value) {
        alert('User not authenticated.');
        return;
      }
      appointmentForm.value.userId = userId.value;
      
      // Basic validation
      if (appointmentForm.value.endTime <= appointmentForm.value.startTime) {
          alert('End time must be after start time.');
          return;
      }

      try {
        if (editingAppointment.value) {
          await dataService.updateAppointment(userId.value, editingAppointment.value.id, appointmentForm.value);
        } else {
          await dataService.addAppointment(userId.value, appointmentForm.value);
        }
        await fetchAppointments();
        closeModal();
      } catch (error) {
        console.error('Error saving appointment:', error);
        alert('Failed to save appointment.');
      }
    };

    const confirmDeleteAppointment = async (appointmentId) => {
      if (!userId.value) {
        alert('User not authenticated.');
        return;
      }
      if (confirm('Are you sure you want to delete this appointment?')) {
        try {
          await dataService.deleteAppointment(userId.value, appointmentId);
          await fetchAppointments();
        } catch (error) {
          console.error('Error deleting appointment:', error);
          alert('Failed to delete appointment.');
        }
      }
    };
    
    const editAppointment = (appointment) => {
        openModal(appointment);
    };

    // Formatting helpers
    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', { 
          year: 'numeric', month: 'long', day: 'numeric' 
      });
    };

    const formatTime = (timeStr) => {
      if (!timeStr) return '';
      // Assuming timeStr is HH:mm
      const [hours, minutes] = timeStr.split(':');
      const date = new Date();
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0);
      return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // Styling helpers
     const getAppointmentClass = (appointment) => {
        switch (appointment.status) {
            case 'completed': return 'bg-green-100 text-green-800';
            case 'cancelled': return 'bg-red-100 text-red-800 opacity-70';
            default: return 'bg-blue-100 text-blue-800'; // scheduled
        }
    };

    const getAppointmentBorderClass = (appointment) => {
        switch (appointment.status) {
            case 'completed': return 'border-green-500';
            case 'cancelled': return 'border-red-500';
            default: return 'border-blue-500'; // scheduled
        }
    };

    onMounted(async () => {
      isLoading.value = true;
      if (userId.value) {
        await Promise.all([fetchClients(), fetchAppointments()]);
      } else {
        const unwatch = watch(userId, async (newUserId) => {
          if (newUserId) {
            await Promise.all([fetchClients(), fetchAppointments()]);
            unwatch();
          }
        });
      }
      isLoading.value = false;
    });

    return {
      appointments,
      clients,
      isLoading,
      isLoadingAppointments,
      showModal,
      editingAppointment,
      appointmentForm,
      currentDate,
      selectedDate,
      currentMonthYear,
      calendarDays,
      selectedDateAppointments,
      previousMonth,
      nextMonth,
      isToday,
      isSelectedDate,
      selectDate,
      getAppointmentsForDay,
      getAppointmentsCount,
      openModal,
      closeModal,
      saveAppointment,
      editAppointment,
      confirmDeleteAppointment,
      formatDate,
      formatTime,
      getAppointmentClass,
      getAppointmentBorderClass,
    };
  }
};
</script> 