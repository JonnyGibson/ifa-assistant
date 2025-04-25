<template>
  <main class="p-6">
    <div class="relative z-10 bg-white bg-opacity-90 inline-block px-6 py-3 rounded-lg shadow-sm mb-8">
      <h1 class="text-3xl font-bold text-emerald-600 mb-0">Activity Log</h1>
    </div>

    <!-- Type Filter Section -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <h2 class="text-lg font-semibold text-gray-700 mb-3">Filter by Type</h2>
      <div class="flex flex-wrap gap-4">
        <label v-for="type in interactionTypes" :key="type.id" class="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            v-model="selectedTypes"
            :value="type.id"
            class="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
          >
          <span class="text-sm text-gray-600">
            <i :class="getTypeIcon(type.key) + ' mr-2 text-emerald-500'" aria-hidden="true"></i>
            {{ type.name }}
          </span>
        </label>
      </div>
    </div>

    <section aria-label="Activity log entries" class="relative">
      <div class="flex">
        <!-- Table Container -->
        <div :class="{'flex-1': isPanelOpen, 'w-full': !isPanelOpen}">
          <div class="bg-white rounded-lg shadow overflow-hidden">
            <table class="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">Date</th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">Client</th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">Type</th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">User</th>
                  <th class="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0">Notes</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr 
                  v-for="entry in paginatedEntries" 
                  :key="entry.id"
                  @click="selectEntry(entry)"
                  class="hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                >
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ formatDate(entry.date) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ entry.clientName }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="flex items-center gap-2">
                      <i :class="getTypeIcon(entry.typeKey) + ' text-emerald-500'" aria-hidden="true"></i>
                      <span>{{ entry.typeName }}</span>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ entry.userName }}</td>
                  <td class="px-6 py-4 text-sm text-gray-500 max-w-lg">{{ truncateText(entry.notes) }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pagination -->
          <div class="flex justify-between items-center p-4 bg-white border-t border-gray-200">
            <div>
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
                  'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
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

        <!-- Detail Panel -->
        <div 
          class="w-96 bg-white shadow-lg border-l transform transition-all duration-300 ease-in-out overflow-hidden"
          :class="isPanelOpen ? 'w-96 opacity-100' : 'w-0 opacity-0'"
        >
          <div class="h-full">
            <!-- Panel Header -->
            <div class="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h2 class="text-lg font-semibold text-gray-900">Interaction Details</h2>
              <button 
                @click="closePanel"
                class="p-2 rounded-full hover:bg-gray-200 transition-colors"
                aria-label="Close panel"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Panel Content -->
            <div v-if="selectedEntry" class="p-6">
              <div class="space-y-4">
                <!-- Client Info -->
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-medium text-gray-500">Client</h3>
                  <router-link 
                    :to="{ name: 'ClientDetail', params: { id: selectedEntry.clientId }}"
                    class="text-emerald-600 hover:text-emerald-800"
                  >
                    {{ selectedEntry.clientName }}
                  </router-link>
                </div>

                <!-- Date & Time -->
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-medium text-gray-500">Date & Time</h3>
                  <p class="text-gray-900">{{ formatDate(selectedEntry.date) }}</p>
                </div>

                <!-- Interaction Type -->
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-medium text-gray-500">Type</h3>
                  <div class="flex items-center gap-2">
                    <i :class="getTypeIcon(selectedEntry.typeKey) + ' text-emerald-500 text-lg'" aria-hidden="true"></i>
                    <span class="text-gray-900">{{ selectedEntry.typeName }}</span>
                  </div>
                </div>

                <!-- User Info -->
                <div class="flex items-center gap-2">
                  <h3 class="text-sm font-medium text-gray-500">User</h3>
                  <p class="text-gray-900">{{ selectedEntry.userName }}</p>
                </div>

                <!-- Notes - Kept as is -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Notes</h3>
                  <p class="mt-1 text-gray-900 whitespace-pre-wrap">{{ selectedEntry.notes }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { clientService, interactionService, userService } from '../services/database';

const entries = ref([]);
const interactionTypes = ref([]);
const selectedTypes = ref([]);
const page = ref(1);
const pageSize = 25;
const selectedEntry = ref(null);
const isPanelOpen = ref(false);

// Filter entries based on selected types
const filteredEntries = computed(() => {
  if (selectedTypes.value.length === 0) return entries.value;
  return entries.value.filter(entry => selectedTypes.value.includes(entry.interactionTypeId));
});

const totalPages = computed(() => Math.ceil(filteredEntries.value.length / pageSize));
const paginatedEntries = computed(() => {
  const start = (page.value - 1) * pageSize;
  return filteredEntries.value.slice(start, start + pageSize);
});

function formatDate(date) {
  if (!date) return '';
  return new Date(date).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
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

// Map interaction type keys to icons (FontAwesome)
const typeIconMap = {
  meeting: 'fas fa-handshake',
  call: 'fas fa-phone',
  email: 'fas fa-envelope',
  note: 'fas fa-sticky-note',
  review: 'fas fa-search',
  document: 'fas fa-file-alt',
  task: 'fas fa-tasks',
  // Add more as needed
};
function getTypeIcon(typeKey) {
  return typeIconMap[typeKey] || 'fas fa-comment-dots';
}

function selectEntry(entry) {
  selectedEntry.value = entry;
  isPanelOpen.value = true;
}

function closePanel() {
  isPanelOpen.value = false;
}

async function loadEntries() {
  const [allInteractions, allClients, allTypes, allUsers] = await Promise.all([
    interactionService._interactionsTable.toArray(),
    clientService._clientsTable.toArray(),
    interactionService._interactionTypesTable.toArray(),
    userService.getAllUsers()
  ]);

  interactionTypes.value = allTypes;
  selectedTypes.value = allTypes.map(t => t.id);
  
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
table th, table td { padding: 0.5rem 1rem; }
table { border-collapse: separate; border-spacing: 0; }
thead th { border-bottom: 1px solid #e5e7eb; background: #f9fafb; }
tbody tr { transition: background 0.15s; }
tbody tr.even { background: #f6f6f6; }

/* Add word-break for notes column */
.max-w-prose {
  max-width: 65ch;
  word-break: normal;
  overflow-wrap: break-word;
}
</style>
