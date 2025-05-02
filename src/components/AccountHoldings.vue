<template>
  <div v-if="client.accounts && client.accounts.length > 0">
    <div v-for="account in client.accounts" :key="account.id" class="mb-8">
      <button
        type="button"
        class="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        @click="toggleAccount(account.id)"
        :aria-expanded="expandedAccount === account.id ? 'true' : 'false'"
        :aria-controls="`account-holdings-${account.id}`"
      >
        <div class="flex items-center gap-2">
          <i class="fas fa-university text-emerald-500"></i>
          <span class="font-semibold text-gray-800">{{ account.type }}</span>
          <span class="ml-2 text-xs text-gray-500">({{ account.provider }})</span>
        </div>
        <div class="flex items-center gap-4">
          <span class="text-emerald-600 font-medium">{{ formatCurrency(calculateAccountValue(account)) }}</span>
          <i :class="['fas', expandedAccount === account.id ? 'fa-chevron-up' : 'fa-chevron-down', 'text-gray-400', 'transition-transform', 'duration-200']"></i>
        </div>
      </button>
      <div v-if="expandedAccount === account.id" :id="`account-holdings-${account.id}`" class="mt-2">
        <div v-if="account.holdings && account.holdings.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FundCard 
            v-for="holding in account.holdings" 
            :key="holding.id"
            :fund="holding.fund"
            :unitsHeld="holding.unitsHeld"
            :formatNumber="formatNumber"
            :getCategoryBadgeClass="getCategoryBadgeClass"
            @edit="$emit('editHolding', account, holding)"
            @delete="$emit('deleteHolding', account, holding)"
          />
          <AddFundCard
            :accountId="account.id"
            :isAdding="addingFundToAccount === account.id"
            :error="addFundError"
            :result="addFundResult"
            @startAdd="$emit('startAddFund', account.id)"
            @cancel="$emit('cancelAddFund')"
            @submit="isin => $emit('submitAddFund', account.id, isin)"
          />
        </div>
        <div v-else class="text-sm text-gray-500 text-center py-2">No holdings in this account</div>
      </div>
    </div>
  </div>
</template>

<script>
import FundCard from './FundCard.vue';
import AddFundCard from './AddFundCard.vue';

export default {
  name: 'AccountHoldings',
  components: {
    FundCard,
    AddFundCard
  },
  props: {
    client: { type: Object, required: true },
    expandedAccount: { type: [String, Number], default: null },
    addingFundToAccount: { type: [String, Number], default: null },
    addFundError: { type: String, default: '' },
    addFundResult: { type: String, default: '' },
    formatCurrency: { type: Function, required: true },
    formatNumber: { type: Function, required: true },
    getCategoryBadgeClass: { type: Function, required: true },
    calculateAccountValue: { type: Function, required: true }
  },
  emits: [
    'toggleAccount',
    'editHolding',
    'deleteHolding',
    'startAddFund',
    'cancelAddFund',
    'submitAddFund'
  ],
  methods: {
    toggleAccount(accountId) {
      this.$emit('toggleAccount', accountId);
    }
  }
};
</script>