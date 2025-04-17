<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Appointment Management</h1>
      <div class="flex space-x-4">
        <button 
          @click="showNewAppointmentModal = true"
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center"
        >
          <i class="fas fa-calendar-plus mr-2"></i>New Appointment
        </button>
      </div>
    </div>

    <!-- Calendar and Schedule View -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Calendar Section -->
      <div class="lg:col-span-2">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold text-gray-800">Calendar</h2>
            <div class="flex space-x-2">
              <button 
                @click="previousMonth"
                class="p-2 text-gray-600 hover:text-gray-800"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <span class="text-lg font-medium">{{ currentMonthYear }}</span>
              <button 
                @click="nextMonth"
                class="p-2 text-gray-600 hover:text-gray-800"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
          <div class="grid grid-cols-7 gap-1">
            <div 
              v-for="day in ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" 
              :key="day"
              class="text-center text-sm font-medium text-gray-500 py-2"
            >
              {{ day }}
            </div>
            <div 
              v-for="(day, index) in calendarDays" 
              :key="index"
              class="border border-gray-200 p-2 min-h-24"
              :class="{
                'bg-gray-50': !day.isCurrentMonth,
                'hover:bg-gray-50 cursor-pointer': day.isCurrentMonth
              }"
              @click="selectDate(day.date)"
            >
              <div class="flex justify-between">
                <span 
                  class="text-sm"
                  :class="{
                    'text-gray-400': !day.isCurrentMonth,
                    'font-semibold': isToday(day.date)
                  }"
                >
                  {{ day.day }}
                </span>
                <span 
                  v-if="getAppointmentsCount(day.date) > 0"
                  class="text-xs bg-emerald-100 text-emerald-800 rounded-full px-2 py-1"
                >
                  {{ getAppointmentsCount(day.date) }}
                </span>
              </div>
              <div class="mt-1 space-y-1">
                <div 
                  v-for="appointment in getAppointmentsForDay(day.date)" 
                  :key="appointment.id"
                  class="text-xs p-1 rounded"
                  :class="getAppointmentClass(appointment)"
                  @click.stop="viewAppointment(appointment)"
                >
                  {{ formatTime(appointment.start_time) }} - {{ appointment.client_name }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Schedule Section -->
      <div class="space-y-6">
        <!-- Today's Appointments -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Today's Schedule</h2>
          <div class="space-y-4">
            <div 
              v-for="appointment in todaysAppointments" 
              :key="appointment.id"
              class="border-l-4 p-4"
              :class="getAppointmentBorderClass(appointment)"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium text-gray-900">{{ appointment.client_name }}</h3>
                  <p class="text-sm text-gray-500">{{ formatTime(appointment.start_time) }} - {{ formatTime(appointment.end_time) }}</p>
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="editAppointment(appointment)"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click="cancelAppointment(appointment)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <p class="text-sm text-gray-600 mt-2">{{ appointment.notes }}</p>
            </div>
            <p 
              v-if="todaysAppointments.length === 0"
              class="text-gray-500 text-center py-4"
            >
              No appointments scheduled for today
            </p>
          </div>
        </div>

        <!-- Upcoming Appointments -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Upcoming Appointments</h2>
          <div class="space-y-4">
            <div 
              v-for="appointment in upcomingAppointments" 
              :key="appointment.id"
              class="border-l-4 p-4"
              :class="getAppointmentBorderClass(appointment)"
            >
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="font-medium text-gray-900">{{ appointment.client_name }}</h3>
                  <p class="text-sm text-gray-500">{{ formatDate(appointment.date) }} at {{ formatTime(appointment.start_time) }}</p>
                </div>
                <div class="flex space-x-2">
                  <button 
                    @click="editAppointment(appointment)"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button 
                    @click="cancelAppointment(appointment)"
                    class="text-red-600 hover:text-red-800"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
              <p class="text-sm text-gray-600 mt-2">{{ appointment.notes }}</p>
            </div>
            <p 
              v-if="upcomingAppointments.length === 0"
              class="text-gray-500 text-center py-4"
            >
              No upcoming appointments
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- New Appointment Modal -->
    <div v-if="showNewAppointmentModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 class="text-2xl font-bold mb-6">New Appointment</h2>
        <form @submit.prevent="createAppointment">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-gray-700 mb-2">Client</label>
              <select
                v-model="newAppointment.client_id"
                class="w-full border border-gray-300 rounded-lg p-2"
                required
              >
                <option value="">Select Client</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.first_name }} {{ client.last_name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 mb-2">Date</label>
              <input
                v-model="newAppointment.date"
                type="date"
                class="w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label class="block text-gray-700 mb-2">Start Time</label>
              <input
                v-model="newAppointment.start_time"
                type="time"
                class="w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label class="block text-gray-700 mb-2">End Time</label>
              <input
                v-model="newAppointment.end_time"
                type="time"
                class="w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-gray-700 mb-2">Notes</label>
              <textarea
                v-model="newAppointment.notes"
                class="w-full border border-gray-300 rounded-lg p-2"
                rows="3"
              ></textarea>
            </div>
          </div>
          <div class="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              @click="showNewAppointmentModal = false"
              class="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

export default {
  name: 'Appointments',
  setup() {
    const appointments = ref([])
    const clients = ref([])
    const showNewAppointmentModal = ref(false)
    const currentDate = ref(new Date())
    
    const newAppointment = ref({
      client_id: '',
      date: '',
      start_time: '',
      end_time: '',
      notes: '',
      status: 'scheduled'
    })

    const fetchAppointments = async () => {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            clients:client_id(first_name, last_name)
          `)
          .order('date', { ascending: true })
          .order('start_time', { ascending: true })
        
        if (error) throw error
        appointments.value = data.map(appointment => ({
          ...appointment,
          client_name: `${appointment.clients.first_name} ${appointment.clients.last_name}`
        }))
      } catch (error) {
        console.error('Error fetching appointments:', error)
      }
    }

    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('id, first_name, last_name')
          .order('last_name', { ascending: true })
        
        if (error) throw error
        clients.value = data
      } catch (error) {
        console.error('Error fetching clients:', error)
      }
    }

    const createAppointment = async () => {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert([newAppointment.value])

        if (error) throw error

        showNewAppointmentModal.value = false
        newAppointment.value = {
          client_id: '',
          date: '',
          start_time: '',
          end_time: '',
          notes: '',
          status: 'scheduled'
        }
        fetchAppointments()
      } catch (error) {
        console.error('Error creating appointment:', error)
      }
    }

    const editAppointment = (appointment) => {
      // Implement edit functionality
      console.log('Edit appointment:', appointment)
    }

    const cancelAppointment = async (appointment) => {
      if (!confirm('Are you sure you want to cancel this appointment?')) return

      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'cancelled' })
          .eq('id', appointment.id)

        if (error) throw error
        fetchAppointments()
      } catch (error) {
        console.error('Error cancelling appointment:', error)
      }
    }

    const viewAppointment = (appointment) => {
      // Implement view functionality
      console.log('View appointment:', appointment)
    }

    const selectDate = (date) => {
      // Implement date selection functionality
      console.log('Selected date:', date)
    }

    const previousMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() - 1,
        1
      )
    }

    const nextMonth = () => {
      currentDate.value = new Date(
        currentDate.value.getFullYear(),
        currentDate.value.getMonth() + 1,
        1
      )
    }

    const currentMonthYear = computed(() => {
      return currentDate.value.toLocaleString('default', { month: 'long', year: 'numeric' })
    })

    const calendarDays = computed(() => {
      const year = currentDate.value.getFullYear()
      const month = currentDate.value.getMonth()
      
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0)
      
      const days = []
      
      // Add days from previous month
      const prevMonthLastDay = new Date(year, month, 0).getDate()
      const firstDayOfWeek = firstDay.getDay()
      
      for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        days.push({
          day: prevMonthLastDay - i,
          date: new Date(year, month - 1, prevMonthLastDay - i),
          isCurrentMonth: false
        })
      }
      
      // Add days from current month
      for (let i = 1; i <= lastDay.getDate(); i++) {
        days.push({
          day: i,
          date: new Date(year, month, i),
          isCurrentMonth: true
        })
      }
      
      // Add days from next month
      const remainingDays = 42 - days.length // 6 rows * 7 days
      for (let i = 1; i <= remainingDays; i++) {
        days.push({
          day: i,
          date: new Date(year, month + 1, i),
          isCurrentMonth: false
        })
      }
      
      return days
    })

    const todaysAppointments = computed(() => {
      const today = new Date().toISOString().split('T')[0]
      return appointments.value.filter(a => 
        a.date === today && 
        a.status === 'scheduled'
      )
    })

    const upcomingAppointments = computed(() => {
      const today = new Date().toISOString().split('T')[0]
      return appointments.value.filter(a => 
        a.date > today && 
        a.status === 'scheduled'
      ).slice(0, 5)
    })

    const getAppointmentsForDay = (date) => {
      const dateStr = date.toISOString().split('T')[0]
      return appointments.value.filter(a => 
        a.date === dateStr && 
        a.status === 'scheduled'
      )
    }

    const getAppointmentsCount = (date) => {
      return getAppointmentsForDay(date).length
    }

    const isToday = (date) => {
      const today = new Date()
      return date.getDate() === today.getDate() &&
             date.getMonth() === today.getMonth() &&
             date.getFullYear() === today.getFullYear()
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }

    const formatTime = (time) => {
      return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })
    }

    const getAppointmentClass = (appointment) => {
      const now = new Date()
      const appointmentTime = new Date(`${appointment.date}T${appointment.start_time}`)
      
      if (appointmentTime < now) {
        return 'bg-gray-100 text-gray-600'
      }
      
      return 'bg-emerald-100 text-emerald-800'
    }

    const getAppointmentBorderClass = (appointment) => {
      const now = new Date()
      const appointmentTime = new Date(`${appointment.date}T${appointment.start_time}`)
      
      if (appointmentTime < now) {
        return 'border-gray-400'
      }
      
      return 'border-emerald-500'
    }

    onMounted(() => {
      fetchAppointments()
      fetchClients()
    })

    return {
      appointments,
      clients,
      showNewAppointmentModal,
      currentDate,
      newAppointment,
      calendarDays,
      todaysAppointments,
      upcomingAppointments,
      currentMonthYear,
      createAppointment,
      editAppointment,
      cancelAppointment,
      viewAppointment,
      selectDate,
      previousMonth,
      nextMonth,
      getAppointmentsForDay,
      getAppointmentsCount,
      isToday,
      formatDate,
      formatTime,
      getAppointmentClass,
      getAppointmentBorderClass
    }
  }
}
</script> 