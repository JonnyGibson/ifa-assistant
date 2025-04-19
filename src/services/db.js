import Dexie from 'dexie';

// --- Static Data --- (Keep existing name/occupation data for client generation)
const nameData = {
  surnames: [
    "Smith", "Jones", "Taylor", "Brown", "Williams", "Wilson", "Evans", "Thomas",
    "Johnson", "Roberts", "Walker", "Wright", "Thompson", "White", "Hall", "Lewis",
    "Clark", "Young", "Harris", "Edwards", "Turner", "Martin", "Cooper", "Hill",
    "Ward", "Green", "Baker", "Adams", "Allen", "King", "Morris", "Scott",
    "Watson", "Moore", "Morgan", "Jackson", "Davies", "Hughes", "Price", "Cook"
  ],
  firstNames: {
    men: [
      "Oliver", "George", "Harry", "Jack", "Charlie", "Thomas", "Jacob", "Noah",
      "William", "Ethan", "James", "Alexander", "Henry", "Michael", "Samuel", "Daniel",
      "Matthew", "Luke", "Benjamin", "Nathan", "Ryan", "Joseph", "David", "Adam",
      "Mason", "Sebastian", "Oscar", "Liam", "Arthur", "Lucas"
    ],
    women: [
      "Olivia", "Sophia", "Emily", "Isabella", "Ava", "Amelia", "Charlotte", "Ella",
      "Grace", "Jessica", "Lucy", "Lily", "Evie", "Sophie", "Mia", "Freya",
      "Hannah", "Florence", "Alice", "Poppy"
    ]
  }
};

const occupations = [ // Can repurpose for clients if needed, or remove if not relevant
  "Software Engineer", "Teacher", "Doctor", "Nurse", "Solicitor", "Police Officer",
  "Firefighter", "Electrician", "Plumber", "Chef", "Architect", "Civil Engineer",
  "Accountant", "Graphic Designer", "Marketing Manager", "Journalist", "Social Worker",
  "Physiotherapist", "Pharmacist", "Dentist", "Veterinarian", "Retail Manager",
  "Construction Worker", "Mechanic", "Train Driver", "Bus Driver", "Estate Agent",
  "Paramedic", "Counsellor", "Data Analyst"
];

// Define standard interaction types at module scope
const INTERACTION_TYPES = [
  { id: 1, name: 'Meeting', description: 'Face-to-face or virtual meeting' },
  { id: 2, name: 'Call', description: 'Phone call conversation' },
  { id: 3, name: 'Email', description: 'Email correspondence' },
  { id: 4, name: 'Review', description: 'Periodic portfolio or plan review' },
  { id: 5, name: 'Note', description: 'General internal note or observation' }
];

// UK postcodes format generator
const generatePostcode = () => {
  const areas = ['L', 'M', 'B', 'S', 'G', 'E', 'W', 'N', 'CM', 'CR', 'BR', 'SW', 'SE'];
  const numbers = '0123456789';
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  const area = areas[Math.floor(Math.random() * areas.length)];
  const district = Math.floor(Math.random() * 99);
  const space = ' ';
  const walk = letters.charAt(Math.floor(Math.random() * letters.length)) +
               letters.charAt(Math.floor(Math.random() * letters.length));
  
  return `${area}${district}${space}${walk}`;
};

