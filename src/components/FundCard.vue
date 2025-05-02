<template>
  <section class="bg-white rounded-lg shadow p-4 flex flex-col justify-between border border-gray-200 min-h-[180px]">
    <div class="flex-1">
      <header class="mb-2">
        <h4 class="text-base font-semibold text-gray-900">{{ fund.name }}</h4>
      </header>
      <dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <div><dt class="font-medium text-gray-500">ISIN</dt><dd class="text-gray-900">{{ fund.isin }}</dd></div>
        <div><dt class="font-medium text-gray-500">Units</dt><dd class="text-gray-900">{{ Math.round(unitsHeld) }}</dd></div>
        <div><dt class="font-medium text-gray-500">Currency</dt><dd class="text-gray-900">{{ fund.currency || 'GBP' }}</dd></div>
        <div>
          <dt class="font-medium text-gray-500">Category</dt>
          <dd>
            <span :class="['inline-block px-2 py-0.5 rounded-full text-xs font-semibold', getCategoryBadgeClass(fund.category)]">
              {{ fund.category }}
            </span>
          </dd>
        </div>
      </dl>
    </div>
    <footer class="flex items-end justify-between mt-4">
      <button @click="$emit('edit')" aria-label="Edit fund holding" class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"><i class="fas fa-edit"></i></button>
      <div class="flex items-center">
        <dt class="font-medium text-gray-500 mr-1">Value</dt>
        <dd class="text-emerald-700 text-lg font-bold bg-emerald-50 rounded px-3 py-1">{{ formatNumber(unitsHeld * fund.price, 2) }}</dd>
      </div>
    </footer>
  </section>
</template>

<script>
export default {
  name: 'FundCard',
  props: {
    fund: { type: Object, required: true },
    unitsHeld: { type: Number, required: true },
    formatNumber: { type: Function, required: true },
    getCategoryBadgeClass: { type: Function, required: true }
  },
  emits: ['edit', 'delete']
};
</script>