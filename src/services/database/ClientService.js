import Dexie from 'dexie';
import { Client } from '../models/Client';

export class ClientService {
  constructor(db) {
    this._db = db;
    this._clientsTable = db.clients;
  }

  async getClient(id) {
    if (!id || isNaN(Number(id))) {
      console.warn('[ClientService] Invalid client ID:', id);
      return null;
    }
    const client = await this._clientsTable.get(Number(id));
    if (!client) {
      console.warn('[ClientService] Client not found with ID:', id);
      return null;
    }
    return new Client(client);
  }

  async getAllClients() {
    console.log('[ClientService] Fetching all clients');
    const clients = await this._clientsTable.toArray();
    console.log(`[ClientService] Found ${clients.length} total clients`);
    return clients.map(client => new Client(client));
  }

  _serializeValue(value) {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (Array.isArray(value)) {
      return value.map(v => this._serializeValue(v));
    }
    if (value && typeof value === 'object') {
      const serialized = {};
      for (const [key, val] of Object.entries(value)) {
        serialized[key] = this._serializeValue(val);
      }
      return serialized;
    }
    return value;
  }

  async createClient(clientData) {
    if (!clientData.firstName || !clientData.lastName || !clientData.email) {
      throw new Error('Missing required client fields');
    }

    try {
      // Serialize all data recursively to ensure it's IndexedDB-safe
      const serializedData = this._serializeValue({
        ...clientData,
        createdAt: new Date(),
        lastReviewDate: null
      });

      console.log('[ClientService] Creating new client:', serializedData);
      const id = await this._clientsTable.add(serializedData);
      console.log('[ClientService] Client created with ID:', id);
      
      return this.getClient(id);
    } catch (error) {
      console.error('[ClientService] Error creating client:', error);
      throw new Error(`Failed to create client: ${error.message}`);
    }
  }

  async updateClient(id, updates) {
    // Serialize all update data recursively
    const serializedUpdates = this._serializeValue({
      ...updates,
      updatedAt: new Date()
    });

    await this._clientsTable.update(id, serializedUpdates);
    return this.getClient(id);
  }

  async updateFactFind(id, section, data) {
    const client = await this.getClient(id);
    if (!client) throw new Error('Client not found');

    await client.updateFactFindSection(section, data);
    return this.updateClient(id, { factFind: client.factFind });
  }

  async getClientsNeedingReview(daysThreshold = 365) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysThreshold);

    return this._clientsTable
      .filter(client => 
        !client.lastReviewDate || 
        new Date(client.lastReviewDate) < cutoffDate
      )
      .toArray();
  }

  async searchClients(query) {
    const lowerQuery = query.toLowerCase();
    return this._clientsTable
      .filter(client => 
        client.firstName.toLowerCase().includes(lowerQuery) ||
        client.lastName.toLowerCase().includes(lowerQuery) ||
        client.email.toLowerCase().includes(lowerQuery) ||
        (client.phone && client.phone.includes(query))
      )
      .toArray();
  }

  async deleteClient(id) {
    return this._db.transaction('rw', [
      this._clientsTable,
      this._db.accounts,
      this._db.insurancePolicies,
      this._db.interactions
    ], async () => {
      await this._db.accounts.where('clientId').equals(id).delete();
      await this._db.insurancePolicies.where('clientId').equals(id).delete();
      await this._db.interactions.where('clientId').equals(id).delete();
      await this._clientsTable.delete(id);
    });
  }

  async getClientInteractions(clientId) {
    if (!clientId) return [];
    
    return this._db.interactions
      .where('clientId')
      .equals(clientId)
      .reverse()
      .sortBy('date');
  }
}