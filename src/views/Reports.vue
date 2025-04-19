<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Reports & Analytics</h1>
      <div class="flex space-x-4">
        <button 
          @click="generateReport"
          class="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition duration-300 flex items-center"
          disabled 
        >
          <i class="fas fa-download mr-2"></i>Generate Report (TBD)
        </button>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>

    <template v-else>
      <!-- Key Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-blue-100">
              <i class="fas fa-users text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Clients</p>
              <p class="text-2xl font-semibold text-blue-600">{{ stats.totalClients }}</p>
            </div>
          </div>
        </div>
         <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-emerald-100">
              <i class="fas fa-calendar-check text-emerald-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Total Appointments</p>
              <p class="text-2xl font-semibold text-emerald-600">{{ stats.totalAppointments }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-yellow-100">
              <i class="fas fa-tasks text-yellow-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Open Tasks</p>
              <p class="text-2xl font-semibold text-yellow-600">{{ stats.openTasks }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="p-3 rounded-full bg-red-100">
              <i class="fas fa-exclamation-triangle text-red-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Overdue Compliance</p>
              <p class="text-2xl font-semibold text-red-600">{{ stats.overdueCompliance }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Report Content Sections -->
      <div class="space-y-8">
        <!-- Client Activity -->
        <section class="bg-white rounded-lg shadow-md p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Client Activity</h2>
          <div class="overflow-x-auto">
            <table class="min-w-full">
               <thead>
                    <tr class="bg-gray-50">
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Activity</th>
                        <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                    </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-if="recentActivity.length === 0">
                        <td colspan="4" class="px-4 py-3 text-center text-gray-500">No recent activity found.</td>
                    </tr>
                    <tr v-for="item in recentActivity" :key="item.id">
                        <td class="px-4 py-3 whitespace-nowrap text-sm">{{ formatDate(item.date) }}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm">{{ item.clientName }}</td>
                        <td class="px-4 py-3 whitespace-nowrap text-sm">{{ item.type }}</td>
                        <td class="px-4 py-3 text-sm">{{ item.details }}</td>
                    </tr>
                </tbody>
            </table>
          </div>
        </section>

        <!-- Add more report sections/charts here as needed -->
         <!-- Example: Compliance Status Breakdown -->
        <section class="bg-white rounded-lg shadow-md p-6">
            <h2 class="text-xl font-semibold text-gray-800 mb-4">Compliance Status</h2>
             <div class="overflow-x-auto">
                 <table class="min-w-full">
                     <thead>
                        <tr class="bg-gray-50">
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Requirement</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                            <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        </tr>
                    </thead>
                     <tbody class="bg-white divide-y divide-gray-200">
                         <tr v-if="complianceItems.length === 0">
                            <td colspan="4" class="px-4 py-3 text-center text-gray-500">No compliance items found.</td>
                         </tr>
                         <tr v-for="item in complianceItems" :key="item.id">
                             <td class="px-4 py-3 whitespace-nowrap text-sm">{{ item.title }}</td>
                             <td class="px-4 py-3 whitespace-nowrap text-sm">{{ item.category }}</td>
                             <td class="px-4 py-3 whitespace-nowrap text-sm">{{ formatDate(item.dueDate) }}</td>
                             <td class="px-4 py-3 whitespace-nowrap">
                                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(item.status)">
                                    {{ item.status }}
                                </span>
                             </td>
                         </tr>
                     </tbody>
                 </table>
             </div>
        </section>

      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { dataService } from '../services/db' // Use our data service

export default {
  name: 'Reports',
  setup() {
    const isLoading = ref(true);
    const stats = ref({
      totalClients: 0,
      totalAppointments: 0,
      openTasks: 0,
      overdueCompliance: 0
    });
    const recentActivity = ref([]); // Combined list of recent actions
    const complianceItems = ref([]); // For compliance table

    const currentUser = inject('currentUser', ref(null)); 
    const userId = computed(() => currentUser.value?.id);

    const fetchData = async () => {
      if (!userId.value) return;
      isLoading.value = true;
      try {
        // Fetch data needed for stats and reports
        const [clients, appointments, tasks, compliance] = await Promise.all([
          dataService.getClients(userId.value),
          dataService.getAppointments(userId.value),
          dataService.getTasks(userId.value),
          dataService.getComplianceRequirements(userId.value)
        ]);

        // Calculate Stats
        stats.value.totalClients = clients.length;
        stats.value.totalAppointments = appointments.length;
        stats.value.openTasks = tasks.filter(t => !t.completed).length;
        stats.value.overdueCompliance = compliance.filter(c => c.status === 'overdue').length;
        
        // Prepare Compliance Table Data (sorted by due date)
        complianceItems.value = compliance.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

        // Prepare Recent Activity (example: last 5 appointments and tasks)
        const clientMap = new Map(clients.map(c => [c.id, `${c.firstName} ${c.lastName}`]));
        const recentAppointments = appointments
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(a => ({ 
              id: `appt-${a.id}`, 
              date: a.createdAt, 
              clientName: clientMap.get(a.clientId) || 'N/A', 
              type: 'Appointment', 
              details: a.title 
          }));
        
        const recentTasks = tasks
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .slice(0, 5)
          .map(t => ({ 
              id: `task-${t.id}`, 
              date: t.createdAt, 
              clientName: clientMap.get(t.clientId) || 'N/A', // Assuming tasks can be linked to clients
              type: 'Task', 
              details: t.title 
          }));

        recentActivity.value = [...recentAppointments, ...recentTasks]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10); // Show latest 10 combined activities

      } catch (error) {
        console.error('Error fetching report data:', error);
        alert('Failed to load report data.');
      } finally {
        isLoading.value = false;
      }
    };

    const generateReport = () => {
      // Placeholder for future report generation logic (e.g., PDF export)
      alert('Report generation feature not yet implemented.');
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      return new Date(dateStr).toLocaleDateString('en-GB');
    };

    const getStatusClass = (status) => {
      // Re-use compliance status styling
      const baseClasses = 'px-2 py-1 rounded-full border';
      switch (status) {
        case 'completed': return `${baseClasses} bg-green-100 text-green-800 border-green-300`;
        case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-300`;
        case 'overdue': return `${baseClasses} bg-red-100 text-red-800 border-red-300`;
        default: return `${baseClasses} bg-gray-100 text-gray-800 border-gray-300`;
      }
    };

    // Fetch data on mount or when user changes
     onMounted(() => {
        if (userId.value) {
            fetchData();
        } else {
            const unwatch = watch(userId, (newUserId) => {
                if (newUserId) {
                    fetchData();
                    unwatch();
                }
            });
        }
    });

    return {
      isLoading,
      stats,
      recentActivity,
      complianceItems,
      generateReport,
      formatDate,
      getStatusClass,
      // Add filters and chart data/options here later
    };
  }
}; 
</script> 