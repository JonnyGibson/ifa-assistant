<template>
  <div class="funds-view p-6">
    <div class="relative z-10 bg-white bg-opacity-90 inline-block px-6 py-3 rounded-lg shadow-sm">
      <h1 class="text-3xl font-bold text-emerald-600 mb-0">Investment Funds in Clients' Portfolios</h1>
    </div>
    <div class="bg-white p-4 rounded-lg shadow mt-6">
      <div class="mb-4 flex justify-between items-center">
        <h2 class="text-2xl font-semibold">Funds</h2>
        <div class="flex items-center gap-4">
          <div v-if="isLoading" class="flex items-center gap-2">
            <span class="text-sm text-gray-600">Loading...</span>
          </div>
        </div>
      </div>
      <div class="mb-4 flex gap-4">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search funds..." 
          class="border border-gray-300 rounded px-4 py-2 w-full" 
        />
        <select 
          v-model="selectedCategory" 
          class="border border-gray-300 rounded px-4 py-2">
          <option value="">All Categories</option>
          <option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
      </div>
      <FundsTable 
        :funds="funds" 
        :portfolioCounts="portfolioCounts" 
      />
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { fundService } from '../services/database';
import FundsTable from '../components/FundsTable.vue';
import PerformanceBadge from '../components/PerformanceBadge.vue';

export default {
  name: 'FundsView',
  components: {
    FundsTable,
    PerformanceBadge
  },
  setup() {
    const funds = ref([]);
    const portfolioCounts = ref({});
    const isLoading = ref(true);
    const searchQuery = ref('');
    const selectedCategory = ref('');
    const sortField = ref('name');
    const sortDirection = ref('asc');
    const updateStatus = ref('');

    const categories = computed(() => {
      const uniqueCategories = new Set();
      funds.value.forEach(fund => {
        if (fund.category) uniqueCategories.add(fund.category);
      });
      return Array.from(uniqueCategories).sort();
    });

    const filteredFunds = computed(() => {
      return funds.value
        .filter(fund => {
          const matchesSearch = !searchQuery.value || 
            fund.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            fund.isin.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
            fund.sedol.toLowerCase().includes(searchQuery.value.toLowerCase());
          
          const matchesCategory = !selectedCategory.value || 
            fund.category === selectedCategory.value;

          return matchesSearch && matchesCategory;
        })
        .sort((a, b) => {
          const modifier = sortDirection.value === 'asc' ? 1 : -1;
          const aVal = a[sortField.value];
          const bVal = b[sortField.value];

          if (typeof aVal === 'string') {
            return modifier * aVal.localeCompare(bVal);
          }
          return modifier * (aVal - bVal);
        });
    });

    const loadFunds = async () => {
      isLoading.value = true;
      try {
        const result = await fundService.getAllFunds();
        funds.value = result.funds;
        portfolioCounts.value = result.portfolioCounts;
      } catch (error) {
        console.error('Error loading funds:', error);
      } finally {
        isLoading.value = false;
      }
    };

    const updateFunds = async () => {
      try {
        updateStatus.value = 'Updating funds...';
        await fundService.updateFundCategories(status => {
          updateStatus.value = status.message;
        });
        await loadFunds();
      } catch (error) {
        console.error('Error updating funds:', error);
        updateStatus.value = 'Error: ' + error.message;
      }
    };

    onMounted(() => {
      loadFunds();
    });

    return {
      funds: filteredFunds,
      portfolioCounts,
      isLoading,
      searchQuery,
      selectedCategory,
      sortField,
      sortDirection,
      updateStatus,
      categories,
      updateFunds
    };
  }
};
</script>