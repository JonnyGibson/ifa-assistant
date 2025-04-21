import Dexie from 'dexie';
import { ClientService } from './ClientService';
import { InvestmentAccountService } from './InvestmentAccountService';
import { InsuranceService } from './InsuranceService';
import { InteractionService } from './InteractionService';
import { UserService } from './UserService';
import { FundService } from './FundService';
import { AuthService } from '../auth/AuthService';
import { generateSeedData } from './seedData';

class IFADatabase extends Dexie {
  constructor() {
    super('IFAAssistantDB');
    console.log('[DB] Initializing IFADatabase constructor');
    
    // Define schema versions
    this.version(1).stores({});

    this.version(6).stores({
      users: '++id, &email, username, isAdmin',
      clients: '++id, assignedIFAUserId, lastName, email, firstName, riskProfile',
      funds: '++id, &isin, &sedol, name, category',
      accounts: '++id, clientId, type, provider, accountNumber, dateOpened',
      holdings: '++id, accountId, fundId, unitsHeld, purchaseDate, purchasePrice',
      insurancePolicies: '++id, clientId, type, provider, policyNumber, startDate, renewalDate',
      interactions: '++id, clientId, date, ifaUserId, interactionTypeId',
      sessions: '++id, token, userId',
      interactionTypes: '++id, &name, category',
      documents: '++id, clientId, type, filename, uploadDate, metadata'
    });

    this.version(7).stores({
      users: '++id, &email, username, isAdmin',
      clients: '++id, lastName, email, firstName, riskProfile',
      funds: '++id, &isin, &sedol, name, category',
      accounts: '++id, clientId, type, provider, accountNumber, dateOpened',
      holdings: '++id, accountId, fundId, unitsHeld, purchaseDate, purchasePrice',
      insurancePolicies: '++id, clientId, type, provider, policyNumber, startDate, renewalDate',
      interactions: '++id, clientId, date, interactionTypeId',
      sessions: '++id, token, userId',
      interactionTypes: '++id, &name, category',
      documents: '++id, clientId, type, filename, uploadDate, metadata'
    }).upgrade(tx => {
      console.log('[DB] Running v7 upgrade...');
      return tx.interactions.toCollection().modify(interaction => {
        delete interaction.ifaUserId;
      }).then(() => {
        return tx.clients.toCollection().modify(client => {
          delete client.assignedIFAUserId;
        });
      });
    });

    this.version(8).stores({
      users: '++id, &email, username, isAdmin',
      clients: '++id, lastName, email, firstName, riskProfile',
      funds: '++id, &isin, &sedol, name, category',
      accounts: '++id, clientId, type, provider, accountNumber, dateOpened, status',
      holdings: '++id, accountId, fundId, unitsHeld, purchaseDate, purchasePrice, [accountId+fundId]',
      insurancePolicies: '++id, clientId, type, provider, policyNumber, startDate, renewalDate',
      interactions: '++id, clientId, date, interactionTypeId',
      sessions: '++id, token, userId',
      interactionTypes: '++id, &name, category',
      documents: '++id, clientId, type, filename, uploadDate, metadata'
    });

    // Initialize services
    console.log('[DB] Creating service instances');
    this.clientService = new ClientService(this);
    this.investmentService = new InvestmentAccountService(this);
    this.insuranceService = new InsuranceService(this);
    this.interactionService = new InteractionService(this);
    this.userService = new UserService(this);
    this.fundService = new FundService(this);
    this.authService = new AuthService(this);
    console.log('[DB] Service instances created');
  }

  async isInitialized() {
    console.log('[DB] Checking if database is initialized...');
    try {
      const userCount = await this.users.count();
      const typeCount = await this.interactionTypes.count();
      const fundCount = await this.funds.count();
      console.log(`[DB] Database check - Users: ${userCount}, Types: ${typeCount}, Funds: ${fundCount}`);
      return userCount > 0 && typeCount > 0 && fundCount > 0;
    } catch (error) {
      console.error('[DB] Database check failed:', error);
      // Return false on error to trigger initialization
      return false;
    }
  }

