export class FundService {
  constructor(db) {
    this._db = db;
    this._fundsTable = db.funds;
    this._holdingsTable = db.holdings;
  }

  async getAllFunds() {
    const funds = await this._fundsTable.toArray();
    const holdings = await this._holdingsTable.toArray();
    
    // Calculate portfolio counts for each fund
    const portfolioCounts = {};
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
  }

  async getFundsByRiskProfile(riskProfile) {
    return this._fundsTable
      .filter(fund => fund.riskProfile === riskProfile)
      .toArray();
  }

  async recommendFundsForAccount(accountType, clientRiskProfile, existingHoldings = []) {
    // Get all funds suitable for the client's risk profile
    const suitableFunds = await this.getFundsByRiskProfile(clientRiskProfile);
    
    // Filter funds based on account type suitability
    const eligibleFunds = suitableFunds.filter(fund => {
      switch(accountType.toLowerCase()) {
        case 'isa':
        case 'gia':
          return !fund.restrictedToCompanyPension;
        case 'pension':
          return true; // All funds can be held in pensions
        default:
          return true;
      }
    });

    // Remove funds that are already held
    const existingFundIds = new Set(existingHoldings.map(h => h.fundId));
    const newFundOptions = eligibleFunds.filter(fund => !existingFundIds.has(fund.id));

    // Select 2-7 funds based on risk profile and account type
    const numFundsToRecommend = Math.floor(Math.random() * 6) + 2; // 2-7 funds
    const recommendedFunds = this._diversifyFundSelection(newFundOptions, numFundsToRecommend);

    return recommendedFunds.map(fund => ({
      fund,
      recommendedAllocation: this._calculateRecommendedAllocation(recommendedFunds.length)
    }));
  }

  _diversifyFundSelection(funds, count) {
    // Ensure diverse fund selection across different categories
    const categories = new Set(funds.map(f => f.category));
    const selected = [];

    // First, try to select one fund from each category
    for (const category of categories) {
      if (selected.length >= count) break;
      
      const fundsInCategory = funds.filter(f => f.category === category);
      if (fundsInCategory.length > 0) {
        selected.push(fundsInCategory[Math.floor(Math.random() * fundsInCategory.length)]);
      }
    }

    // If we need more funds, randomly select from remaining funds
    while (selected.length < count && funds.length > selected.length) {
      const remaining = funds.filter(f => !selected.includes(f));
      if (remaining.length === 0) break;
      
      selected.push(remaining[Math.floor(Math.random() * remaining.length)]);
    }

    return selected;
  }

  _calculateRecommendedAllocation(numFunds) {
    // Simple equal weight distribution for now
    return Math.floor(100 / numFunds);
  }

  async createFund(fundData) {
    // Validate required fields
    if (!fundData.name || !fundData.isin || !fundData.sedol) {
      throw new Error('Fund name, ISIN, and SEDOL are required');
    }

    // Check for duplicate ISIN/SEDOL
    const existing = await this._fundsTable
      .where('isin')
      .equals(fundData.isin)
      .or('sedol')
      .equals(fundData.sedol)
      .first();

    if (existing) {
      throw new Error('Fund with this ISIN or SEDOL already exists');
    }

    return this._fundsTable.add({
      ...fundData,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }

  async updateFundPrice(fundId, price, date = new Date()) {
    const fund = await this._fundsTable.get(fundId);
    if (!fund) throw new Error('Fund not found');

    return this._fundsTable.update(fundId, {
      currentPrice: price,
      lastPriceUpdate: date,
      updatedAt: new Date()
    });
  }

  async getFundPerformance(fundId, startDate, endDate = new Date()) {
    const fund = await this._fundsTable.get(fundId);
    if (!fund) throw new Error('Fund not found');

    // This would typically fetch historical price data from another table
    // For now, we'll return a simplified performance object
    return {
      fundId,
      startDate,
      endDate,
      startPrice: fund.historicalPrices?.[startDate] || fund.currentPrice,
      endPrice: fund.currentPrice,
      performance: this._calculatePerformance(
        fund.historicalPrices?.[startDate] || fund.currentPrice,
        fund.currentPrice
      )
    };
  }

  _calculatePerformance(startPrice, endPrice) {
    return ((endPrice - startPrice) / startPrice) * 100;
  }

  async getFundById(fundId) {
    const fund = await this._fundsTable.get(fundId);
    if (!fund) return null;

    return {
      ...fund,
      ftLink: fund.links?.ft || null,
      performanceLink: fund.links?.performance || null
    };
  }

  async updateFundCategories(progressCallback) {
    try {
      if (progressCallback) {
        progressCallback({ status: 'starting', message: 'Starting fund update process...' });
      }

      const response = await fetch('/api/funds/update', {
        method: 'POST'
      });

      if (!response.ok) {
        throw new Error('Failed to start fund update');
      }

      // Load the updated funds data
      const response2 = await fetch('/fund_data/transformed_funds.json');
      if (!response2.ok) {
        throw new Error('Failed to load updated fund data');
      }

      const updatedFunds = await response2.json();
      
      // Update the funds in IndexedDB
      await this._db.transaction('rw', this._fundsTable, async () => {
        await this._fundsTable.clear();
        await this._fundsTable.bulkAdd(updatedFunds);
      });

      if (progressCallback) {
        progressCallback({ 
          status: 'completed', 
          message: `Successfully updated ${updatedFunds.length} funds`,
          total: updatedFunds.length
        });
      }

      return true;
    } catch (error) {
      console.error('Error updating funds:', error);
      if (progressCallback) {
        progressCallback({ 
          status: 'error', 
          message: `Error updating funds: ${error.message}` 
        });
      }
      throw error;
    }
  }
}