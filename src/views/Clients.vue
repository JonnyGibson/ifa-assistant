<template>
  <div>
    <!-- Search Input -->
    <div class="relative -mt-14 z-10 px-4">
        <input 
            type="text" 
            v-model="searchQuery"
            placeholder="Search by name or email..."
            class="w-64 px-4 py-2 border border-gray-300 rounded-md shadow-lg focus:ring-emerald-500 focus:border-emerald-500 bg-white"
        />
    </div>

    <!-- Loading Indicator: Use combined loading state -->
    <div v-if="isLoading || infoLoading" class="flex justify-center items-center py-10">
      <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
      <span class="ml-3 text-gray-500">Loading client data...</span>
    </div>

    <!-- Client Table: Render only when both states are false -->
    <div v-else class="table-container bg-white shadow border border-gray-200 overflow-hidden sm:rounded-lg">
      <table class="client-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Contact</th>
            <th>Risk Appetite</th>
            <th>Last Contact</th>
            <th>
              <span class="sr-only">View Details</span>
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="paginatedClients.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
              {{ clients.length === 0 ? 'No clients found.' : 'No clients match your search.' }}
            </td>
          </tr>
          <tr v-for="client in paginatedClients" :key="client.id" class="client-row">
            <td>
              <div class="client-name">{{ client.firstName }} {{ client.lastName }}</div>
              <div class="client-dob">DOB: {{ formatDate(client.dateOfBirth) }}</div>
            </td>
            <td>
              <a :href="'mailto:' + client.email" class="client-email">{{ client.email }}</a>
              <div class="client-phone">{{ client.phone }}</div>
            </td>
            <td>
              <div class="relative group">
                <span 
                  :class="[
                    'risk-pill',
                    {
                      'risk-averse': client.riskProfile === 'Averse',
                      'risk-minimal': client.riskProfile === 'Minimal',
                      'risk-cautious': client.riskProfile === 'Cautious',
                      'risk-open': client.riskProfile === 'Open',
                      'risk-eager': client.riskProfile === 'Eager'
                    }
                  ]"
                >
                  {{ client.riskProfile }}
                </span>
                <div class="risk-tooltip">
                  <div v-if="client.riskProfile === 'Averse'" class="tooltip-content">
                    Individuals in this category are very cautious, preferring to minimize risk and prioritize capital preservation. They are unlikely to invest in the stock market and may prefer safer options like savings accounts.
                  </div>
                  <div v-if="client.riskProfile === 'Minimal'" class="tooltip-content">
                    This level suggests a low tolerance for risk and a preference for stability.
                  </div>
                  <div v-if="client.riskProfile === 'Cautious'" class="tooltip-content">
                    Individuals in this category are more comfortable with some degree of risk and are willing to accept moderate volatility for the potential of higher returns.
                  </div>
                  <div v-if="client.riskProfile === 'Open'" class="tooltip-content">
                    This level indicates a moderate willingness to take on risk and a preference for a balanced approach, potentially including a mix of lower and higher-risk assets.
                  </div>
                  <div v-if="client.riskProfile === 'Eager'" class="tooltip-content">
                    This is the highest risk appetite level, with individuals willing to accept a high degree of risk and potential volatility in pursuit of significant returns.
                  </div>
                </div>
              </div>
            </td>
            <td class="text-sm text-gray-500">
              {{ formatRelativeTime(client.lastInteractionDate) }}
            </td>
            <td class="text-right">
              <router-link 
                :to="{ name: 'ClientDetail', params: { id: client.id } }" 
                class="view-details"
              >
                View Details
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
      
      <!-- Improved Pagination Controls -->
      <div 
        v-if="totalPages > 1" 
        class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
      >
          <div class="flex-1 flex justify-between sm:hidden">
              <button @click="prevPage" :disabled="currentPage === 1" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"> Previous </button>
              <button @click="nextPage" :disabled="currentPage === totalPages" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"> Next </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                  <p class="text-sm text-gray-700">
                      Showing <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span>
                      to <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, filteredClients.length) }}</span>
                      of <span class="font-medium">{{ filteredClients.length }}</span> results
                  </p>
              </div>
              <div>
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button 
                        @click="prevPage" 
                        :disabled="currentPage === 1" 
                        class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                          <span class="sr-only">Previous</span>
                          <i class="fas fa-chevron-left h-5 w-5" aria-hidden="true"></i>
                      </button>
                      <!-- Page info -->
                      <span aria-current="page" class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-500">
                         Page {{ currentPage }} of {{ totalPages }}
                      </span>
                       <button 
                         @click="nextPage" 
                         :disabled="currentPage === totalPages" 
                         class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <span class="sr-only">Next</span>
                           <i class="fas fa-chevron-right h-5 w-5" aria-hidden="true"></i>
                      </button>
                  </nav>
              </div>
          </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, inject, watch } from 'vue';
