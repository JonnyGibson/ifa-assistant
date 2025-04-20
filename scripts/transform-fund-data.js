import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function transformFundData() {
    try {
        // Read the funds data from public/fund_data
        const fundsPath = path.join(__dirname, '../public/fund_data/funds.json');
        const funds = JSON.parse(fs.readFileSync(fundsPath, 'utf8'));
        
        const transformedFunds = [];
        
        for (const fund of funds) {
            console.log(`Processing fund: ${fund.name || fund.isin}`);
            
            // Create transformed fund object using existing data
            const transformedFund = {
                isin: fund.isin,
                sedol: fund.sedol,
                name: fund.name,
                price: fund.price,
                currency: fund.currency || 'GBP',
                category: fund.category || 'Unclassified',
                lastUpdated: new Date().toISOString(),
                performance: fund.performance || {
                    threeYearChange: null,
                    oneYearChange: null,
                    threeMonthChange: null
                },
                allocation: fund.allocation || {
                    nonUKBond: 0,
                    ukBond: 0,
                    cash: 0
                },
                links: {
                    ft: `https://markets.ft.com/data/funds/tearsheet/summary?s=${fund.isin}`,
                    performance: `https://markets.ft.com/data/funds/tearsheet/performance?s=${fund.isin}`
                }
            };
            
            transformedFunds.push(transformedFund);
        }
        
        // Write the transformed data to transformed_funds.json
        const outputPath = path.join(__dirname, '../public/fund_data/transformed_funds.json');
        fs.writeFileSync(outputPath, JSON.stringify(transformedFunds, null, 2));
        console.log(`Transformed ${transformedFunds.length} funds successfully!`);
        
    } catch (error) {
        console.error('Error transforming fund data:', error);
    }
}

// Execute the transformation
transformFundData().catch(console.error);