<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden" style="overscroll-behavior: contain;">
    <div class="bg-white rounded-lg w-[50vw] h-[50vh] max-w-3xl flex flex-col">
      <div class="px-8 py-6 border-b border-gray-200 flex-shrink-0">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-medium text-gray-900">Updating Fund Prices</h3>
          <span class="text-sm text-gray-500">{{ formatDate(new Date()) }}</span>
        </div>
      </div>
      <div class="flex-1 overflow-y-auto px-8 py-6 hide-scrollbar" style="overscroll-behavior: contain;">
        <div class="space-y-4">
          <div v-for="fund in updateProgress" :key="fund.isin" class="text-base bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between mb-2">
              <span class="font-medium text-gray-900">{{ fund.name }}</span>
              <div class="flex items-center gap-2">
                <i :class="['fas', fund.status === 'pending' ? 'fa-clock text-gray-400' : fund.status === 'updating' ? 'fa-sync-alt fa-spin text-blue-500' : fund.status === 'success' ? 'fa-check text-green-500' : 'fa-exclamation-circle text-red-500']"></i>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-baseline gap-2">
                <span class="text-gray-500">{{ formatCurrency(fund.previousPrice, 'GBP') }}</span>
                <i class="fas fa-arrow-right text-gray-400 text-xs"></i>
                <span :class="['font-medium', fund.status === 'success' ? (fund.price > fund.previousPrice ? 'text-green-600' : fund.price < fund.previousPrice ? 'text-red-600' : 'text-gray-900') : 'text-gray-400']">
                  {{ fund.status === 'success' ? formatCurrency(fund.price, fund.currency) : '—' }}
                </span>
              </div>
              <span v-if="fund.status === 'success'" class="text-sm" :class="{'text-green-600': fund.price > fund.previousPrice, 'text-red-600': fund.price < fund.previousPrice, 'text-gray-500': fund.price === fund.previousPrice}">
                {{ calculatePriceChange(fund.previousPrice, fund.price) }}
              </span>
            </div>
            <div v-if="fund.status === 'error'" class="mt-1 text-sm text-red-600">
              {{ fund.error }}
            </div>
          </div>
        </div>
      </div>
      <div class="px-8 py-6 border-t border-gray-200 flex-shrink-0">
        <div class="flex justify-end">
          <button @click="$emit('cancelUpdateFunds')" class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FundPriceUpdateModal',
  props: {
    show: { type: Boolean, default: true },
    updateProgress: { type: Array, required: true },
    formatCurrency: { type: Function, required: true },
    calculatePriceChange: { type: Function, required: true },
    formatDate: { type: Function, required: false }
  }
};
</script>
