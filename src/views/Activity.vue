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
          <table class="min-w-full bg-white rounded-lg shadow border text-sm">
            <thead class="bg-gray-50 border-b">
              <tr>
                <th scope="col" class="text-left px-4 py-2 font-semibold text-gray-700 w-40">Date</th>
                <th scope="col" class="text-left px-4 py-2 font-semibold text-gray-700 w-48">Client</th>
                <th scope="col" class="text-left px-4 py-2 font-semibold text-gray-700 w-40">Type</th>
                <th scope="col" class="text-left px-4 py-2 font-semibold text-gray-700">Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr 
                v-for="entry in paginatedEntries" 
                :key="entry.id"
                @click="selectEntry(entry)"
                class="even:bg-gray-50 hover:bg-emerald-50 focus-within:bg-emerald-100 transition cursor-pointer"
              >
                <td class="px-4 py-2 whitespace-nowrap">{{ formatDate(entry.date) }}</td>
                <td class="px-4 py-2 whitespace-nowrap">
                  <span class="text-gray-900">{{ entry.clientName }}</span>
                </td>
                <td class="px-4 py-2 whitespace-nowrap flex items-center gap-2">
                  <i :class="getTypeIcon(entry.typeKey) + ' text-emerald-500 text-base'" aria-hidden="true"></i>
                  <span>{{ entry.typeName || 'Unknown' }}</span>
                </td>
                <td class="px-4 py-2">
                  <div class="max-w-prose break-words">
                    {{ truncateText(entry.notes) }}
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
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
              <div class="space-y-6">
                <!-- Client Info -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Client</h3>
                  <router-link 
                    :to="{ name: 'ClientDetail', params: { id: selectedEntry.clientId }}"
                    class="mt-1 block text-emerald-600 hover:text-emerald-800"
                  >
                    {{ selectedEntry.clientName }}
                  </router-link>
                </div>

                <!-- Date & Time -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Date & Time</h3>
                  <p class="mt-1 text-gray-900">{{ formatDate(selectedEntry.date) }}</p>
                </div>

                <!-- Interaction Type -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Type</h3>
                  <div class="mt-1 flex items-center gap-2">
                    <i :class="getTypeIcon(selectedEntry.typeKey) + ' text-emerald-500 text-lg'" aria-hidden="true"></i>
                    <span class="text-gray-900">{{ selectedEntry.typeName }}</span>
                  </div>
                </div>

                <!-- Notes -->
                <div>
                  <h3 class="text-sm font-medium text-gray-500">Notes</h3>
                  <p class="mt-1 text-gray-900 whitespace-pre-wrap">{{ selectedEntry.notes }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav class="flex items-center justify-between mt-4" aria-label="Pagination">
        <button @click="prevPage" :disabled="page === 1" aria-label="Previous page" class="px-3 py-1 border rounded disabled:opacity-50">Prev</button>
        <span class="text-xs text-gray-500">Page {{ page }} of {{ totalPages }}</span>
        <button @click="nextPage" :disabled="page === totalPages" aria-label="Next page" class="px-3 py-1 border rounded disabled:opacity-50">Next</button>
      </nav>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { clientService, interactionService } from '../services/database';

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
  const [allInteractions, allClients, allTypes] = await Promise.all([
    interactionService._interactionsTable.toArray(),
    clientService._clientsTable.toArray(),
    interactionService._interactionTypesTable.toArray()
  ]);
  
  interactionTypes.value = allTypes;
  // Initialize selectedTypes with all type IDs
  selectedTypes.value = allTypes.map(t => t.id);
  
  const clientMap = Object.fromEntries(allClients.map(c => [c.id, c]));
  const typeMap = Object.fromEntries(allTypes.map(t => [t.id, t]));
  
  entries.value = allInteractions
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(i => {
      const client = clientMap[i.clientId];
      const type = typeMap[i.interactionTypeId];
      return {
        ...i,
        clientName: client ? `${client.firstName} ${client.lastName}` : undefined,
        typeName: type?.name,
        typeKey: type?.key || (type?.name ? type.name.toLowerCase().replace(/\s/g, '') : undefined)
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
