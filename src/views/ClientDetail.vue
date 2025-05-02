<template>
  <div v-if="isLoading" class="flex justify-center items-center py-10">
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
  </div>
  <div v-else-if="client" class="p-6 relative">
    <ClientOverviewCard 
      :client="client" 
      :formatDate="formatDate" 
      :getRiskProfileBadgeClass="getRiskProfileBadgeClass" 
      @confirmDeleteClient="confirmDeleteClient" 
    />
    
    <PortfolioOverview 
      :holdings="holdings" 
      :totalPortfolioValue="totalPortfolioValue" 
      :portfolioAssetAllocation="portfolioAssetAllocation" 
      :formatCurrency="formatCurrency" 
      :formatAssetType="formatAssetType" 
      :getAssetAllocationColor="getAssetAllocationColor"
      ref="portfolioOverview"
    >
      <template #update-fund-prices>
        <button 
          @click="updateFundPrices" 
          :disabled="holdings.length === 0" 
          class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-md hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" 
          title="Update Fund Prices"
        >
          <i class="fas fa-sync-alt mr-2"></i>
          Update Fund Prices
        </button>
      </template>
      <template #accounts>
        <AccountHoldings
          :client="client"
          :expandedAccount="expandedAccount"
          :addingFundToAccount="addRowAccountId"
          :addFundError="addRowError"
          :addFundResult="addRowResult"
          :formatCurrency="formatCurrency"
          :formatNumber="formatNumber"
          :getCategoryBadgeClass="getCategoryBadgeClass"
          :calculateAccountValue="calculateAccountValue"
          @toggleAccount="toggleAccountDetails"
          @editHolding="openEditHoldingModal"
          @deleteHolding="confirmDeleteHolding"
          @startAddFund="showAddRow"
          @cancelAddFund="cancelAddRow"
          @submitAddFund="findFundForAccount"
        />
      </template>
    </PortfolioOverview>

    <RecentInteractions 
      :interactions="interactions" 
      :interactionsLoading="interactionsLoading" 
      :interactionTypeMap="interactionTypeMap" 
      :client="client" 
      :formatDate="formatDate" 
    />

    <FactFindSection 
      :client="client" 
      :formatDate="formatDate" 
      :formatCurrency="formatCurrency" 
      :getRiskProfileBadgeClass="getRiskProfileBadgeClass" 
    />
  </div>
  <div v-else class="text-center py-10">
    <div class="bg-red-50 border-l-4 border-red-400 p-4 mb-4 max-w-lg mx-auto">
      <div class="flex">
        <div class="flex-shrink-0">
          <i class="fas fa-exclamation-circle text-red-400"></i>
        </div>
        <div class="ml-3">
          <h3 class="text-lg font-medium text-red-800">Client Not Found</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>Could not find a client with ID: {{ id }}.</p>
            <p class="mt-1">The client may have been deleted or the ID may be invalid.</p>
          </div>
        </div>
      </div>
    </div>
    <router-link :to="{ name: 'Clients' }" class="text-emerald-600 hover:underline mt-4 inline-flex items-center">
      <i class="fas fa-arrow-left mr-2"></i>
      Back to Client List
    </router-link>
  </div>

  <FundPriceUpdateModal 
    v-if="isUpdatingFunds" 
    :show="isUpdatingFunds"
    :updateProgress="updateProgress" 
    :formatDate="formatDate"
    :formatCurrency="formatCurrency" 
    :calculatePriceChange="calculatePriceChange" 
    @cancelUpdateFunds="cancelUpdateFunds"
  />

  <DeleteConfirmationModal 
    v-if="showDeleteModal" 
    :show="showDeleteModal"
    :client="client" 
    @cancel="showDeleteModal = false" 
    @delete="deleteClient" 
  />

  <EditHoldingModal 
    v-if="editHoldingModal.open" 
    :editHoldingModal="editHoldingModal" 
    @close="closeEditHoldingModal" 
    @save="saveHoldingEdit" 
    @delete="deleteHolding" 
  />
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { clientService, investmentService, investmentAccountService, interactionService, insuranceService, userService } from '../services/database';
import { INSURANCE_TYPES } from '../services/models/productTypes';
import {
  ClientOverviewCard,
  PortfolioOverview,
  RecentInteractions,
  FactFindSection,
  DeleteConfirmationModal,
  FundPriceUpdateModal,
  EditHoldingModal,
  AccountHoldings
} from '../components';

