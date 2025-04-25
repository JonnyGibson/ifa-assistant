<template>
  <div class="px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Header with Search -->
    <div class="mb-8">
      <div class="sm:flex sm:items-center sm:justify-between">
        <div class="flex items-center gap-4">
          <div class="relative z-10 bg-white bg-opacity-90 inline-block px-6 py-3 rounded-lg shadow-sm">
            <h1 class="text-3xl font-bold text-emerald-600 mb-0">Clients</h1>
          </div>
          <button
            @click="showAddClientModal = true"
            class="relative z-20 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition duration-300 flex items-center gap-2"
          >
            <i class="fas fa-user-plus"></i>
            New Client
          </button>
        </div>
        <div class="mt-4 sm:mt-0 w-64">
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="fas fa-search text-gray-400"></i>
            </div>
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Search clients..."
              class="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition duration-150 ease-in-out"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Content Area -->
    <div class="bg-white rounded-lg shadow">
      <!-- Loading Indicator -->
      <div v-if="isLoading" class="flex justify-center items-center py-10">
        <div class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
        <span class="ml-3 text-gray-500">Loading client data...</span>
      </div>

      <!-- Client Table -->
      <div v-else>
        <div class="table-container bg-white shadow border border-gray-200 overflow-hidden sm:rounded-lg">
          <table class="client-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Risk Appetite</th>
                <th>Products</th>
                <th>Last Contact</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-if="clients.length === 0">
                <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                  No clients found.
                </td>
              </tr>
              <tr v-for="client in clients" 
                  :key="client.id" 
                  class="client-row cursor-pointer"
                  @click="navigateToClient(client.id)"
              >
                <td>
                  <div class="client-name">
                    {{ client.firstName }} {{ client.lastName }}
                  </div>
                  <div class="client-dob">DOB: {{ formatDate(client.dateOfBirth) }}</div>
                </td>
                <td>
                  <div class="client-email">{{ client.email }}</div>
                  <div class="client-phone">{{ client.phone }}</div>
                </td>
                <td>
                  <span
                    :class="getRiskProfileBadgeClass(client.riskProfile)"
                    class="px-2 py-1 text-xs rounded-full"
                  >
                    {{ client.riskProfile || 'Not Set' }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-wrap gap-1">
                    <span v-if="productCounts[client.id]?.sipp" class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      SIPP
                    </span>
                    <span v-if="productCounts[client.id]?.isa" class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      ISA
                    </span>
                    <span v-if="productCounts[client.id]?.lisa" class="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                      LISA
                    </span>
                    <span v-if="productCounts[client.id]?.gia" class="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs">
                      GIA
                    </span>
                    <span v-if="productCounts[client.id]?.savings" class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                      Savings
                    </span>
                    <span v-if="productCounts[client.id]?.insurance" class="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                      Insurance
                    </span>
                  </div>
                </td>
                <td>
                  {{ formatRelativeTime(lastInteractionDate(client.id)) }}
                  <div class="text-xs text-gray-500">
                    {{ recentInteractionCount(client.id) }} interactions in the last year
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Controls -->
        <div class="flex justify-between items-center p-4 bg-white border-t border-gray-200">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="goToPage(currentPage - 1)"
              :disabled="!canGoPrevious"
              class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              @click="goToPage(currentPage + 1)"
              :disabled="!canGoNext"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing
                <span class="font-medium">{{ ((currentPage - 1) * 10) + 1 }}</span>
                to
                <span class="font-medium">{{ Math.min(currentPage * 10, filteredClients.length) }}</span>
                of
                <span class="font-medium">{{ filteredClients.length }}</span>
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="goToPage(currentPage - 1)"
                  :disabled="!canGoPrevious"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Previous</span>
                  <i class="fas fa-chevron-left h-5 w-5"></i>
                </button>
                <button
                  v-for="page in totalPages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="[
                    'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                    currentPage === page
                      ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]"
                >
                  {{ page }}
                </button>
                <button
                  @click="goToPage(currentPage + 1)"
                  :disabled="!canGoNext"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Next</span>
                  <i class="fas fa-chevron-right h-5 w-5"></i>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Client Modal -->
    <div v-if="showAddClientModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-8 max-w-md w-full">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">{{ editingClient ? 'Edit Client' : 'Add New Client' }}</h2>
          <button @click="showAddClientModal = false" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <form @submit.prevent="saveClient">
          <div class="space-y-4">
            <!-- Name Fields -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" v-model="newClient.firstName" required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" v-model="newClient.lastName" required
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
            </div>

            <!-- Contact Details -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Email</label>
              <input type="email" v-model="newClient.email" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700">Phone</label>
              <input type="tel" v-model="newClient.phone" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <!-- Date of Birth -->
            <div>
              <label class="block text-sm font-medium text-gray-700">Date of Birth</label>
              <input type="date" v-model="newClient.dateOfBirth" required
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>

            <!-- Address -->
            <div class="space-y-3">
              <label class="block text-sm font-medium text-gray-700">Address</label>
              <input type="text" v-model="newClient.address.street" placeholder="Street Address" required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
              <div class="grid grid-cols-2 gap-4">
                <input type="text" v-model="newClient.address.city" placeholder="City" required
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
                <input type="text" v-model="newClient.address.postcode" placeholder="Postcode" required
                  class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
                />
              </div>
              <input type="text" v-model="newClient.address.country" placeholder="Country" required
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div class="mt-6 flex justify-end space-x-3">
            <button type="button" @click="showAddClientModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              Cancel
            </button>
            <button type="submit"
              class="px-4 py-2 text-sm font-medium text-white bg-emerald-600 border border-transparent rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              {{ editingClient ? 'Save Changes' : 'Add Client' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted, inject } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clientService, interactionService, investmentService, insuranceService } from '../services/database';

export default {
  name: 'ClientsView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const clients = ref([]);
    const clientInteractions = ref({});
    const isLoading = ref(true);
    const searchQuery = ref('');
    const showAddClientModal = ref(false);
    const editingClient = ref(null);
    const currentUser = inject('currentUser', ref(null));
    const productCounts = ref({});
    const currentPage = ref(1);
    const itemsPerPage = 10;

    const newClient = ref({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dateOfBirth: '',
      address: {
        street: '',
        city: '',
        postcode: '',
        country: ''
      },
      factFind: {
        personal: {
          title: '',
          nationality: '',
          maritalStatus: '',
          dependents: []
        },
        employment: {
          occupation: '',
          employer: '',
          income: null,
          employmentStatus: '',
          retirementAge: null
        },
        financial: {
          monthlyIncome: {
            salary: 0,
            benefits: 0,
            investments: 0,
            other: 0
          },
          monthlyExpenses: {
            housing: 0,
            utilities: 0,
            transport: 0,
            other: 0
          }
        },
        objectives: {
          shortTerm: [],
          mediumTerm: [],
          longTerm: [],
          riskTolerance: {
            profile: '',
            score: null,
            lastAssessed: null,
            notes: ''
          }
        }
      }
    });

    const formatCurrency = (value) => {
        if (!value) return '£0';
        return new Intl.NumberFormat('en-GB', {
            style: 'currency',
            currency: 'GBP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const getRiskProfileBadgeClass = (profile) => {
        switch (profile?.toLowerCase()) {
            case 'averse': return 'bg-blue-100 text-blue-800';
            case 'minimal': return 'bg-green-100 text-green-800';
            case 'cautious': return 'bg-yellow-100 text-yellow-800';
            case 'open': return 'bg-orange-100 text-orange-800';
            case 'eager': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const loadProductCounts = async (clientId) => {
      try {
        const [accounts, policies] = await Promise.all([
          investmentService.getClientAccounts(clientId),
          insuranceService.getClientPolicies(clientId)
        ]);

        const counts = {
          sipp: accounts.filter(a => a.type === 'SIPP').length,
          isa: accounts.filter(a => a.type === 'ISA').length,
          lisa: accounts.filter(a => a.type === 'LISA').length,
          gia: accounts.filter(a => a.type === 'GIA').length,
          savings: accounts.filter(a => a.type === 'SAVINGS').length,
          insurance: policies.length
        };

        productCounts.value[clientId] = counts;
      } catch (error) {
        console.error(`Error loading product counts for client ${clientId}:`, error);
        productCounts.value[clientId] = { sipp: 0, isa: 0, lisa: 0, gia: 0, savings: 0, insurance: 0 };
      }
    };

    const loadClients = async () => {
      isLoading.value = true;
      try {
        console.log('[ClientsView] Fetching all clients');
        const allClients = await clientService.getAllClients();
        console.log('[ClientsView] Retrieved clients:', allClients);
        
        const validClients = allClients.filter(client => {
          if (!client || typeof client.id !== 'number') {
            console.warn('[ClientsView] Invalid client found:', client);
            return false;
          }
          return true;
        });
        
        clients.value = validClients;

        // Load product counts and interactions in parallel
        await Promise.all([
          ...validClients.map(client => loadProductCounts(client.id)),
          ...validClients.map(async client => {
            try {
              const info = await interactionService.getLastInteractionInfo(client.id);
              clientInteractions.value[client.id] = info;
            } catch (error) {
              console.error(`[ClientsView] Error getting interactions for client ${client.id}:`, error);
              clientInteractions.value[client.id] = { lastDate: null, recentCount: 0 };
            }
          })
        ]);

      } catch (error) {
        console.error('[ClientsView] Error loading clients:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const filteredClients = computed(() => {
      if (!searchQuery.value) return clients.value;
      
      const query = searchQuery.value.toLowerCase();
      return clients.value.filter(client => 
        client.firstName.toLowerCase().includes(query) ||
        client.lastName.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query)
      );
    });

    const totalPages = computed(() => Math.ceil(filteredClients.value.length / itemsPerPage));
    
    const paginatedClients = computed(() => {
      const startIndex = (currentPage.value - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      return filteredClients.value.slice(startIndex, endIndex);
    });

    const canGoPrevious = computed(() => currentPage.value > 1);
    const canGoNext = computed(() => currentPage.value < totalPages.value);

    const goToPage = (page) => {
      currentPage.value = page;
    };

    watch(searchQuery, () => {
      currentPage.value = 1;
    });

    const formatRelativeTime = (date) => {
      if (!date) return 'Never';
      
      const now = new Date();
      const past = new Date(date);
      const diffMs = now - past;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return 'today';
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      return `${Math.floor(diffDays / 30)}m ago`;
    };

    const lastInteractionDate = (clientId) => {
      return clientInteractions.value[clientId]?.lastDate;
    };

    const recentInteractionCount = (clientId) => {
      return clientInteractions.value[clientId]?.recentCount || 0;
    };

    const deleteClient = async (clientId) => {
      if (!confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
        return;
      }

      try {
        await clientService.deleteClient(clientId);
        clients.value = clients.value.filter(c => c.id !== clientId);
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Failed to delete client');
      }
    };

    const editClient = (client) => {
      editingClient.value = { ...client };
      showAddClientModal.value = true;
    };

    const saveClient = async () => {
      try {
        const clientData = {
          ...newClient.value,
          createdAt: new Date().toISOString(),
          riskProfile: 'Not Set',
          lastReviewDate: null
        };
        
        const savedClient = await clientService.createClient(clientData);
        showAddClientModal.value = false;
        await loadClients();
        
        // Reset the form
        newClient.value = {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          dateOfBirth: '',
          address: {
            street: '',
            city: '',
            postcode: '',
            country: ''
          },
          factFind: {
            personal: {
              title: '',
              nationality: '',
              maritalStatus: '',
              dependents: []
            },
            employment: {
              occupation: '',
              employer: '',
              income: null,
              employmentStatus: '',
              retirementAge: null
            },
            financial: {
              monthlyIncome: {
                salary: 0,
                benefits: 0,
                investments: 0,
                other: 0
              },
              monthlyExpenses: {
                housing: 0,
                utilities: 0,
                transport: 0,
                other: 0
              }
            },
            objectives: {
              shortTerm: [],
              mediumTerm: [],
              longTerm: [],
              riskTolerance: {
                profile: '',
                score: null,
                lastAssessed: null,
                notes: ''
              }
            }
          }
        };
        
        // Navigate to the new client's detail page
        router.push({ name: 'ClientDetail', params: { id: savedClient.id } });
      } catch (error) {
        console.error('Error saving client:', error);
        alert('Failed to save client. Please try again.');
      }
    };

    const navigateToClient = (clientId) => {
      router.push({ name: 'ClientDetail', params: { id: clientId } });
    };

    watch(() => route.query.editClientId, async (newId) => {
      if (newId) {
        const client = await clientService.getClient(Number(newId));
        if (client) {
          editClient(client);
        }
      }
    }, { immediate: true });

    onMounted(() => {
      if (currentUser.value?.id) {
        loadClients();
      }
    });

    const formatDate = (date) => {
      if (!date) return 'Never';
      return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };

    return {
      clients: paginatedClients,
      filteredClients, // <-- Expose filteredClients for pagination info
      isLoading,
      searchQuery,
      showAddClientModal,
      editingClient,
      lastInteractionDate,
      recentInteractionCount,
      productCounts,
      deleteClient,
      editClient,
      saveClient,
      formatDate,
      formatRelativeTime,
      formatCurrency,
      getRiskProfileBadgeClass,
      navigateToClient,
      currentPage,
      totalPages,
      canGoPrevious,
      canGoNext,
      goToPage,
      newClient
    };
  }
};
</script>

<style scoped lang="postcss">
.table-container {
  @apply rounded-lg border-0 overflow-hidden;
}

.client-table {
  @apply min-w-full divide-y divide-gray-200;
}

.client-table th {
  @apply px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 first:rounded-tl-lg last:rounded-tr-lg;
}

.client-table td {
  @apply px-6 py-4 whitespace-nowrap text-sm;
}

.client-row {
  @apply hover:bg-gray-50 transition-colors duration-150 cursor-pointer;
}

.client-name {
  @apply text-sm font-medium text-gray-900 hover:text-emerald-600 transition-colors duration-150;
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

.view-details {
  @apply text-emerald-600 hover:text-emerald-900 font-medium;
}
</style>