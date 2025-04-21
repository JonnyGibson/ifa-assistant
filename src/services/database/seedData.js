import { ACCOUNT_TYPES } from '../models/productTypes';
import { INSURANCE_TYPES } from '../models/productTypes';

const RISK_PROFILES = ['Conservative', 'Moderate', 'Balanced', 'Growth', 'Aggressive'];

const PROVIDERS = {
  pension: ['Prudential', 'Standard Life', 'Scottish Widows', 'Aegon', 'Royal London'],
  isa: ['Hargreaves Lansdown', 'Fidelity', 'AJ Bell', 'Interactive Investor', 'Vanguard'],
  gia: ['Hargreaves Lansdown', 'Fidelity', 'AJ Bell', 'Interactive Investor', 'Charles Stanley']
};

const UK_CITIES = ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Cardiff', 'Leeds', 'Liverpool', 'Bristol', 'Newcastle', 'Belfast', 'Sheffield', 'Nottingham', 'Southampton', 'Brighton', 'Coventry', 'Plymouth', 'Stoke-on-Trent', 'Derby', 'Wolverhampton'];
const UK_STREETS = ['High Street', 'Church Road', 'Station Road', 'Victoria Road', 'Green Lane', 'Manor Road', 'Kings Road', 'Queen Street'];
const UK_COUNTIES = ['Greater London', 'West Midlands', 'Greater Manchester', 'West Yorkshire', 'Merseyside', 'South Yorkshire', 'Kent', 'Essex'];

function generateRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateUKAddress() {
  const houseNumber = Math.floor(Math.random() * 200) + 1;
  const street = UK_STREETS[Math.floor(Math.random() * UK_STREETS.length)];
  const city = UK_CITIES[Math.floor(Math.random() * UK_CITIES.length)];
  const county = UK_COUNTIES[Math.floor(Math.random() * UK_COUNTIES.length)];
  const postcodePrefixes = ['AB', 'B', 'BA', 'BR', 'BS', 'BT', 'CA', 'CB', 'CF', 'CH', 'CM', 'CO', 'CR', 'CT'];
  const postcode = `${postcodePrefixes[Math.floor(Math.random() * postcodePrefixes.length)]}${Math.floor(Math.random() * 99)} ${Math.floor(Math.random() * 9)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
  
  return {
    line1: `${houseNumber} ${street}`,
    line2: '',
    city,
    county,
    postcode,
    country: 'United Kingdom'
  };
}

function generateRandomClient() {
  const firstNames = ['John', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'James', 'Emily'];
  const lastNames = ['Smith', 'Jones', 'Williams', 'Brown', 'Taylor', 'Davies', 'Wilson', 'Evans'];
  
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  
  // Generate date of birth between 1945 and 2003
  const dob = generateRandomDate(new Date(1945, 0, 1), new Date(2003, 11, 31));

  // Generate a random UK-style phone number
  const phone = `07${Math.floor(100000000 + Math.random() * 900000000)}`;

  // Generate a random client since date in the last 10 years
  const createdAt = generateRandomDate(new Date(new Date().setFullYear(new Date().getFullYear() - 10)), new Date());

  return {
    firstName,
    lastName,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
    riskProfile: RISK_PROFILES[Math.floor(Math.random() * RISK_PROFILES.length)],
    dateOfBirth: dob.toISOString().split('T')[0],
    address: generateUKAddress(),
    phone,
    createdAt: createdAt.toISOString()
  };
}

function generateAccountProducts() {
  // Each client will have 1-3 different account types
  const numAccounts = Math.floor(Math.random() * 3) + 1;
  const selectedTypes = Object.keys(ACCOUNT_TYPES).sort(() => 0.5 - Math.random()).slice(0, numAccounts);
  
  return selectedTypes.map(type => {
    const providers = PROVIDERS[type.toLowerCase()] || PROVIDERS.isa;
    return {
      type,
      provider: providers[Math.floor(Math.random() * providers.length)],
      minFunds: 2, // Minimum number of funds per account
      maxFunds: 7  // Maximum number of funds per account
    };
  });
}

function generateInsurancePolicies() {
  // Each client may have 0-2 insurance policies
  const numPolicies = Math.floor(Math.random() * 3);
  const insuranceTypeKeys = Object.keys(INSURANCE_TYPES);
  return Array(numPolicies).fill(null).map(() => {
    const typeKey = insuranceTypeKeys[Math.floor(Math.random() * insuranceTypeKeys.length)];
    const typeObj = INSURANCE_TYPES[typeKey];
    const provider = typeObj.providers[Math.floor(Math.random() * typeObj.providers.length)];
    const premiumFrequency = Math.random() < 0.5 ? 'monthly' : 'annual';
    return {
      type: typeKey,
      provider,
      coverAmount: Math.floor(Math.random() * 400000) + 100000, // £100k-£500k
      premiumAmount: Math.floor(Math.random() * 80) + 20, // £20-£100
      premiumFrequency,
      startDate: new Date(Date.now() - Math.floor(Math.random() * 2 * 365 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0],
      status: 'active'
    };
  });
}

export function generateSeedData(numClients = 50) {
  return Array(numClients).fill(null).map(() => ({
    client: generateRandomClient(),
    products: generateAccountProducts(),
    insurancePolicies: generateInsurancePolicies()
  }));
}