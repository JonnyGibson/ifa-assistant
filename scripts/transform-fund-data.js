import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure axios with headers to mimic a browser
const axiosInstance = axios.create({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
    },
    timeout: 10000,
});

// Helper function to parse performance value
function parsePerformanceValue(value) {
    if (!value) return null;
    // Remove any '+' sign and convert to number
    return parseFloat(value.replace('+', '').replace('%', '').trim()) || null;
}

async function getFundData(isin) {
    try {
        // Get summary page data first
        const summaryUrl = `https://markets.ft.com/data/funds/tearsheet/summary?s=${isin}`;
        const summaryResponse = await axiosInstance.get(summaryUrl);
        const $summary = cheerio.load(summaryResponse.data);
        
        // Extract category
        const category = $summary('td:contains("Morningstar category")').next().text().trim();
        
        // Get performance page data
        const performanceUrl = `https://markets.ft.com/data/funds/tearsheet/performance?s=${isin}`;
        const performanceResponse = await axiosInstance.get(performanceUrl);
        const $performance = cheerio.load(performanceResponse.data);
        
        // Find the fund's performance row (first row in the table body)
        const performanceRow = $performance('.mod-ui-table tbody tr').first();
        const cells = performanceRow.find('td');
        
        // Extract performance data from spans with mod-format classes
        const threeYearValue = cells.eq(2).find('span').text().trim();
        const oneYearValue = cells.eq(3).find('span').text().trim();
        const threeMonthValue = cells.eq(5).find('span').text().trim();
        
        // Get the fund name and price
        const fundName = $summary('.mod-tearsheet-overview__header__name').text().trim();
        const priceText = $summary('li:contains("Price")').text().match(/[\d.]+/)?.[0];
        
        return {
            name: fundName,
            price: parseFloat(priceText) || null,
            category: category || null,
            performance: {
                threeYearChange: parsePerformanceValue(threeYearValue),
                oneYearChange: parsePerformanceValue(oneYearValue),
                threeMonthChange: parsePerformanceValue(threeMonthValue)
            }
        };
    } catch (error) {
        console.error(`Error fetching data for ISIN ${isin}:`, error.message);
        return {
            name: null,
            price: null,
            category: null,
            performance: {
                threeYearChange: null,
                oneYearChange: null,
                threeMonthChange: null
            }
        };
    }
}

async function transformFundData() {
    try {
        // Read the existing funds data
        const fundsPath = path.join(__dirname, '../fund_data/funds.json');
        const funds = JSON.parse(fs.readFileSync(fundsPath, 'utf8'));
        
        const transformedFunds = [];
        
        for (const fund of funds) {
            console.log(`Processing fund: ${fund.name || fund.isin}`);
            
            // Add delay between requests
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            // Get updated fund data
            const fundData = await getFundData(fund.isin);
            
            // Create transformed fund object
            const transformedFund = {
                isin: fund.isin,
                sedol: fund.sedol,
                name: fundData.name || fund.name,
                price: fundData.price || fund.price,
                currency: fund.currency || 'GBP',
                category: fundData.category,
                lastUpdated: new Date().toISOString(),
                performance: fundData.performance,
                allocation: fund.allocation || {},
                links: {
                    ft: `https://markets.ft.com/data/funds/tearsheet/summary?s=${fund.isin}`,
                    performance: `https://markets.ft.com/data/funds/tearsheet/performance?s=${fund.isin}`
                }
            };
            
            transformedFunds.push(transformedFund);
        }
        
        // Write the transformed data to a new file
        const outputPath = path.join(__dirname, '../fund_data/transformed_funds.json');
        fs.writeFileSync(outputPath, JSON.stringify(transformedFunds, null, 2));
        console.log(`Transformed ${transformedFunds.length} funds successfully!`);
        
    } catch (error) {
        console.error('Error transforming fund data:', error);
    }
}

// Create package.json for dependencies if it doesn't exist
const packageJson = {
    "name": "fund-data-transformer",
    "version": "1.0.0",
    "dependencies": {
        "axios": "^1.6.0",
        "cheerio": "^1.0.0-rc.12"
    },
    "type": "module"
};

// Write package.json if it doesn't exist
const packagePath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packagePath)) {
    fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
}

// Execute the transformation
transformFundData().catch(console.error); 