<template>
  <div class="funds-view p-6">
    <div class="relative z-10 bg-white bg-opacity-90 inline-block px-6 py-3 rounded-lg shadow-sm">
      <h1 class="text-3xl font-bold text-emerald-600 mb-0">Investment Funds in Clients' Portfolios</h1>
    </div>
    <div class="bg-white p-4 rounded-lg shadow mt-6">
      <div class="mb-4 flex justify-between items-center">
        <h2 class="text-2xl font-semibold">Funds</h2>
        <div class="flex items-center gap-4">
          <div v-if="isUpdating" class="flex items-center gap-2">
            <div class="h-2 w-48 bg-gray-200 rounded">
              <div 
                class="h-full bg-blue-500 rounded transition-all duration-300" 
                :style="{ width: updateProgress + '%' }">
              </div>
            </div>
            <span class="text-sm text-gray-600">{{ updateStatus }}</span>
          </div>
          <button 
            @click="updateFunds" 
            :disabled="isUpdating"
            class="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded">
            Update Funds
          </button>
        </div>
      </div>
      <FundsTable 
        :funds="funds" 
        :portfolioCounts="portfolioCounts" 
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import FundsTable from '../components/FundsTable.vue';
import { dataService } from '../services/db';

export default {
  name: 'FundsView',
  components: {
    FundsTable
  },
  setup() {
    const funds = ref([]);
    const portfolioCounts = ref({});
    const isUpdating = ref(false);
    const updateProgress = ref(0);
    const updateStatus = ref('');

    const fetchFunds = async () => {
      console.log('[FundsView] Fetching all funds...');
      try {
        const result = await dataService.getAllFunds();
        console.log('[FundsView] Fetched data:', result);
        funds.value = result.funds;
        portfolioCounts.value = result.portfolioCounts;
        console.log('[FundsView] Processed funds:', funds.value.length);
      } catch (error) {
        console.error('[FundsView] Error fetching funds:', error);
      }
    };

    const updateFunds = async () => {
      try {
        isUpdating.value = true;
        updateProgress.value = 0;
        updateStatus.value = 'Starting update...';

        await dataService.updateFundCategories((progress) => {
          if (progress.status === 'completed') {
            updateProgress.value = 100;
            updateStatus.value = progress.message;
            setTimeout(() => {
              isUpdating.value = false;
              fetchFunds(); // Refresh the funds list
            }, 1000);
          } else if (progress.status === 'error') {
            updateStatus.value = progress.message;
            setTimeout(() => {
              isUpdating.value = false;
            }, 2000);
          } else {
            updateProgress.value = progress.total ? (progress.current / progress.total * 100) : 0;
            updateStatus.value = progress.message;
          }
        });
      } catch (error) {
        console.error('[FundsView] Error updating funds:', error);
        updateStatus.value = 'Error updating funds';
        setTimeout(() => {
          isUpdating.value = false;
        }, 2000);
      }
    };

    onMounted(() => {
      fetchFunds();
    });

    return {
      funds,
      portfolioCounts,
      isUpdating,
      updateProgress,
      updateStatus,
      updateFunds
    };
  }
};
</script>