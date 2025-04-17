<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <LoginForm v-if="!isAuthenticated" @login="handleLogin" />
    
    <div v-else class="min-h-screen flex">
      <Sidebar :user-email="userEmail" />
      
      <div class="flex-1">
        <!-- Hero Section with Background Image -->
        <div class="relative">
          <div class="absolute inset-0 bg-gradient-to-r from-emerald-900/90 to-emerald-800/90">
            <img 
              src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2000&q=80" 
              alt="Financial Dashboard Background"
              class="w-full h-64 object-cover mix-blend-overlay"
            />
          </div>
          <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div class="flex justify-between items-center">
              <div>
                <h1 class="text-3xl font-bold text-white">Overview Dashboard</h1>
              </div>
              <div class="flex items-center space-x-4">
                <button class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center">
                  <i class="fas fa-plus mr-2"></i>New Client
                </button>
                <button @click="handleLogout" class="bg-white/10 hover:bg-white/20 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center">
                  <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
              </div>
            </div>
          </div>
        </div>

        <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-16">
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
                chart-ref="riskProfileChart"
                class="backdrop-blur-lg bg-white/80 shadow-lg"
              />
              <ChartCard
                title="Document Status"
                chart-ref="documentStatusChart"
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
        </main>
      </div>
    </div>
  </div>
</template>

<script>
import { supabase } from './supabase'
import { Chart } from 'chart.js/auto'
import LoginForm from './components/LoginForm.vue'
import Sidebar from './components/Sidebar.vue'
import StatsCard from './components/StatsCard.vue'
import ChartCard from './components/ChartCard.vue'
import RecentActivity from './components/RecentActivity.vue'
import QuickActions from './components/QuickActions.vue'
import UpcomingAppointments from './components/UpcomingAppointments.vue'

export default {
  name: 'App',
  components: {
    LoginForm,
    Sidebar,
    StatsCard,
    ChartCard,
    RecentActivity,
    QuickActions,
    UpcomingAppointments
  },
  data() {
    return {
      isAuthenticated: false,
      userEmail: '',
      stats: {
        totalClients: 0,
        activeClients: 0,
        pendingDocuments: 0,
        overdueCompliance: 0
      },
      recentActivity: [],
      upcomingAppointments: [],
      charts: {
        riskProfile: null,
        documentStatus: null
      }
    }
  },
  async created() {
    console.log('App created, checking session...')
    // Check for existing session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('Session check result:', { session, error })
    
    if (session) {
      console.log('Session found, user:', session.user)
      this.isAuthenticated = true
      this.userEmail = session.user.email
      await this.fetchDashboardData()
    } else {
      console.log('No session found')
    }

    // Set up auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', { event, session })
      if (event === 'SIGNED_IN') {
        this.isAuthenticated = true
        this.userEmail = session.user.email
        this.fetchDashboardData()
      } else if (event === 'SIGNED_OUT') {
        this.isAuthenticated = false
        this.userEmail = ''
      }
    })
  },
  methods: {
    async handleLogin(loginData) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: loginData.email,
          password: loginData.password
        })
        
        if (error) throw error
        
        // Session is automatically persisted by Supabase
        this.isAuthenticated = true
        this.userEmail = data.user.email
        await this.fetchDashboardData()
      } catch (error) {
        console.error('Login error:', error.message)
      }
    },
    async handleLogout() {
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
        this.isAuthenticated = false
        this.userEmail = ''
      } catch (error) {
        console.error('Logout error:', error.message)
      }
    },
    async fetchDashboardData() {
      try {
        console.log('Fetching dashboard data...')
        
        // Fetch client statistics
        const { data: clients, error: clientsError } = await supabase
          .from('clients')
          .select('*')
        
        console.log('Clients data:', clients)
        console.log('Clients error:', clientsError)
        
        if (clientsError) throw clientsError
        
        // Fetch recent notes
        const { data: notes, error: notesError } = await supabase
          .from('client_notes')
          .select(`
            *,
            clients:client_id(first_name, last_name)
          `)
          .order('created_at', { ascending: false })
          .limit(5)
        
        console.log('Notes data:', notes)
        console.log('Notes error:', notesError)
        
        if (notesError) throw notesError
        
        // Update statistics
        this.stats.totalClients = clients.length
        this.stats.activeClients = clients.filter(c => c.status === 'active').length
        this.stats.pendingDocuments = clients.filter(c => c.status === 'pending').length
        this.stats.overdueCompliance = clients.filter(c => c.status === 'overdue').length
        
        console.log('Updated stats:', this.stats)
        
        // Update recent activity
        this.recentActivity = notes.map(note => ({
          ...note,
          clientName: `${note.clients.first_name} ${note.clients.last_name}`
        }))
        
        console.log('Updated recent activity:', this.recentActivity)
        
        // Update charts
        this.updateCharts(clients)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      }
    },
    updateCharts(clients) {
      // Only proceed if we have clients data
      if (!clients || clients.length === 0) {
        console.log('No client data available for charts')
        return
      }

      // Destroy existing charts if they exist
      if (this.charts.riskProfile) {
        this.charts.riskProfile.destroy()
      }
      if (this.charts.documentStatus) {
        this.charts.documentStatus.destroy()
      }

      // Get canvas elements safely
      const riskProfileCanvas = this.$refs.riskProfileChart
      const documentStatusCanvas = this.$refs.documentStatusChart

      if (!riskProfileCanvas || !documentStatusCanvas) {
        console.log('Chart canvases not found')
        return
      }

      // Risk Profile Distribution
      const riskProfiles = clients.reduce((acc, client) => {
        acc[client.risk_profile] = (acc[client.risk_profile] || 0) + 1
        return acc
      }, {})
      
      const riskProfileCtx = riskProfileCanvas.getContext('2d')
      this.charts.riskProfile = new Chart(riskProfileCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(riskProfiles),
          datasets: [{
            data: Object.values(riskProfiles),
            backgroundColor: [
              'rgba(75, 192, 192, 0.6)',
              'rgba(255, 206, 86, 0.6)',
              'rgba(255, 99, 132, 0.6)'
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
        acc[client.status] = (acc[client.status] || 0) + 1
        return acc
      }, {})
      
      const documentStatusCtx = documentStatusCanvas.getContext('2d')
      this.charts.documentStatus = new Chart(documentStatusCtx, {
        type: 'doughnut',
        data: {
          labels: Object.keys(documentStatuses),
          datasets: [{
            data: Object.values(documentStatuses),
            backgroundColor: [
              'rgba(54, 162, 235, 0.6)',
              'rgba(255, 99, 132, 0.6)',
              'rgba(255, 206, 86, 0.6)'
            ]
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false
        }
      })
    },
    handleNewNote() {
      // Implement new note functionality
    },
    handleUploadDoc() {
      // Implement document upload functionality
    },
    handleSchedule() {
      // Implement scheduling functionality
    },
    handleExport() {
      // Implement export functionality
    }
  }
}
</script>

<style>
#app {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #10b981;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #059669;
}
</style> 