<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header Section -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-3xl font-bold text-gray-800">Compliance Management</h1>
      <div class="flex space-x-4">
        <button 
          @click="openModal()" 
          class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center"
        >
          <i class="fas fa-plus mr-2"></i>New Requirement
        </button>
      </div>
    </div>

    <!-- Loading Indicator -->
    <div v-if="isLoading" class="flex justify-center items-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>

    <template v-else>
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
      <div class="bg-white rounded-lg shadow-md overflow-x-auto">
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
             <tr v-if="filteredRequirements.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">No requirements found matching criteria.</td>
            </tr>
            <tr v-for="requirement in filteredRequirements" :key="requirement.id" class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="text-sm font-medium text-gray-900">{{ requirement.title }}</div>
                <div class="text-sm text-gray-500 max-w-xs truncate" :title="requirement.description">{{ requirement.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 py-1 text-xs font-semibold rounded-full" :class="getCategoryClass(requirement.category)">
                  {{ requirement.category }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm text-gray-900">{{ formatDate(requirement.dueDate) }}</div>
                <div class="text-xs" :class="getDueDateClass(requirement.dueDate, requirement.status)">{{ getDaysRemaining(requirement.dueDate, requirement.status) }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <select v-model="requirement.status" @change="updateStatus(requirement)" 
                  class="text-xs font-semibold rounded-full border-none appearance-none text-center p-1"
                  :class="getStatusClass(requirement.status)">
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="overdue">Overdue</option>
                </select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button @click="editRequirement(requirement)" class="text-blue-600 hover:text-blue-900" title="Edit"><i class="fas fa-edit"></i></button>
                <button @click="confirmDeleteRequirement(requirement.id)" class="text-red-600 hover:text-red-900" title="Delete"><i class="fas fa-trash"></i></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>

    <!-- Add/Edit Requirement Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-2xl w-full">
        <h2 class="text-2xl font-bold mb-6">{{ editingRequirement ? 'Edit' : 'New' }} Compliance Requirement</h2>
        <form @submit.prevent="saveRequirement">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-gray-700 mb-1 text-sm font-medium">Title</label>
              <input v-model="requirementForm.title" type="text" class="w-full border border-gray-300 rounded-lg p-2 text-sm" required/>
            </div>
            <div>
              <label class="block text-gray-700 mb-1 text-sm font-medium">Category</label>
              <select v-model="requirementForm.category" class="w-full border border-gray-300 rounded-lg p-2 text-sm" required>
                 <option disabled value="">Select Category</option>
                 <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
                 <option value="Other">Other (Specify)</option>
              </select>
              <input v-if="requirementForm.category === 'Other'" v-model="otherCategory" type="text" placeholder="Enter new category" class="mt-2 w-full border border-gray-300 rounded-lg p-2 text-sm"/>
            </div>
             <div>
              <label class="block text-gray-700 mb-1 text-sm font-medium">Assigned Client (Optional)</label>
              <select v-model="requirementForm.clientId" class="w-full border border-gray-300 rounded-lg p-2 text-sm">
                <option value="">None</option>
                <option v-for="client in clients" :key="client.id" :value="client.id">
                  {{ client.firstName }} {{ client.lastName }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 mb-1 text-sm font-medium">Due Date</label>
              <input v-model="requirementForm.dueDate" type="date" class="w-full border border-gray-300 rounded-lg p-2 text-sm" required/>
            </div>
             <div>
              <label class="block text-gray-700 mb-1 text-sm font-medium">Status</label>
               <select v-model="requirementForm.status" class="w-full border border-gray-300 rounded-lg p-2 text-sm" required>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label class="block text-gray-700 mb-1 text-sm font-medium">Priority</label>
              <select v-model="requirementForm.priority" class="w-full border border-gray-300 rounded-lg p-2 text-sm" required>
                <option disabled value="">Select Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div class="mt-6">
            <label class="block text-gray-700 mb-1 text-sm font-medium">Description</label>
            <textarea v-model="requirementForm.description" class="w-full border border-gray-300 rounded-lg p-2 text-sm" rows="4" required></textarea>
          </div>
          <div class="flex justify-end space-x-4 mt-6">
            <button type="button" @click="closeModal" class="px-4 py-2 text-gray-600 hover:text-gray-800">Cancel</button>
            <button type="submit" class="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg">
              {{ editingRequirement ? 'Update' : 'Create' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, inject, watch } from 'vue'
import { dataService } from '../services/db' // Use our data service

// Default structure for a new requirement
const defaultRequirementForm = () => ({
  title: '',
  category: '',
  description: '',
  dueDate: '',
  priority: 'medium',
  status: 'pending',
  clientId: '', // Optional client ID
  userId: null
});

export default {
  name: 'Compliance',
  setup() {
    const requirements = ref([]);
    const clients = ref([]);
    const isLoading = ref(true);
    const showModal = ref(false);
    const editingRequirement = ref(null);
    const requirementForm = ref(defaultRequirementForm());
    const otherCategory = ref(''); // For custom category input
    const searchQuery = ref('');
    const selectedStatus = ref('');
    const selectedCategory = ref('');

    const currentUser = inject('currentUser', ref(null)); 
    const userId = computed(() => currentUser.value?.id);

    // Predefined categories, can be expanded
    const categories = ref(['AML', 'KYC', 'Suitability Report', 'Annual Review', 'GDPR']);

    // Fetch initial data
    const fetchData = async () => {
      if (!userId.value) return;
      isLoading.value = true;
      try {
        const [reqData, clientData] = await Promise.all([
            dataService.getComplianceRequirements(userId.value),
            dataService.getClients(userId.value)
        ]);
        requirements.value = reqData;
        clients.value = clientData;
        updateRequirementStatusBasedOnDate(); // Check for overdue items
      } catch (error) {
        console.error('Error fetching compliance data:', error);
        alert('Failed to load compliance requirements.');
      } finally {
        isLoading.value = false;
      }
    };

    // Calculate stats based on current requirements
    const stats = computed(() => {
      const now = new Date().toISOString().split('T')[0];
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      return requirements.value.reduce((acc, req) => {
        if (req.status === 'completed') acc.completed++;
        if (req.status === 'pending') acc.pending++;
        if (req.status === 'overdue') acc.overdue++;
        
        if (req.dueDate) {
          const dueDate = new Date(req.dueDate);
          if (dueDate.getMonth() === currentMonth && dueDate.getFullYear() === currentYear && req.status !== 'completed') {
            acc.dueThisMonth++;
          }
        }
        return acc;
      }, { completed: 0, pending: 0, overdue: 0, dueThisMonth: 0 });
    });

    // Filter requirements based on search and dropdowns
    const filteredRequirements = computed(() => {
      return requirements.value.filter(req => {
        const searchMatch = req.title.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                            req.description.toLowerCase().includes(searchQuery.value.toLowerCase());
        const statusMatch = !selectedStatus.value || req.status === selectedStatus.value;
        const categoryMatch = !selectedCategory.value || req.category === selectedCategory.value;
        return searchMatch && statusMatch && categoryMatch;
      });
    });
    
    // Check and update status if due date has passed
    const updateRequirementStatusBasedOnDate = () => {
        const today = new Date().toISOString().split('T')[0];
        requirements.value.forEach(async (req) => {
            if (req.status === 'pending' && req.dueDate && req.dueDate < today) {
                req.status = 'overdue';
                // Optionally update in DB immediately, or batch update
                // For simplicity, we update locally first, then update DB on explicit status change
                // await dataService.updateComplianceRequirement(userId.value, req.id, { status: 'overdue' });
            }
        });
    };

    // Modal handling
    const openModal = (requirement = null) => {
      if (requirement) {
        editingRequirement.value = requirement;
        requirementForm.value = { ...requirement }; 
        // Check if category is custom
        if (!categories.value.includes(requirement.category)) {
          otherCategory.value = requirement.category;
          requirementForm.value.category = 'Other';
        }
      } else {
        editingRequirement.value = null;
        requirementForm.value = defaultRequirementForm();
        otherCategory.value = '';
      }
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
      editingRequirement.value = null;
      requirementForm.value = defaultRequirementForm();
      otherCategory.value = '';
    };

    // Save new or updated requirement
    const saveRequirement = async () => {
      if (!userId.value) {
        alert('User not authenticated.');
        return;
      }
      requirementForm.value.userId = userId.value;

      // Use custom category if provided
      if (requirementForm.value.category === 'Other' && otherCategory.value) {
          requirementForm.value.category = otherCategory.value.trim();
          if (!categories.value.includes(requirementForm.value.category)) {
              categories.value.push(requirementForm.value.category); // Add to list for future use
          }
      } else if (requirementForm.value.category === 'Other') {
          alert('Please specify the category name.');
          return;
      }
      
       // Ensure client ID is null if empty string
      if (requirementForm.value.clientId === '') {
          requirementForm.value.clientId = null;
      }

      try {
        if (editingRequirement.value) {
          await dataService.updateComplianceRequirement(userId.value, editingRequirement.value.id, requirementForm.value);
        } else {
          await dataService.addComplianceRequirement(userId.value, requirementForm.value);
        }
        await fetchData(); // Refresh data
        closeModal();
      } catch (error) {
        console.error('Error saving requirement:', error);
        alert('Failed to save requirement.');
      }
    };

    // Update status directly from table
    const updateStatus = async (requirement) => {
      if (!userId.value) return;
       // The v-model on the select dropdown handles the local state change
       // We just need to persist it to the DB
       try {
          await dataService.updateComplianceRequirement(userId.value, requirement.id, { status: requirement.status });
          // Optional: fetch data again or just update stats if needed
          // Recalculate stats if needed, or rely on computed property
          updateRequirementStatusBasedOnDate(); // Re-check overdue status
          console.log(`Requirement ${requirement.id} status updated to ${requirement.status}`);
       } catch(error) {
           console.error('Error updating requirement status:', error);
           alert('Failed to update status.');
           // Revert local change on error?
           await fetchData(); // Re-fetch to be safe
       }
    };
    
    // Edit requirement (opens modal)
    const editRequirement = (requirement) => {
        openModal(requirement);
    };

    // Delete requirement
    const confirmDeleteRequirement = async (requirementId) => {
      if (!userId.value) return;
      if (confirm('Are you sure you want to delete this requirement?')) {
        try {
          await dataService.deleteComplianceRequirement(userId.value, requirementId);
          await fetchData(); // Refresh data
        } catch (error) {
          console.error('Error deleting requirement:', error);
          alert('Failed to delete requirement.');
        }
      }
    };

    // Formatting and styling helpers
    const formatDate = (dateStr) => {
      if (!dateStr) return 'N/A';
      return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB');
    };

    const getDaysRemaining = (dueDateStr, status) => {
      if (status === 'completed' || !dueDateStr) return '-';
      const today = new Date();
      const dueDate = new Date(dueDateStr + 'T00:00:00');
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} day(s)`;
      if (diffDays === 0) return 'Due today';
      return `${diffDays} day(s) remaining`;
    };
    
     const getDueDateClass = (dueDateStr, status) => {
        if (status === 'completed' || !dueDateStr) return 'text-gray-500';
        const today = new Date();
        const dueDate = new Date(dueDateStr + 'T00:00:00');
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) return 'text-red-600 font-medium'; // Overdue
        if (diffDays <= 7) return 'text-yellow-600'; // Due soon
        return 'text-gray-500';
    };

    const getStatusClass = (status) => {
      const baseClasses = 'px-2 py-1 rounded-full border';
      switch (status) {
        case 'completed': return `${baseClasses} bg-green-100 text-green-800 border-green-300`;
        case 'pending': return `${baseClasses} bg-yellow-100 text-yellow-800 border-yellow-300`;
        case 'overdue': return `${baseClasses} bg-red-100 text-red-800 border-red-300`;
        default: return `${baseClasses} bg-gray-100 text-gray-800 border-gray-300`;
      }
    };

    const getCategoryClass = (category) => {
        const colors = ['blue', 'indigo', 'purple', 'pink', 'teal', 'cyan'];
        const hash = category.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0);
        const color = colors[Math.abs(hash) % colors.length];
        return `bg-${color}-100 text-${color}-800`;
    };

    // Fetch data on mount and when user changes
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
      requirements,
      clients,
      isLoading,
      stats,
      searchQuery,
      selectedStatus,
      selectedCategory,
      categories,
      filteredRequirements,
      showModal,
      editingRequirement,
      requirementForm,
      otherCategory,
      fetchData,
      openModal,
      closeModal,
      saveRequirement,
      updateStatus,
      editRequirement,
      confirmDeleteRequirement,
      formatDate,
      getDaysRemaining,
      getDueDateClass,
      getStatusClass,
      getCategoryClass,
    };
  }
}; 
</script> 