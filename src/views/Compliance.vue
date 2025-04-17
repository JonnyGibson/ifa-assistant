<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Compliance Management</h1>
      <div class="flex space-x-4">
        <button 
          @click="showNewRequirementModal = true"
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center"
        >
          <i class="fas fa-plus mr-2"></i>New Requirement
        </button>
      </div>
    </div>

    <!-- Compliance Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-emerald-100">
            <i class="fas fa-check-circle text-emerald-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Completed</p>
            <p class="text-2xl font-semibold text-emerald-600">{{ stats.completed }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100">
            <i class="fas fa-clock text-yellow-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Pending</p>
            <p class="text-2xl font-semibold text-yellow-600">{{ stats.pending }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-red-100">
            <i class="fas fa-exclamation-circle text-red-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Overdue</p>
            <p class="text-2xl font-semibold text-red-600">{{ stats.overdue }}</p>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100">
            <i class="fas fa-calendar-alt text-blue-600 text-xl"></i>
          </div>
          <div class="ml-4">
            <p class="text-sm font-medium text-gray-600">Due This Month</p>
            <p class="text-2xl font-semibold text-blue-600">{{ stats.dueThisMonth }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="bg-white rounded-lg shadow-md p-6 mb-8">
      <div class="flex flex-col md:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search requirements..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <i class="fas fa-search absolute left-3 top-3 text-gray-400"></i>
          </div>
        </div>
        <div class="flex space-x-4">
          <select
            v-model="selectedStatus"
            class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Status</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
          <select
            v-model="selectedCategory"
            class="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Categories</option>
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Compliance Requirements Table -->
    <div class="bg-white rounded-lg shadow-md overflow-hidden">
      <table class="min-w-full">
        <thead>
          <tr class="bg-gray-50">
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirement</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="requirement in filteredRequirements" :key="requirement.id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900">{{ requirement.title }}</div>
              <div class="text-sm text-gray-500">{{ requirement.description }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getCategoryClass(requirement.category)">
                {{ requirement.category }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900">{{ formatDate(requirement.due_date) }}</div>
              <div class="text-xs text-gray-500">{{ getDaysRemaining(requirement.due_date) }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getStatusClass(requirement.status)">
                {{ requirement.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button 
                @click="updateStatus(requirement)"
                class="text-emerald-600 hover:text-emerald-900 mr-4"
              >
                <i class="fas fa-check"></i>
              </button>
              <button 
                @click="editRequirement(requirement)"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                <i class="fas fa-edit"></i>
              </button>
              <button 
                @click="deleteRequirement(requirement)"
                class="text-red-600 hover:text-red-900"
              >
                <i class="fas fa-trash"></i>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- New Requirement Modal -->
    <div v-if="showNewRequirementModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 class="text-2xl font-bold mb-6">New Compliance Requirement</h2>
        <form @submit.prevent="createRequirement">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-gray-700 mb-2">Title</label>
              <input
                v-model="newRequirement.title"
                type="text"
                class="w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label class="block text-gray-700 mb-2">Category</label>
              <select
                v-model="newRequirement.category"
                class="w-full border border-gray-300 rounded-lg p-2"
                required
              >
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 mb-2">Due Date</label>
              <input
                v-model="newRequirement.due_date"
                type="date"
                class="w-full border border-gray-300 rounded-lg p-2"
                required
              />
            </div>
            <div>
              <label class="block text-gray-700 mb-2">Priority</label>
              <select
                v-model="newRequirement.priority"
                class="w-full border border-gray-300 rounded-lg p-2"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div class="mt-6">
            <label class="block text-gray-700 mb-2">Description</label>
            <textarea
              v-model="newRequirement.description"
              class="w-full border border-gray-300 rounded-lg p-2"
              rows="4"
              required
            ></textarea>
          </div>
          <div class="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              @click="showNewRequirementModal = false"
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
  name: 'Compliance',
  setup() {
    const requirements = ref([])
    const stats = ref({
      completed: 0,
      pending: 0,
      overdue: 0,
      dueThisMonth: 0
    })
    const searchQuery = ref('')
    const selectedStatus = ref('')
    const selectedCategory = ref('')
    const showNewRequirementModal = ref(false)
    const categories = ['Regulatory', 'Internal', 'Client', 'Documentation', 'Training']
    
    const newRequirement = ref({
      title: '',
      description: '',
      category: '',
      due_date: '',
      priority: 'medium',
      status: 'pending'
    })

    const fetchRequirements = async () => {
      try {
        const { data, error } = await supabase
          .from('compliance_requirements')
          .select('*')
          .order('due_date', { ascending: true })
        
        if (error) throw error
        requirements.value = data
        updateStats()
      } catch (error) {
        console.error('Error fetching requirements:', error)
      }
    }

    const updateStats = () => {
      const now = new Date()
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()

      stats.value = {
        completed: requirements.value.filter(r => r.status === 'completed').length,
        pending: requirements.value.filter(r => r.status === 'pending').length,
        overdue: requirements.value.filter(r => 
          r.status === 'pending' && new Date(r.due_date) < now
        ).length,
        dueThisMonth: requirements.value.filter(r => {
          const dueDate = new Date(r.due_date)
          return dueDate.getMonth() === thisMonth && 
                 dueDate.getFullYear() === thisYear &&
                 r.status === 'pending'
        }).length
      }
    }

    const filteredRequirements = computed(() => {
      let filtered = requirements.value

      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase()
        filtered = filtered.filter(r => 
          r.title.toLowerCase().includes(query) ||
          r.description.toLowerCase().includes(query)
        )
      }

      if (selectedStatus.value) {
        filtered = filtered.filter(r => r.status === selectedStatus.value)
      }

      if (selectedCategory.value) {
        filtered = filtered.filter(r => r.category === selectedCategory.value)
      }

      return filtered
    })

    const createRequirement = async () => {
      try {
        const { data, error } = await supabase
          .from('compliance_requirements')
          .insert([newRequirement.value])

        if (error) throw error

        showNewRequirementModal.value = false
        newRequirement.value = {
          title: '',
          description: '',
          category: '',
          due_date: '',
          priority: 'medium',
          status: 'pending'
        }
        fetchRequirements()
      } catch (error) {
        console.error('Error creating requirement:', error)
      }
    }

    const updateStatus = async (requirement) => {
      try {
        const { error } = await supabase
          .from('compliance_requirements')
          .update({ status: 'completed' })
          .eq('id', requirement.id)

        if (error) throw error
        fetchRequirements()
      } catch (error) {
        console.error('Error updating requirement:', error)
      }
    }

    const editRequirement = (requirement) => {
      // Implement edit functionality
      console.log('Edit requirement:', requirement)
    }

    const deleteRequirement = async (requirement) => {
      if (!confirm('Are you sure you want to delete this requirement?')) return

      try {
        const { error } = await supabase
          .from('compliance_requirements')
          .delete()
          .eq('id', requirement.id)

        if (error) throw error
        fetchRequirements()
      } catch (error) {
        console.error('Error deleting requirement:', error)
      }
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString()
    }

    const getDaysRemaining = (dueDate) => {
      const now = new Date()
      const due = new Date(dueDate)
      const diffTime = due - now
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays < 0) return 'Overdue'
      if (diffDays === 0) return 'Due today'
      if (diffDays === 1) return 'Due tomorrow'
      return `Due in ${diffDays} days`
    }

    const getCategoryClass = (category) => {
      const classes = {
        Regulatory: 'bg-blue-100 text-blue-800',
        Internal: 'bg-purple-100 text-purple-800',
        Client: 'bg-green-100 text-green-800',
        Documentation: 'bg-yellow-100 text-yellow-800',
        Training: 'bg-red-100 text-red-800'
      }
      return classes[category] || 'bg-gray-100 text-gray-800'
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
      fetchRequirements()
    })

    return {
      requirements,
      stats,
      searchQuery,
      selectedStatus,
      selectedCategory,
      showNewRequirementModal,
      categories,
      newRequirement,
      filteredRequirements,
      createRequirement,
      updateStatus,
      editRequirement,
      deleteRequirement,
      formatDate,
      getDaysRemaining,
      getCategoryClass,
      getStatusClass
    }
  }
}
</script> 