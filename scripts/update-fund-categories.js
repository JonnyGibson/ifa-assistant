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

async function getFundCategory(isin, fund) {
    try {
        const url = `https://markets.ft.com/data/funds/tearsheet/summary?s=${isin}`;
        const response = await axiosInstance.get(url);
        const $ = cheerio.load(response.data);

        // Try multiple possible category selectors in order of preference
        const categorySelectors = [
            'td:contains("Morningstar category")',
            'td:contains("Fund type")',
            'td:contains("Category")',
            'td:contains("Investment objective")',
            'td:contains("Investment Strategy")'
        ];
        
        let category = null;
        
        // First try direct category from FT
        for (const selector of categorySelectors) {
            const cell = $(selector);
            if (cell.length > 0) {
                const text = cell.next().text().trim();
                if (text && text !== '--') {
                    category = text;
                    break;
                }
            }
        }

        // If no category found, analyze investment objectives and strategy
        if (!category) {
            const objectives = $('td:contains("Investment objective")').next().text().trim().toLowerCase();
            const strategy = $('td:contains("Investment Strategy")').next().text().trim().toLowerCase();
            const combinedText = objectives + ' ' + strategy;

            if (combinedText.includes('equity income') || combinedText.includes('dividend')) {
                category = 'Equity Income';
            } else if (combinedText.includes('equity') && combinedText.includes('global')) {
                category = 'Global Equity';
            } else if (combinedText.includes('equity') && combinedText.includes('europe')) {
                category = 'European Equity';
            } else if (combinedText.includes('equity') && combinedText.includes('uk')) {
                category = 'UK Equity';
            }
        }

        // If still no category, analyze fund name and asset allocation
        if (!category) {
            const fundName = fund.name.toLowerCase();
            const hasEquityAllocation = fund.allocation.nonUKBond === 0 && fund.allocation.ukBond === 0;
            const hasBondAllocation = fund.allocation.nonUKBond > 0 || fund.allocation.ukBond > 0;

            // Check for "founders" and "owners" which indicates global equity strategy
            if (fundName.includes('founders') || fundName.includes('owners')) {
                category = 'Global Equity';
            } else if (fundName.includes('aktien') || fundName.includes('equity')) {
                if (fundName.includes('income') || fundName.includes('dividend') || fundName.includes('yield')) {
                    category = 'Equity Income';
                } else if (fundName.includes('europe')) {
                    category = 'European Equity';
                } else if (fundName.includes('global')) {
                    category = 'Global Equity';
                } else if (fundName.includes('uk')) {
                    category = 'UK Equity';
                } else if (fundName.includes('japan')) {
                    category = 'Japanese Equity';
                } else {
                    category = 'Equity';
                }
            } else if (fundName.includes('bond') || hasBondAllocation) {
                if (fundName.includes('corporate')) {
                    category = 'Corporate Bond';
                } else if (fundName.includes('government')) {
                    category = 'Government Bond';
                } else {
                    category = 'Fixed Income';
                }
            } else if (fundName.includes('income') || fundName.includes('dividend') || fundName.includes('yield')) {
                if (hasEquityAllocation) {
                    category = 'Equity Income';
                } else {
                    category = 'Income';
                }
            }
        }

        // Final category cleanup and standardization
        if (category) {
            // Standardize similar categories
            if (category.includes('Global') && category.includes('Equity')) {
                category = 'Global Equity';
            } else if (category.includes('Europe') && category.includes('Equity')) {
                category = 'European Equity';
            } else if (category.includes('Japan') && category.includes('Equity')) {
                category = 'Japanese Equity';
            } else if (category.includes('Income') && category.includes('Equity')) {
                category = 'Equity Income';
            }
        }

        return category || 'Unclassified';
    } catch (error) {
        console.error(`Error fetching category for ISIN ${isin}:`, error.message);
        return 'Unclassified';
    }
}

async function updateFundCategories() {
    try {
        // Read the existing transformed funds data
        const fundsPath = path.join(__dirname, '../public/fund_data/transformed_funds.json');
        const funds = JSON.parse(fs.readFileSync(fundsPath, 'utf8'));

        console.log(`Processing ${funds.length} funds...`);

        // Update categories for each fund
        for (let i = 0; i < funds.length; i++) {
            const fund = funds[i];
            console.log(`Processing fund ${i + 1}/${funds.length}: ${fund.name} (${fund.isin})`);
            
            // Add delay between requests to avoid rate limiting
            if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            const category = await getFundCategory(fund.isin, fund);
            fund.category = category;
            
            console.log(`  Category: ${category}`);
        }

        // Write the updated data back to the file
        fs.writeFileSync(fundsPath, JSON.stringify(funds, null, 2));
        console.log('\nFinished updating fund categories!');
        
        // Print category distribution
        const categoryDistribution = funds.reduce((acc, fund) => {
            acc[fund.category] = (acc[fund.category] || 0) + 1;
            return acc;
        }, {});
        
        console.log('\nCategory Distribution:');
        Object.entries(categoryDistribution)
            .sort((a, b) => b[1] - a[1])
            .forEach(([category, count]) => {
                console.log(`${category}: ${count} funds`);
            });

    } catch (error) {
        console.error('Error updating fund categories:', error);
    }
}

// Run the update
updateFundCategories().catch(console.error);