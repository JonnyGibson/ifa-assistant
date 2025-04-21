import { ACCOUNT_TYPES } from './productTypes';

export class InvestmentAccount {
  constructor(data) {
    this.id = data.id;
    this.clientId = data.clientId;
    this.type = data.type;
    this.provider = data.provider;
    this.accountNumber = data.accountNumber;
    this.dateOpened = new Date(data.dateOpened);
    this.status = data.status || 'active';
    this.holdings = data.holdings || [];
    this.contributions = data.contributions || [];
    this.lastValuation = data.lastValuation;
    this.lastValuationDate = data.lastValuationDate ? new Date(data.lastValuationDate) : null;
  }

  static validate(data) {
    if (!data.clientId) throw new Error('Client ID is required');
    if (!data.type || !ACCOUNT_TYPES.includes(data.type)) {
      throw new Error(`Invalid account type. Must be one of: ${ACCOUNT_TYPES.join(', ')}`);
    }
    if (!data.provider) throw new Error('Provider is required');
    if (!data.accountNumber) throw new Error('Account number is required');
  }

  addHolding(fundId, units, price, date = new Date()) {
    if (!fundId || !units || !price) {
      throw new Error('Fund ID, units, and price are required');
    }

    const existingHolding = this.holdings.find(h => h.fundId === fundId);
    if (existingHolding) {
      // Update existing holding
      existingHolding.unitsHeld += units;
      existingHolding.purchasePrice = (existingHolding.purchasePrice + price) / 2; // Average price
      existingHolding.purchaseDate = date;
    } else {
      // Add new holding
      this.holdings.push({
        fundId,
        unitsHeld: units,
        purchasePrice: price,
        purchaseDate: date
      });
    }
  }

  removeHolding(fundId) {
    const index = this.holdings.findIndex(h => h.fundId === fundId);
    if (index === -1) throw new Error('Holding not found');
    this.holdings.splice(index, 1);
  }

  updateHolding(fundId, updates) {
    const holding = this.holdings.find(h => h.fundId === fundId);
    if (!holding) throw new Error('Holding not found');
    Object.assign(holding, updates);
  }

  addContribution(amount, date = new Date()) {
    if (!amount || amount <= 0) {
      throw new Error('Contribution amount must be greater than 0');
    }

    this.contributions.push({
      amount,
      date: new Date(date),
      type: 'contribution'
    });
  }

  calculateTotalValue() {
    return this.holdings.reduce((total, holding) => {
      const currentPrice = holding.fund?.currentPrice || holding.purchasePrice;
      return total + (holding.unitsHeld * currentPrice);
    }, 0);
  }

  getTotalContributions() {
    return this.contributions.reduce((total, contribution) => {
      return total + contribution.amount;
    }, 0);
  }

  getPerformance() {
    const totalValue = this.calculateTotalValue();
    const totalContributions = this.getTotalContributions();
    
    if (totalContributions === 0) return 0;
    
    return ((totalValue - totalContributions) / totalContributions) * 100;
  }
}