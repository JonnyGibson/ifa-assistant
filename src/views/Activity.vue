<template>
  <div class="px-4 sm:px-6 lg:px-8 py-8">
    <!-- Page Title -->
    <div class="relative z-10 bg-white bg-opacity-90 inline-block px-6 py-3 rounded-lg shadow-sm mb-6">
      <h1 class="text-3xl font-bold text-emerald-600">Activity Log</h1>
    </div>

    <section aria-label="Activity log entries" class="relative">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- Main Content Area with Filters -->
        <div class="flex-1">
          <div class="bg-white rounded-lg shadow overflow-hidden mb-6">
            <!-- Filter Toggle -->
            <div 
              @click="toggleFilters"
              class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
            >
              <div class="flex items-center gap-2">
                <h2 class="font-semibold text-lg text-gray-900">Filters</h2>
                <div class="flex gap-1.5 items-center text-sm text-gray-600">
                  <span v-if="selectedTypes.length < interactionTypes.length" class="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                    {{ selectedTypes.length }} types
                  </span>
                  <span v-if="selectedUsers.length < users.length" class="px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs">
                    {{ selectedUsers.length }} users
                  </span>
                </div>
              </div>
              <i :class="['fas', isFiltersOpen ? 'fa-chevron-up' : 'fa-chevron-down', 'text-gray-400']"></i>
            </div>

            <!-- Filter Content -->
            <div v-show="isFiltersOpen" class="p-4 border-b border-gray-200 bg-gray-50">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <!-- Interaction Types Filter -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <h3 class="font-medium text-gray-700">Interaction Types</h3>
                    <button 
                      @click.stop="toggleAllTypes"
                      class="text-sm text-emerald-600 hover:text-emerald-800"
                    >
                      {{ allTypesSelected ? 'Deselect All' : 'Select All' }}
                    </button>
                  </div>
                  <div class="bg-white rounded-lg p-2 shadow-sm">
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-1">
                      <label v-for="type in interactionTypes" 
                             :key="type.id" 
                             class="flex items-center gap-2 hover:bg-gray-50 px-2 py-1.5 rounded cursor-pointer"
                      >
                        <input type="checkbox"
                               v-model="selectedTypes"
                               :value="type.id"
                               @click.stop
                               class="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-500 focus:ring-opacity-50"
                        />
                        <div class="flex items-center gap-1.5 min-w-0">
                          <i :class="getTypeIcon(type.key) + ' text-emerald-500 w-4'" aria-hidden="true"></i>
                          <span class="text-sm text-gray-700 truncate">{{ type.name }}</span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>

                <!-- IFA Users Filter -->
                <div>
                  <div class="flex justify-between items-center mb-2">
                    <h3 class="font-medium text-gray-700">IFA Users</h3>
                    <button 
                      @click.stop="toggleAllUsers"
                      class="text-sm text-emerald-600 hover:text-emerald-800"
                    >
                      {{ allUsersSelected ? 'Deselect All' : 'Select All' }}
                    </button>
                  </div>
                  <div class="bg-white rounded-lg p-3 shadow-sm space-y-1 max-h-[180px] overflow-y-auto">
                    <label v-for="user in users" 
                           :key="user.id" 
                           class="flex items-center gap-2 hover:bg-gray-50 p-1.5 rounded cursor-pointer"
                    >
                      <input type="checkbox"
                             v-model="selectedUsers"
                             :value="user.id"
                             @click.stop
                             class="rounded border-gray-300 text-emerald-600 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-500 focus:ring-opacity-50"
                      />
                      <div class="min-w-0 flex-1">
                        <div class="text-sm font-medium text-gray-700 truncate">{{ user.firstName }} {{ user.lastName }}</div>
                        <div class="text-xs text-gray-500 truncate">{{ user.email }}</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-4 sm:px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap w-[160px]">Date</th>
                    <th class="px-4 sm:px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                    <th class="px-4 sm:px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px]">Type</th>
                    <th class="hidden sm:table-cell px-4 sm:px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-[180px]">User</th>
                    <th class="hidden sm:table-cell px-4 sm:px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr 
                    v-for="entry in paginatedEntries" 
                    :key="entry.id"
                    @click="selectEntry(entry)"
                    class="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                  >
                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(entry.date) }}</td>
                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ entry.clientName }}</td>
                    <td class="px-4 sm:px-6 py-4 whitespace-nowrap text-sm">
                      <div class="flex items-center gap-2">
                        <i :class="getTypeIcon(entry.typeKey) + ' text-emerald-500 w-4'" aria-hidden="true"></i>
                        <span class="truncate">{{ entry.typeName }}</span>
                      </div>
                    </td>
                    <td class="hidden sm:table-cell px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span class="truncate">{{ entry.userName }}</span>
                    </td>
                    <td class="hidden sm:table-cell px-4 sm:px-6 py-4 text-sm text-gray-500">
                      <span class="line-clamp-2">{{ entry.notes }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div class="flex flex-col sm:flex-row justify-between items-center p-4 bg-white border-t border-gray-200">
              <div class="mb-4 sm:mb-0">
                <p class="text-sm text-gray-700">
                  Showing
                  <span class="font-medium">{{ ((page - 1) * pageSize) + 1 }}</span>
                  to
                  <span class="font-medium">{{ Math.min(page * pageSize, filteredEntries.length) }}</span>
                  of
                  <span class="font-medium">{{ filteredEntries.length }}</span>
                  results
                </p>
              </div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  @click="prevPage"
                  :disabled="page === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Previous</span>
                  <i class="fas fa-chevron-left h-5 w-5"></i>
                </button>
                <button
                  v-for="pageNum in totalPages"
                  :key="pageNum"
                  @click="page = pageNum"
                  :class="[
                    'relative hidden sm:inline-flex items-center px-4 py-2 border text-sm font-medium',
                    page === pageNum
                      ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  ]"
                >
                  {{ pageNum }}
                </button>
                <button
                  @click="nextPage"
                  :disabled="page === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span class="sr-only">Next</span>
                  <i class="fas fa-chevron-right h-5 w-5"></i>
                </button>
              </nav>
            </div>
          </div>
        </div>

        <!-- Detail Panel -->
        <div 
          :class="[
            'bg-white shadow-lg rounded-lg transition-all duration-300 ease-in-out overflow-hidden',
            'fixed inset-y-0 right-0 lg:static lg:inset-auto',
            isPanelOpen ? 'translate-x-0 w-full sm:w-96 lg:w-80' : 'translate-x-full lg:translate-x-0',
            !selectedEntry && !isPanelOpen ? 'lg:hidden' : ''
          ]"
        >
          <div class="h-full flex flex-col">
            <!-- Panel Header -->
            <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 class="text-lg font-semibold text-gray-900">Interaction Details</h2>
              <div class="flex items-center gap-2">
                <button 
                  @click="closePanel"
                  class="p-2 rounded-full hover:bg-gray-200 transition-colors"
                  aria-label="Close panel"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>
            </div>

            <!-- Panel Content -->
            <div v-if="selectedEntry" class="p-6 flex-1 overflow-y-auto">
              <div class="space-y-6">
                <!-- Client Info -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Client</h3>
                  <router-link 
                    :to="{ name: 'ClientDetail', params: { id: selectedEntry.clientId }}"
                    class="text-emerald-600 hover:text-emerald-800 font-medium"
                  >
                    {{ selectedEntry.clientName }}
                  </router-link>
                </div>

                <!-- Date & Time -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Date & Time</h3>
                  <p class="text-gray-900">{{ formatDate(selectedEntry.date) }}</p>
                </div>

                <!-- Interaction Type -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Type</h3>
                  <div class="flex items-center gap-2">
                    <i :class="getTypeIcon(selectedEntry.typeKey) + ' text-emerald-500'" aria-hidden="true"></i>
                    <span class="text-gray-900">{{ selectedEntry.typeName }}</span>
                  </div>
                </div>

                <!-- User -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-2">User</h3>
                  <p class="text-gray-900">{{ selectedEntry.userName }}</p>
                  <p class="text-sm text-gray-500">{{ selectedEntry.userEmail }}</p>
                </div>

                <!-- Notes -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500 mb-2">Notes</h3>
                  <p class="text-gray-900 whitespace-pre-line">{{ selectedEntry.notes }}</p>
                </div>
              </div>
            </div>
            <div v-else class="p-6 flex items-center justify-center text-gray-500">
              Select an interaction to view details
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { clientService, interactionService, userService } from '../services/database';

