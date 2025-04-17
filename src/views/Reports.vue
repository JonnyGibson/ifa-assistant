<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
      <div class="flex space-x-4">
        <button 
          @click="generateReport"
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center"
        >
          <i class="fas fa-download mr-2"></i>Generate Report
        </button>
      </div>
    </div>

    <!-- Report Filters -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label class="block text-gray-700 mb-2">Report Type</label>
          <select
            v-model="selectedReportType"
            class="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="client">Client Analysis</option>
            <option value="compliance">Compliance Status</option>
            <option value="appointments">Appointment Trends</option>
            <option value="documents">Document Management</option>
          </select>
        </div>
        <div>
          <label class="block text-gray-700 mb-2">Date Range</label>
          <select
            v-model="selectedDateRange"
            class="w-full border border-gray-300 rounded-lg p-2"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        <div v-if="selectedDateRange === 'custom'">
          <label class="block text-gray-700 mb-2">Start Date</label>
          <input
            v-model="startDate"
            type="date"
            class="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
        <div v-if="selectedDateRange === 'custom'">
          <label class="block text-gray-700 mb-2">End Date</label>
          <input
            v-model="endDate"
            type="date"
            class="w-full border border-gray-300 rounded-lg p-2"
          />
        </div>
      </div>
    </div>

    <!-- Report Content -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Summary Cards -->
      <div class="grid grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-emerald-100">
              <i class="fas fa-users text-emerald-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Clients</p>
              <p class="text-2xl font-semibold text-emerald-600">{{ stats.totalClients }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100">
              <i class="fas fa-calendar-check text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Completed Appointments</p>
              <p class="text-2xl font-semibold text-blue-600">{{ stats.completedAppointments }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100">
              <i class="fas fa-file-alt text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Pending Documents</p>
              <p class="text-2xl font-semibold text-yellow-600">{{ stats.pendingDocuments }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100">
              <i class="fas fa-exclamation-circle text-red-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Overdue Compliance</p>
              <p class="text-2xl font-semibold text-red-600">{{ stats.overdueCompliance }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Charts Section -->
      <div class="bg-white rounded-lg shadow-md p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">Client Growth</h2>
        <div class="h-64">
          <!-- Chart will be rendered here -->
          <div class="flex items-center justify-center h-full text-gray-500">
            Chart loading...
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed Reports -->
    <div class="mt-8">
      <div class="bg-white rounded-lg shadow-md overflow-hidden">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Detailed Report</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full">
              <thead>
                <tr class="bg-gray-50">
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="item in reportData" :key="item.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ formatDate(item.date) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item.client_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item.type }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(item.status)">
                      {{ item.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ item.details }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '../supabase'

export default {
  name: 'Reports',
  setup() {
    const selectedReportType = ref('client')
    const selectedDateRange = ref('30')
    const startDate = ref('')
    const endDate = ref('')
    const stats = ref({
      totalClients: 0,
      completedAppointments: 0,
      pendingDocuments: 0,
      overdueCompliance: 0
    })
    const reportData = ref([])

    const fetchStats = async () => {
      try {
        // Fetch total clients
        const { data: clientsData, error: clientsError } = await supabase
          .from('clients')
          .select('id', { count: 'exact' })
        
        if (clientsError) throw clientsError
        stats.value.totalClients = clientsData.length

        // Fetch completed appointments
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id')
          .eq('status', 'completed')
        
        if (appointmentsError) throw appointmentsError
        stats.value.completedAppointments = appointmentsData.length

        // Fetch pending documents
        const { data: documentsData, error: documentsError } = await supabase
          .from('documents')
          .select('id')
          .eq('status', 'pending')
        
        if (documentsError) throw documentsError
        stats.value.pendingDocuments = documentsData.length

        // Fetch overdue compliance
        const { data: complianceData, error: complianceError } = await supabase
          .from('compliance_requirements')
          .select('id')
          .eq('status', 'overdue')
        
        if (complianceError) throw complianceError
        stats.value.overdueCompliance = complianceData.length

      } catch (error) {
        console.error('Error fetching stats:', error)
      }
    }

    const fetchReportData = async () => {
      try {
        let query = supabase
          .from('reports')
          .select('*')
          .order('date', { ascending: false })

        // Apply date range filter
        if (selectedDateRange.value !== 'custom') {
          const days = parseInt(selectedDateRange.value)
          const startDate = new Date()
          startDate.setDate(startDate.getDate() - days)
          query = query.gte('date', startDate.toISOString())
        } else if (startDate.value && endDate.value) {
          query = query
            .gte('date', startDate.value)
            .lte('date', endDate.value)
        }

        const { data, error } = await query
        
        if (error) throw error
        reportData.value = data
      } catch (error) {
        console.error('Error fetching report data:', error)
      }
    }

    const generateReport = async () => {
      try {
        // Generate report based on selected type and date range
        await fetchReportData()
        
        // Here you would typically:
        // 1. Generate the report data
        // 2. Format it for download
        // 3. Trigger the download
        console.log('Generating report...')
      } catch (error) {
        console.error('Error generating report:', error)
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }

    const getStatusClass = (status) => {
      const classes = {
        completed: 'bg-emerald-100 text-emerald-800',
        pending: 'bg-yellow-100 text-yellow-800',
        overdue: 'bg-red-100 text-red-800'
      }
      return classes[status] || 'bg-gray-100 text-gray-800'
    }

    onMounted(() => {
      fetchStats()
      fetchReportData()
    })

    return {
      selectedReportType,
      selectedDateRange,
      startDate,
      endDate,
      stats,
      reportData,
      generateReport,
      formatDate,
      getStatusClass
    }
  }
}
</script> 