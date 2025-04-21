import { INSURANCE_TYPES } from './productTypes';

export class InsurancePolicy {
  id;
  clientId;
  type;
  provider;
  policyNumber;
  startDate;
  renewalDate;
  premiumAmount;
  premiumFrequency; // 'monthly' | 'annual'
  coverAmount;
  description;
  benefits;
  exclusions;
  status; // 'active' | 'pending' | 'lapsed' | 'cancelled'
  documents; // Array of document references
  notes;
  lastReviewDate;

  constructor(data) {
    Object.assign(this, data);
  }

  static validate(policy) {
    if (!policy.type || !INSURANCE_TYPES[policy.type]) {
      throw new Error('Invalid insurance type');
    }

    if (!policy.provider || !INSURANCE_TYPES[policy.type].providers.includes(policy.provider)) {
      throw new Error('Invalid provider for this insurance type');
    }

    // Convert premiumAmount to number if it's a string
    const premium = typeof policy.premiumAmount === 'string' ? 
      parseFloat(policy.premiumAmount) : 
      policy.premiumAmount;

    if (typeof premium !== 'number' || isNaN(premium) || premium < 0) {
      throw new Error('Invalid premium amount');
    }

    if (!policy.premiumFrequency || !['monthly', 'annual'].includes(policy.premiumFrequency)) {
      throw new Error('Invalid premium frequency');
    }

    if (!policy.startDate || isNaN(new Date(policy.startDate).getTime())) {
      throw new Error('Invalid start date');
    }

    return true;
  }

  calculateAnnualPremium() {
    if (this.premiumFrequency === 'monthly') {
      return this.premiumAmount * 12;
    }
    return this.premiumAmount;
  }

  isActive() {
    const now = new Date();
    return this.status === 'active' && (!this.renewalDate || new Date(this.renewalDate) > now);
  }

  daysUntilRenewal() {
    if (!this.renewalDate) return null;
    const now = new Date();
    const renewal = new Date(this.renewalDate);
    const diff = renewal.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getDisplayName() {
    return INSURANCE_TYPES[this.type]?.name || 'Unknown Insurance Type';
  }

  getDescription() {
    return INSURANCE_TYPES[this.type]?.description || '';
  }
}