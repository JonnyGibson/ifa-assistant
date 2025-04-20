import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateISINsList() {
    try {
        // Read morefunds.json
        const morefundsPath = path.join(__dirname, '../public/fund_data/morefunds.json');
        const morefunds = JSON.parse(fs.readFileSync(morefundsPath, 'utf8'));
        
        // Extract ISINs from morefunds
        const allISINs = morefunds.map(fund => fund.ISIN);
        
        // Write ISINs to file
        const isinsPath = path.join(__dirname, '../public/fund_data/isins.json');
        fs.writeFileSync(isinsPath, JSON.stringify(allISINs, null, 2));
        
        console.log(`Generated ISINs list with ${allISINs.length} unique ISINs`);
    } catch (error) {
        console.error('Error generating ISINs list:', error);
    }
}

generateISINsList().catch(console.error);