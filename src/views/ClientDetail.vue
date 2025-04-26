<template>
  <div v-if="isLoading" class="flex justify-center items-center py-10">
     <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
  </div>
  <div v-else-if="client" class="p-6 relative">
    <!-- Client Overview Card -->
    <div class="bg-glass backdrop-blur-xs rounded-lg shadow-soft p-6 mb-6 transition-all duration-300 hover:shadow-hover relative z-20">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Basic Info -->
        <div>
          <div class="flex justify-between items-start">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">{{ client.firstName }} {{ client.lastName }}</h2>
              <p class="text-sm text-gray-600 mt-1">Client since {{ formatDate(client.createdAt) }}</p>
            </div>
          </div>
          <div class="mt-4 space-y-2">
            <p class="text-sm flex items-center"><i class="fas fa-envelope text-gray-400 w-5 mr-2"></i>{{ client.email }}</p>
            <p class="text-sm flex items-center"><i class="fas fa-phone text-gray-400 w-5 mr-2"></i>{{ client.phone }}</p>
          </div>
        </div>
        
        <!-- Address -->
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-2 flex items-center">
            <i class="fas fa-location-dot text-gray-400 w-5 mr-2"></i>Address
          </h3>
          <div v-if="client.address" class="pl-7 text-sm space-y-1">
            <p>{{ client.address.street }}</p>
            <p>{{ client.address.city }}</p>
            <p>{{ client.address.postcode }}</p>
            <p>{{ client.address.country }}</p>
          </div>
          <div v-else class="pl-7 text-sm text-gray-400 italic">No address on file</div>
        </div>
        
        <!-- Risk Profile -->
        <div>
          <h3 class="text-sm font-medium text-gray-500 mb-2 flex items-center justify-between">
            <div class="flex items-center">
              <i class="fas fa-chart-line text-gray-400 w-5 mr-2"></i>Risk Profile
            </div>
            <button 
              @click="confirmDeleteClient" 
              class="text-red-600 hover:text-red-800 transition-colors ml-4"
              title="Delete Client">
              <i class="fas fa-trash"></i>
            </button>
          </h3>
          <div class="pl-7">
            <span :class="['px-3 py-1.5 text-sm rounded-full inline-block', getRiskProfileBadgeClass(client.riskProfile)]">
              {{ client.riskProfile || 'Not Set' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Portfolio Summary -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Portfolio Overview -->
      <div class="lg:col-span-2">
        <div class="bg-glass backdrop-blur-xs rounded-lg shadow-soft p-6 h-full transition-all duration-300 hover:shadow-hover">
          <h3 class="text-lg font-semibold text-gray-800 mb-4 flex justify-between items-center">
            <span>Portfolio Overview</span>
            <div class="flex items-center gap-4">
              <button 
                @click="updateFundPrices" 
                :disabled="holdings.length === 0" 
                class="inline-flex items-center px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-md hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed" 
                title="Update Fund Prices"
              >
                <i class="fas fa-sync-alt mr-2"></i>
                Update Fund Prices
              </button>
              <span class="text-lg font-semibold text-emerald-600" aria-label="Total portfolio value">
                {{ formatCurrency(totalPortfolioValue) }}
              </span>
            </div>
          </h3>
          
          <!-- Category Distribution Chart -->
          <div v-if="holdings.length > 0" class="mt-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 class="text-sm font-medium text-gray-600 mb-2">Category Distribution</h4>
              <canvas ref="categoryChart" width="400" height="256" style="display:block;max-width:100%;height:auto;"></canvas>
            </div>
            <div>
              <h4 class="text-sm font-medium text-gray-600 mb-2">Asset Allocation</h4>
              <div class="space-y-3">
                <div v-for="(value, type) in portfolioAssetAllocation" :key="type" class="flex justify-between items-center">
                  <span class="text-sm font-medium">{{ formatAssetType(type) }}</span>
                  <div class="flex items-center gap-2">
                    <div class="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        class="h-full rounded-full" 
                        :class="getAssetAllocationColor(type)"
                        :style="{ width: `${value}%` }"
                      ></div>
                    </div>
                    <span class="text-sm text-gray-600">{{ value.toFixed(1) }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Investment Accounts Summary -->
          <div v-if="client.accounts?.length > 0" class="mb-6">
            <h4 class="text-sm font-medium text-gray-500 mb-3">Investment Accounts</h4>
            <div class="space-y-3">
              <div v-for="account in client.accounts" :key="account.id" 
                   class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div class="flex justify-between items-center">
                  <div>
                    <h5 class="font-medium text-gray-900">{{ account.type }}</h5>
                    <p class="text-sm text-gray-600">{{ account.provider }} - #{{ account.accountNumber }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-lg font-semibold text-emerald-600">{{ formatCurrency(calculateAccountValue(account)) }}</p>
                    <button @click="toggleAccountDetails(account.id)" 
                            class="text-xs text-emerald-600 hover:text-emerald-700 mt-1 flex items-center">
                      {{ expandedAccount === account.id ? 'Hide' : 'Show' }} Details
                      <i :class="['fas', expandedAccount === account.id ? 'fa-chevron-up' : 'fa-chevron-down', 'ml-1']"></i>
                    </button>
                  </div>
                </div>
                
                <!-- Expandable Holdings -->
                <div v-if="expandedAccount === account.id" class="mt-4">
                  <div v-if="holdingsLoading" class="flex justify-center py-4">
                    <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
                  </div>
                  <div v-else-if="account.holdings?.length" class="mt-2">
                    <table class="min-w-full text-sm">
                      <thead>
                        <tr class="text-gray-500">
                          <th class="text-left py-2">Fund</th>
                          <th class="text-right py-2">Units</th>
                          <th class="text-right py-2">Price</th>
                          <th class="text-right py-2">Value</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100">
                        <tr v-for="holding in account.holdings" :key="holding.id" class="hover:bg-gray-50">
                          <td class="py-2">
                            <div class="flex flex-col">
                              <a :href="holding.fund.ftLink" target="_blank" class="hover:text-emerald-600">
                                {{ holding.fund.name }}
                              </a>
                              <span :class="['text-xs mt-1 inline-block w-fit px-2 py-0.5 rounded-full', getCategoryBadgeClass(holding.fund.category)]">
                                {{ holding.fund.category }}
                              </span>
                            </div>
                          </td>
                          <td class="text-right py-2">{{ Math.round(holding.unitsHeld) }}</td>
                          <td class="text-right py-2">{{ formatCurrency(holding.fund.price) }}</td>
                          <td class="text-right py-2">
                            <span class="px-3 py-1 rounded-lg bg-emerald-50 text-emerald-700">
                              {{ formatCurrency(holding.unitsHeld * holding.fund.price) }}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p v-else class="text-sm text-gray-500 text-center py-2">No holdings in this account</p>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Insurance Policies Summary -->
          <div v-if="insurancePolicies.length > 0" class="mt-6">
            <h4 class="text-sm font-medium text-gray-500 mb-3">Insurance Policies</h4>
            <div class="space-y-3">
              <div v-for="policy in insurancePolicies" :key="policy.id" 
                   class="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                <div class="flex justify-between items-center">
                  <div>
                    <h5 class="font-medium text-gray-900">{{ INSURANCE_TYPES[policy.type]?.name }}</h5>
                    <p class="text-sm text-gray-600">{{ policy.provider }} - #{{ policy.policyNumber }}</p>
                  </div>
                  <div class="text-right">
                    <p v-if="policy.premiumAmount != null && policy.premiumFrequency" class="text-sm font-medium text-gray-900">
                      {{ formatCurrency(policy.premiumAmount) }}/{{ policy.premiumFrequency }}
                    </p>
                    <button @click="togglePolicyDetails(policy.id)"
                            class="text-xs text-emerald-600 hover:text-emerald-700 mt-1 flex items-center">
                      {{ expandedPolicy === policy.id ? 'Hide' : 'Show' }} Details
                      <i :class="['fas', expandedPolicy === policy.id ? 'fa-chevron-up' : 'fa-chevron-down', 'ml-1']"></i>
                    </button>
                  </div>
                </div>
                
                <!-- Expandable Policy Details -->
                <div v-if="expandedPolicy === policy.id" class="mt-4 text-sm space-y-2">
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <p class="text-gray-600">Status</p>
                      <p :class="[
                        'inline-block px-2 py-1 rounded-full text-xs font-medium mt-1',
                        policy.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      ]">
                        {{ policy.status }}
                      </p>
                    </div>
                    <div>
                      <p class="text-gray-600">Start Date</p>
                      <p class="mt-1">{{ formatDate(policy.startDate) }}</p>
                    </div>
                    <div v-if="policy.coverageAmount">
                      <p class="text-gray-600">Coverage Amount</p>
                      <p class="mt-1">{{ formatCurrency(policy.coverageAmount) }}</p>
                    </div>
                    <div v-if="policy.nextPaymentDate">
                      <p class="text-gray-600">Next Payment</p>
                      <p class="mt-1">{{ formatDate(policy.nextPaymentDate) }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div v-if="!client.accounts?.length && !insurancePolicies.length" 
               class="text-center text-gray-500 py-6">
            No investment accounts or insurance policies found
          </div>
        </div>
      </div>

      <!-- Recent Interactions Card -->
      <div class="lg:col-span-1">
        <div class="bg-glass backdrop-blur-xs rounded-lg shadow-soft p-6 h-full transition-all duration-300 hover:shadow-hover">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">Recent Interactions</h3>
          </div>
          <div v-if="interactionsLoading" class="flex justify-center py-8">
            <div class="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
          <div v-else-if="interactions.length > 0" class="overflow-hidden rounded-lg border border-gray-200">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="interaction in interactions.slice(0, 5)" :key="interaction.id" 
                    class="hover:bg-gray-50 transition-colors duration-150">
                  <td class="px-6 py-4">
                    <span class="text-sm font-medium text-gray-900">{{ interactionTypeMap[interaction.interactionTypeId]?.name || 'Unknown Type' }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {{ formatDate(interaction.date) }}
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="p-4 bg-gray-50 border-t border-gray-200">
              <p class="text-sm text-gray-600">
                Showing last 5 interactions.
                <router-link :to="{ name: 'Activity', query: { clientId: client.id }}" class="text-emerald-600 hover:text-emerald-800 font-medium">
                  View all
                </router-link>
              </p>
            </div>
          </div>
          <div v-else class="text-center py-8">
            <i class="fas fa-history text-gray-300 text-3xl mb-2"></i>
            <p class="text-gray-500 text-sm">No recent interactions</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Fact Find Section -->
    <div class="bg-glass backdrop-blur-xs rounded-lg shadow-soft overflow-hidden mb-6 transition-all duration-300 hover:shadow-hover">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold text-gray-800">Fact Find</h2>
          <div class="flex items-center space-x-4">
            <div class="flex items-center">
              <i class="fas fa-clock text-gray-400 mr-2"></i>
              <span class="text-sm text-gray-500">Last updated: {{ formatDate(client.factFind?.lastUpdated) }}</span>
            </div>
            <button 
              class="text-emerald-600 hover:text-emerald-700 transition-colors"
              title="Edit Fact Find (Coming Soon)">
              <i class="fas fa-edit"></i>
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <!-- Personal & Employment Section -->
          <div class="space-y-6">
            <!-- Personal Details -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <h3 class="text-lg font-medium mb-4 flex items-center text-gray-800">
                <i class="fas fa-user text-emerald-500 mr-2"></i>
                Personal Details
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <p class="text-sm">
                    <span class="text-gray-600">Title:</span><br/>
                    <span class="font-medium">{{ client.factFind?.personal?.title || 'Not specified' }}</span>
                  </p>
                  <p class="text-sm">
                    <span class="text-gray-600">Date of Birth:</span><br/>
                    <span class="font-medium">{{ formatDate(client.dateOfBirth) }}</span>
                  </p>
                  <p class="text-sm">
                    <span class="text-gray-600">Nationality:</span><br/>
                    <span class="font-medium">{{ client.factFind?.personal?.nationality || 'Not specified' }}</span>
                  </p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm">
                    <span class="text-gray-600">Marital Status:</span><br/>
                    <span class="font-medium">{{ client.factFind?.personal?.maritalStatus || 'Not specified' }}</span>
                  </p>
                  <p class="text-sm">
                    <span class="text-gray-600">Dependents:</span><br/>
                    <div v-if="client.factFind?.personal?.dependents?.length" class="mt-1">
                      <div v-for="(dependent, index) in client.factFind.personal.dependents" 
                           :key="index" 
                           class="flex items-center space-x-2 mb-1">
                        <span class="font-medium">{{ dependent.relationship }}:</span>
                        <span>{{ dependent.age }} years old</span>
                      </div>
                    </div>
                    <span v-else class="font-medium">None</span>
                  </p>
                  <p class="text-sm">
                    <span class="text-gray-600">Health Status:</span><br/>
                    <span class="font-medium">{{ client.factFind?.personal?.healthStatus || 'Not specified' }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Employment Details -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <h3 class="text-lg font-medium mb-4 flex items-center text-gray-800">
                <i class="fas fa-briefcase text-emerald-500 mr-2"></i>
                Employment
              </h3>
              <div class="space-y-3">
                <p class="text-sm">
                  <span class="text-gray-600">Occupation:</span><br/>
                  <span class="font-medium">{{ client.factFind?.employment?.occupation || 'Not specified' }}</span>
                </p>
                <p class="text-sm">
                  <span class="text-gray-600">Employer:</span><br/>
                  <span class="font-medium">{{ client.factFind?.employment?.employer || 'Not specified' }}</span>
                </p>
                <div class="grid grid-cols-2 gap-4">
                  <p class="text-sm">
                    <span class="text-gray-600">Annual Income:</span><br/>
                    <span class="font-medium">{{ formatCurrency(client.factFind?.employment?.annualIncome) }}</span>
                  </p>
                  <p class="text-sm">
                    <span class="text-gray-600">Years in Role:</span><br/>
                    <span class="font-medium">{{ client.factFind?.employment?.yearsInRole || 'Not specified' }}</span>
                  </p>
                </div>
                <p class="text-sm">
                  <span class="text-gray-600">Employment Status:</span><br/>
                  <span class="font-medium">{{ client.factFind?.employment?.status || 'Not specified' }}</span>
                </p>
              </div>
            </div>
          </div>

          <!-- Financial & Objectives Section -->
          <div class="space-y-6">
            <!-- Financial Overview -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <h3 class="text-lg font-medium mb-4 flex items-center text-gray-800">
                <i class="fas fa-wallet text-emerald-500 mr-2"></i>
                Financial Overview
              </h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="space-y-2">
                  <p class="text-sm">
                    <span class="text-gray-600">Monthly Income:</span><br/>
                    <span class="font-medium">{{ formatCurrency(client.factFind?.financial?.monthlyIncome) }}</span>
                  </p>
                  <p class="text-sm">
                    <span class="text-gray-600">Monthly Expenses:</span><br/>
                    <span class="font-medium">{{ formatCurrency(client.factFind?.financial?.monthlyExpenses) }}</span>
                  </p>
                </div>
                <div class="space-y-2">
                  <p class="text-sm">
                    <span class="text-gray-600">Assets:</span><br/>
                    <span class="font-medium">{{ formatCurrency(client.factFind?.financial?.totalAssets) }}</span>
                  </p>
                  <p class="text-sm">
                    <span class="text-gray-600">Liabilities:</span><br/>
                    <span class="font-medium">{{ formatCurrency(client.factFind?.financial?.totalLiabilities) }}</span>
                  </p>
                </div>
              </div>
            </div>

            <!-- Investment Objectives -->
            <div class="bg-white rounded-lg p-4 shadow-sm">
              <h3 class="text-lg font-medium mb-4 flex items-center text-gray-800">
                <i class="fas fa-bullseye text-emerald-500 mr-2"></i>
                Investment Objectives
              </h3>
              <div class="space-y-4">
                <div>
                  <h4 class="text-sm font-medium text-gray-600 mb-2">Short Term Goals</h4>
                  <ul class="list-disc list-inside space-y-1">
                    <li v-for="goal in client.factFind?.objectives?.shortTerm" :key="goal" class="text-sm pl-2">{{ goal }}</li>
                    <li v-if="!client.factFind?.objectives?.shortTerm?.length" class="text-sm text-gray-500 italic">No short term goals specified</li>
                  </ul>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-600 mb-2">Medium Term Goals</h4>
                  <ul class="list-disc list-inside space-y-1">
                    <li v-for="goal in client.factFind?.objectives?.mediumTerm" :key="goal" class="text-sm pl-2">{{ goal }}</li>
                    <li v-if="!client.factFind?.objectives?.mediumTerm?.length" class="text-sm text-gray-500 italic">No medium term goals specified</li>
                  </ul>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-600 mb-2">Long Term Goals</h4>
                  <ul class="list-disc list-inside space-y-1">
                    <li v-for="goal in client.factFind?.objectives?.longTerm" :key="goal" class="text-sm pl-2">{{ goal }}</li>
                    <li v-if="!client.factFind?.objectives?.longTerm?.length" class="text-sm text-gray-500 italic">No long term goals specified</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Risk Assessment -->
        <div class="mt-8">
          <div class="bg-white rounded-lg p-4 shadow-sm">
            <h3 class="text-lg font-medium mb-4 flex items-center text-gray-800">
              <i class="fas fa-chart-line text-emerald-500 mr-2"></i>
              Risk Assessment
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p class="text-sm text-gray-600 mb-2">Risk Profile</p>
                <span :class="['px-3 py-1.5 text-sm rounded-full inline-block', getRiskProfileBadgeClass(client.riskProfile)]">
                  {{ client.riskProfile || 'Not Set' }}
                </span>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-2">Risk Tolerance Score</p>
                <span class="text-sm font-medium">{{ client.factFind?.objectives?.riskTolerance?.score || 'Not assessed' }}</span>
              </div>
              <div>
                <p class="text-sm text-gray-600 mb-2">Last Assessment Date</p>
                <span class="text-sm font-medium">{{ formatDate(client.factFind?.objectives?.riskTolerance?.lastAssessment) || 'Not recorded' }}</span>
              </div>
            </div>
            <div class="mt-4">
              <p class="text-sm text-gray-600 mb-2">Notes</p>
              <p class="text-sm">{{ client.factFind?.objectives?.riskTolerance?.notes || 'No risk assessment notes available' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
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

  <!-- Fund Price Update Popover -->
  <div v-if="isUpdatingFunds" 
       class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-hidden" 
       style="overscroll-behavior: contain;"
       @click.self="cancelUpdateFunds">
    <div class="bg-white rounded-lg w-[50vw] h-[50vh] max-w-3xl flex flex-col">
      <div class="px-8 py-6 border-b border-gray-200 flex-shrink-0">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-medium text-gray-900">Updating Fund Prices</h3>
          <span class="text-sm text-gray-500">{{ formatDate(new Date()) }}</span>
        </div>
      </div>
      
      <div class="flex-1 overflow-y-auto px-8 py-6 hide-scrollbar" style="overscroll-behavior: contain;">
        <div class="space-y-4">
          <div v-for="fund in updateProgress" 
               :key="fund.isin" 
               class="text-base bg-gray-50 p-4 rounded-lg">
            <div class="flex justify-between mb-2">
              <span class="font-medium text-gray-900">{{ fund.name }}</span>
              <div class="flex items-center gap-2">
                <i :class="[
                  'fas',
                  fund.status === 'pending' ? 'fa-clock text-gray-400' :
                  fund.status === 'updating' ? 'fa-sync-alt fa-spin text-blue-500' :
                  fund.status === 'success' ? 'fa-check text-green-500' :
                  'fa-exclamation-circle text-red-500'
                ]"></i>
              </div>
            </div>
            <div class="flex items-center justify-between">
              <div class="flex items-baseline gap-2">
                <span class="text-gray-500">{{ formatCurrency(fund.previousPrice, 'GBP') }}</span>
                <i class="fas fa-arrow-right text-gray-400 text-xs"></i>
                <span :class="[
                  'font-medium',
                  fund.status === 'success' ? 
                    (fund.price > fund.previousPrice ? 'text-green-600' : 
                     fund.price < fund.previousPrice ? 'text-red-600' : 
                     'text-gray-900') :
                  'text-gray-400'
                ]">
                  {{ fund.status === 'success' ? formatCurrency(fund.price, fund.currency) : '—' }}
                </span>
              </div>
              <span v-if="fund.status === 'success'" class="text-sm" :class="{
                'text-green-600': fund.price > fund.previousPrice,
                'text-red-600': fund.price < fund.previousPrice,
                'text-gray-500': fund.price === fund.previousPrice
              }">
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
          <button
            @click="cancelUpdateFunds"
            class="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Delete Confirmation Modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white rounded-lg p-6 max-w-md w-full m-4">
      <div class="mb-4">
        <h3 class="text-lg font-medium text-gray-900">Delete Client</h3>
        <p class="mt-2 text-sm text-gray-500">
          Are you sure you want to delete {{ client.firstName }} {{ client.lastName }}? This will permanently remove:
        </p>
        <ul class="mt-2 text-sm text-gray-600 list-disc pl-5">
          <li>Client profile and contact information</li>
          <li>Investment accounts and holdings</li>
          <li>Insurance policies</li>
          <li>Interaction history</li>
          <li>Fact find data</li>
        </ul>
        <p class="mt-2 text-sm text-red-600">This action cannot be undone.</p>
      </div>
      <div class="flex justify-end space-x-4">
        <button
          @click="showDeleteModal = false"
          class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
        >
          Cancel
        </button>
        <button
          @click="deleteClient"
          class="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete Client
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Chart, ArcElement, Tooltip, Legend, PieController } from 'chart.js';
import { clientService, investmentService, interactionService, insuranceService, userService } from '../services/database';
import { INSURANCE_TYPES } from '../services/models/productTypes';

Chart.register(ArcElement, Tooltip, Legend, PieController);

export default {
  name: 'ClientDetailView',
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
    const categoryChart = ref(null);
    const categoryChartInstance = ref(null);
    const expandedAccount = ref(null);
    const expandedPolicy = ref(null);
    const showDeleteModal = ref(false);
    const isUpdatingFunds = ref(false);
    const updateProgress = ref([]);

    const clientId = computed(() => Number(props.id));

    const fetchClientData = async () => {
      isLoading.value = true;
      holdingsLoading.value = true;
      interactionsLoading.value = true;
      console.log(`[ClientDetailView] Fetching data for client ID: ${clientId.value}`);
      try {
        const [clientData, interactionTypes, policies] = await Promise.all([
          clientService.getClient(clientId.value),
          interactionService.getAllInteractionTypes(),
          insuranceService.getClientPolicies(clientId.value)
        ]);

        console.log('[ClientDetailView] Initial client data:', clientData);

        interactionTypeMap.value = interactionTypes.reduce((map, type) => {
          map[type.id] = type;
          return map;
        }, {});

        if (!clientData) throw new Error('Client not found');
        client.value = clientData;

        // Load client accounts using InvestmentService
        const accounts = await investmentService.getClientAccounts(clientId.value);
        console.log('[ClientDetailView] Fetched client accounts:', accounts);
        
        if (accounts.length > 0) {
          console.log('[ClientDetailView] Loading detailed account data for accounts:', accounts.map(a => ({ id: a.id, type: a.type })));
          const accountsWithHoldings = await Promise.all(
            accounts.map(account => 
              investmentService.getAccount(account.id)
            )
          );
          
          console.log('[ClientDetailView] Loaded accounts with holdings:', accountsWithHoldings);
          client.value.accounts = accountsWithHoldings;
          holdings.value = accountsWithHoldings.reduce((allHoldings, account) => {
            return allHoldings.concat(account.holdings || []);
          }, []);
          console.log('[ClientDetailView] Total holdings:', holdings.value.length);
        }

        // Load interactions and fetch corresponding users
        const rawInteractions = await interactionService.getClientInteractions(clientId.value);
        const userIds = [...new Set(rawInteractions.map(i => i.userId))];
        const users = await Promise.all(userIds.map(id => userService.getAllUsers()));
        const userMap = Object.fromEntries(users.flat().map(u => [u.id, u]));
        
        interactions.value = rawInteractions.map(interaction => ({
          ...interaction,
          userName: userMap[interaction.userId] ? `${userMap[interaction.userId].firstName} ${userMap[interaction.userId].lastName}` : 'Unknown User'
        }));

        insurancePolicies.value = policies;

        console.log('[ClientDetailView] Fetched Client:', client.value);
        console.log('[ClientDetailView] Total Holdings across accounts:', holdings.value.length);
        console.log('[ClientDetailView] Fetched Interactions:', interactions.value.length);
        console.log('[ClientDetailView] Fetched Insurance Policies:', insurancePolicies.value.length);

        if (holdings.value.length > 0) {
          nextTick(() => {
            console.log('[ClientDetailView] Setting up category chart...');
            setupCategoryChart();
          });
        }

      } catch (error) {
        console.error('[ClientDetailView] Error fetching data for client', clientId.value, ':', error);
        client.value = null;
      } finally {
        isLoading.value = false;
        holdingsLoading.value = false;
        interactionsLoading.value = false;
      }
    };

    const setupCategoryChart = () => {
      console.log('[setupCategoryChart] called');
      if (!categoryChart.value) {
        console.log('[setupCategoryChart] categoryChart ref is null');
        return;
      }
      if (!holdings.value.length) {
        console.log('[setupCategoryChart] No holdings, skipping chart');
        return;
      }
      // Log canvas dimensions and parent
      const canvas = categoryChart.value;
      console.log('[setupCategoryChart] Canvas:', canvas, 'Parent:', canvas.parentElement, 'Width:', canvas.width, 'Height:', canvas.height);

      // Destroy previous chart instance if it exists
      if (categoryChartInstance.value) {
        console.log('[setupCategoryChart] Destroying previous chart instance');
        categoryChartInstance.value.destroy();
        categoryChartInstance.value = null;
      } else {
        console.log('[setupCategoryChart] No previous chart instance to destroy');
      }

      const categoryData = holdings.value.reduce((acc, holding) => {
        const category = holding.fund.category;
        if (!acc[category]) acc[category] = 0;
        const value = holding.currentValue || (holding.unitsHeld * holding.fund.price) || 0;
        acc[category] += value;
        return acc;
      }, {});

      const sortedCategories = Object.entries(categoryData)
        .sort(([, a], [, b]) => b - a)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      const labels = Object.keys(sortedCategories);
      const data = Object.values(sortedCategories);
      const colors = [
        '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', 
        '#EC4899', '#F59E0B', '#84CC16', '#14B8A6'
      ];

      console.log('[setupCategoryChart] Creating new Chart instance with labels:', labels, 'data:', data);
      categoryChartInstance.value = new Chart(categoryChart.value, {
        type: 'doughnut',
        data: {
          labels,
          datasets: [{
            data,
            backgroundColor: colors.slice(0, labels.length),
            borderWidth: 1,
            borderColor: '#fff'
          }]
        },
        options: {
          responsive: false, // Disable responsiveness to prevent canvas growth
          plugins: {
            legend: {
              position: 'right',
              labels: {
                usePointStyle: true,
                font: { size: 12 }
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
      console.log('[setupCategoryChart] Chart instance created:', categoryChartInstance.value);
    };

    watch(
      [holdings, categoryChart],
      async () => {
        if (holdings.value.length > 0 && categoryChart.value) {
          await nextTick();
          setupCategoryChart();
        }
      },
      { immediate: true }
    );

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
      
      // First pass: accumulate raw values
      const rawAllocation = holdings.value.reduce((acc, holding) => {
        const fund = holding.fund;
        if (!fund) return acc;
        
        const value = holding.currentValue || (holding.unitsHeld * fund.price) || 0;
        if (fund.allocation) {
          Object.entries(fund.allocation).forEach(([type, percentage]) => {
            if (type !== 'other') { // Exclude 'other' in first pass
              if (!acc[type]) acc[type] = 0;
              acc[type] += (value * (percentage / 100));
            }
          });
        }
        return acc;
      }, {});

      // Calculate remaining value for 'other' category
      const allocatedValue = Object.values(rawAllocation).reduce((sum, val) => sum + val, 0);
      const otherValue = totalValue - allocatedValue;
      if (otherValue > 0) {
        rawAllocation.other = otherValue;
      }

      // Convert to percentages
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
        console.log('[updateFundPrices] Starting fund price updates...');
        isUpdatingFunds.value = true;
        updateProgress.value = [];

        console.log('[ClientDetailView] holdings count before update:', holdings.value.length);
        console.log('[ClientDetailView] holdings ISINs before update:', holdings.value.map(h => h.fund?.isin));
        
        // Create update progress array with initial pending state for unique funds only
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

        // Progress callback function
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
        
        // Refetch data if any updates were successful
        if (updateProgress.value.some(f => f.status === 'success')) {
          await fetchClientData();
        }

        console.log('[updateFundPrices] Fund prices updated');
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
      getRiskProfileBadgeClass,
      getCategoryBadgeClass,
      calculateGainLossPercent,
      id: props.id,
      categoryChart,
      categoryChartInstance,
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
      calculatePriceChange
    };
  }
}
</script>

<style scoped>
.hide-scrollbar {
  scrollbar-width: none;  /* Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;  /* Chrome, Safari, Opera */
}
</style>