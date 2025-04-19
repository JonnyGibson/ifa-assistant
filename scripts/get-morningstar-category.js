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

async function getMorningstarCategory(isin) {
    try {
        const url = `https://markets.ft.com/data/funds/tearsheet/summary?s=${isin}`;
        const response = await axiosInstance.get(url);
        const $ = cheerio.load(response.data);
        
        // Target the specific table and find the Morningstar category row
        const category = $('.mod-ui-table--two-column tbody tr')
            .filter((_, el) => $(el).find('th').text().trim() === 'Morningstar category')
            .find('td')
            .text()
            .trim();
        
        return {
            isin: isin,
            category: category || null
        };
    } catch (error) {
        console.error(`Error fetching category for ISIN ${isin}:`, error.message);
        return {
            isin: isin,
            category: null
        };
    }
}

async function processAllFunds() {
    try {
        // Read the existing funds data
        const fundsPath = path.join(__dirname, '../fund_data/funds.json');
        const funds = JSON.parse(fs.readFileSync(fundsPath, 'utf8'));
        
        const results = [];
        
        for (const fund of funds) {
            console.log(`Processing ISIN: ${fund.isin}`);
            
            // Add delay between requests
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            const result = await getMorningstarCategory(fund.isin);
            results.push(result);
        }
        
        // Write the results to a new file
        const outputPath = path.join(__dirname, '../fund_data/morningstar_categories.json');
        fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
        console.log(`Processed ${results.length} funds successfully!`);
        
        // Log any funds where category couldn't be found
        const failed = results.filter(r => !r.category);
        if (failed.length > 0) {
            console.log('\nFailed to get category for these ISINs:');
            failed.forEach(f => console.log(f.isin));
        }
        
    } catch (error) {
        console.error('Error processing funds:', error);
    }
}

// Create package.json for dependencies if it doesn't exist
const packageJson = {
    "name": "morningstar-category-fetcher",
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

// Execute the script
processAllFunds().catch(console.error); 