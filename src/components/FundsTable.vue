<!-- src/components/FundsTable.vue -->
<template>
  <div class="card">
    <DataTable
      :value="fundsWithPortfolioCounts"
      :expandedRows="expandedRows"
      @row-expand="onRowExpand"
      @row-collapse="onRowCollapse"
      dataKey="isin"
      class="p-datatable-sm"
      :paginator="true"
      :rows="20"
      :rowsPerPageOptions="[10, 20, 50]"
      paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
      :filters="filters"
      filterDisplay="menu"
      v-model:filters="filters"
      sortField="name"
      :sortOrder="1"
    >
      <Column expander style="width: 40px" />
      <Column field="name" header="Fund Name" :sortable="true" style="min-width: 300px">
        <template #body="slotProps">
          <div class="flex flex-column">
            <span class="font-medium">{{ slotProps.data.name }}</span>
          </div>
        </template>
      </Column>
      <Column field="price" header="NAV" :sortable="false" style="width: 150px">
        <template #body="slotProps">
          <div class="flex flex-col space-y-1">
            <div class="font-medium text-base">{{ slotProps.data.price.toFixed(2) }}</div>
            <div class="text-xs text-emerald-600">{{ formatDate(slotProps.data.lastUpdated).split(',')[0].split(' ').slice(0, 2).join(' ') }}</div>
          </div>
        </template>
      </Column>
      <Column field="category" header="Category" :sortable="true" style="width: 200px">
        <template #body="slotProps">
          <Tag :value="slotProps.data.category" :severity="getCategorySeverity(slotProps.data.category)" />
        </template>
      </Column>
      <Column field="portfolioCount" header="Portfolios" style="width: 120px" :sortable="true">
        <template #body="slotProps">
          <div class="flex align-items-center justify-content-end gap-2">
            <i class="pi pi-users text-gray-500" />
            <span>{{ slotProps.data.portfolioCount }}</span>
          </div>
        </template>
      </Column>
      
      <template #expansion="slotProps">
        <div class="p-4 bg-gray-50">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 class="text-lg font-semibold mb-4">Performance Metrics</h3>
              <div class="grid grid-cols-3 gap-4">
                <div class="bg-white p-3 rounded-lg shadow-sm">
                  <p class="text-sm text-gray-600 mb-2">3M Return</p>
                  <PerformanceBadge :value="parseFloat(slotProps.data.performance?.threeMonthChange)" />
                </div>
                <div class="bg-white p-3 rounded-lg shadow-sm">
                  <p class="text-sm text-gray-600 mb-2">1Y Return</p>
                  <PerformanceBadge :value="parseFloat(slotProps.data.performance?.oneYearChange)" />
                </div>
                <div class="bg-white p-3 rounded-lg shadow-sm">
                  <p class="text-sm text-gray-600 mb-2">3Y Return</p>
                  <PerformanceBadge :value="parseFloat(slotProps.data.performance?.threeYearChange)" />
                </div>
              </div>
            </div>
            <div>
              <h3 class="text-lg font-semibold mb-4">Asset Allocation</h3>
              <div class="grid grid-cols-3 gap-4">
                <template v-if="slotProps.data.allocation?.nonUKStock">
                  <div class="bg-white p-3 rounded-lg shadow-sm">
                    <p class="text-sm text-gray-600 mb-2">Non-UK Stock</p>
                    <span class="font-medium">{{ formatPercentage(slotProps.data.allocation.nonUKStock) }}</span>
                  </div>
                </template>
                <template v-if="slotProps.data.allocation?.ukStock">
                  <div class="bg-white p-3 rounded-lg shadow-sm">
                    <p class="text-sm text-gray-600 mb-2">UK Stock</p>
                    <span class="font-medium">{{ formatPercentage(slotProps.data.allocation.ukStock) }}</span>
                  </div>
                </template>
                <template v-if="slotProps.data.allocation?.nonUKBond">
                  <div class="bg-white p-3 rounded-lg shadow-sm">
                    <p class="text-sm text-gray-600 mb-2">Non-UK Bonds</p>
                    <span class="font-medium">{{ formatPercentage(slotProps.data.allocation.nonUKBond) }}</span>
                  </div>
                </template>
                <template v-if="slotProps.data.allocation?.ukBond">
                  <div class="bg-white p-3 rounded-lg shadow-sm">
                    <p class="text-sm text-gray-600 mb-2">UK Bonds</p>
                    <span class="font-medium">{{ formatPercentage(slotProps.data.allocation.ukBond) }}</span>
                  </div>
                </template>
                <template v-if="slotProps.data.allocation?.cash">
                  <div class="bg-white p-3 rounded-lg shadow-sm">
                    <p class="text-sm text-gray-600 mb-2">Cash</p>
                    <span class="font-medium">{{ formatPercentage(slotProps.data.allocation.cash) }}</span>
                  </div>
                </template>
                <template v-if="slotProps.data.allocation?.other">
                  <div class="bg-white p-3 rounded-lg shadow-sm">
                    <p class="text-sm text-gray-600 mb-2">Other</p>
                    <span class="font-medium">{{ formatPercentage(slotProps.data.allocation.other) }}</span>
                  </div>
                </template>
                <div v-if="!hasAnyAllocation(slotProps.data.allocation)" class="col-span-3 text-gray-500 text-center py-2">
                  No allocation data available
                </div>
              </div>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div class="flex items-center gap-3">
                <a 
                  :href="slotProps.data.links?.ft" 
                  target="_blank" 
                  class="text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                >
                  <i class="pi pi-external-link"></i>
                  <span>View on Financial Times</span>
                </a>
                <span class="text-sm text-gray-500">ISIN: {{ slotProps.data.isin }}</span>
              </div>
              <div class="text-sm text-gray-500">
                Last Updated: {{ formatDate(slotProps.data.lastUpdated) }}
              </div>
            </div>
          </div>
        </div>
      </template>
    </DataTable>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Tag from 'primevue/tag';
