<template>
  <main class="p-6">
    <div class="relative z-10 bg-white bg-opacity-90 inline-block px-6 py-3 rounded-lg shadow-sm mb-8">
      <h1 class="text-3xl font-bold text-emerald-600 mb-0">Activity Log</h1>
    </div>
    <section aria-label="Activity log entries">
      <table class="min-w-full bg-white rounded-lg shadow border text-sm">
        <thead class="bg-gray-50 border-b">
          <tr>
            <th scope="col" class="text-left px-4 py-2 font-semibold text-gray-700">Date</th>
            <th scope="col" class="text-left px-4 py-2 font-semibold text-gray-700">Client</th>
            <th scope="col" class="text-left px-4 py-2 font-semibold text-gray-700">Type</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="entry in paginatedEntries" :key="entry.id" class="even:bg-gray-50 hover:bg-emerald-50 focus-within:bg-emerald-100 transition">
            <td class="px-4 py-2 whitespace-nowrap">{{ formatDate(entry.date) }}</td>
            <td class="px-4 py-2 whitespace-nowrap">
              <router-link v-if="entry.clientId && entry.clientName" :to="{ name: 'ClientDetail', params: { id: entry.clientId } }" class="text-emerald-700 underline hover:text-emerald-900">
                {{ entry.clientName }}
              </router-link>
              <span v-else class="text-gray-400 italic">Unknown</span>
            </td>
            <td class="px-4 py-2 whitespace-nowrap flex items-center gap-2">
              <i :class="getTypeIcon(entry.typeKey) + ' text-emerald-500 text-base'" aria-hidden="true"></i>
              <span>{{ entry.typeName || 'Unknown' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
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
const page = ref(1);
const pageSize = 25;
const totalPages = computed(() => Math.ceil(entries.value.length / pageSize));
const paginatedEntries = computed(() => {
  const start = (page.value - 1) * pageSize;
  return entries.value.slice(start, start + pageSize);
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

async function loadEntries() {
  const [allInteractions, allClients, allTypes] = await Promise.all([
    interactionService._interactionsTable.toArray(),
    clientService._clientsTable.toArray(),
    interactionService._interactionTypesTable.toArray()
  ]);
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
</style>
