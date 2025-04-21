import { InvestmentAccount } from '../models/InvestmentAccount';
import { ACCOUNT_TYPES } from '../models/productTypes';

export class InvestmentAccountService {
  constructor(db) {
    this._db = db;
    this._accountsTable = db.accounts;
    this._holdingsTable = db.holdings;
    this._fundsTable = db.funds;
  }

  async getAccount(id) {
    if (!id) return null;
    const account = await this._accountsTable.get(id);
    if (!account) return null;

    // Get holdings for this account
    const holdings = await this._holdingsTable
      .where('accountId')
      .equals(id)
      .toArray();

    // Get fund details for each holding
    const fundDetails = await Promise.all(
      holdings.map(async holding => {
        const fund = await this._fundsTable.get(holding.fundId);
        return {
          ...holding,
          fund
        };
      })
    );

    return new InvestmentAccount({
      ...account,
      holdings: fundDetails
    });
  }

  async getClientAccounts(clientId) {
    if (!clientId) return [];
    
    const accounts = await this._accountsTable
      .where('clientId')
      .equals(clientId)
      .toArray();

    // Get holdings for all accounts
    const accountIds = accounts.map(a => a.id);
    const holdings = await this._holdingsTable
      .where('accountId')
      .anyOf(accountIds)
      .toArray();

    // Get all unique fund IDs from holdings
    const fundIds = [...new Set(holdings.map(h => h.fundId))];
    const funds = await this._fundsTable
      .where('id')
      .anyOf(fundIds)
      .toArray();

    // Group holdings by account
    const holdingsByAccount = holdings.reduce((acc, holding) => {
      const fund = funds.find(f => f.id === holding.fundId);
      if (!acc[holding.accountId]) {
        acc[holding.accountId] = [];
      }
      acc[holding.accountId].push({
        ...holding,
        fund
      });
      return acc;
    }, {});

    return accounts.map(account => new InvestmentAccount({
      ...account,
      holdings: holdingsByAccount[account.id] || []
    }));
  }

  async createAccount(accountData) {
    // Validate the account data
    InvestmentAccount.validate(accountData);

    const id = await this._accountsTable.add({
      ...accountData,
      dateOpened: accountData.dateOpened || new Date(),
      status: 'active'
    });

    // If initial holdings are provided, add them
    if (accountData.holdings?.length) {
      await Promise.all(accountData.holdings.map(holding =>
        this.addHolding(id, holding)
      ));
    }

    return this.getAccount(id);
  }

  async addHolding(accountId, holdingData) {
    const account = await this.getAccount(accountId);
    if (!account) throw new Error('Account not found');

    // Check if fund exists
    const fund = await this._fundsTable.get(holdingData.fundId);
    if (!fund) throw new Error('Fund not found');

    // Check if holding already exists
    const existingHolding = await this._holdingsTable
      .where(['accountId', 'fundId'])
      .equals([accountId, holdingData.fundId])
      .first();

    if (existingHolding) {
      // Update existing holding
      await this._holdingsTable.update(existingHolding.id, {
        unitsHeld: existingHolding.unitsHeld + holdingData.unitsHeld,
        purchasePrice: (existingHolding.purchasePrice + holdingData.purchasePrice) / 2 // Average price
      });
    } else {
      // Create new holding
      await this._holdingsTable.add({
        accountId,
        fundId: holdingData.fundId,
        unitsHeld: holdingData.unitsHeld,
        purchasePrice: holdingData.purchasePrice,
        purchaseDate: holdingData.purchaseDate || new Date()
      });
    }

    return this.getAccount(accountId);
  }

  async updateHolding(accountId, fundId, updates) {
    const holding = await this._holdingsTable
      .where(['accountId', 'fundId'])
      .equals([accountId, fundId])
      .first();

    if (!holding) throw new Error('Holding not found');

    await this._holdingsTable.update(holding.id, updates);
    return this.getAccount(accountId);
  }

  async removeHolding(accountId, fundId) {
    const holding = await this._holdingsTable
      .where(['accountId', 'fundId'])
      .equals([accountId, fundId])
      .first();

    if (!holding) throw new Error('Holding not found');

    await this._holdingsTable.delete(holding.id);
    return this.getAccount(accountId);
  }

  async addContribution(accountId, amount, date = new Date()) {
    const account = await this.getAccount(accountId);
    if (!account) throw new Error('Account not found');

    try {
      account.addContribution(amount, date);
      await this.updateAccount(accountId, {
        contributions: account.contributions
      });
      return account;
    } catch (error) {
      throw new Error(`Failed to add contribution: ${error.message}`);
    }
  }

  async closeAccount(id, reason = '', transferDetails = null) {
    const account = await this.getAccount(id);
    if (!account) throw new Error('Account not found');

    await this.updateAccount(id, {
      status: 'closed',
      closureDate: new Date(),
      closureReason: reason,
      transferDetails,
    });

    return this.getAccount(id);
  }

  async getAccountValuation(id) {
    const account = await this.getAccount(id);
    if (!account) throw new Error('Account not found');

    // Get current fund prices and calculate total value
    const totalValue = account.calculateTotalValue();
    
    await this.updateAccount(id, {
      lastValuation: totalValue,
      lastValuationDate: new Date()
    });

    return {
      totalValue,
      holdings: account.holdings.map(holding => ({
        ...holding,
        currentValue: holding.unitsHeld * holding.currentPrice
      })),
      valuationDate: new Date()
    };
  }

  async getAccountsByType(clientId, type) {
    return this._accountsTable
      .where('clientId')
      .equals(clientId)
      .filter(account => account.type === type)
      .toArray();
  }

  async getActiveAccounts(clientId) {
    return this._accountsTable
      .where('clientId')
      .equals(clientId)
      .filter(account => account.status === 'active')
      .toArray();
  }
}