  async updateFundPrices() {
    const holdings = await this._holdingsTable.toArray();
    const uniqueISINs = [...new Set(holdings.map(h => h.fund.isin))];
    
    const updatedFunds = [];
    for (const isin of uniqueISINs) {
      try {
        const response = await fetch(`/.netlify/functions/getFundPrice?isin=${isin}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch price for ${isin}`);
        }
        
        const data = await response.json();
        updatedFunds.push({
          isin,
          name: holdings.find(h => h.fund.isin === isin)?.fund.name,
          price: data.price,
          lastUpdated: data.timestamp,
          status: 'success'
        });
      } catch (error) {
        console.error(`Error updating price for ${isin}:`, error);
        updatedFunds.push({
          isin,
          name: holdings.find(h => h.fund.isin === isin)?.fund.name,
          status: 'error',
          error: error.message
        });
      }
    }

    // Update holdings with new prices
    await this._db.transaction('rw', this._holdingsTable, async () => {
      for (const fund of updatedFunds.filter(f => f.status === 'success')) {
        await this._holdingsTable
          .where('fund.isin')
          .equals(fund.isin)
          .modify(holding => {
            holding.fund.price = fund.price;
            holding.fund.lastUpdated = fund.lastUpdated;
          });
      }
    });

    return updatedFunds;
  }