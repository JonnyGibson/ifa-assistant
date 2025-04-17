<template>
  <div>
    <!-- Quick Stats with Glassmorphism -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Clients"
        :value="stats.totalClients"
        icon="fa-users"
        icon-bg-color="bg-emerald-100"
        icon-text-color="text-emerald-600"
        value-color="text-emerald-600"
        class="backdrop-blur-lg bg-white/80 shadow-lg"
      />
      <StatsCard
        title="Active Clients"
        :value="stats.activeClients"
        icon="fa-user-check"
        icon-bg-color="bg-green-100"
        icon-text-color="text-green-600"
        value-color="text-green-600"
        class="backdrop-blur-lg bg-white/80 shadow-lg"
      />
      <StatsCard
        title="Pending Documents"
        :value="stats.pendingDocuments"
        icon="fa-file-alt"
        icon-bg-color="bg-amber-100"
        icon-text-color="text-amber-600"
        value-color="text-amber-600"
        class="backdrop-blur-lg bg-white/80 shadow-lg"
      />
      <StatsCard
        title="Overdue Compliance"
        :value="stats.overdueCompliance"
        icon="fa-exclamation-triangle"
        icon-bg-color="bg-red-100"
        icon-text-color="text-red-600"
        value-color="text-red-600"
        class="backdrop-blur-lg bg-white/80 shadow-lg"
      />
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Charts Section -->
      <div class="lg:col-span-2 space-y-8">
        <ChartCard
          title="Risk Profile Distribution"
          ref="riskProfileChart"
          class="backdrop-blur-lg bg-white/80 shadow-lg"
        />
        <ChartCard
          title="Document Status"
          ref="documentStatusChart"
          class="backdrop-blur-lg bg-white/80 shadow-lg"
        />
      </div>

      <!-- Right Sidebar -->
      <div class="space-y-8">
        <UpcomingAppointments 
          :appointments="upcomingAppointments"
          class="backdrop-blur-lg bg-white/80 shadow-lg"
        />
        <QuickActions
          @new-note="handleNewNote"
          @upload-doc="handleUploadDoc"
          @schedule="handleSchedule"
          @export="handleExport"
          class="backdrop-blur-lg bg-white/80 shadow-lg"
        />
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="mt-8">
      <RecentActivity 
        :activities="recentActivity"
        class="backdrop-blur-lg bg-white/80 shadow-lg"
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Chart } from 'chart.js/auto'
import { supabase } from '../supabase'
import StatsCard from '../components/StatsCard.vue'
import ChartCard from '../components/ChartCard.vue'
import RecentActivity from '../components/RecentActivity.vue'
import QuickActions from '../components/QuickActions.vue'
import UpcomingAppointments from '../components/UpcomingAppointments.vue'

