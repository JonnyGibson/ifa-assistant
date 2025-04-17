<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Clients</h1>
      <button 
        @click="showAddClientModal = true"
        class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
      >
        Add New Client
      </button>
    </div>

    <!-- Search and Filter Section -->
    <div class="mb-6 flex gap-4">
      <div class="flex-1">
        <input
          type="text"
          v-model="searchQuery"
          placeholder="Search clients..."
          class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <select
        v-model="filterStatus"
        class="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">All Statuses</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>

    <!-- Clients Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Phone
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="client in filteredClients" :key="client.id">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="text-sm font-medium text-gray-900">
                  {{ client.name }}
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ client.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-500">{{ client.phone }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="{
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                  'bg-green-100 text-green-800': client.status === 'active',
                  'bg-red-100 text-red-800': client.status === 'inactive'
                }"
              >
                {{ client.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button
                @click="editClient(client)"
                class="text-blue-600 hover:text-blue-900 mr-3"
              >
                Edit
              </button>
              <button
                @click="viewClientDetails(client)"
                class="text-gray-600 hover:text-gray-900"
              >
                View
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Add/Edit Client Modal -->
    <div v-if="showAddClientModal" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-xl font-bold mb-4">{{ editingClient ? 'Edit Client' : 'Add New Client' }}</h2>
        <form @submit.prevent="saveClient">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="name">
              Name
            </label>
            <input
              id="name"
              v-model="clientForm.name"
              type="text"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
              Email
            </label>
            <input
              id="email"
              v-model="clientForm.email"
              type="email"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="phone">
              Phone
            </label>
            <input
              id="phone"
              v-model="clientForm.phone"
              type="tel"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2" for="status">
              Status
            </label>
            <select
              id="status"
              v-model="clientForm.status"
              class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div class="flex justify-end gap-4">
            <button
              type="button"
              @click="showAddClientModal = false"
              class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../supabase'

export default {
  name: 'Clients',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const clients = ref([])
    const searchQuery = ref('')
    const filterStatus = ref('')
    const showAddClientModal = ref(false)
    const editingClient = ref(null)
    const clientForm = ref({
      name: '',
      email: '',
      phone: '',
      status: 'active'
    })

    const filteredClients = computed(() => {
      return clients.value.filter(client => {
        const matchesSearch = client.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                            client.email.toLowerCase().includes(searchQuery.value.toLowerCase())
        const matchesStatus = !filterStatus.value || client.status === filterStatus.value
        return matchesSearch && matchesStatus
      })
    })

    const fetchClients = async () => {
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .order('name')
        
        if (error) throw error
        clients.value = data
      } catch (error) {
        console.error('Error fetching clients:', error)
      }
    }

    const saveClient = async () => {
      try {
        if (editingClient.value) {
          const { error } = await supabase
            .from('clients')
            .update(clientForm.value)
            .eq('id', editingClient.value.id)
          
          if (error) throw error
        } else {
          const { error } = await supabase
            .from('clients')
            .insert([clientForm.value])
          
          if (error) throw error
        }

        await fetchClients()
        showAddClientModal.value = false
        resetForm()
      } catch (error) {
        console.error('Error saving client:', error)
      }
    }

    const editClient = (client) => {
      editingClient.value = client
      clientForm.value = { ...client }
      showAddClientModal.value = true
    }

    const viewClientDetails = (client) => {
      router.push({ name: 'ClientDetails', params: { id: client.id } })
    }

    const resetForm = () => {
      clientForm.value = {
        name: '',
        email: '',
        phone: '',
        status: 'active'
      }
      editingClient.value = null
    }

    // Watch for edit query parameter
    watch(() => route.query.edit, (newId) => {
      if (newId) {
        const clientToEdit = clients.value.find(c => c.id === newId)
        if (clientToEdit) {
          editClient(clientToEdit)
        }
      }
    })

    onMounted(() => {
      fetchClients()
    })

    return {
      clients,
      searchQuery,
      filterStatus,
      showAddClientModal,
      editingClient,
      clientForm,
      filteredClients,
      saveClient,
      editClient,
      viewClientDetails
    }
  }
}
</script> 