  async clearAllData() {
    try {
      console.log('[DB] Starting database clearing process');
      await this.transaction('rw', 
        [this.users, this.clients, this.funds, this.accounts, 
         this.holdings, this.insurancePolicies, this.interactions, 
         this.sessions, this.interactionTypes, this.documents],
        async () => {
          // Keep track of admin users before clearing
          console.log('[DB] Preserving admin users');
          const adminUsers = await this.users.where('isAdmin').equals(1).toArray();
          
          // Clear all tables
          console.log('[DB] Clearing all tables');
          await Promise.all([
            this.clients.clear(),
            this.funds.clear(),
            this.accounts.clear(),
            this.holdings.clear(),
            this.insurancePolicies.clear(),
            this.interactions.clear(),
            this.sessions.clear(),
            this.interactionTypes.clear(),
            this.documents.clear(),
            this.users.clear()
          ]);

          // Restore admin users
          console.log('[DB] Restoring admin users');
          await this.users.bulkAdd(adminUsers);
        }
      );
      console.log('[DB] Database cleared successfully');
      return true;
    } catch (error) {
      console.error('[DB] Failed to clear database:', error);
      throw error;
    }
  }

  async initialize(forceReset = false) {
    console.log('[DB] Starting database initialization...');
    try {
      if (forceReset) {
        console.log('[DB] Force reset requested, clearing database...');
        await this.clearAllData();
      } else {
        console.log('[DB] Checking if database needs initialization');
        const initialized = await this.isInitialized();
        if (initialized) {
          console.log('[DB] Database already initialized, skipping initialization');
          return true;
        }
        console.log('[DB] Database needs initialization, continuing...');
      }

      // Step 1: Initialize core tables
      await this.transaction('rw', 
        [this.users, this.interactionTypes], 
        async () => {
          // Add default interaction types
          console.log('[DB] Adding default interaction types...');
          await this.interactionTypes.bulkAdd([
            { id: 1, name: 'Annual Review', category: 'review' },
            { id: 2, name: 'Fact Find', category: 'onboarding' },
            { id: 3, name: 'Risk Assessment', category: 'review' },
            { id: 4, name: 'Investment Review', category: 'review' },
            { id: 5, name: 'Insurance Review', category: 'review' },
            { id: 6, name: 'Phone Call', category: 'communication' },
            { id: 7, name: 'Email', category: 'communication' },
            { id: 8, name: 'Meeting', category: 'communication' },
            { id: 9, name: 'Document Submission', category: 'administrative' }
          ]);

          // Add default admin user if none exists
          console.log('[DB] Checking for admin user...');
          const adminExists = await this.users.where('email').equals('admin@webserve.it').count();
          if (!adminExists) {
            console.log('[DB] Creating default admin user...');
            await this.users.add({
              username: 'admin',
              email: 'admin@webserve.it',
              password: 'admin123',
              firstName: 'Admin',
              lastName: 'User',
              isAdmin: true,
              createdAt: new Date()
            });
            console.log('[DB] Admin user created');
          }
        }
      );

      // Step 2: Load and seed funds
      console.log('[DB] Loading funds data...');
      try {
        console.log('[DB] Fetching fund data from file');
        const response = await fetch('/fund_data/transformed_funds.json');
        if (!response.ok) {
          throw new Error(`Failed to fetch funds data: ${response.status} ${response.statusText}`);
        }
        
        console.log('[DB] Parsing funds JSON');
        const funds = await response.json();
        console.log(`[DB] Seeding ${funds.length} funds...`);
        
        await this.transaction('rw', this.funds, async () => {
          await this.funds.bulkAdd(funds);
          console.log('[DB] Funds added to database');
        });

        // Step 3: Generate and add sample clients
        console.log('[DB] Generating sample client data...');
        const seedData = generateSeedData(50);
        console.log('[DB] Sample data generated');

        // Step 4: Add clients in a separate transaction
        await this.transaction('rw', this.clients, async () => {
          console.log('[DB] Adding sample clients...');
          const clientIds = await this.clients.bulkAdd(
            seedData.map(data => data.client),
            { allKeys: true }
          );
          console.log(`[DB] Added ${clientIds.length} clients`);
          return clientIds;
        }).then(async (clientIds) => {
          // Step 5: Process each client's data in separate transactions
          for (let i = 0; i < clientIds.length; i++) {
            const clientId = clientIds[i];
            const clientData = seedData[i];
            
            console.log(`[DB] Processing client ${i+1}/${clientIds.length}`);
            
            // Add accounts and holdings
            await this.transaction('rw', 
              [this.accounts, this.holdings, this.funds], 
              async () => {
                const allFunds = await this.funds.toArray();
                
                for (const product of clientData.products) {
                  const accountId = await this.accounts.add({
                    clientId,
                    type: product.type,
                    provider: product.provider,
                    accountNumber: `ACC${Math.floor(Math.random() * 1e6)}`,
                    dateOpened: new Date(Date.now() - Math.random() * 5 * 365 * 24 * 3600 * 1000),
                    status: 'active'
                  });

                  const holdingCount = Math.floor(Math.random() * 
                    (product.maxFunds - product.minFunds + 1)) + product.minFunds;
                  
                  const shuffledFunds = [...allFunds].sort(() => 0.5 - Math.random());
                  for (let j = 0; j < holdingCount; j++) {
                    const fund = shuffledFunds[j];
                    await this.holdings.add({
                      accountId,
                      fundId: fund.id,
                      unitsHeld: Math.floor(Math.random() * 91) + 10, // 10-100 units
                      purchaseDate: new Date(Date.now() - Math.random() * 3 * 365 * 24 * 3600 * 1000),
                      purchasePrice: fund.price || 1
                    });
                  }
                }
              }
            );

            // Add insurance policies
            await this.transaction('rw', this.insurancePolicies, async () => {
              for (const policy of clientData.insurancePolicies) {
                const startDate = new Date(Date.now() - Math.random() * 2 * 365 * 24 * 3600 * 1000);
                const renewalDate = new Date(startDate);
                renewalDate.setFullYear(renewalDate.getFullYear() + 1);

                await this.insurancePolicies.add({
                  clientId,
                  type: policy.type,
                  provider: policy.provider,
                  policyNumber: `POL${Math.floor(Math.random() * 1e6)}`,
                  startDate,
                  renewalDate,
                  coverAmount: policy.coverAmount,
                  monthlyPremium: policy.monthlyPremium
                });
              }
            });

            // Add interactions
            await this.transaction('rw', this.interactions, async () => {
              await this.interactions.add({
                clientId,
                date: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 3600 * 1000),
                interactionTypeId: Math.floor(Math.random() * 8) + 1,
                notes: 'Regular client review and portfolio discussion'
              });
            });
          }
        });

        console.log('[DB] Database initialization completed successfully');
        return true;

      } catch (error) {
        console.error('[DB] Failed to load funds data:', error);
        throw error;
      }

    } catch (error) {
      console.error('[DB] Database initialization failed:', error);
      return false;
    }
  }
}

// Create and export database instance
console.log('[DB] Creating database instance');
export const db = new IFADatabase();
console.log('[DB] Database instance created');

// Export services
export const clientService = db.clientService;
export const investmentService = db.investmentService;
export const insuranceService = db.insuranceService;
export const interactionService = db.interactionService;
export const userService = db.userService;
export const fundService = db.fundService;
export const authService = db.authService;

// Removed automatic initialization to prevent conflicts with other initialization calls
// db.initialize().catch(console.error);