// UK phone number generator
const generatePhoneNumber = () => {
  const prefixes = ['07700', '07800', '07900', '07500', '07400'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const number = Math.floor(Math.random() * 900000 + 100000);
  return `${prefix} ${number}`;
};

// UK address generator
const generateAddress = () => {
  const streets = ['High Street', 'Station Road', 'Church Lane', 'Mill Road', 'Victoria Road', 
                  'Green Lane', 'Manor Road', 'Church Street', 'Park Road', 'Queens Road'];
  const cities = ['London', 'Manchester', 'Birmingham', 'Liverpool', 'Glasgow', 
                 'Edinburgh', 'Leeds', 'Bristol', 'Cardiff', 'Newcastle'];
  
  const houseNumber = Math.floor(Math.random() * 200) + 1;
  const street = streets[Math.floor(Math.random() * streets.length)];
  const city = cities[Math.floor(Math.random() * cities.length)];
  const postcode = generatePostcode();
  
  return {
    street: `${houseNumber} ${street}`,
    city,
    postcode
  };
};

// --- Helper Functions for Seeding ---

// Generate a random date within the last N years
const generateRandomDate = (yearsBack = 5) => {
  const now = Date.now();
  const past = now - yearsBack * 365 * 24 * 60 * 60 * 1000;
  return new Date(past + Math.random() * (now - past));
};

// Generate a plausible Date of Birth (18-80 years old)
const generateDOB = () => {
  const now = new Date();
  const maxAge = 80;
  const minAge = 18;
  const birthYear = now.getFullYear() - minAge - Math.floor(Math.random() * (maxAge - minAge));
  const birthMonth = Math.floor(Math.random() * 12);
  const birthDay = Math.floor(Math.random() * 28) + 1; // Keep it simple
  return new Date(birthYear, birthMonth, birthDay);
};

// Add a function to load the funds data
const loadFundsData = async () => {
  try {
    const response = await fetch('/fund_data/transformed_funds.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const fundsData = await response.json();
    
    // Create a Map to deduplicate funds by ISIN
    const uniqueFundsMap = new Map();
    
    // First pass - collect latest data for each ISIN
    fundsData.forEach((fund) => {
      const existing = uniqueFundsMap.get(fund.isin);
      if (!existing || new Date(fund.lastUpdated) > new Date(existing.lastUpdated)) {
        // Fix duplicate text in names and clean up special characters
        const cleanName = fund.name.replace(/(.+)\1/, '$1').trim().replace(/[^\x00-\x7F]/g, '');
        uniqueFundsMap.set(fund.isin, {
          ...fund,
          name: cleanName
        });
      }
    });
    
    // Convert Map back to array and add IDs
    const uniqueFunds = Array.from(uniqueFundsMap.values()).map((fund, index) => ({
      id: index + 1,
      isin: fund.isin,
      sedol: fund.sedol,
      name: fund.name,
      price: fund.price,
      currency: fund.currency,
      category: fund.category,
      performance: fund.performance,
      allocation: fund.allocation,
      links: fund.links,
      lastUpdated: fund.lastUpdated
    }));

    console.log(`💰 Imported ${uniqueFunds.length} unique funds`);
    return uniqueFunds;
  } catch (error) {
    console.error('Error loading funds data:', error);
    return [];
  }
};

// Update generateSeedData to be async
const generateSeedData = async () => {
  console.log('🌱 Generating new seed data for IFA Portal...');
  
  const ifaUsers = [];
  const clients = [];
  let funds = [];
  const holdings = [];
  const interactions = [];

  // 1. Generate IFA Users (1 admin, 2 normal)
  ifaUsers.push({ id: 1, username: 'admin.ifa', email: 'admin@ifa.com', password: 'password', firstName: 'Admin', lastName: 'Advisor', isAdmin: true, createdAt: new Date() });
  ifaUsers.push({ id: 2, username: 'john.doe', email: 'john.doe@ifa.com', password: 'password', firstName: 'John', lastName: 'Doe', isAdmin: false, createdAt: new Date() });
  ifaUsers.push({ id: 3, username: 'jane.smith', email: 'jane.smith@ifa.com', password: 'password', firstName: 'Jane', lastName: 'Smith', isAdmin: false, createdAt: new Date() });
  console.log(`👥 Generated ${ifaUsers.length} IFA users.`);

  // 2. Process imported funds data
  try {
    funds = await loadFundsData();
    console.log(`💰 Imported ${funds.length} unique funds from transformed_funds.json`);
  } catch (error) {
    console.error('Error processing funds:', error);
    console.error('Error details:', error.message);
    funds = []; // Fallback to empty array if import fails
  }

  // 3. Generate Clients (50 samples) & Interactions based on requirements
  const riskProfiles = ['Averse', 'Minimal', 'Cautious', 'Open', 'Eager'];
  
  // Distribution weights for risk profiles (making Cautious most common, Averse and Eager least common)
  const riskProfileWeights = {
    'Averse': 0.1,    // 10% chance
    'Minimal': 0.2,   // 20% chance
    'Cautious': 0.4,  // 40% chance
    'Open': 0.2,      // 20% chance
    'Eager': 0.1      // 10% chance
  };

  const getWeightedRiskProfile = () => {
    const rand = Math.random();
    let cumulativeWeight = 0;
    
    for (const [profile, weight] of Object.entries(riskProfileWeights)) {
      cumulativeWeight += weight;
      if (rand <= cumulativeWeight) {
        return profile;
      }
    }
    return 'Cautious'; // Default fallback
  };

  const now = Date.now();
  const threeMonthsAgo = now - (3 * 30 * 24 * 60 * 60 * 1000);
  const sixMonthsAgo = now - (6 * 30 * 24 * 60 * 60 * 1000);
  const oneYearAgo = now - (12 * 30 * 24 * 60 * 60 * 1000);

  for (let i = 0; i < 50; i++) {
    const clientId = i + 1; // Simple sequential ID for seeding
    const isMale = Math.random() > 0.5;
    const firstName = isMale 
      ? nameData.firstNames.men[Math.floor(Math.random() * nameData.firstNames.men.length)]
      : nameData.firstNames.women[Math.floor(Math.random() * nameData.firstNames.women.length)];
    const lastName = nameData.surnames[Math.floor(Math.random() * nameData.surnames.length)];
    const assignedIFA = ifaUsers[Math.floor(Math.random() * ifaUsers.length)]; // Randomly assign an IFA

    clients.push({
      id: clientId,
      firstName,
      lastName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@email.com`,
      phone: generatePhoneNumber(),
      address: generateAddress(),
      dateOfBirth: generateDOB(),
      riskProfile: getWeightedRiskProfile(), // Use weighted distribution
      assignedIFAUserId: assignedIFA.id, 
      createdAt: generateRandomDate(2) // Client onboarded in last 2 years
    });

    // 4. Generate Holdings for this Client (3-8 funds, but not more than available)
    const maxPossibleHoldings = Math.min(8, funds.length);
    const minHoldings = Math.min(3, maxPossibleHoldings);
    const numHoldings = Math.floor(Math.random() * (maxPossibleHoldings - minHoldings + 1)) + minHoldings;
    
    // Randomly select funds without replacement
    const availableFunds = [...funds];
    const selectedFunds = [];
    
    for (let j = 0; j < numHoldings && availableFunds.length > 0; j++) {
      const randomIndex = Math.floor(Math.random() * availableFunds.length);
      selectedFunds.push(availableFunds.splice(randomIndex, 1)[0]);
    }
    
    selectedFunds.forEach(fund => {
      const unitsHeld = Math.floor(Math.random() * 5000) + 500; // 500-5500 units
      holdings.push({
        clientId: clientId,
        fundId: fund.id,
        unitsHeld: unitsHeld,
        acquisitionDate: generateRandomDate(1) // Acquired in the last year
      });
    });

    // 5. Generate Interactions based on Client ID Grouping
    let numInteractions = 0;
    let interactionStartDate = oneYearAgo; // Default oldest

    const generateInteractionNote = (interactionType, clientRiskProfile) => {
      const meetingReasons = [
        "Annual portfolio review and rebalancing discussion",
        "Retirement planning consultation - discussing pension options and drawdown strategies",
        "Estate planning and inheritance tax discussion",
        "Investment strategy review in light of market conditions",
        "Life changes discussion - new job and pension transfer options",
        "Risk profile reassessment - considering changes to investment approach",
        "Tax year-end planning and ISA allocation review",
        "Discussion about new investment opportunities and market outlook",
        "Family wealth planning and intergenerational wealth transfer",
        "Insurance and protection needs review"
      ];

      const callReasons = [
        "Quick portfolio valuation update requested",
        "Market volatility concerns - reassurance call",
        "Query about recent fund performance",
        "Discussion about upcoming withdrawal needs",
        "Quick check on ISA contribution status",
        "Question about tax certificates",
        "Clarification on recent investment changes",
        "Update on personal circumstances affecting investments",
        "Query about online account access",
        "Discussion about new address/contact details"
      ];

      const emailReasons = [
        "Sent updated portfolio valuation statement",
        "Provided information about new investment opportunities",
        "Responded to query about fund charges and fees",
        "Sent tax year-end planning reminder",
        "Provided retirement income projection figures",
        "Sent meeting follow-up summary and action points",
        "Provided requested fund factsheets",
        "Sent inheritance tax calculation summary",
        "Provided pension contribution statement",
        "Sent updated risk profile questionnaire"
      ];

      const reviewReasons = [
        "Quarterly portfolio performance review completed",
        "Annual investment strategy review",
        "Risk profile review - ${clientRiskProfile} appetite confirmed",
        "Income withdrawal strategy review",
        "Tax efficiency review of current holdings",
        "Investment costs and charges review",
        "Portfolio rebalancing review",
        "Retirement planning milestone review",
        "Estate planning review",
        "Protection needs review"
      ];

      const noteReasons = [
        "Updated client circumstances - new grandchild",
        "Noted change in retirement timeline",
        "Recorded updated income requirements",
        "Noted interest in ESG investing",
        "Updated client's employment status",
        "Recorded changes to family circumstances",
        "Noted future inheritance expectations",
        "Updated long-term investment goals",
        "Recorded property purchase plans",
        "Noted business sale considerations"
      ];

      let reasons;
      switch (interactionType.name) {
        case 'Meeting':
          reasons = meetingReasons;
          break;
        case 'Call':
          reasons = callReasons;
          break;
        case 'Email':
          reasons = emailReasons;
          break;
        case 'Review':
          reasons = reviewReasons;
          break;
        case 'Note':
          reasons = noteReasons;
          break;
        default:
          reasons = noteReasons;
      }

      return reasons[Math.floor(Math.random() * reasons.length)];
    };

    if (clientId <= 10) { // Group 1: 0 interactions (clients 1-10)
      numInteractions = 0;
    } else if (clientId <= 20) { // Group 2: 3-5 interactions in last year (clients 11-20)
      numInteractions = Math.floor(Math.random() * 3) + 3; // 3 to 5
      interactionStartDate = oneYearAgo;
    } else if (clientId <= 40) { // Group 3: >= 2 interactions in last 6 months (clients 21-40)
      numInteractions = Math.floor(Math.random() * 4) + 2; // 2 to 5
      interactionStartDate = sixMonthsAgo;
    } else { // Group 4: >= 2 interactions in last 3 months (clients 41-50)
      numInteractions = Math.floor(Math.random() * 4) + 2; // 2 to 5
      interactionStartDate = threeMonthsAgo;
    }

    for (let j = 0; j < numInteractions; j++) {
       // Generate date between interactionStartDate and now
       const interactionDate = new Date(interactionStartDate + Math.random() * (now - interactionStartDate));
       // Select a random interaction type ID from the module-scoped constant
       const randomInteractionType = INTERACTION_TYPES[Math.floor(Math.random() * INTERACTION_TYPES.length)];
       
       interactions.push({
        clientId: clientId,
        ifaUserId: assignedIFA.id,
        date: interactionDate,
        interactionTypeId: randomInteractionType.id,
        summaryNotes: generateInteractionNote(randomInteractionType, clients[clients.length - 1].riskProfile)
      });
    }
  }
  console.log(`🧑‍🤝‍🧑 Generated ${clients.length} clients.`);
  console.log(`🧾 Generated ${holdings.length} client holdings.`);
  console.log(`📞 Generated ${interactions.length} client interactions according to frequency requirements.`);

  return { ifaUsers, clients, funds, holdings, interactions, interactionTypes: INTERACTION_TYPES };
};


// --- Database Class ---
class AppDatabase extends Dexie {
  // Declare tables (properties) for type safety/autocompletion
  users; // IFAs
  clients;
  funds;
  holdings;
  interactions;
  sessions; // Keep sessions for IFA login
  interactionTypes; // New table for interaction types

  constructor() {
    super('IFAAssistantDB');
    console.log('📊 Initializing IFA Assistant Database');
    
    this.version(4).stores({ 
      // IFA Users: Use email as the unique login identifier
      users: '++id, &email, username, isAdmin', 
      // Client Data: Index for filtering by assigned IFA
      clients: '++id, assignedIFAUserId, lastName, email', 
      // Investment Funds: ISIN unique, index name for display/search
      funds: '++id, &isin, &sedol, name, category', 
      // Client Holdings: Index clientId for lookup, fundId maybe later
      holdings: '++id, clientId, fundId, unitsHeld', 
      // Client Interactions: Index clientId & date for lookup/sorting, ifaUserId for filtering
      interactions: '++id, clientId, date, ifaUserId, interactionTypeId', 
      // IFA Login Sessions: Index token for lookup
      sessions: '++id, token, userId', 
      // Interaction Types: Name should be unique
      interactionTypes: '++id, &name'
    }).upgrade(tx => {
       console.log("Upgrading database schema from version 3 to 4.");
    });

    // Assign types to properties
    this.users = this.table('users');
    this.clients = this.table('clients');
    this.funds = this.table('funds');
    this.holdings = this.table('holdings');
    this.interactions = this.table('interactions');
    this.sessions = this.table('sessions');
    this.interactionTypes = this.table('interactionTypes');
  }

  async needsSeeding() {
    const typeCount = await this.interactionTypes.count();
    const userCount = await this.users.count(); 
    console.log(`🔍 Checking database state: ${userCount} IFA users, ${typeCount} interaction types found`);
    return userCount === 0 || typeCount === 0; 
  }

  async seed() {
    console.log('🚀 Starting database seeding process...');
    try {
      const seedData = await generateSeedData();
      
      await this.transaction('rw', 
        this.users, this.clients, this.funds, this.holdings,
        this.interactions, this.interactionTypes, 
        async () => {
          console.log('  - Adding Interaction Types...');
          await this.interactionTypes.bulkAdd(seedData.interactionTypes); 
          console.log('  - Adding IFA Users...');
          await this.users.bulkAdd(seedData.ifaUsers);
          console.log('  - Adding Funds...');
          await this.funds.bulkAdd(seedData.funds);
          console.log('  - Adding Clients...');
          await this.clients.bulkAdd(seedData.clients);
          console.log('  - Adding Holdings...');
          await this.holdings.bulkAdd(seedData.holdings);
          console.log('  - Adding Interactions...');
          await this.interactions.bulkAdd(seedData.interactions);
        });
      console.log('✨ Database seeded successfully!');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
      if (error.failures && error.failures.length > 0) {
        console.error('   Dexie specific failures:', error.failures);
      }
      throw error;
    }
  }

  async reset() {
    console.log('🔄 Resetting database...');
    const tablesToClear = [
        this.users, this.clients, this.funds, 
        this.holdings, this.interactions, this.sessions,
        this.interactionTypes
    ];
    // Use Promise.all for potentially faster clearing
    await this.transaction('rw', tablesToClear, async () => {
        console.log('🗑️ Clearing all data...');
        await Promise.all(tablesToClear.map(table => table.clear()));
    });
    console.log('🌱 Starting fresh seed...');
    await this.seed(); 
    console.log('✅ Database reset complete!');
  }
}

export const db = new AppDatabase();

// --- Initialize Database ---
export const initializeDatabase = async () => {
  console.log('🏁 Starting database initialization...');
  try {
    // Ensure DB is open before checking/seeding
    await db.open(); 
    console.log(`✅ Database opened successfully (version ${db.verno})`);

    if (await db.needsSeeding()) {
      console.log('📝 Database appears empty or needs initial seed...');
      await db.seed();
    } else {
      console.log('✅ Database already contains data, no seeding needed');
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    // Improved recovery: Log error, try to delete *and then* re-initialize
    // This handles cases where opening failed due to corruption/version issues.
    try {
      console.warn('🔄 Attempting database recovery (delete & re-initialize)...');
      await db.close(); // Ensure it's closed before deleting
      await Dexie.delete(db.name); // Static Dexie method to delete DB by name
      console.log(`   Database '${db.name}' deleted.`);
      // Create a new instance or re-open the existing one. Re-opening should trigger creation.
      const recoveredDb = new AppDatabase(); // Create new instance
      await recoveredDb.open();
      console.log('   Database re-opened/created.');
      await recoveredDb.seed(); // Seed the fresh database
      console.log('✅ Database recovery successful!');
      // Make sure the exported 'db' points to the recovered instance if necessary
      // Since db is exported, maybe re-assigning is tricky. 
      // A factory function for db instance could be better. For now, assume page reload might be needed.
      alert("Database recovered. Please refresh the page."); 
    } catch (recoveryError) {
      console.error('💥 Database recovery failed:', recoveryError);
      alert("Critical database error. Recovery failed. Please clear browser data or contact support.");
      throw recoveryError; // Throw final error
    }
  }
};

// --- Auth Service (Adapting for IFA Users) ---
export const authService = {
  async login(email, password) {
    // Login uses the 'users' table (IFAs) and queries by email
    console.log(`[AuthService] Attempting login for email: ${email}`)
    const user = await db.users.where('email').equals(email).first();
    
    // Basic password check (replace with hashing in production!)
    if (!user) {
        console.warn(`[AuthService] Login failed: No user found for email ${email}`);
        throw new Error('Invalid IFA credentials');
    }
    if (user.password !== password) { 
        console.warn(`[AuthService] Login failed: Incorrect password for email ${email}`);
        throw new Error('Invalid IFA credentials');
    }
    console.log(`[AuthService] Login successful for ${email}`);

    // Generate session token (replace with secure method in production!)
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    await db.sessions.add({
      userId: user.id, // This is the IFA user's ID
      token,
      createdAt: new Date()
    });
    console.log(`[AuthService] Session created for user ID: ${user.id}`);

    // Return IFA user data (excluding password) and token
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  async logout(token) {
    await db.sessions.where('token').equals(token).delete();
  },

  async getCurrentUser(token) { // Gets the currently logged-in IFA user
    const session = await db.sessions.where('token').equals(token).first();
    if (!session) return null;
    
    // Fetch the IFA user based on session.userId
    const user = await db.users.get(session.userId); 
    if (!user) {
        // Session exists but user doesn't? Clean up session.
        await db.sessions.delete(session.id);
        return null;
    }

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword; // Return IFA user details
  },

  // Register function might not be needed if IFAs are pre-provisioned
  // async register(ifaUserData) { ... } 
};


// --- Data Service (New functions for Clients, Funds, Holdings, Interactions) ---
export const dataService = {

  // == Clients ==
  async getClients(ifaUserId = null) {
    if (ifaUserId) {
      // Get clients assigned to a specific IFA
      return await db.clients.where('assignedIFAUserId').equals(ifaUserId).toArray();
    } else {
      // Get all clients (e.g., for an admin view)
      return await db.clients.toArray();
    }
  },

  async getClientById(clientId) {
    return await db.clients.get(clientId);
  },
  
  // Add/Update/Delete Client functions would go here...
  // async addClient(clientData) { ... }

  // == Funds ==
  async getAllFunds() {
    const funds = await db.funds.toArray();
    
    // Calculate portfolio counts for each fund
    const holdings = await db.holdings.toArray();
    const portfolioCounts = {};
    
    // Count how many unique clients hold each fund
    holdings.forEach(holding => {
      const fund = funds.find(f => f.id === holding.fundId);
      if (fund) {
        portfolioCounts[fund.isin] = (portfolioCounts[fund.isin] || 0) + 1;
      }
    });

    return {
      funds: funds.map(fund => ({
        ...fund,
        ftLink: fund.links?.ft || null,
        performanceLink: fund.links?.performance || null
      })),
      portfolioCounts
    };
  },

  async getFundById(fundId) {
    const fund = await db.funds.get(fundId);
    if (!fund) return null;
    return {
      ...fund,
      ftLink: fund.links?.ft || null,
      performanceLink: fund.links?.performance || null
    };
  },
  
  // Add/Update/Delete Fund functions...

  // == Holdings ==
  async getHoldingsForClient(clientId) {
    const holdings = await db.holdings.where('clientId').equals(clientId).toArray();
    const fundIds = [...new Set(holdings.map(h => h.fundId))];
    const funds = await db.funds.where('id').anyOf(fundIds).toArray();
    
    const fundMap = funds.reduce((map, fund) => {
      map[fund.id] = fund;
      return map;
    }, {});

    return holdings.map(holding => {
      const fund = fundMap[holding.fundId];
      if (!fund) return null;
      
      const currentValue = holding.unitsHeld * fund.price;
      return {
        ...holding,
        fund: {
          name: fund.name,
          isin: fund.isin,
          sedol: fund.sedol,
          category: fund.category,
          price: fund.price,
          currency: fund.currency,
          performance: fund.performance,
          ftLink: fund.links?.ft || null
        },
        currentValue: parseFloat(currentValue.toFixed(2))
      };
    }).filter(Boolean);
  },

  // Add/Update/Delete Holding functions...

  // == Interactions ==
  async getInteractionsForClient(clientId) {
    return await db.interactions
      .where('clientId').equals(clientId)
      .reverse() // Show most recent first
      .sortBy('date');
  },
  
  async addInteraction(interactionData) {
      // Caller must provide interactionTypeId
      if (!interactionData.clientId || !interactionData.ifaUserId || !interactionData.date || !interactionData.interactionTypeId) {
          throw new Error("Missing required fields for interaction (clientId, ifaUserId, date, interactionTypeId).");
      }
      return await db.interactions.add({
         ...interactionData,
         date: new Date(interactionData.date) 
      });
  },

  // Update/Delete Interaction functions...

  // == Settings (Removed, but could be added back if IFA-specific settings needed) ==
  // async getSetting(userId, key) { ... }
  // async setSetting(userId, key, value) { ... }

  // MODIFIED Function: Get info about recent/last interactions
  async getLastInteractionInfo(clientId, recentMonths = 3) {
      const now = new Date();
      // Ensure 'now' is reset for consistent calculation
      const pastDateForRecentCount = new Date(new Date().setMonth(now.getMonth() - recentMonths)); 
      
      // console.log(`[DataService] Getting last interaction info for client ${clientId}, recent since ${pastDateForRecentCount.toISOString()}`);
      
      try {
          // Find the most recent interaction date first
          const lastInteraction = await db.interactions
              .where('clientId').equals(clientId)
              .reverse() // Sort descending by primary key (usually chronological enough if PK is ++id)
              .sortBy('date'); // Explicitly sort by date descending to be sure
          
          const lastDate = lastInteraction.length > 0 ? lastInteraction[0].date : null;
          // console.log(`[DataService] Last interaction date for client ${clientId}: ${lastDate}`);

          // Count interactions within the recent period
          let recentCount = 0;
          if (lastDate) { // Only count if there are any interactions
             recentCount = await db.interactions
                .where('clientId').equals(clientId)
                .and(interaction => interaction.date >= pastDateForRecentCount)
                .count();
          }
          // console.log(`[DataService] Found ${recentCount} interactions since ${pastDateForRecentCount.toISOString()} for client ${clientId}.`);
          
          return { 
              count: recentCount, 
              lastDate: lastDate 
          };

      } catch (error) {
          console.error(`[DataService] Error getting last interaction info for client ${clientId}:`, error);
          return { count: 0, lastDate: null }; // Return default on error
      }
  },

  // == Interaction Types ==
  async getAllInteractionTypes() {
      console.log('[DataService] Fetching all interaction types...');
      try {
          const types = await db.interactionTypes.toArray();
          console.log(`[DataService] Fetched ${types.length} interaction types.`);
          return types;
      } catch (error) {
          console.error('[DataService] Error fetching interaction types:', error);
          return []; 
      }
  }
};