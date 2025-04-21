// Financial product type definitions for UK IFA
export const ACCOUNT_TYPES = {
  ISA: {
    name: 'Stocks & Shares ISA',
    providers: ['Hargreaves Lansdown', 'AJ Bell', 'Fidelity', 'Interactive Investor'],
    maxYearlyContribution: 20000,
    description: 'Tax-efficient investment account with annual allowance'
  },
  LISA: {
    name: 'Lifetime ISA',
    providers: ['Hargreaves Lansdown', 'AJ Bell', 'Nutmeg'],
    maxYearlyContribution: 4000,
    description: 'For first-time buyers or retirement, with 25% government bonus'
  },
  SIPP: {
    name: 'Self-Invested Personal Pension',
    providers: ['Hargreaves Lansdown', 'AJ Bell', 'Aviva', 'Scottish Widows'],
    description: 'Flexible pension with tax relief on contributions'
  },
  GIA: {
    name: 'General Investment Account',
    providers: ['Hargreaves Lansdown', 'AJ Bell', 'Fidelity', 'Interactive Investor'],
    description: 'Flexible investment account without tax advantages'
  }
};

export const INSURANCE_TYPES = {
  INCOME_PROTECTION: {
    name: 'Income Protection',
    providers: ['Aviva', 'Legal & General', 'Royal London', 'AIG', 'Vitality'],
    description: 'Provides regular payments if unable to work due to illness or injury'
  },
  LIFE: {
    name: 'Life Insurance',
    providers: ['Aviva', 'Legal & General', 'Scottish Widows', 'Royal London', 'Zurich'],
    description: 'Pays out a lump sum if the policyholder dies during the term'
  },
  CRITICAL_ILLNESS: {
    name: 'Critical Illness Cover',
    providers: ['Aviva', 'AIG', 'Legal & General', 'Vitality', 'Zurich'],
    description: 'Provides a tax-free lump sum if diagnosed with a specified serious illness'
  },
  HEALTH: {
    name: 'Private Health Insurance',
    providers: ['Bupa', 'AXA', 'Vitality', 'Aviva', 'WPA'],
    description: 'Covers the cost of private medical treatment'
  },
  BUSINESS_PROTECTION: {
    name: 'Business Protection',
    providers: ['Legal & General', 'Aviva', 'Royal London', 'AIG', 'Zurich'],
    description: 'Protects businesses against the financial impact of death or illness of key people'
  },
  FAMILY_INCOME_BENEFIT: {
    name: 'Family Income Benefit',
    providers: ['Legal & General', 'Aviva', 'Royal London', 'Scottish Widows'],
    description: 'Pays a regular income to beneficiaries if the policyholder dies during the term'
  }
};

export const FACT_FIND_SECTIONS = {
  PERSONAL: {
    title: 'Personal Information',
    fields: [
      'title', 'firstName', 'lastName', 'dateOfBirth', 'nationalInsurance',
      'maritalStatus', 'dependents', 'healthStatus', 'smoker'
    ]
  },
  EMPLOYMENT: {
    title: 'Employment & Income',
    fields: [
      'employmentStatus', 'occupation', 'employer', 'annualIncome',
      'otherIncome', 'employmentBenefits'
    ]
  },
  FINANCIAL: {
    title: 'Financial Position',
    fields: [
      'monthlyIncome', 'monthlyExpenses', 'existingMortgage',
      'otherLoans', 'creditCards', 'savings', 'investments'
    ]
  },
  OBJECTIVES: {
    title: 'Financial Objectives',
    fields: [
      'shortTermGoals', 'mediumTermGoals', 'longTermGoals',
      'retirementPlans', 'riskTolerance', 'investmentPreferences'
    ]
  },
  PROTECTION: {
    title: 'Protection Needs',
    fields: [
      'existingPolicies', 'dependentProtection', 'incomeProtection',
      'criticalIllness', 'privateHealthCare'
    ]
  }
};

// Risk profiles with detailed descriptions
export const RISK_PROFILES = {
  AVERSE: {
    name: 'Risk Averse',
    description: 'Prefers maximum security of capital. Typically suited to cash savings and government bonds.',
    suitableProducts: ['Cash ISA', 'Premium Bonds', 'Fixed Rate Bonds'],
    typicalAllocation: {
      cash: 70,
      bonds: 25,
      equity: 5
    }
  },
  MINIMAL: {
    name: 'Minimal Risk',
    description: 'Accepts minimal risk for potentially better returns than cash. May consider high-quality bonds.',
    suitableProducts: ['Cash ISA', 'Investment Grade Bonds', 'Gilt Funds'],
    typicalAllocation: {
      cash: 40,
      bonds: 50,
      equity: 10
    }
  },
  CAUTIOUS: {
    name: 'Cautious',
    description: 'Willing to accept some risk for better potential returns. Considers a balanced approach.',
    suitableProducts: ['Stocks & Shares ISA', 'Mixed Investment Funds', 'Corporate Bonds'],
    typicalAllocation: {
      cash: 20,
      bonds: 40,
      equity: 40
    }
  },
  BALANCED: {
    name: 'Balanced',
    description: 'Seeks a balance between risk and return. Comfortable with market fluctuations.',
    suitableProducts: ['Stocks & Shares ISA', 'Global Equity Funds', 'Mixed Investment Funds'],
    typicalAllocation: {
      cash: 10,
      bonds: 30,
      equity: 60
    }
  },
  ADVENTUROUS: {
    name: 'Adventurous',
    description: 'Willing to accept higher risk for potentially higher returns. Comfortable with volatility.',
    suitableProducts: ['Global Equity Funds', 'Emerging Markets', 'Thematic Funds'],
    typicalAllocation: {
      cash: 5,
      bonds: 15,
      equity: 80
    }
  }
};