export default {
  name: 'Dashboard',
  components: {
    StatsCard,
    ChartCard,
    RecentActivity,
    QuickActions,
    UpcomingAppointments
  },
  setup() {
    console.log('[Dashboard.vue] setup() called'); // Log setup start

    const stats = ref({
      totalClients: 0,
      activeClients: 0,
      pendingDocuments: 0,
      overdueCompliance: 0
    })
    const recentActivity = ref([])
    const upcomingAppointments = ref([])
    const charts = ref({
      riskProfile: null,
      documentStatus: null
    })

    const fetchDashboardData = async () => {
      console.log('[Dashboard.vue] fetchDashboardData() starting...'); // Log fetch start
      try {
        console.log('Fetching dashboard data...')
        
        // Fetch client statistics
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('*')
        
        if (clientsError) throw clientsError
        console.log('[Dashboard.vue] Fetched clients:', clients);
        
        // Fetch recent notes with client information
        const { data: notes, error: notesError } = await supabase
          .from('client_notes')
          .select(`
            *,
            clients:client_id(first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10)
        
        if (notesError) throw notesError
        console.log('[Dashboard.vue] Fetched notes:', notes);
        
        // Update statistics
        stats.value.totalClients = clients.length
        stats.value.activeClients = clients.filter(c => c.status === 'active').length
        stats.value.pendingDocuments = clients.filter(c => c.status === 'pending').length
        stats.value.overdueCompliance = clients.filter(c => c.status === 'overdue').length
        console.log('[Dashboard.vue] Stats updated:', stats.value);
        
        // Update recent activity with formatted data
        recentActivity.value = notes.map(note => ({
          id: note.id,
          clientName: `${note.clients.first_name} ${note.clients.last_name}`,
          note_type: note.note_type || 'general',
          created_at: note.created_at,
          content: note.content || 'No content available'
        }))
        console.log('[Dashboard.vue] Recent activity updated:', recentActivity.value);
        
        // Update charts
        updateCharts(clients)
        console.log('[Dashboard.vue] fetchDashboardData() completed.');
      } catch (error) {
        console.error('[Dashboard.vue] Error fetching dashboard data:', error)
      }
    }

    const updateCharts = (clients) => {
      console.log('[Dashboard.vue] updateCharts() called.');
      // Only proceed if we have clients data
      if (!clients || clients.length === 0) {
        console.log('[Dashboard.vue] No client data available for charts')
        return
      }

      // Get canvas elements safely
      // Using nextTick might be safer here if the component isn't fully rendered yet
      // but let's stick with querySelector for now.
      const riskProfileChartCanvas = document.querySelector('#riskProfileChart canvas')
      const documentStatusChartCanvas = document.querySelector('#documentStatusChart canvas')

      if (!riskProfileChartCanvas || !documentStatusChartCanvas) {
        console.log('[Dashboard.vue] Chart canvases not found')
        return
      }
      console.log('[Dashboard.vue] Chart canvases found.');

      // Risk Profile Distribution
      const riskProfiles = clients.reduce((acc, client) => {
        const profile = client.risk_profile || 'Unknown'; // Handle null/undefined profiles
        acc[profile] = (acc[profile] || 0) + 1
        return acc
      }, {})
      
      if (charts.value.riskProfile) {
        console.log('[Dashboard.vue] Destroying existing risk profile chart.');
        charts.value.riskProfile.destroy()
      }
      
      const riskProfileCtx = riskProfileChartCanvas.getContext('2d')
      console.log('[Dashboard.vue] Creating risk profile chart.');
      charts.value.riskProfile = new Chart(riskProfileCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(riskProfiles),
          datasets: [{
            data: Object.values(riskProfiles),
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(153, 102, 255, 0.6)' // Added more colors just in case
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
      
      // Document Status
      const documentStatuses = clients.reduce((acc, client) => {
        const status = client.status || 'Unknown'; // Handle null/undefined statuses
        acc[status] = (acc[status] || 0) + 1
        return acc
      }, {})
      
      if (charts.value.documentStatus) {
        console.log('[Dashboard.vue] Destroying existing document status chart.');
        charts.value.documentStatus.destroy()
      }
      
      const documentStatusCtx = documentStatusChartCanvas.getContext('2d')
      console.log('[Dashboard.vue] Creating document status chart.');
      charts.value.documentStatus = new Chart(documentStatusCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(documentStatuses),
          datasets: [{
            data: Object.values(documentStatuses),
            backgroundColor: [
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(75, 192, 192, 0.6)' // Added more colors
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
      console.log('[Dashboard.vue] updateCharts() finished.');
    }

    const handleNewNote = () => {
      // Implement new note functionality
      console.log('[Dashboard.vue] New note action triggered')
    }

    const handleUploadDoc = () => {
      // Implement document upload functionality
      console.log('[Dashboard.vue] Upload document action triggered')
    }

    const handleSchedule = () => {
      // Implement scheduling functionality
      console.log('[Dashboard.vue] Schedule action triggered')
    }

    const handleExport = () => {
      // Implement export functionality
      console.log('[Dashboard.vue] Export action triggered')
    }

    onMounted(() => {
      console.log('[Dashboard.vue] onMounted() called'); // Log mount
      fetchDashboardData()
    })

    return {
      stats,
      recentActivity,
      upcomingAppointments,
      handleNewNote,
      handleUploadDoc,
      handleSchedule,
      handleExport
    }
  }
}
</script> 