import { dataService } from '../services/db';

// --- Relative Time Formatting Helper ---
const formatRelativeTime = (date) => {
    console.log(`[formatRelativeTime] Received date:`, date); // <<< ADD LOGGING HERE
    if (!date) return 'Never';
    const d = new Date(date);
    if (isNaN(d.getTime())) {
      console.warn('[formatRelativeTime] Invalid date received:', date);
      return 'Invalid Date';
    }
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const seconds = Math.round(diff / 1000);
    const minutes = Math.round(seconds / 60);
    const hours = Math.round(minutes / 60);
    const days = Math.round(hours / 24);
    const weeks = Math.round(days / 7);
    const months = Math.round(days / 30); // Approximation
    const years = Math.round(days / 365); // Approximation

    if (seconds < 60) return `${seconds} sec ago`;
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 24) return `${hours} hr ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (weeks === 1) return '1 week ago';
    if (days < 30) return `${weeks} weeks ago`;
    if (months === 1) return '1 month ago';
    if (days < 365) return `${months} months ago`;
    if (years === 1) return '1 year ago';
    return `${years} years ago`;
};
// -------------------------------------

export default {
  name: 'ClientsView',
  setup() {
    const clients = ref([]);
    // Store only lastInteractionDate keyed by clientId
    const clientLastContact = ref({}); 
    const isLoading = ref(true);
    const infoLoading = ref(true); 
    const currentUser = inject('currentUser', ref(null));
    const searchQuery = ref('');
    const currentPage = ref(1);
    const itemsPerPage = ref(15);

    // Add formatDate function
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('en-GB');
      } catch (e) {
        return 'Invalid Date';
      }
    };

    const fetchClientData = async () => {
      console.log('[ClientsView] fetchClientData STARTING...');
      // Reset states
      isLoading.value = true;
      infoLoading.value = true;
      clients.value = [];
      clientLastContact.value = {};
      currentPage.value = 1;
      try {
        const user = currentUser.value;
        if (!user) { 
            console.warn('[ClientsView] fetchClientData: Current user not available.');
            isLoading.value = false; 
            infoLoading.value = false;
            return; 
        }
        
        const fetchUserId = user.isAdmin ? null : user.id;
        console.log(`[ClientsView] fetchClientData: Fetching base clients...`);
        const fetchedClients = await dataService.getClients(fetchUserId);
        clients.value = fetchedClients;
        console.log(`[ClientsView] fetchClientData: Base clients fetched (${clients.value.length}).`);
        isLoading.value = false; // Base data is loaded

        if (fetchedClients.length > 0) {
            console.log(`[ClientsView] fetchClientData: Fetching interaction info...`);
            const infoPromises = fetchedClients.map(client => 
                dataService.getLastInteractionInfo(client.id, 3) 
                  .then(info => ({ clientId: client.id, lastDate: info.lastDate }))
            );
            const infoResults = await Promise.all(infoPromises);
            console.log(`[ClientsView] fetchClientData: Interaction info fetched.`);
            
            const lastContactMap = {};
            infoResults.forEach(result => {
                lastContactMap[result.clientId] = result.lastDate;
            });
            clientLastContact.value = lastContactMap;
        } else {
             console.log('[ClientsView] fetchClientData: No clients, skipping interaction info fetch.');
        }
      } catch (error) { 
          console.error('[ClientsView] fetchClientData: Error fetching data:', error);
          isLoading.value = false; // Ensure loading stops on error
      } 
      finally { 
          // Info loading finishes regardless of whether clients were found or an error occurred
          infoLoading.value = false; 
          console.log(`[ClientsView] fetchClientData: FINALLY block, infoLoading set to false.`);
      }
    };

    // 1. Combine client data with last contact date
    const processedClients = computed(() => {
        console.log('[ClientsView] Computing processedClients. Base clients:', clients.value.length, 'Last contact map:', clientLastContact.value);
        const combined = clients.value.map(client => ({
            ...client,
            lastInteractionDate: clientLastContact.value[client.id] || null
        }));
        console.log('[ClientsView] Combined clients with dates (first 5):', combined.slice(0, 5)); // Log first few results
        return combined;
    });

    // 2. Sort clients by last interaction date (with added safety)
    const sortedClients = computed(() => {
        // Ensure processedClients is an array before sorting
        if (!Array.isArray(processedClients.value)) {
             console.warn('[ClientsView] processedClients is not an array during sorting.');
             return [];
        }
        return [...processedClients.value].sort((a, b) => {
            const timeA = a.lastInteractionDate ? new Date(a.lastInteractionDate).getTime() : 0; // Treat null as oldest
            const timeB = b.lastInteractionDate ? new Date(b.lastInteractionDate).getTime() : 0;
            
            // Handle potential NaN from invalid dates
            const validTimeA = isNaN(timeA) ? 0 : timeA;
            const validTimeB = isNaN(timeB) ? 0 : timeB;

            return validTimeB - validTimeA; // Descending (newest first)
        });
    });

    // 3. Filter clients based on search query (with added safety)
    const filteredClients = computed(() => {
        const sorted = sortedClients.value;
        // Add safety check
        if (!Array.isArray(sorted)) {
            console.warn('[ClientsView] sortedClients is not an array during filtering.');
            return [];
        }
        if (!searchQuery.value) {
            return sorted; // Return the verified array
        }
        const lowerQuery = searchQuery.value.toLowerCase();
        return sorted.filter(client => {
            const nameMatch = `${client.firstName} ${client.lastName}`.toLowerCase().includes(lowerQuery);
            const emailMatch = client.email.toLowerCase().includes(lowerQuery);
            return nameMatch || emailMatch;
        });
    });

    // 4. Paginate the filtered clients (with added safety)
    const totalPages = computed(() => {
        // Add safety check for filteredClients
        if (!Array.isArray(filteredClients.value)) return 1;
        return Math.ceil(filteredClients.value.length / itemsPerPage.value) || 1; // Ensure at least 1 page
    });

    const paginatedClients = computed(() => {
        const filtered = filteredClients.value;
        // Add safety check
         if (!Array.isArray(filtered)) {
            console.warn('[ClientsView] filteredClients is not an array during pagination.');
            return [];
        }
        const start = (currentPage.value - 1) * itemsPerPage.value;
        const end = start + itemsPerPage.value;
        return filtered.slice(start, end);
    });

    // Pagination methods (Remain the same)
    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };
    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    // Watch search query (Remains the same)
    watch(searchQuery, () => { currentPage.value = 1; });

    // --- Utility Functions ---
    const getRiskProfileBadgeClass = (riskProfile) => {
      switch (riskProfile?.toLowerCase()) {
        case 'averse':
          return 'risk-averse';
        case 'minimal':
          return 'risk-minimal';
        case 'cautious':
          return 'risk-cautious';
        case 'open':
          return 'risk-open';
        case 'eager':
          return 'risk-eager';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };
    // --- End Utility Functions ---

    onMounted(() => {
       console.log('[ClientsView] onMounted hook fired.');
       if (!currentUser.value) {
           console.log('[ClientsView] onMounted: currentUser not available yet, setting up watch.');
           const unwatch = watch(currentUser, (newUser) => {
               console.log('[ClientsView] Watch triggered. New user:', newUser);
               if (newUser) {
                   console.log('[ClientsView] Watch: New user found, calling fetchClientData.');
                   fetchClientData();
                   unwatch();
               }
           }, { immediate: true });
       } else {
           console.log('[ClientsView] onMounted: currentUser available, calling fetchClientData directly.');
           fetchClientData();
       }
    });

    return {
      // Note: No need to return clientLastContact map if only used internally
      paginatedClients, 
      filteredClients, 
      isLoading,
      infoLoading,
      formatDate,
      getRiskProfileBadgeClass,
      formatRelativeTime,
      searchQuery,
      currentPage,
      itemsPerPage,
      totalPages,
      nextPage,
      prevPage
    };
  }
}
</script>

<style scoped lang="postcss">
.table-container {
  @apply overflow-x-auto;
}

.client-table {
  @apply min-w-full divide-y divide-gray-200;
}

.client-table th {
  @apply px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0;
}

.client-table td {
  @apply px-6 py-4 whitespace-nowrap text-sm;
}

.client-row {
  @apply hover:bg-gray-50 transition-colors duration-150;
}

.client-name {
  @apply text-sm font-medium text-gray-900;
}

.client-dob {
  @apply text-sm text-gray-500;
}

.client-email {
  @apply text-sm text-blue-600 hover:text-blue-800 hover:underline;
}

.client-phone {
  @apply text-sm text-gray-500;
}

.risk-pill {
  @apply px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-help relative;
}

.risk-averse {
  @apply bg-blue-100 text-blue-800;
}

.risk-minimal {
  @apply bg-green-100 text-green-800;
}

.risk-cautious {
  @apply bg-yellow-100 text-yellow-800;
}

.risk-open {
  @apply bg-orange-100 text-orange-800;
}

.risk-eager {
  @apply bg-red-100 text-red-800;
}

.risk-tooltip {
  @apply invisible opacity-0 absolute z-10 w-72 p-3 mt-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg transition-all duration-200 transform -translate-x-1/2 left-1/2 group-hover:visible group-hover:opacity-100 whitespace-normal break-words;
}

.tooltip-content {
  @apply text-xs leading-relaxed;
}

.view-details {
  @apply text-emerald-600 hover:text-emerald-900 font-medium;
}
</style>