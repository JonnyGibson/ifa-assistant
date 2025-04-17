<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Client Details</h1>
      <button 
        @click="$router.push({ name: 'Clients' })"
        class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
      >
        Back to Clients
      </button>
    </div>

    <div v-if="loading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="client" class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 class="text-xl font-semibold mb-4">Personal Information</h2>
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-500">Name</label>
              <p class="mt-1 text-lg">{{ client.name }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Email</label>
              <p class="mt-1 text-lg">{{ client.email }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Phone</label>
              <p class="mt-1 text-lg">{{ client.phone }}</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-500">Status</label>
              <span
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-green-100 text-green-800': client.status === 'active',
                  'bg-red-100 text-red-800': client.status === 'inactive'
                }"
              >
                {{ client.status }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h2 class="text-xl font-semibold mb-4">Actions</h2>
          <div class="space-y-4">
            <button
              @click="editClient"
              class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Edit Client
            </button>
            <button
              @click="viewDocuments"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Documents
            </button>
            <button
              @click="viewAppointments"
              class="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              View Appointments
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">Client not found</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

export default {
  name: 'ClientDetails',
  props: {
    id: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const router = useRouter()
    const client = ref(null)
    const loading = ref(true)

    const fetchClient = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', props.id)
          .single()
        
        if (error) throw error
        client.value = data
      } catch (error) {
        console.error('Error fetching client:', error)
      } finally {
        loading.value = false
      }
    }

    const editClient = () => {
      router.push({ name: 'Clients', query: { edit: props.id } })
    }

    const viewDocuments = () => {
      router.push({ name: 'Documents', query: { clientId: props.id } })
    }

    const viewAppointments = () => {
      router.push({ name: 'Appointments', query: { clientId: props.id } })
    }

    onMounted(() => {
      fetchClient()
    })

    return {
      client,
      loading,
      editClient,
      viewDocuments,
      viewAppointments
    }
  }
}
</script> 