import PerformanceBadge from './PerformanceBadge.vue';

const formatPercentage = (value) => {
  if (value === undefined || value === null) return 'N/A';
  return value >= 0 ? `+${value.toFixed(2)}%` : `${value.toFixed(2)}%`;
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const hasAnyAllocation = (allocation) => {
  return allocation?.ukBond || allocation?.nonUKBond || allocation?.cash || allocation?.ukStock || allocation?.nonUKStock || allocation?.other;
};

export default {
  name: 'FundsTable',
  components: {
    DataTable,
    Column,
    Tag,
    PerformanceBadge
  },
  props: {
    funds: {
      type: Array,
      required: true
    },
    portfolioCounts: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const expandedRows = ref({});
    const filters = ref({});

    const fundsWithPortfolioCounts = computed(() => {
      return props.funds.map(fund => ({
        ...fund,
        portfolioCount: props.portfolioCounts[fund.isin] || 0
      }));
    });

    const getCategorySeverity = (category) => {
      const categoryColors = {
        'Equity Income': 'success',    // Green
        'Global Equity': 'primary',    // Blue
        'Fixed Income': 'warning',     // Orange
        'Equity': 'info',             // Light Blue
        'Japanese Equity': 'danger',   // Red
        'European Equity': 'help',     // Purple
        'Unclassified': 'secondary'   // Gray
      };
      return categoryColors[category] || 'secondary';
    };

    const onRowExpand = (event) => {
      expandedRows.value[event.data.isin] = true;
    };

    const onRowCollapse = (event) => {
      delete expandedRows.value[event.data.isin];
    };

    return {
      expandedRows,
      filters,
      fundsWithPortfolioCounts,
      onRowExpand,
      onRowCollapse,
      formatPercentage,
      formatDate,
      getCategorySeverity,
      hasAnyAllocation
    };
  }
};
</script>

<style>
.p-datatable .p-datatable-tbody > tr > td {
  padding: 0.75rem 1rem;
}

.p-datatable .p-datatable-thead > tr > th {
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 600;
  color: #475569;
}
</style>