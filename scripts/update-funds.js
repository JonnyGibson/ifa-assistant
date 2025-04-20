import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get command line arguments
const args = process.argv.slice(2);
const targetIsin = args[0];

// Configure axios with rotating user agents
const USER_AGENTS = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0'
];

// Configure axios
const getAxiosInstance = () => {
    const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
    return axios.create({
        headers: {
            'User-Agent': randomUserAgent,
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Connection': 'keep-alive'
        },
        timeout: 30000
    });
};

let axiosInstance = getAxiosInstance();

// Helper Functions
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const parseNumericValue = value => {
    if (!value || value === '--') return null;
    return parseFloat(value.replace(/[+%,]/g, '')) || null;
};

// Retry function with exponential backoff
async function retryWithBackoff(fn, maxRetries = 3, initialDelay = 5000) {
    let retries = 0;
    while (true) {
        try {
            return await fn();
        } catch (error) {
            retries++;
            if (retries > maxRetries) throw error;
            
            const delayTime = initialDelay * Math.pow(2, retries - 1);
            console.log(`\nAttempt ${retries} failed. Retrying in ${delayTime/1000} seconds...`);
            await delay(delayTime);
            axiosInstance = getAxiosInstance();
        }
    }
}

// Main fund data extraction function
async function getFundData(isin) {
    return retryWithBackoff(async () => {
        console.log(`\nProcessing ${isin}...`);
        
        const summaryUrl = `https://markets.ft.com/data/funds/tearsheet/summary?s=${isin}`;
        const performanceUrl = `https://markets.ft.com/data/funds/tearsheet/performance?s=${isin}`;
        
        const [summaryResponse, performanceResponse] = await Promise.all([
            axiosInstance.get(summaryUrl),
            axiosInstance.get(performanceUrl)
        ]);
        
        const $ = cheerio.load(summaryResponse.data);
        const $perf = cheerio.load(performanceResponse.data);

        // Extract fund name
        const fundName = $('.mod-tearsheet-overview__header__name').first().text().trim();
        if (!fundName) {
            console.warn(`No fund name found for ISIN ${isin}, skipping...`);
            return null;
        }

        // Extract price
        let price = null;
        const priceElement = $('.mod-tearsheet-overview__quote__bar li').first();
        if (priceElement.length) {
            const priceLabel = priceElement.find('.mod-ui-data-list__label').text().trim();
            if (priceLabel.toLowerCase().includes('price')) {
                price = parseNumericValue(priceElement.find('.mod-ui-data-list__value').text().trim());
                console.log('Found price:', price);
            }
        }

        // Extract category
        let category = null;
        $('.mod-ui-table--two-column tbody tr').each((i, row) => {
            const label = $(row).find('th').text().trim();
            if (label === 'Morningstar category') {
                category = $(row).find('td').text().trim();
            }
        });

        // Extract performance data
        const performance = {
            fiveYearChange: null,
            threeYearChange: null,
            oneYearChange: null,
            sixMonthChange: null,
            threeMonthChange: null,
            oneMonthChange: null
        };

        // Find the first row of the performance table (fund's performance)
        const performanceRow = $perf('.mod-ui-table--freeze-pane tbody tr').first();
        if (performanceRow.length) {
            console.log('Found performance row');
            const cells = performanceRow.find('td:not(:first-child)');
            cells.each((i, cell) => {
                const valueSpan = $perf(cell).find('span.mod-format--pos, span.mod-format--neg');
                if (valueSpan.length) {
                    const value = parseNumericValue(valueSpan.text().trim());
                    console.log(`Performance column ${i}:`, value);
                    switch(i) {
                        case 0: performance.fiveYearChange = value; break;
                        case 1: performance.threeYearChange = value; break;
                        case 2: performance.oneYearChange = value; break;
                        case 3: performance.sixMonthChange = value; break;
                        case 4: performance.threeMonthChange = value; break;
                        case 5: performance.oneMonthChange = value; break;
                    }
                }
            });
        }

        // Extract allocation data
        const allocation = {
            nonUKStock: 0,
            ukStock: 0,
            nonUKBond: 0,
            ukBond: 0,
            cash: 0,
            other: 0
        };

        // Using the exact table structure for allocation
        $('.mod-ui-table--two-column tbody tr').each((i, row) => {
            const label = $(row).find('td:first-child').text().trim();
            const valueText = $(row).find('td:last-child').text().trim();
            const value = parseNumericValue(valueText);

            if (value !== null) {
                switch(label.toLowerCase()) {
                    case 'uk stock': allocation.ukStock = value; break;
                    case 'non-uk stock': allocation.nonUKStock = value; break;
                    case 'uk bond': allocation.ukBond = value; break;
                    case 'non-uk bond': allocation.nonUKBond = value; break;
                    case 'cash': allocation.cash = value; break;
                    case 'other': allocation.other = value; break;
                }
            }
        });

        // Build final fund data object (without profile and investment sections)
        const fundData = {
            isin,
            sedol: null,
            name: fundName,
            price,
            currency: 'GBP',
            category,
            lastUpdated: new Date().toISOString(),
            performance,
            allocation,
            links: {
                ft: summaryUrl,
                performance: performanceUrl
            }
        };

        console.log('\nExtracted data:');
        console.log('Price:', fundData.price);
        console.log('Category:', fundData.category);
        console.log('Performance:', fundData.performance);
        console.log('Allocation:', fundData.allocation);

        return fundData;
    });
}

// Main update function
async function updateFunds() {
    try {
        // Read existing funds data
        const fundsPath = path.join(__dirname, '../public/fund_data/transformed_funds.json');
        const transformedFunds = JSON.parse(fs.readFileSync(fundsPath, 'utf8'));
        
        // Determine which ISINs to process
        const isins = targetIsin ? [targetIsin] : transformedFunds.map(fund => fund.isin);
        
        console.log(targetIsin ? 
            `Processing single ISIN: ${targetIsin}` : 
            `Processing ${isins.length} funds...`);

        const updatedFunds = [];
        const failedIsins = [];
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < isins.length; i++) {
            const isin = isins[i];
            try {
                if (i > 0) await delay(5000); // 5 second delay between requests
                
                const fundData = await getFundData(isin);
                if (fundData) {
                    if (targetIsin) {
                        const fundIndex = transformedFunds.findIndex(f => f.isin === targetIsin);
                        if (fundIndex !== -1) {
                            transformedFunds[fundIndex] = fundData;
                        }
                    }
                    updatedFunds.push(fundData);
                    successCount++;
                } else {
                    failedIsins.push(isin);
                    failCount++;
                }
            } catch (error) {
                console.error(`Error processing ${isin}:`, error.message);
                failedIsins.push(isin);
                failCount++;
            }
        }
        
        // Write the updated data
        fs.writeFileSync(
            fundsPath, 
            JSON.stringify(targetIsin ? transformedFunds : updatedFunds, null, 2)
        );
        
        if (failedIsins.length > 0) {
            const failedIsinsPath = path.join(__dirname, 'failed_isins.json');
            fs.writeFileSync(failedIsinsPath, JSON.stringify(failedIsins, null, 2));
            console.log(`\nFailed ISINs have been saved to: ${failedIsinsPath}`);
        }
        
        console.log('\nUpdate complete:');
        console.log(`- Successfully updated: ${successCount} funds`);
        console.log(`- Failed: ${failCount} funds`);
        
    } catch (error) {
        console.error('Fatal error:', error);
        process.exit(1);
    }
}

// Run the update
updateFunds().catch(console.error);