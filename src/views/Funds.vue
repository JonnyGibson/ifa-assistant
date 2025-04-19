<template>
  <div class="funds-view p-6">
    <div class="relative z-10 bg-white bg-opacity-90 inline-block px-6 py-3 rounded-lg shadow-sm">
      <h1 class="text-3xl font-bold text-emerald-600 mb-0">Investment Funds in Clients' Portfolios</h1>
    </div>
    <FundsTable 
      :funds="funds" 
      :portfolioCounts="portfolioCounts" 
      class="mt-6"
    />
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

    onMounted(() => {
      fetchFunds();
    });

    return {
      funds,
      portfolioCounts
    };
  }
};
</script>