const entries = ref([]);
const interactionTypes = ref([]);
const selectedTypes = ref([]);
const users = ref([]);
const selectedUsers = ref([]);
const page = ref(1);
const pageSize = 25;
const selectedEntry = ref(null);
const isPanelOpen = ref(false);
const isFiltersOpen = ref(false);

// Computed property for all types selected
const allTypesSelected = computed(() => {
  return selectedTypes.value.length === interactionTypes.value.length;
});

// Computed property for all users selected
const allUsersSelected = computed(() => {
  return selectedUsers.value.length === users.value.length;
});

// Toggle all interaction types
const toggleAllTypes = () => {
  if (allTypesSelected.value) {
    selectedTypes.value = [];
  } else {
    selectedTypes.value = interactionTypes.value.map(t => t.id);
  }
};

// Toggle all users
const toggleAllUsers = () => {
  if (allUsersSelected.value) {
    selectedUsers.value = [];
  } else {
    selectedUsers.value = users.value.map(u => u.id);
  }
};

// Toggle filters panel
const toggleFilters = () => {
  isFiltersOpen.value = !isFiltersOpen.value;
};

// Filter entries based on selected types and users
const filteredEntries = computed(() => {
  return entries.value.filter(entry => {
    const typeMatch = selectedTypes.value.length === 0 || selectedTypes.value.includes(entry.interactionTypeId);
    const userMatch = selectedUsers.value.length === 0 || selectedUsers.value.includes(entry.userId);
    return typeMatch && userMatch;
  });
});