export default {
  name: 'ClientDetailView',
  components: {
    ClientOverviewCard,
    PortfolioOverview,
    RecentInteractions,
    FactFindSection,
    DeleteConfirmationModal,
    FundPriceUpdateModal,
    EditHoldingModal,
    AccountHoldings
  },
  props: {
    id: {
      type: [String, Number],
      required: true,
    },
  },
  setup(props) {
    const route = useRoute();
    const router = useRouter();
    const client = ref(null);
    const insurancePolicies = ref([]);
    const holdings = ref([]);
    const interactions = ref([]);
    const interactionTypeMap = ref({});
    const isLoading = ref(true);
    const holdingsLoading = ref(true);
    const interactionsLoading = ref(true);
    const expandedAccount = ref(null);
    const expandedPolicy = ref(null);
    const showDeleteModal = ref(false);
    const isUpdatingFunds = ref(false);
    const updateProgress = ref([]);
    const editHoldingModal = ref({ open: false, account: null, holding: null, units: 0, confirmDelete: false });
    const addRowAccountId = ref(null);
    const addRowIsin = ref('');
    const addRowError = ref('');
    const addRowResult = ref('');

    const clientId = computed(() => Number(props.id));

    const fetchClientData = async () => {
      isLoading.value = true;
      holdingsLoading.value = true;
      interactionsLoading.value = true;
      try {
        const [clientData, interactionTypes, policies] = await Promise.all([
          clientService.getClient(clientId.value),
          interactionService.getAllInteractionTypes(),
          insuranceService.getClientPolicies(clientId.value)
        ]);

        interactionTypeMap.value = interactionTypes.reduce((map, type) => {
          map[type.id] = type;
          return map;
        }, {});

        if (!clientData) throw new Error('Client not found');
        client.value = clientData;

        const accounts = await investmentService.getClientAccounts(clientId.value);
        if (accounts.length > 0) {
          const accountsWithHoldings = await Promise.all(
            accounts.map(account => 
              investmentService.getAccount(account.id)
            )
          );
          client.value.accounts = accountsWithHoldings;
          holdings.value = accountsWithHoldings.reduce((allHoldings, account) => {
            return allHoldings.concat(account.holdings || []);
          }, []);
        }

        const rawInteractions = await interactionService.getClientInteractions(clientId.value);
        const userIds = [...new Set(rawInteractions.map(i => i.userId))];
        const users = await Promise.all(userIds.map(id => userService.getAllUsers()));
        const userMap = Object.fromEntries(users.flat().map(u => [u.id, u]));
        
        interactions.value = rawInteractions.map(interaction => ({
          ...interaction,
          userName: userMap[interaction.userId] ? `${userMap[interaction.userId].firstName} ${userMap[interaction.userId].lastName}` : 'Unknown User'
        }));

        insurancePolicies.value = policies;

      } catch (error) {
        console.error('[ClientDetailView] Error fetching data for client', clientId.value, ':', error);
        client.value = null;
      } finally {
        isLoading.value = false;
        holdingsLoading.value = false;
        interactionsLoading.value = false;
      }
    };

    const calculateAccountValue = (account) => {
      if (typeof account.totalValue === 'number') return account.totalValue;
      if (account.holdings?.length) {
        return account.holdings.reduce((sum, h) => {
          const value = h.currentValue != null ? h.currentValue : (h.unitsHeld * h.fund.price || 0);
          return sum + value;
        }, 0);
      }
      return 0;
    };

    const totalPortfolioValue = computed(() =>
      client.value?.accounts?.reduce((sum, account) => sum + calculateAccountValue(account), 0) || 0
    );

    const portfolioAssetAllocation = computed(() => {
      const totalValue = totalPortfolioValue.value;
      if (!totalValue) return {};
      
      const rawAllocation = holdings.value.reduce((acc, holding) => {
        const fund = holding.fund;
        if (!fund) return acc;
        
        const value = holding.currentValue || (holding.unitsHeld * fund.price) || 0;
        if (fund.allocation) {
          Object.entries(fund.allocation).forEach(([type, percentage]) => {
            if (type !== 'other') {
              if (!acc[type]) acc[type] = 0;
              acc[type] += (value * (percentage / 100));
            }
          });
        }
        return acc;
      }, {});

      const allocatedValue = Object.values(rawAllocation).reduce((sum, val) => sum + val, 0);
      const otherValue = totalValue - allocatedValue;
      if (otherValue > 0) {
        rawAllocation.other = otherValue;
      }

      return Object.entries(rawAllocation).reduce((acc, [type, value]) => {
        acc[type] = (value / totalValue) * 100;
        return acc;
      }, {});
    });

    const formatAssetType = (type) => {
      const formatMap = {
        'nonUKStock': 'Non-UK Stock',
        'ukStock': 'UK Stock',
        'nonUKBond': 'Non-UK Bond',
        'ukBond': 'UK Bond',
        'cash': 'Cash',
        'other': 'Other'
      };
      return formatMap[type] || type;
    };

    const getAssetAllocationColor = (type) => {
      const colorMap = {
        'nonUKStock': 'bg-blue-500',
        'ukStock': 'bg-emerald-500',
        'nonUKBond': 'bg-purple-500',
        'ukBond': 'bg-indigo-500',
        'cash': 'bg-gray-500',
        'other': 'bg-yellow-500'
      };
      return colorMap[type] || 'bg-gray-400';
    };

    const updateFundPrices = async () => {
      try {
        isUpdatingFunds.value = true;
        updateProgress.value = [];

        const uniqueFunds = holdings.value.reduce((acc, holding) => {
          if (!acc.some(f => f.isin === holding.fund.isin)) {
            acc.push({
              isin: holding.fund.isin,
              name: holding.fund.name,
              previousPrice: holding.fund.price,
              status: 'pending'
            });
          }
          return acc;
        }, []);
        
        updateProgress.value = uniqueFunds;

        const onProgress = (fundUpdate) => {
          const index = updateProgress.value.findIndex(f => f.isin === fundUpdate.isin);
          if (index !== -1) {
            updateProgress.value[index] = { ...fundUpdate };
          }
        };

        await investmentService.updateFundPrices(
          holdings.value.map(h => h.fund?.isin),
          onProgress
        );
        
        if (updateProgress.value.some(f => f.status === 'success')) {
          await fetchClientData();
        }
      } catch (error) {
        console.error('[updateFundPrices] Error updating fund prices:', error);
      }
    };

    const cancelUpdateFunds = () => {
      isUpdatingFunds.value = false;
    };

    const calculatePriceChange = (previousPrice, currentPrice) => {
      if (!previousPrice || !currentPrice) return '—';
      const change = currentPrice - previousPrice;
      const percentageChange = ((change / previousPrice) * 100).toFixed(2);
      const formattedChange = percentageChange > 0 ? `+${percentageChange}` : percentageChange;
      return `${formattedChange}%`;
    };

    const calculateGainLossPercent = (holding) => {
      if (!holding.purchasePrice || !holding.currentValue) return 0;
      const initialValue = holding.purchasePrice * holding.unitsHeld;
      return ((holding.currentValue - initialValue) / initialValue) * 100;
    };

    const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString('en-GB', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
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

    const formatNumber = (value, maxDecimals = 2) => {
      if (typeof value !== 'number') return 'N/A';
      return new Intl.NumberFormat('en-GB', {
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

    const getCategoryBadgeClass = (category) => {
        switch (category?.toLowerCase()) {
            case 'equity income': return 'bg-emerald-100 text-emerald-800';
            case 'global equity': return 'bg-blue-100 text-blue-800';
            case 'fixed income': return 'bg-amber-100 text-amber-800';
            case 'japanese equity': return 'bg-indigo-100 text-indigo-800';
            case 'european equity': return 'bg-violet-100 text-violet-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const toggleAccountDetails = (accountId) => {
      expandedAccount.value = expandedAccount.value === accountId ? null : accountId;
    };

    const togglePolicyDetails = (policyId) => {
      expandedPolicy.value = expandedPolicy.value === policyId ? null : policyId;
    };

    const confirmDeleteClient = () => {
      showDeleteModal.value = true;
    };

    const deleteClient = () => {
      clientService.deleteClient(clientId.value)
        .then(() => {
          showDeleteModal.value = false;
          router.push({ name: 'Clients' });
        })
        .catch((error) => {
          console.error('Error deleting client:', error);
          alert('Failed to delete client. Please try again later.');
          showDeleteModal.value = false;
        });
    };

    const openEditHoldingModal = (account, holding) => {
      editHoldingModal.value.open = true;
      editHoldingModal.value.account = account;
      editHoldingModal.value.holding = holding;
      editHoldingModal.value.units = holding.unitsHeld;
      editHoldingModal.value.confirmDelete = false;
    };

    const closeEditHoldingModal = () => {
      editHoldingModal.value.open = false;
      editHoldingModal.value.account = null;
      editHoldingModal.value.holding = null;
      editHoldingModal.value.units = 0;
      editHoldingModal.value.confirmDelete = false;
    };

    const saveHoldingEdit = async () => {
      const { account, holding, units } = editHoldingModal.value;
      if (!account || !holding) return;
      if (units < 0) return;
      await investmentAccountService.updateHolding(account.id, holding.fund.id, { unitsHeld: units });
      closeEditHoldingModal();
      await fetchClientData();
    };

    const confirmDeleteHolding = () => {
      editHoldingModal.value.confirmDelete = true;
    };

    const deleteHolding = async () => {
      const { account, holding } = editHoldingModal.value;
      if (!account || !holding) return;
      await investmentService.deleteHolding(account.id, holding.id);
      closeEditHoldingModal();
      await fetchClientData();
    };

    const showAddRow = (accountId) => {
      addRowAccountId.value = accountId;
      addRowIsin.value = '';
      addRowError.value = '';
      addRowResult.value = '';
    };

    const cancelAddRow = () => {
      addRowAccountId.value = null;
      addRowIsin.value = '';
      addRowError.value = '';
      addRowResult.value = '';
    };

    const findFundForAccount = async (accountId) => {
      addRowError.value = '';
      addRowResult.value = '';
      if (!addRowIsin.value) {
        addRowError.value = 'Please enter a valid ISIN.';
        return;
      }
      try {
        const fund = await investmentService.findFundByISIN(addRowIsin.value);
        if (!fund) {
          addRowError.value = 'Fund not found. Please check the ISIN and try again.';
          return;
        }
        addRowResult.value = `Found fund: ${fund.name}. You can now add it to the account.`;
      } catch (error) {
        console.error('Error finding fund:', error);
        addRowError.value = 'An error occurred while searching for the fund. Please try again later.';
      }
    };

    watch(() => props.id, (newId) => {
        if (newId) {
            fetchClientData();
        }
    }, { immediate: true });

    return {
      client,
      insurancePolicies,
      holdings,
      interactions,
      interactionTypeMap,
      isLoading,
      holdingsLoading,
      interactionsLoading,
      totalPortfolioValue,
      portfolioAssetAllocation,
      formatDate,
      formatCurrency,
      formatNumber,
      getRiskProfileBadgeClass,
      getCategoryBadgeClass,
      calculateGainLossPercent,
      id: props.id,
      INSURANCE_TYPES,
      expandedAccount,
      expandedPolicy,
      toggleAccountDetails,
      togglePolicyDetails,
      calculateAccountValue,
      formatAssetType,
      getAssetAllocationColor,
      showDeleteModal,
      deleteClient,
      confirmDeleteClient,
      updateFundPrices,
      isUpdatingFunds,
      updateProgress,
      cancelUpdateFunds,
      calculatePriceChange,
      editHoldingModal,
      openEditHoldingModal,
      closeEditHoldingModal,
      saveHoldingEdit,
      confirmDeleteHolding,
      deleteHolding,
      addRowAccountId,
      addRowIsin,
      addRowError,
      addRowResult,
      showAddRow,
      cancelAddRow,
      findFundForAccount
    };
  }
};
</script>