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
        
        // Extract category and ensure it's not empty
        const category = $summary('td:contains("Morningstar category")').next().text().trim() || 
                        $summary('td:contains("Fund type")').next().text().trim();
        
        // Get performance page data
        const performanceUrl = `https://markets.ft.com/data/funds/tearsheet/performance?s=${isin}`;
        const performanceResponse = await axiosInstance.get(performanceUrl);
        const $performance = cheerio.load(performanceResponse.data);
        
        // Find the fund's performance row (first row in the table body)
        const performanceRow = $performance('.mod-ui-table tbody tr').first();
        const cells = performanceRow.find('td');
        
        // Extract performance data with fallbacks
        const threeYearValue = cells.eq(2).find('span').text().trim() || cells.eq(2).text().trim();
        const oneYearValue = cells.eq(3).find('span').text().trim() || cells.eq(3).text().trim();
        const threeMonthValue = cells.eq(5).find('span').text().trim() || cells.eq(5).text().trim();
        
        // Get the fund name and price with fallback options
        const fundName = $summary('.mod-tearsheet-overview__header__name').text().trim();
        const priceText = $summary('li:contains("Price")').text().match(/[\d.]+/)?.[0] || 
                         $summary('.mod-ui-table td:contains("NAV")').next().text().match(/[\d.]+/)?.[0];
        
        // Get allocation data with international equivalents
        const nonUKBond = parseFloat($summary('td:contains("Non-UK bond")').next().text().trim().replace('%', '') || 
                                   $summary('td:contains("International Fixed Income")').next().text().trim().replace('%', '') || '0');
        const ukBond = parseFloat($summary('td:contains("UK bond")').next().text().trim().replace('%', '') || 
                                $summary('td:contains("Domestic Fixed Income")').next().text().trim().replace('%', '') || '0');
        const cash = parseFloat($summary('td:contains("Cash")').next().text().trim().replace('%', '') || '0');

        return {
            name: fundName,
            price: parseFloat(priceText) || null,
            category: category || null,
            performance: {
                threeYearChange: parsePerformanceValue(threeYearValue),
                oneYearChange: parsePerformanceValue(oneYearValue),
                threeMonthChange: parsePerformanceValue(threeMonthValue)
            },
            allocation: {
                nonUKBond,
                ukBond,
                cash
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
            },
            allocation: {
                nonUKBond: 0,
                ukBond: 0,
                cash: 0
            }
        };
    }
}

async function transformFundData() {
    try {
        // Read the funds data from public/fund_data
        const fundsPath = path.join(__dirname, '../public/fund_data/funds.json');
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
                category: fundData.category || fund.profile?.category,
                lastUpdated: new Date().toISOString(),
                performance: fundData.performance,
                allocation: fundData.allocation || fund.allocation || {},
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