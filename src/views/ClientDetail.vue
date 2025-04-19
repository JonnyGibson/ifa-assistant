<template>
  <div v-if="isLoading" class="flex justify-center items-center py-10">
     <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
  </div>
  <div v-else-if="client" class="space-y-8">
    <!-- Client Header -->
    <div class="flex justify-between items-center">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">{{ client.firstName }} {{ client.lastName }}</h1>
        <p class="text-sm text-gray-500">Client ID: {{ client.id }}</p>
      </div>
       <span 
         :class="getRiskProfileBadgeClass(client.riskProfile)"
         class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full"
        >
         {{ client.riskProfile }} Risk
       </span>
    </div>

    <!-- Client Details Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white shadow p-6 rounded-lg">
      <div class="md:col-span-1">
        <h2 class="text-lg font-semibold text-gray-800 mb-2 border-b pb-1">Contact Info</h2>
        <p class="text-sm text-gray-600"><i class="fas fa-envelope mr-2 text-gray-400 w-4"></i>{{ client.email }}</p>
        <p class="text-sm text-gray-600 mt-1"><i class="fas fa-phone mr-2 text-gray-400 w-4"></i>{{ client.phone }}</p>
        <p class="text-sm text-gray-600 mt-1"><i class="fas fa-birthday-cake mr-2 text-gray-400 w-4"></i>{{ formatDate(client.dateOfBirth) }}</p>
      </div>
      <div class="md:col-span-2">
         <h2 class="text-lg font-semibold text-gray-800 mb-2 border-b pb-1">Address</h2>
         <p class="text-sm text-gray-600">{{ client.address?.street }}</p>
         <p class="text-sm text-gray-600">{{ client.address?.city }}</p>
         <p class="text-sm text-gray-600">{{ client.address?.postcode }}</p>
      </div>
    </div>

    <!-- Holdings Section -->
    <div class="bg-white shadow p-6 rounded-lg">
       <h2 class="text-xl font-semibold text-gray-800 mb-4">Portfolio Holdings</h2>
       <div v-if="holdingsLoading" class="flex justify-center items-center py-6">
         <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
       </div>
       <div v-else-if="holdings.length > 0">
         <table class="min-w-full divide-y divide-gray-200 mb-4">
           <thead class="bg-gray-50">
             <tr>
               <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fund Name</th>
               <th scope="col" class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
               <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Units Held</th>
               <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
               <th scope="col" class="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
             </tr>
           </thead>
           <tbody class="bg-white divide-y divide-gray-200">
             <tr v-for="holding in holdings" :key="holding.id">
               <td class="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                 <div>
                   {{ holding.fund.name }}
                   <div class="text-xs text-gray-500">{{ holding.fund.isin }}</div>
                 </div>
               </td>
               <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{{ holding.fund.category }}</td>
               <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{{ holding.unitsHeld.toLocaleString() }}</td>
               <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-500 text-right">{{ formatCurrency(holding.fund.price, holding.fund.currency, 4) }}</td>
               <td class="px-4 py-2 whitespace-nowrap text-sm text-gray-900 text-right font-semibold">{{ formatCurrency(holding.currentValue, holding.fund.currency) }}</td>
             </tr>
           </tbody>
           <tfoot class="bg-gray-50">
             <tr>
               <td colspan="4" class="px-4 py-2 text-right text-sm font-bold text-gray-700 uppercase">Total Portfolio Value</td>
               <td class="px-4 py-2 text-right text-sm font-bold text-gray-900">{{ formatCurrency(totalPortfolioValue, holdings[0]?.fund.currency) }}</td>
             </tr>
           </tfoot>
         </table>
       </div>
       <p v-else class="text-gray-500 text-center py-4">No holdings found for this client.</p>
    </div>

    <!-- Category Distribution and Interaction History side by side -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <!-- Category Distribution -->
      <div class="bg-white shadow p-6 rounded-lg">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Category Distribution</h3>
        <div v-if="holdings.length > 0" class="h-[400px] relative flex items-center justify-center">
          <canvas ref="categoryChart"></canvas>
        </div>
        <p v-else class="text-gray-500 text-center py-4">No holdings data available</p>
      </div>

      <!-- Interactions Section -->
      <div class="bg-white shadow p-6 rounded-lg">
        <h2 class="text-lg font-semibold text-gray-800 mb-4">Interaction History</h2>
        <div v-if="interactionsLoading" class="flex justify-center items-center py-6">
          <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
        </div>
        <div v-else-if="interactions.length > 0" 
             class="overflow-y-auto h-[400px] pr-2 scrollbar scrollbar-thin scrollbar-thumb-emerald-200 scrollbar-track-gray-100 hover:scrollbar-thumb-emerald-300">
          <ul class="divide-y divide-gray-200">
            <li v-for="interaction in interactions" :key="interaction.id" class="py-3">
              <div class="flex justify-between items-center">
                <span class="text-sm font-medium text-emerald-700">
                  {{ interactionTypeMap[interaction.interactionTypeId]?.name || 'Unknown Type' }}
                </span>
                <span class="text-xs text-gray-500">{{ formatDate(interaction.date) }}</span>
              </div>
              <p class="text-sm text-gray-700 mt-1">{{ interaction.summaryNotes }}</p>
              <p class="text-xs text-gray-400 mt-1">Recorded by IFA ID: {{ interaction.ifaUserId }}</p>
            </li>
          </ul>
        </div>
        <p v-else class="text-gray-500 text-center py-4">No interactions recorded for this client.</p>
      </div>
    </div>

  </div>
   <div v-else class="text-center py-10 text-red-500">
     <h1>Client Not Found</h1>
     <p>Could not load details for client ID: {{ id }}</p>
     <router-link :to="{ name: 'Clients' }" class="text-emerald-600 hover:underline mt-4 inline-block">Back to Client List</router-link>
   </div>
