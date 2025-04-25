<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Responsive Table Container -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fund Name</th>
            <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NAV</th>
            <th class="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th class="hidden sm:table-cell px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Portfolios</th>
            <th class="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="fund in fundsWithPortfolioCounts" :key="fund.isin" class="hover:bg-gray-50 transition-colors duration-150">
            <td class="px-4 sm:px-6 py-4">
              <div class="flex flex-col">
                <span class="font-medium text-gray-900 line-clamp-2">{{ fund.name }}</span>
                <span class="text-xs text-gray-500">ISIN: {{ fund.isin }}</span>
              </div>
            </td>
            <td class="px-4 sm:px-6 py-4">
              <div class="flex flex-col">
                <span class="font-medium text-gray-900">{{ formatCurrency(fund.price) }}</span>
                <span class="text-xs text-emerald-600">{{ formatDate(fund.lastUpdated) }}</span>
              </div>
            </td>
            <td class="hidden sm:table-cell px-4 sm:px-6 py-4">
              <span :class="[
                'px-2 py-1 text-xs rounded-full',
                getCategoryBadgeClass(fund.category)
              ]">
                {{ fund.category }}
              </span>
            </td>
            <td class="hidden sm:table-cell px-4 sm:px-6 py-4">
              <div class="flex items-center gap-2">
                <i class="fas fa-users text-gray-500"></i>
                <span class="text-gray-900">{{ fund.portfolioCount }}</span>
              </div>
            </td>
            <td class="px-4 sm:px-6 py-4">
              <button 
                @click="toggleDetails(fund)"
                class="text-emerald-600 hover:text-emerald-800"
              >
                {{ expandedFund === fund ? 'Hide' : 'View' }} Details
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile-friendly Pagination -->
    <div class="flex flex-col sm:flex-row justify-between items-center p-4 bg-white border-t border-gray-200">
      <div class="mb-4 sm:mb-0">
        <p class="text-sm text-gray-700">
          Showing
          <span class="font-medium">{{ ((currentPage - 1) * pageSize) + 1 }}</span>
          to
          <span class="font-medium">{{ Math.min(currentPage * pageSize, totalFunds) }}</span>
          of
          <span class="font-medium">{{ totalFunds }}</span>
          results
        </p>
      </div>
      <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        <button
          @click="prevPage"
          :disabled="currentPage === 1"
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
            'relative hidden sm:inline-flex items-center px-4 py-2 border text-sm font-medium',
            currentPage === page
              ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
          ]"
        >
          {{ page }}
        </button>
        <button
          @click="nextPage"
          :disabled="currentPage === totalPages"
          class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="sr-only">Next</span>
          <i class="fas fa-chevron-right h-5 w-5"></i>
        </button>
      </nav>
    </div>

    <!-- Fund Details Modal - Mobile Optimized -->
    <div v-if="expandedFund" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end sm:items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <div class="flex justify-between items-start">
                  <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                    {{ expandedFund.name }}
                  </h3>
                  <button 
                    @click="closeDetails"
                    class="text-gray-400 hover:text-gray-500 focus:outline-none sm:hidden"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="mt-4 space-y-4">
                  <div>
                    <p class="text-sm text-gray-500">Performance</p>
                    <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                      <div class="bg-white p-3 rounded-lg shadow-sm">
                        <p class="text-sm text-gray-600 mb-1">3M Return</p>
                        <PerformanceBadge :value="parseFloat(expandedFund.performance?.threeMonthChange)" />
                      </div>
                      <div class="bg-white p-3 rounded-lg shadow-sm">
                        <p class="text-sm text-gray-600 mb-1">1Y Return</p>
                        <PerformanceBadge :value="parseFloat(expandedFund.performance?.oneYearChange)" />
                      </div>
                      <div class="bg-white p-3 rounded-lg shadow-sm">
                        <p class="text-sm text-gray-600 mb-1">3Y Return</p>
                        <PerformanceBadge :value="parseFloat(expandedFund.performance?.threeYearChange)" />
                      </div>
                    </div>
                  </div>
                  <div class="space-y-2">
                    <p class="text-sm text-gray-500">Details</p>
                    <div class="mt-2 space-y-2 text-sm">
                      <p><span class="font-medium">ISIN:</span> {{ expandedFund.isin }}</p>
                      <p><span class="font-medium">Category:</span> {{ expandedFund.category }}</p>
                      <p><span class="font-medium">Current Price:</span> {{ formatCurrency(expandedFund.price) }}</p>
                      <p><span class="font-medium">Last Updated:</span> {{ formatDate(expandedFund.lastUpdated) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              @click="closeDetails"
              class="w-full sm:w-auto inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import PerformanceBadge from './PerformanceBadge.vue';

export default {
  name: 'FundsTable',
  components: {
    PerformanceBadge
  },
  props: {
    funds: {
      type: Array,
      required: true
    }
  },
  setup(props) {
    const currentPage = ref(1);
    const pageSize = 10;
    const expandedFund = ref(null);

    const totalFunds = computed(() => props.funds.length);
    const totalPages = computed(() => Math.ceil(totalFunds.value / pageSize));
    
    const fundsWithPortfolioCounts = computed(() => {
      const start = (currentPage.value - 1) * pageSize;
      return props.funds
        .slice(start, start + pageSize)
        .map(fund => ({
          ...fund,
          portfolioCount: Math.floor(Math.random() * 50) + 1 // Mock data for demo
        }));
    });

    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    };

    const formatCurrency = (value) => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP'
      }).format(value);
    };

    const getCategoryBadgeClass = (category) => {
      const classes = {
        'equity income': 'bg-emerald-100 text-emerald-800',
        'global equity': 'bg-blue-100 text-blue-800',
        'fixed income': 'bg-amber-100 text-amber-800',
        'japanese equity': 'bg-indigo-100 text-indigo-800',
        'european equity': 'bg-violet-100 text-violet-800'
      };
      return classes[category.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const prevPage = () => {
      if (currentPage.value > 1) currentPage.value--;
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const goToPage = (page) => {
      currentPage.value = page;
    };

    const toggleDetails = (fund) => {
      expandedFund.value = expandedFund.value === fund ? null : fund;
    };

    const closeDetails = () => {
      expandedFund.value = null;
    };

    return {
      fundsWithPortfolioCounts,
      currentPage,
      pageSize,
      totalFunds,
      totalPages,
      expandedFund,
      formatDate,
      formatCurrency,
      getCategoryBadgeClass,
      prevPage,
      nextPage,
      goToPage,
      toggleDetails,
      closeDetails
    };
  }
};
</script>

<style scoped>
.performance-positive {
  color: rgb(22 163 74); /* text-green-600 */
}
.performance-negative {
  color: rgb(220 38 38); /* text-red-600 */
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>