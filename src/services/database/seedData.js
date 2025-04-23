import { ACCOUNT_TYPES } from '../models/productTypes';
import { INSURANCE_TYPES } from '../models/productTypes';

const RISK_PROFILES = ['Conservative', 'Moderate', 'Balanced', 'Growth', 'Aggressive'];

const PROVIDERS = {
  pension: ['Prudential', 'Standard Life', 'Scottish Widows', 'Aegon', 'Royal London'],
  isa: ['Hargreaves Lansdown', 'Fidelity', 'AJ Bell', 'Interactive Investor', 'Vanguard'],
  gia: ['Hargreaves Lansdown', 'Fidelity', 'AJ Bell', 'Interactive Investor', 'Charles Stanley']
};

const UK_CITIES = ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Cardiff', 'Leeds', 'Liverpool', 'Bristol', 'Newcastle', 'Belfast', 'Sheffield', 'Nottingham', 'Southampton', 'Brighton', 'Coventry', 'Plymouth', 'Stoke-on-Trent', 'Derby', 'Wolverhampton'];
const UK_STREETS = ['High Street', 'Church Road', 'Station Road', 'Victoria Road', 'Green Lane', 'Manor Road', 'Kings Road', 'Queen Street'];
const UK_COUNTIES = ['Greater London', 'West Midlands', 'Greater Manchester', 'West Yorkshire', 'Merseyside', 'South Yorkshire', 'Kent', 'Essex'];

function generateRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateUKAddress() {
  const houseNumber = Math.floor(Math.random() * 200) + 1;
  const street = UK_STREETS[Math.floor(Math.random() * UK_STREETS.length)];
  const city = UK_CITIES[Math.floor(Math.random() * UK_CITIES.length)];
  const county = UK_COUNTIES[Math.floor(Math.random() * UK_COUNTIES.length)];
  const postcodePrefixes = ['AB', 'B', 'BA', 'BR', 'BS', 'BT', 'CA', 'CB', 'CF', 'CH', 'CM', 'CO', 'CR', 'CT'];
  const postcode = `${postcodePrefixes[Math.floor(Math.random() * postcodePrefixes.length)]}${Math.floor(Math.random() * 99)} ${Math.floor(Math.random() * 9)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
  
  return {
    line1: `${houseNumber} ${street}`,
    line2: '',
    city,
    county,
    postcode,
    country: 'United Kingdom'
  };
}

function generateRandomFactFind() {
  const now = new Date();
  const twoYearsAgo = new Date(now.setFullYear(now.getFullYear() - 2));
  const lastUpdated = generateRandomDate(twoYearsAgo, now);

  return {
    personal: {
      title: ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr'][Math.floor(Math.random() * 5)],
      nationalInsurance: `${['A', 'B', 'C', 'E', 'G', 'J', 'L', 'M', 'N', 'P'][Math.floor(Math.random() * 10)]}${Math.floor(Math.random() * 1000000)}${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]}`,
      maritalStatus: ['Single', 'Married', 'Civil Partnership', 'Divorced', 'Widowed'][Math.floor(Math.random() * 5)],
      dependents: Array(Math.floor(Math.random() * 4)).fill(null).map(() => ({
        relationship: ['Child', 'Stepchild', 'Parent', 'Grandchild'][Math.floor(Math.random() * 4)],
        age: Math.floor(Math.random() * 18)
      })),
      healthStatus: ['Excellent', 'Good', 'Fair', 'Poor'][Math.floor(Math.random() * 4)],
      smoker: Math.random() < 0.2,
      nationality: 'British',
      taxResidency: 'UK',
      lastUpdated
    },
    employment: {
      status: ['Employed', 'Self-Employed', 'Semi-Retired', 'Retired', 'Business Owner'][Math.floor(Math.random() * 5)],
      occupation: ['Teacher', 'Doctor', 'Engineer', 'Business Owner', 'Accountant', 'Lawyer', 'Manager'][Math.floor(Math.random() * 7)],
      employer: ['NHS', 'Self-Employed', 'ABC Corp', 'XYZ Ltd', 'Local Council'][Math.floor(Math.random() * 5)],
      annualIncome: Math.floor(Math.random() * 150000) + 30000,
      otherIncome: Math.random() < 0.3 ? [{
        source: ['Rental Income', 'Dividends', 'Part-time Work'][Math.floor(Math.random() * 3)],
        amount: Math.floor(Math.random() * 20000) + 5000
      }] : [],
      employmentBenefits: ['Health Insurance', 'Life Insurance', 'Pension', 'Company Car'].filter(() => Math.random() < 0.3),
      yearsInRole: Math.floor(Math.random() * 20) + 1,
      retirementAge: Math.floor(Math.random() * 10) + 65,
      lastUpdated
    },
    financial: {
      monthlyIncome: {
        salary: Math.floor(Math.random() * 150000 + 30000) / 12,
        benefits: Math.floor(Math.random() * 10000) / 12,
        investments: Math.floor(Math.random() * 20000) / 12,
        other: Math.floor(Math.random() * 5000) / 12
      },
      monthlyExpenses: {
        housing: Math.floor(Math.random() * 2000) + 500,
        utilities: Math.floor(Math.random() * 300) + 100,
        transport: Math.floor(Math.random() * 500) + 100,
        loans: Math.floor(Math.random() * 500),
        lifestyle: Math.floor(Math.random() * 1000) + 300
      },
      assets: {
        property: Math.random() < 0.7 ? [{
          type: 'Primary Residence',
          value: Math.floor(Math.random() * 500000) + 200000,
          mortgage: Math.floor(Math.random() * 300000)
        }] : [],
        savings: Math.random() < 0.8 ? [{
          type: 'Cash ISA',
          value: Math.floor(Math.random() * 50000)
        }] : [],
        investments: [],
        pensions: Math.random() < 0.6 ? [{
          provider: ['Standard Life', 'Prudential', 'Aviva'][Math.floor(Math.random() * 3)],
          value: Math.floor(Math.random() * 200000) + 50000
        }] : [],
        other: []
      },
      liabilities: {
        mortgages: Math.random() < 0.7 ? [{
          lender: ['Nationwide', 'Halifax', 'Barclays'][Math.floor(Math.random() * 3)],
          amount: Math.floor(Math.random() * 300000) + 100000,
          monthlyPayment: Math.floor(Math.random() * 1500) + 500
        }] : [],
        loans: Math.random() < 0.3 ? [{
          type: 'Personal Loan',
          amount: Math.floor(Math.random() * 20000) + 5000
        }] : [],
        creditCards: Math.random() < 0.5 ? [{
          provider: ['Visa', 'Mastercard', 'Amex'][Math.floor(Math.random() * 3)],
          balance: Math.floor(Math.random() * 5000)
        }] : [],
        other: []
      },
      lastUpdated
    },
    objectives: {
      shortTerm: [
        'Build emergency fund',
        'Clear credit card debt',
        'Save for home improvements',
        'Start investing regularly'
      ].filter(() => Math.random() < 0.5),
      mediumTerm: [
        'Save for children\'s education',
        'Buy a larger home',
        'Start a business',
        'Invest in property'
      ].filter(() => Math.random() < 0.5),
      longTerm: [
        'Comfortable retirement',
        'Leave inheritance for children',
        'Achieve financial independence',
        'Buy holiday home'
      ].filter(() => Math.random() < 0.5),
      retirementPlans: {
        targetAge: Math.floor(Math.random() * 10) + 60,
        targetIncome: Math.floor(Math.random() * 30000) + 20000,
        existingProvision: []
      },
      riskTolerance: {
        profile: RISK_PROFILES[Math.floor(Math.random() * RISK_PROFILES.length)],
        score: Math.floor(Math.random() * 100),
        lastAssessed: generateRandomDate(twoYearsAgo, now),
        notes: 'Client understands and accepts the risks associated with their chosen investment strategy.'
      },
      investmentPreferences: {
        ethical: Math.random() < 0.3,
        excludedSectors: Math.random() < 0.3 ? ['Tobacco', 'Arms', 'Gambling'].filter(() => Math.random() < 0.5) : [],
        preferredSectors: ['Technology', 'Healthcare', 'Renewable Energy', 'Infrastructure'].filter(() => Math.random() < 0.5),
        notes: ''
      },
      lastUpdated
    },
    protection: {
      existingPolicies: [],
      needs: {
        lifeInsurance: {
          required: Math.random() < 0.6,
          coverAmount: Math.floor(Math.random() * 500000) + 100000,
          notes: ''
        },
        criticalIllness: {
          required: Math.random() < 0.4,
          coverAmount: Math.floor(Math.random() * 300000) + 50000,
          notes: ''
        },
        incomeProtection: {
          required: Math.random() < 0.3,
          coverAmount: Math.floor(Math.random() * 2000) + 1000,
          notes: ''
        },
        privateHealthCare: {
          required: Math.random() < 0.3,
          notes: ''
        }
      },
      lastUpdated
    }
  };
}

function generateRandomClient() {
  const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Emily'];
  const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Wilson', 'Evans'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  // Generate date of birth between 1945 and 2003
  const dob = generateRandomDate(new Date(1945, 0, 1), new Date(2003, 11, 31));

  // Generate a random UK-style phone number
  const phone = `07${Math.floor(100000000 + Math.random() * 900000000)}`;

  // Generate a random client since date in the last 10 years
  const createdAt = generateRandomDate(new Date(new Date().setFullYear(new Date().getFullYear() - 10)), new Date());

  const client = {
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    riskProfile: RISK_PROFILES[Math.floor(Math.random() * RISK_PROFILES.length)],
    dateOfBirth: dob.toISOString().split('T')[0],
    address: generateUKAddress(),
    phone,
    createdAt: createdAt.toISOString(),
    factFind: generateRandomFactFind()
  };

  return client;
}

function generateAccountProducts() {
  // Each client will have 1-3 different account types
  const numAccounts = Math.floor(Math.random() * 3) + 1;
  const selectedTypes = Object.keys(ACCOUNT_TYPES).sort(() => 0.5 - Math.random()).slice(0, numAccounts);
  
  return selectedTypes.map(type => {
    const providers = PROVIDERS[type.toLowerCase()] || PROVIDERS.isa;
    return {
      type,
      provider: providers[Math.floor(Math.random() * providers.length)],
      minFunds: 2, // Minimum number of funds per account
      maxFunds: 7  // Maximum number of funds per account
    };
  });
}

function generateInsurancePolicies() {
  // Each client may have 0-2 insurance policies
  const numPolicies = Math.floor(Math.random() * 3);
  const insuranceTypeKeys = Object.keys(INSURANCE_TYPES);
  return Array(numPolicies).fill(null).map(() => {
    const typeKey = insuranceTypeKeys[Math.floor(Math.random() * insuranceTypeKeys.length)];
    const typeObj = INSURANCE_TYPES[typeKey];
    const provider = typeObj.providers[Math.floor(Math.random() * typeObj.providers.length)];
    const premiumFrequency = Math.random() < 0.5 ? 'monthly' : 'annual';
    return {
      type: typeKey,
      provider,
      coverAmount: Math.floor(Math.random() * 400000) + 100000, // £100k-£500k
      premiumAmount: Math.floor(Math.random() * 80) + 20, // £20-£100
      premiumFrequency,
      startDate: new Date(Date.now() - Math.floor(Math.random() * 2 * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      status: 'active'
    };
  });
}

// Generate interactions for a given client spread over the past year
function generateInteractionsForClient(clientId) {
  const interactions = [];
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  // Determine if this client will be an active one (20% chance)
  const isActiveClient = Math.random() < 0.2;
  
  // Base number of interactions:
  // Active clients: 15-25 interactions per year
  // Regular clients: 4-8 interactions per year
  const baseInteractions = isActiveClient ? 
    Math.floor(Math.random() * 11) + 15 : // 15-25 interactions
    Math.floor(Math.random() * 5) + 4;    // 4-8 interactions

  // Create an array of weeks in the past year
  const weeks = 52;
  const weekBuckets = Array(weeks).fill(0);
  
  // First, ensure minimum weekly contacts across all clients
  for (let week = 0; week < weeks; week++) {
    // 10% chance for each client to have an interaction in any given week
    if (Math.random() < 0.1) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (week * 7));
      const date = new Date(weekStart.getTime() + Math.random() * 7 * 24 * 3600 * 1000);
      
      // Determine interaction type - more likely to have reviews for active clients
      const interactionTypeId = isActiveClient && Math.random() < 0.4 ?
        Math.floor(Math.random() * 3) + 1 : // Types 1-3 are reviews
        Math.floor(Math.random() * 4) + 6;   // Types 6-9 are communication/admin

      interactions.push({
        clientId,
        date,
        interactionTypeId,
        notes: `${isActiveClient ? 'Regular' : 'Standard'} client interaction`
      });
      weekBuckets[week]++;
    }
  }

  // Then add remaining interactions, trying to fill gaps
  for (let i = 0; i < baseInteractions; i++) {
    // Find weeks with fewer interactions
    const weakWeeks = weekBuckets.map((count, index) => ({ count, index }))
      .filter(w => w.count < 2)  // Prefer weeks with less than 2 interactions
      .sort((a, b) => a.count - b.count);
    
    let targetWeek;
    if (weakWeeks.length > 0 && Math.random() < 0.7) {
      // 70% chance to pick a week with fewer interactions
      targetWeek = weakWeeks[Math.floor(Math.random() * weakWeeks.length)].index;
    } else {
      // Otherwise pick a random week
      targetWeek = Math.floor(Math.random() * weeks);
    }

    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - (targetWeek * 7));
    const date = new Date(weekStart.getTime() + Math.random() * 7 * 24 * 3600 * 1000);

    // More likely to be a review for active clients
    const interactionTypeId = isActiveClient && Math.random() < 0.4 ?
      Math.floor(Math.random() * 3) + 1 : // Types 1-3 are reviews
      Math.floor(Math.random() * 4) + 6;   // Types 6-9 are communication/admin

    interactions.push({
      clientId,
      date,
      interactionTypeId,
      notes: `${isActiveClient ? 'Regular' : 'Standard'} client interaction`
    });
    weekBuckets[targetWeek]++;
  }

  // Sort by date
  return interactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export function generateSeedData(numClients = 50) {
  const now = new Date(); // Add this line

  // First generate baseline client data
  const clientData = Array(numClients).fill(null).map(() => ({
    client: generateRandomClient(),
    products: generateAccountProducts(),
    insurancePolicies: generateInsurancePolicies()
  }));

  // Generate interactions for each client
  const allInteractions = [];
  for (let i = 0; i < numClients; i++) {
    const interactions = generateInteractionsForClient(i + 1); // clientIds start at 1
    allInteractions.push(...interactions);
  }

  // Ensure we have at least 5 contacts per week
  const weekBuckets = new Array(52).fill(0);
  allInteractions.forEach(interaction => {
    const weekNumber = Math.floor((now - interaction.date) / (7 * 24 * 3600 * 1000));
    if (weekNumber >= 0 && weekNumber < 52) {
      weekBuckets[weekNumber]++;
    }
  });

  // Add additional interactions for weeks with less than 5 contacts
  weekBuckets.forEach((count, weekIndex) => {
    if (count < 5) {
      const needed = 5 - count;
      for (let i = 0; i < needed; i++) {
        // Pick a random client
        const clientId = Math.floor(Math.random() * numClients) + 1;
        
        // Create interaction for this week
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (weekIndex * 7));
        const date = new Date(weekStart.getTime() + Math.random() * 7 * 24 * 3600 * 1000);
        
        allInteractions.push({
          clientId,
          date,
          interactionTypeId: Math.floor(Math.random() * 9) + 1,
          notes: 'Additional interaction to maintain minimum weekly contact'
        });
      }
    }
  });

  // Final sort of all interactions by date
  allInteractions.sort((a, b) => b.date.getTime() - a.date.getTime());

  return {
    clients: clientData,
    interactions: allInteractions
  };
}