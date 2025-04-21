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

  async createClient(clientData) {
    if (!clientData.firstName || !clientData.lastName || !clientData.email) {
      throw new Error('Missing required client fields');
    }

    const id = await this._clientsTable.add({
      ...clientData,
      createdAt: new Date(),
      lastReviewDate: null
    });

    return this.getClient(id);
  }

  async updateClient(id, updates) {
    await this._clientsTable.update(id, {
      ...updates,
      updatedAt: new Date()
    });
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