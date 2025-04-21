import Dexie from 'dexie';
import { FACT_FIND_SECTIONS, RISK_PROFILES } from './productTypes';

class ClientDatabase extends Dexie {
  constructor() {
    super('ClientDatabase');
    this.version(1).stores({
      clients: '++id, firstName, lastName, email, riskProfile'
    });
    this.clients = this.table('clients');
  }
}

const db = new ClientDatabase();

export class Client {
  // Basic client information
  id;
  firstName;
  lastName;
  dateOfBirth;
  email;
  phone;
  address;
  riskProfile;
  createdAt;
  clientSince;
  lastReviewDate;
  accounts = [];

  constructor(data) {
    if (!data) return;
    
    // Initialize basic properties
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.dateOfBirth = data.dateOfBirth;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.riskProfile = data.riskProfile;
    this.createdAt = data.createdAt;
    this.clientSince = data.clientSince || data.createdAt;
    this.lastReviewDate = data.lastReviewDate;
    this.accounts = data.accounts || [];

    // Initialize fact find if it exists
    this.factFind = {
      personal: {
        title: data.factFind?.personal?.title || '',
        nationalInsurance: data.factFind?.personal?.nationalInsurance || '',
        maritalStatus: data.factFind?.personal?.maritalStatus || '',
        dependents: data.factFind?.personal?.dependents || [],
        healthStatus: data.factFind?.personal?.healthStatus || '',
        smoker: data.factFind?.personal?.smoker || false,
        nationality: data.factFind?.personal?.nationality || '',
        taxResidency: data.factFind?.personal?.taxResidency || '',
        lastUpdated: data.factFind?.personal?.lastUpdated || null
      },
      employment: {
        status: data.factFind?.employment?.status || '',
        occupation: data.factFind?.employment?.occupation || '',
        employer: data.factFind?.employment?.employer || '',
        annualIncome: data.factFind?.employment?.annualIncome || 0,
        otherIncome: data.factFind?.employment?.otherIncome || [],
        employmentBenefits: data.factFind?.employment?.employmentBenefits || [],
        yearsInRole: data.factFind?.employment?.yearsInRole || 0,
        retirementAge: data.factFind?.employment?.retirementAge || null,
        lastUpdated: data.factFind?.employment?.lastUpdated || null
      },
      financial: {
        monthlyIncome: {
          salary: data.factFind?.financial?.monthlyIncome?.salary || 0,
          benefits: data.factFind?.financial?.monthlyIncome?.benefits || 0,
          investments: data.factFind?.financial?.monthlyIncome?.investments || 0,
          other: data.factFind?.financial?.monthlyIncome?.other || 0
        },
        monthlyExpenses: {
          housing: data.factFind?.financial?.monthlyExpenses?.housing || 0,
          utilities: data.factFind?.financial?.monthlyExpenses?.utilities || 0,
          transport: data.factFind?.financial?.monthlyExpenses?.transport || 0,
          loans: data.factFind?.financial?.monthlyExpenses?.loans || 0,
          lifestyle: data.factFind?.financial?.monthlyExpenses?.lifestyle || 0
        },
        assets: {
          property: data.factFind?.financial?.assets?.property || [],
          savings: data.factFind?.financial?.assets?.savings || [],
          investments: data.factFind?.financial?.assets?.investments || [],
          pensions: data.factFind?.financial?.assets?.pensions || [],
          other: data.factFind?.financial?.assets?.other || []
        },
        liabilities: {
          mortgages: data.factFind?.financial?.liabilities?.mortgages || [],
          loans: data.factFind?.financial?.liabilities?.loans || [],
          creditCards: data.factFind?.financial?.liabilities?.creditCards || [],
          other: data.factFind?.financial?.liabilities?.other || []
        },
        lastUpdated: data.factFind?.financial?.lastUpdated || null
      },
      objectives: {
        shortTerm: data.factFind?.objectives?.shortTerm || [],
        mediumTerm: data.factFind?.objectives?.mediumTerm || [],
        longTerm: data.factFind?.objectives?.longTerm || [],
        retirementPlans: {
          targetAge: data.factFind?.objectives?.retirementPlans?.targetAge || null,
          targetIncome: data.factFind?.objectives?.retirementPlans?.targetIncome || null,
          existingProvision: data.factFind?.objectives?.retirementPlans?.existingProvision || []
        },
        riskTolerance: {
          profile: data.factFind?.objectives?.riskTolerance?.profile || '',
          lastAssessed: data.factFind?.objectives?.riskTolerance?.lastAssessed || null,
          notes: data.factFind?.objectives?.riskTolerance?.notes || ''
        },
        investmentPreferences: {
          ethical: data.factFind?.objectives?.investmentPreferences?.ethical || false,
          excludedSectors: data.factFind?.objectives?.investmentPreferences?.excludedSectors || [],
          preferredSectors: data.factFind?.objectives?.investmentPreferences?.preferredSectors || [],
          notes: data.factFind?.objectives?.investmentPreferences?.notes || ''
        },
        lastUpdated: data.factFind?.objectives?.lastUpdated || null
      },
      protection: {
        existingPolicies: data.factFind?.protection?.existingPolicies || [],
        needs: {
          lifeInsurance: {
            required: data.factFind?.protection?.needs?.lifeInsurance?.required || false,
            coverAmount: data.factFind?.protection?.needs?.lifeInsurance?.coverAmount || 0,
            notes: data.factFind?.protection?.needs?.lifeInsurance?.notes || ''
          },
          criticalIllness: {
            required: data.factFind?.protection?.needs?.criticalIllness?.required || false,
            coverAmount: data.factFind?.protection?.needs?.criticalIllness?.coverAmount || 0,
            notes: data.factFind?.protection?.needs?.criticalIllness?.notes || ''
          },
          incomeProtection: {
            required: data.factFind?.protection?.needs?.incomeProtection?.required || false,
            coverAmount: data.factFind?.protection?.needs?.incomeProtection?.coverAmount || 0,
            notes: data.factFind?.protection?.needs?.incomeProtection?.notes || ''
          },
          privateHealthCare: {
            required: data.factFind?.protection?.needs?.privateHealthCare?.required || false,
            notes: data.factFind?.protection?.needs?.privateHealthCare?.notes || ''
          }
        },
        lastUpdated: data.factFind?.protection?.lastUpdated || null
      }
    };
  }

  // Validation rules for fact find data
  static validateFactFind(factFind) {
    // Basic validation example - extend as needed
    if (!factFind.personal || !factFind.employment || !factFind.financial) {
      throw new Error('Missing required fact find sections');
    }

    // Validate risk profile if set
    if (factFind.objectives?.riskTolerance?.profile) {
      const profile = factFind.objectives.riskTolerance.profile.toUpperCase();
      if (!RISK_PROFILES[profile]) {
        throw new Error('Invalid risk profile');
      }
    }

    return true;
  }

  // Helper method to update fact find section
  async updateFactFindSection(section, data) {
    if (!FACT_FIND_SECTIONS[section.toUpperCase()]) {
      throw new Error('Invalid fact find section');
    }

    this.factFind[section.toLowerCase()] = {
      ...this.factFind[section.toLowerCase()],
      ...data,
      lastUpdated: new Date()
    };

    return this;
  }
}

export default db.clients;