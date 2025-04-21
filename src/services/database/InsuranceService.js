import { InsurancePolicy } from '../models/Insurance';
import { INSURANCE_TYPES } from '../models/productTypes';

export class InsuranceService {
  constructor(db) {
    this._db = db;
    this._policiesTable = db.insurancePolicies;
  }

  async getPolicy(id) {
    if (!id) return null;
    const policy = await this._policiesTable.get(id);
    if (!policy) return null;
    return new InsurancePolicy(policy);
  }

  async getClientPolicies(clientId) {
    if (!clientId) return [];
    
    try {
      const policies = await this._policiesTable
        .where('clientId')
        .equals(clientId)
        .toArray();
        
      // Convert any legacy insurance types to the new format
      const updatedPolicies = policies.map(policy => {
        // Convert legacy types to new format
        if (policy.type === 'Life Insurance' || policy.type === 'Life') {
          policy.type = 'LIFE';
        } else if (policy.type === 'Critical Illness' || policy.type === 'Critical') {
          policy.type = 'CRITICAL_ILLNESS';
        } else if (policy.type === 'Income Protection' || policy.type === 'Income') {
          policy.type = 'INCOME_PROTECTION';
        } else if (policy.type === 'Private Health' || policy.type === 'Health') {
          policy.type = 'HEALTH';
        }

        // If type is still not valid, default to LIFE insurance
        if (!INSURANCE_TYPES[policy.type]) {
          policy.type = 'LIFE';
          policy.provider = INSURANCE_TYPES.LIFE.providers[0];
          if (!policy.premiumAmount) policy.premiumAmount = 50;
          if (!policy.premiumFrequency) policy.premiumFrequency = 'monthly';
        }

        return new InsurancePolicy(policy);
      });

      // Update any changed policies
      await Promise.all(updatedPolicies.map(policy => {
        if (JSON.stringify(policy) !== JSON.stringify(policies.find(p => p.id === policy.id))) {
          return this.updatePolicy(policy.id, policy);
        }
      }));

      return updatedPolicies;
    } catch (error) {
      console.error('Error fetching client policies:', error);
      return [];
    }
  }

  async createPolicy(policyData) {
    // Validate the policy data
    InsurancePolicy.validate(policyData);

    const id = await this._policiesTable.add({
      ...policyData,
      status: policyData.status || 'active',
      startDate: policyData.startDate || new Date()
    });

    return this.getPolicy(id);
  }

  async updatePolicy(id, updates) {
    const policy = await this.getPolicy(id);
    if (!policy) throw new Error('Policy not found');

    // If type is being changed, validate the new type
    if (updates.type && updates.type !== policy.type) {
      InsurancePolicy.validate({ ...policy, ...updates });
    }

    await this._policiesTable.update(id, updates);
    return this.getPolicy(id);
  }

  async cancelPolicy(id, reason = '') {
    const policy = await this.getPolicy(id);
    if (!policy) throw new Error('Policy not found');

    await this.updatePolicy(id, {
      status: 'cancelled',
      cancellationDate: new Date(),
      cancellationReason: reason
    });

    return this.getPolicy(id);
  }

  async addDocument(id, document) {
    const policy = await this.getPolicy(id);
    if (!policy) throw new Error('Policy not found');

    const documents = [...(policy.documents || []), {
      ...document,
      uploadDate: new Date()
    }];

    await this.updatePolicy(id, { documents });
    return this.getPolicy(id);
  }

  async getPoliciesByType(clientId, type) {
    return this._policiesTable
      .where('clientId')
      .equals(clientId)
      .filter(policy => policy.type === type)
      .toArray();
  }

  async getActivePolicies(clientId) {
    return this._policiesTable
      .where('clientId')
      .equals(clientId)
      .filter(policy => policy.status === 'active')
      .toArray();
  }

  async getPoliciesNeedingRenewal(daysThreshold = 30) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysThreshold);

    return this._policiesTable
      .where('status')
      .equals('active')
      .filter(policy => 
        policy.renewalDate && 
        new Date(policy.renewalDate) <= futureDate
      )
      .toArray();
  }

  async recordPremiumPayment(id, amount, date = new Date()) {
    const policy = await this.getPolicy(id);
    if (!policy) throw new Error('Policy not found');

    const payments = [...(policy.premiumPayments || []), {
      amount,
      date,
      status: 'completed'
    }];

    await this.updatePolicy(id, { 
      premiumPayments: payments,
      lastPaymentDate: date
    });

    return this.getPolicy(id);
  }
}