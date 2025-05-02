<template>
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
        <div class="space-y-6">
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
                    <div v-for="(dependent, index) in client.factFind.personal.dependents" :key="index" class="flex items-center space-x-2 mb-1">
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
        <div class="space-y-6">
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
</template>

<script>
export default {
  name: 'FactFindSection',
  props: {
    client: { type: Object, required: true },
    formatDate: { type: Function, required: true },
    formatCurrency: { type: Function, required: true },
    getRiskProfileBadgeClass: { type: Function, required: false }
  }
};
</script>