const totalPages = computed(() => Math.ceil(filteredEntries.value.length / pageSize));
const paginatedEntries = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredEntries.value.slice(start, start + pageSize);
});

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function prevPage() {
  if (page.value > 1) page.value--;
}

function nextPage() {
  if (page.value < totalPages.value) page.value++;
}

function truncateText(text) {
  if (!text) return '';
  return text.length > 250 ? text.substring(0, 250) + '...' : text;
}

const typeIconMap = {
  meeting: 'fas fa-handshake',
  call: 'fas fa-phone',
  email: 'fas fa-envelope',
  note: 'fas fa-sticky-note',
  review: 'fas fa-search',
  document: 'fas fa-file-alt'
};

function getTypeIcon(type) {
  return typeIconMap[type] || 'fas fa-circle';
}

function selectEntry(entry) {
  selectedEntry.value = entry;
  isPanelOpen.value = true;
}

function closePanel() {
  isPanelOpen.value = false;
  selectedEntry.value = null;
}

async function loadEntries() {
  const [allInteractions, allClients, allTypes, allUsers] = await Promise.all([
    interactionService._interactionsTable.toArray(),
    clientService._clientsTable.toArray(),
    interactionService._interactionTypesTable.toArray(),
    userService.getAllUsers()
  ]);

  interactionTypes.value = allTypes;
  users.value = allUsers;
  
  // Initialize all types and users as selected
  selectedTypes.value = allTypes.map(t => t.id);
  selectedUsers.value = allUsers.map(u => u.id);
  
  const clientMap = Object.fromEntries(allClients.map(c => [c.id, c]));
  const typeMap = Object.fromEntries(allTypes.map(t => [t.id, t]));
  const userMap = Object.fromEntries(allUsers.map(u => [u.id, u]));
  
  entries.value = allInteractions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(i => {
      const client = clientMap[i.clientId];
      const type = typeMap[i.interactionTypeId];
      const user = userMap[i.userId];
      return {
        ...i,
        clientName: client ? `${client.firstName} ${client.lastName}` : undefined,
        typeName: type?.name,
        typeKey: type?.key || (type?.name ? type.name.toLowerCase().replace(/\s/g, '') : undefined),
        userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
        userEmail: user?.email || 'Unknown'
      };
    });
}

onMounted(loadEntries);
</script>

<style scoped>
table th, table td { 
  padding: 0.5rem 1rem; 
}

table { 
  border-collapse: separate; 
  border-spacing: 0; 
}

thead th { 
  border-bottom: 1px solid #e5e7eb; 
  background: #f9fafb; 
  position: sticky;
  top: 0;
  z-index: 10;
}

tbody tr { 
  transition: background 0.15s; 
}

tbody tr.even { 
  background: #f6f6f6; 
}

.max-w-prose {
  max-width: 65ch;
  word-break: normal;
  overflow-wrap: break-word;
}

/* Custom scrollbar */
.overflow-y-auto {
  scrollbar-width: thin;
  scrollbar-color: #10b981 #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #10b981;
  border-radius: 3px;
}

@media (max-width: 640px) {
  .table-container {
    margin: 0 -1rem;
  }
}
</style>
