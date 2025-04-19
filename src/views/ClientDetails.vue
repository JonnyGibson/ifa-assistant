<template>
  <div class="container mx-auto px-4 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Client Details</h1>
      <button 
        @click="$router.back()"
        class="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
      >
        Back
      </button>
    </div>

    <div v-if="isLoading" class="flex justify-center items-center h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <div v-else-if="client" class="bg-white rounded-lg shadow p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Column 1: Personal & Contact -->
        <div class="md:col-span-1">
          <h2 class="text-xl font-semibold mb-4 border-b pb-2">Personal Information</h2>
          <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Name</dt>
              <dd class="mt-1 text-lg">{{ client.firstName }} {{ client.lastName }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd class="mt-1 text-lg">{{ client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString('en-GB') : 'N/A' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Email</dt>
              <dd class="mt-1 text-lg break-words">{{ client.email }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Phone</dt>
              <dd class="mt-1 text-lg">{{ client.phone }}</dd>
            </div>
          </dl>
        </div>

        <!-- Column 2: Employment & Address -->
        <div class="md:col-span-1">
          <h2 class="text-xl font-semibold mb-4 border-b pb-2">Employment & Address</h2>
           <dl class="space-y-3">
            <div>
              <dt class="text-sm font-medium text-gray-500">Occupation</dt>
              <dd class="mt-1 text-lg">{{ client.occupation || 'Not specified' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Company</dt>
              <dd class="mt-1 text-lg">{{ client.companyName || 'Not specified' }}</dd>
            </div>
             <div>
              <dt class="text-sm font-medium text-gray-500">Job Title</dt>
              <dd class="mt-1 text-lg">{{ client.jobTitle || 'Not specified' }}</dd>
            </div>
            <div>
              <dt class="text-sm font-medium text-gray-500">Employment Type</dt>
              <dd class="mt-1 text-lg">{{ employmentTypeLabel(client.employmentType) || 'Not specified' }}</dd>
            </div>
             <div class="pt-2 mt-2 border-t">
              <dt class="text-sm font-medium text-gray-500">Address</dt>
              <dd class="mt-1 text-lg">
                {{ client.address?.street || 'N/A' }} <br>
                {{ client.address?.city || 'N/A' }}, {{ client.address?.postcode || 'N/A' }} <br>
                {{ client.address?.country || 'N/A' }}
              </dd>
            </div>
          </dl>
        </div>

        <!-- Column 3: Related Info & Actions -->
        <div class="md:col-span-1">
           <h2 class="text-xl font-semibold mb-4 border-b pb-2">Related Information</h2>
           <div class="space-y-4">
             <div>
                <dt class="text-sm font-medium text-gray-500">Related Appointments</dt>
                <dd class="mt-1 text-lg">{{ relatedAppointmentsCount }}</dd>
             </div>
              <div>
                <dt class="text-sm font-medium text-gray-500">Related Documents</dt>
                <dd class="mt-1 text-lg">{{ relatedDocumentsCount }}</dd>
             </div>
           </div>
           
           <h2 class="text-xl font-semibold mt-8 mb-4 border-b pb-2">Actions</h2>
           <div class="space-y-3">
            <button
              @click="editClient"
              class="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <i class="fas fa-edit mr-2"></i>Edit Client Details
            </button>
            <button
              @click="viewDocuments"
              class="w-full flex items-center justify-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
             <i class="fas fa-file-alt mr-2"></i> View Documents
            </button>
            <button
              @click="viewAppointments"
              class="w-full flex items-center justify-center bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <i class="fas fa-calendar-check mr-2"></i> View Appointments
            </button>
            <button
              @click="confirmDeleteClient"
              class="w-full flex items-center justify-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors mt-4"
            >
              <i class="fas fa-trash-alt mr-2"></i> Delete Client
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12">
      <p class="text-gray-500">Client not found or you do not have permission to view this client.</p>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, inject, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { dataService } from '../services/db' // Use our data service

export default {
  name: 'ClientDetails',
  props: {
    // Route prop injection automatically converts route params to component props
    id: {
      type: [String, Number], // Can be string from URL or number from DB
      required: true
    }
  },
  setup(props) {
    const router = useRouter();
    const client = ref(null);
    const relatedAppointmentsCount = ref(0);
    const relatedDocumentsCount = ref(0);
    const isLoading = ref(true);

    const currentUser = inject('currentUser', ref(null)); 
    const userId = computed(() => currentUser.value?.id);

    const fetchClientData = async () => {
      if (!userId.value || !props.id) {
          isLoading.value = false;
          return; // Cannot fetch without user or client ID
      }
      isLoading.value = true;
      try {
        const clientIdNum = Number(props.id); // Ensure ID is a number for DB query
        // Fetch client details, related appointments count, and documents count
        const [clientData, appointments, documents] = await Promise.all([
            dataService.getClientById(userId.value, clientIdNum),
            dataService.getAppointmentsForClient(userId.value, clientIdNum),
            dataService.getDocumentsForClient(userId.value, clientIdNum)
        ]);
        
        client.value = clientData; // This might be null if not found/unauthorized
        relatedAppointmentsCount.value = appointments?.length || 0;
        relatedDocumentsCount.value = documents?.length || 0;

      } catch (error) {
        console.error('Error fetching client details:', error);
        client.value = null; // Ensure client is null on error
      } finally {
        isLoading.value = false;
      }
    };

    const editClient = () => {
      // Navigate back to Clients view with query param to trigger edit modal
      router.push({ name: 'Clients', query: { editClientId: props.id } });
    };

    const viewDocuments = () => {
      // Navigate to Documents view, pre-filtered for this client
      router.push({ name: 'Documents', query: { clientId: props.id } });
    };

    const viewAppointments = () => {
      // Navigate to Appointments view, perhaps defaulting to this client?
      // Or just show related appointments here?
       router.push({ name: 'Appointments', query: { clientId: props.id } }); // Example
    };
    
    const confirmDeleteClient = async () => {
      if (!userId.value || !client.value) return;
      if (confirm(`Are you sure you want to delete ${client.value.firstName} ${client.value.lastName}? This will also delete related records.`)) {
          try {
              await dataService.deleteClient(userId.value, client.value.id);
              alert('Client deleted successfully.');
              router.push({ name: 'Clients' }); // Go back to client list
          } catch (error) {
              console.error('Error deleting client:', error);
              alert('Failed to delete client.');
          }
      }
    };

    const employmentTypeLabel = (type) => {
      const labels = {
        full_time: 'Full Time',
        part_time: 'Part Time',
        contract: 'Contract',
        self_employed: 'Self Employed',
        retired: 'Retired',
        unemployed: 'Unemployed'
      };
      return labels[type] || type;
    };

    // Fetch data when component mounts or when userId/props.id changes
    watch([userId, () => props.id], fetchClientData, { immediate: true });

    return {
      client,
      isLoading,
      relatedAppointmentsCount,
      relatedDocumentsCount,
      editClient,
      viewDocuments,
      viewAppointments,
      confirmDeleteClient,
      employmentTypeLabel
    };
  }
}; 
</script> 