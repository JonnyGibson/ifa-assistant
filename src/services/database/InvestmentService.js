export class InvestmentService {
  constructor(db) {
    this._db = db;
    this._holdingsTable = db.table('holdings');
    this._accountsTable = db.table('accounts');
    this._fundsTable = db.table('funds');
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
      if (!acc[holding.accountId]) {
        acc[holding.accountId] = [];
      }
      const fund = funds.find(f => f.id === holding.fundId);
      if (fund) {
        acc[holding.accountId].push({
          ...holding,
          fund
        });
      }
      return acc;
    }, {});

    // Attach holdings to accounts
    return accounts.map(account => ({
      ...account,
      holdings: holdingsByAccount[account.id] || []
    }));
  }

  async getAccount(accountId) {
    const account = await this._accountsTable.get(accountId);
    if (!account) return null;

    const holdings = await this._holdingsTable
      .where('accountId')
      .equals(accountId)
      .toArray();

    const fundIds = [...new Set(holdings.map(h => h.fundId))];
    const funds = await this._fundsTable
      .where('id')
      .anyOf(fundIds)
      .toArray();

    account.holdings = holdings.map(holding => ({
      ...holding,
      fund: funds.find(f => f.id === holding.fundId)
    })).filter(h => h.fund); // Only include holdings with valid funds

    return account;
  }

  async updateFundPrices(providedIsins = null, progressCallback = null) {
    console.log('[InvestmentService] updateFundPrices invoked, providedIsins:', providedIsins);
    let uniqueISINs;
    if (Array.isArray(providedIsins) && providedIsins.length) {
      uniqueISINs = [...new Set(providedIsins.filter(Boolean))];
      console.log('[InvestmentService] using provided ISIN list:', uniqueISINs);
    } else {
      const holdings = await this._holdingsTable.toArray();
      const fundIds = [...new Set(holdings.map(h => h.fundId).filter(Boolean))];
      const funds = fundIds.length
        ? await this._fundsTable.where('id').anyOf(fundIds).toArray()
        : [];
      uniqueISINs = funds.map(f => f.isin).filter(Boolean);
    }

    if (!uniqueISINs || uniqueISINs.length === 0) {
      console.warn('[InvestmentService] No ISINs found - nothing to update');
      return [];
    }

    const fundRecords = uniqueISINs.length
      ? await this._fundsTable.where('isin').anyOf(uniqueISINs).toArray()
      : [];

    const updatedFunds = [];
    for (const isin of uniqueISINs) {
      const fundRecord = fundRecords.find(f => f.isin === isin);
      const fundId = fundRecord?.id;
      const fundName = fundRecord?.name;
      const previousPrice = fundRecord?.price;

      try {
        const baseUrl = window.location.hostname === 'localhost' ? 
          'http://localhost:8888' : 
          window.location.origin;
        const url = `${baseUrl}/.netlify/functions/getFundPrice?isin=${isin}`;
        
        console.log(`[InvestmentService] fetching price for ${isin} from ${url}`);
        
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch price for ${isin}, status ${response.status}`);
        }

        const data = await response.json();
        const updatedFund = {
          isin,
          id: fundId,
          name: fundName,
          previousPrice,
          price: data.price,
          currency: data.currency,
          lastUpdated: data.timestamp,
          status: 'success'
        };
        
        updatedFunds.push(updatedFund);
        
        if (progressCallback) {
          progressCallback(updatedFund);
        }

      } catch (error) {
        console.error(`Error updating price for ${isin}:`, error);
        const errorFund = {
          isin,
          id: fundId,
          name: fundName,
          previousPrice,
          status: 'error',
          error: error.message
        };
        updatedFunds.push(errorFund);
        
        if (progressCallback) {
          progressCallback(errorFund);
        }
      }
    }

    // Update both holdings and central funds table with new prices
    await this._db.transaction('rw', this._holdingsTable, this._fundsTable, async () => {
      for (const uf of updatedFunds.filter(f => f.status === 'success')) {
        if (uf.id) {
          // Update holdings
          await this._holdingsTable
            .where('fundId')
            .equals(uf.id)
            .modify(holding => {
              if (holding.fund) {
                holding.fund.price = uf.price;
                holding.fund.lastUpdated = uf.lastUpdated;
                holding.fund.currency = uf.currency;
              }
            });

          // Update central funds table
          await this._fundsTable
            .where('id')
            .equals(uf.id)
            .modify(fund => {
              fund.price = uf.price;
              fund.lastUpdated = uf.lastUpdated;
              fund.currency = uf.currency;
            });
        }
      }
    });

    return updatedFunds;
  }
}