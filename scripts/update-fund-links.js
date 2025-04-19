import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the ISINs list
const isinsPath = path.join(__dirname, '../fund_data/isins.json');
const isins = JSON.parse(fs.readFileSync(isinsPath, 'utf8'));

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

// Function to convert ISIN to SEDOL
function isinToSedol(isin) {
    if (!isin || isin.length !== 12) return null;
    
    // Remove country code (first 2 characters)
    let code = isin.substring(2);
    // Remove check digit (last character)
    code = code.substring(0, code.length - 1);
    // Remove leading zeros
    code = code.replace(/^0+/, '');
    
    return code;
}

// Function to extract text from a table row by label
function extractTableData($, label) {
    const text = $(`td:contains("${label}")`).next().text().trim();
    return text === '--' ? null : text;
}

async function getFTFundData(isin) {
    try {
        const url = `https://markets.ft.com/data/funds/tearsheet/summary?s=${isin}`;
        const response = await axiosInstance.get(url);
        const $ = cheerio.load(response.data);
        
        // Extract fund name
        const fundName = $('.mod-tearsheet-overview__header__name').text().trim();
        if (!fundName) {
            console.warn(`No fund name found for ISIN ${isin}, skipping...`);
            return null;
        }

        // Basic fund data
        const fundData = {
            isin: isin,
            sedol: isinToSedol(isin),
            name: fundName,
            price: parseFloat($('li:contains("Price")').text().match(/[\d.]+/)?.[0] || '0'),
            currency: 'GBP',
            lastUpdated: new Date().toISOString(),
            
            // Profile data
            profile: {
                fundType: extractTableData($, 'Fund type'),
                launchDate: extractTableData($, 'Launch date'),
                domicile: extractTableData($, 'Domicile'),
                incomeTreatment: extractTableData($, 'Income treatment'),
                category: extractTableData($, 'Morningstar category'),
            },
            
            // Investment details
            investment: {
                minInitialInvestment: extractTableData($, 'Min. initial investment'),
                minAdditionalInvestment: extractTableData($, 'Min. additional investment'),
                annualCharge: extractTableData($, 'Max annual charge'),
                ongoingCharge: extractTableData($, 'Net expense ratio'),
            },
            
            // Performance data (if available)
            performance: {
                oneYearChange: $('td:contains("1 Year change")').next().text().trim().replace('%', ''),
            },
            
            // Asset allocation
            allocation: {
                nonUKBond: parseFloat($('td:contains("Non-UK bond")').next().text().trim().replace('%', '') || '0'),
                ukBond: parseFloat($('td:contains("UK bond")').next().text().trim().replace('%', '') || '0'),
                cash: parseFloat($('td:contains("Cash")').next().text().trim().replace('%', '') || '0'),
            },
            
            // Links
            links: {
                ft: url,
                performance: url.replace('summary', 'performance'),
            }
        };

        // Extract top 5 holdings if available
        const holdings = [];
        $('table:contains("Top 5 holdings") tr').each((i, row) => {
            const cols = $(row).find('td');
            if (cols.length >= 2) {
                const holding = {
                    name: $(cols[0]).text().trim(),
                    weight: parseFloat($(cols[1]).text().trim().replace('%', '')) || 0
                };
                if (holding.name && !holding.name.includes('Top 5 holdings')) {
                    holdings.push(holding);
                }
            }
        });
        fundData.topHoldings = holdings;

        return fundData;
    } catch (error) {
        console.error(`Error fetching data for ISIN ${isin}:`, error.message);
        return null;
    }
}

async function updateFundData() {
    const updatedFunds = [];
    
    for (const isin of isins) {
        if (!isin.startsWith('GB')) continue; // Only process GB ISINs for now
        
        console.log(`Processing ISIN: ${isin}...`);
        
        // Add delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const fundData = await getFTFundData(isin);
        if (fundData) {
            updatedFunds.push(fundData);
        }
    }
    
    // Write the updated data to a new file
    const outputPath = path.join(__dirname, '../fund_data/funds.json');
    fs.writeFileSync(outputPath, JSON.stringify(updatedFunds, null, 2));
    console.log(`Updated ${updatedFunds.length} funds successfully!`);
}

// Execute the update
updateFundData().catch(console.error);

// Create package.json for dependencies
const packageJson = {
    "name": "fund-data-updater",
    "version": "1.0.0",
    "dependencies": {
        "axios": "^1.6.0",
        "cheerio": "^1.0.0-rc.12"
    },
    "type": "module"
};

// Write package.json
fs.writeFileSync(
    path.join(__dirname, 'package.json'), 
    JSON.stringify(packageJson, null, 2)
); 