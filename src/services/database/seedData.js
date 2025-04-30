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

function generateInteractionNote(typeId, clientFirstName) {
  const templates = {
    1: [ // Meeting
      `Annual review meeting with ${clientFirstName}. Discussed portfolio performance and rebalancing needs.`,
      `Initial consultation with ${clientFirstName} to understand financial goals and risk tolerance.`,
      `Quarterly review meeting. ${clientFirstName} expressed interest in ESG investments.`
    ],
    2: [ // Call
      `Phone call with ${clientFirstName} to discuss recent market volatility and portfolio strategy.`,
      `Follow-up call to clarify pension contribution options.`,
      `${clientFirstName} called to discuss upcoming retirement planning needs.`
    ],
    3: [ // Email
      `Sent portfolio review summary and recommendations to ${clientFirstName}.`,
      `Email correspondence regarding updated risk assessment questionnaire.`,
      `Sent investment proposal and fund recommendations for ISA allocation.`
    ],
    4: [ // Note
      `Updated client risk profile following recent assessment.`,
      `Noted changes in ${clientFirstName}'s retirement planning timeline.`,
      `Recorded updates to family circumstances and protection needs.`
    ],
    5: [ // Review
      `Completed annual investment portfolio review. Performance in line with expectations.`,
      `Conducted protection review. Recommended increasing life cover.`,
      `Pension review completed. Adjustments needed to meet retirement goals.`
    ],
    6: [ // Document
      `Generated annual portfolio performance report for tax year.`,
      `Prepared updated financial plan document incorporating recent changes.`,
      `Processed new ISA transfer documentation.`
    ],
    7: [ // Task
      `Set reminder for next quarterly review meeting.`,
      `Schedule follow-up on pension transfer paperwork.`,
      `Update fact find with new employment details.`
    ],
    8: [ // Other
      `Updated client preferences for communication methods.`,
      `Recorded changes to investment strategy preferences.`,
      `Updated contact details and communication preferences.`
    ],
    9: [ // Admin
      `Updated client records with new address details.`,
      `Processed account rebalancing instructions.`,
      `Updated beneficiary information on pension accounts.`
    ]
  };

  const options = templates[typeId] || templates[8]; // Default to Other if type not found
  return options[Math.floor(Math.random() * options.length)];
}

export async function generateAndSeedData(db, numClients = 50) {
  // 1. Fetch all funds from DB and filter by allowed currencies
  const allFunds = (await db.funds.toArray()).filter(fund => 
    ['GBP', 'EUR', 'USD'].includes(fund.currency)
  );
  if (!allFunds.length) throw new Error('No funds available in database. Seed funds before clients.');

  // Get all advisor users
  const advisorEmails = ['advisor@webserve.it', 'john@webserve.it', 'paul@webserve.it'];
  const advisorUsers = [];
  
  for (const email of advisorEmails) {
    const user = await db.users.where('email').equals(email).first();
    if (user) {
      advisorUsers.push({ id: user.id, email: user.email });
    }
  }
  
  if (!advisorUsers.length) {
    throw new Error('No advisor users found in database');
  }

  // 2. Generate and insert clients, capturing their real DB ids
  const clientData = Array(numClients).fill(null).map(() => ({
    client: generateRandomClient(),
    products: generateAccountProducts(),
    insurancePolicies: generateInsurancePolicies()
  }));

  const clientIds = [];
  // Track number of high-value portfolios created
  let highValuePortfolios = 0;
  const MAX_HIGH_VALUE_PORTFOLIOS = 10; // Maximum number of portfolios > £1M

  for (const c of clientData) {
    const clientId = await db.clients.add({ ...c.client });
    clientIds.push(clientId);

    // 3. For each client, create 1-3 investment accounts (portfolios)
    const numAccounts = c.products.length;
    let clientTotalValue = 0;

    for (let i = 0; i < numAccounts; i++) {
      const product = c.products[i];
      // Pick 2-7 random funds for this account
      const numFunds = Math.floor(Math.random() * (product.maxFunds - product.minFunds + 1)) + product.minFunds;
      const shuffledFunds = allFunds.sort(() => 0.5 - Math.random());
      const selectedFunds = shuffledFunds.slice(0, numFunds);

      // Create account
      const accountId = await db.accounts.add({
        clientId,
        type: product.type,
        provider: product.provider,
        accountNumber: `${product.type}-${Math.floor(Math.random() * 1000000)}`,
        dateOpened: new Date().toISOString(),
        status: 'active'
      });

      // Calculate target portfolio value range based on remaining high-value slots
      const isHighValue = highValuePortfolios < MAX_HIGH_VALUE_PORTFOLIOS && Math.random() < 0.2;
      const targetValue = isHighValue ? 
        Math.random() * 1500000 + 1000000 : // £1M - £2.5M for high value
        Math.random() * 750000 + 50000;     // £50K - £800K for regular

      // Create holdings for this account
      for (const fund of selectedFunds) {
        if (!fund.price) continue;
        
        // Calculate units to achieve target value distribution
        const targetHoldingValue = targetValue / numFunds;
        const units = Math.floor(targetHoldingValue / fund.price);
        
        await db.holdings.add({
          accountId,
          fundId: fund.id,
          unitsHeld: units,
          purchasePrice: fund.price,
          purchaseDate: new Date().toISOString()
        });

        clientTotalValue += units * fund.price;
      }

      if (clientTotalValue > 1000000) {
        highValuePortfolios++;
      }
    }

    // 4. Insert insurance policies for this client
    for (const policy of c.insurancePolicies) {
      await db.insurancePolicies.add({
        ...policy,
        clientId
      });
    }
  }

  // 5. Generate 2-6 interactions per client
  const now = new Date();
  const allInteractions = [];
  for (const clientId of clientIds) {
    const client = clientData.find(c => c.client.id === clientId);
    const clientFirstName = client ? client.client.firstName : 'Client';
    const n = Math.floor(Math.random() * 5) + 2; // 2-6 interactions
    for (let i = 0; i < n; i++) {
      const daysAgo = Math.floor(Math.random() * 365);
      const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      const typeId = Math.floor(Math.random() * 9) + 1;
      // Randomly select an advisor for each interaction
      const user = advisorUsers[Math.floor(Math.random() * advisorUsers.length)];
      
      allInteractions.push({
        clientId,
        date,
        userId: user.id,
        userEmail: user.email,
        interactionTypeId: typeId,
        notes: generateInteractionNote(typeId, clientFirstName)
      });
    }
  }

  // 6. Insert interactions
  for (const interaction of allInteractions) {
    await db.interactions.add(interaction);
  }
}