</template>

<script>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { dataService } from '../services/db';
import { useRoute } from 'vue-router';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
Chart.register(ArcElement, Tooltip, Legend, PieController);

export default {
  name: 'ClientDetailView',
  props: {
      id: { // Accept id as a prop from the router
          type: [String, Number],
          required: true,
      },
  },
  setup(props) {
    const route = useRoute(); // Access route info if needed beyond props
    const client = ref(null);
    const holdings = ref([]);
    const interactions = ref([]);
    const interactionTypes = ref([]); // Add state for interaction types
    const isLoading = ref(true);
    const holdingsLoading = ref(true);
    const interactionsLoading = ref(true);
    const typesLoading = ref(true); // Add loading state for types
    const categoryChart = ref(null);

    const clientId = computed(() => Number(props.id)); // Ensure ID is a number

    const fetchClientData = async () => {
      isLoading.value = true;
      holdingsLoading.value = true;
      interactionsLoading.value = true;
      typesLoading.value = true; // Start loading types too
      console.log(`[ClientDetailView] Fetching data for client ID: ${clientId.value}`);
      try {
        // Fetch all data in parallel, including interaction types
        const [clientData, holdingsData, interactionsData, typesData] = await Promise.all([
          dataService.getClientById(clientId.value),
          dataService.getHoldingsForClient(clientId.value),
          dataService.getInteractionsForClient(clientId.value),
          dataService.getAllInteractionTypes() // Fetch types
        ]);

        client.value = clientData;
        holdings.value = holdingsData;
        interactions.value = interactionsData;
        interactionTypes.value = typesData; // Store fetched types

        console.log(`[ClientDetailView] Fetched Client:`, client.value);
        console.log(`[ClientDetailView] Fetched Holdings: ${holdings.value.length}`);
        console.log(`[ClientDetailView] Fetched Interactions: ${interactions.value.length}`);
        console.log(`[ClientDetailView] Fetched Interaction Types: ${interactionTypes.value.length}`);

        holdingsLoading.value = false;
        interactionsLoading.value = false;
        typesLoading.value = false; // Types loaded

        if (holdings.value.length > 0) {
          nextTick(() => setupCategoryChart());
        }

      } catch (error) {
        console.error(`[ClientDetailView] Error fetching data for client ${clientId.value}:`, error);
        client.value = null; // Indicate client not found or error
        // TODO: Add user-friendly error handling
      } finally {
        isLoading.value = false; // Main loading finished
      }
    };

    const setupCategoryChart = () => {
      if (!categoryChart.value) return;

      // Calculate category distribution
      const categoryData = holdings.value.reduce((acc, holding) => {
        const category = holding.fund.category;
        acc[category] = (acc[category] || 0) + holding.currentValue;
        return acc;
      }, {});

      // Prepare chart data
      const labels = Object.keys(categoryData);
      const data = Object.values(categoryData);
      const colors = [
        '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', 
        '#EC4899', '#F59E0B', '#84CC16', '#14B8A6'
      ];

      new Chart(categoryChart.value, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'right',
              labels: {
                usePointStyle: true,
              }
            },
            tooltip: {
              callbacks: {
                label: (context) => {
                  const value = context.raw;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    };

    // Computed map for easy lookup of interaction type names by ID
    const interactionTypeMap = computed(() => {
        return interactionTypes.value.reduce((map, type) => {
            map[type.id] = type;
            return map;
        }, {});
    });

    // Computed property for total portfolio value
    const totalPortfolioValue = computed(() => {
        return holdings.value.reduce((sum, holding) => sum + (holding.currentValue || 0), 0);
    });

    // --- Utility Functions (Copied from ClientsView, consider moving to a utils file) ---
    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString();
      } catch (e) {
        return 'Invalid Date';
      }
    };
    
    const formatCurrency = (value, currencyCode = 'GBP', maxDecimals = 2) => {
      if (typeof value !== 'number') return 'N/A';
      return new Intl.NumberFormat('en-GB', { 
          style: 'currency', 
          currency: currencyCode,
          minimumFractionDigits: 2,
          maximumFractionDigits: maxDecimals
      }).format(value);
    };
    
    const getRiskProfileBadgeClass = (profile) => {
        switch (profile?.toLowerCase()) {
            case 'low': return 'bg-blue-100 text-blue-800';
            case 'low-medium': return 'bg-cyan-100 text-cyan-800';
            case 'medium': return 'bg-emerald-100 text-emerald-800';
            case 'medium-high': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    // --- End Utility Functions ---

    // Watch for changes in the prop 'id' in case the user navigates 
    // between client detail pages without leaving the component instance
    watch(() => props.id, (newId) => {
        if (newId) {
            fetchClientData();
        }
    }, { immediate: true }); // Fetch data immediately when component mounts

    // If not using watch immediate:true, call fetchClientData in onMounted
    // onMounted(fetchClientData); 

    return {
      client,
      holdings,
      interactions,
      interactionTypeMap, // Return the map for template use
      isLoading,
      holdingsLoading,
      interactionsLoading,
      totalPortfolioValue,
      formatDate,
      formatCurrency,
      getRiskProfileBadgeClass,
      id: props.id, // Expose prop for the template if needed (e.g., for error message)
      categoryChart
    };
  }
}
</script>