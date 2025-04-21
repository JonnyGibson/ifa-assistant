export class InteractionService {
  constructor(db) {
    this._db = db;
    this._interactionsTable = db.interactions;
    this._interactionTypesTable = db.interactionTypes;
  }

  async getClientInteractions(clientId) {
    const interactions = await this._interactionsTable
      .where('clientId')
      .equals(clientId)
      .reverse()
      .sortBy('date');

    const types = await this._interactionTypesTable.toArray();
    const typeMap = new Map(types.map(type => [type.id, type]));

    return interactions.map(interaction => ({
      ...interaction,
      type: typeMap.get(interaction.interactionTypeId)
    }));
  }

  async getRecentInteractions(limit = 10) {
    const interactions = await this._interactionsTable
      .reverse()
      .limit(limit)
      .sortBy('date');

    const types = await this._interactionTypesTable.toArray();
    const typeMap = new Map(types.map(type => [type.id, type]));

    return interactions.map(interaction => ({
      ...interaction,
      type: typeMap.get(interaction.interactionTypeId)
    }));
  }

  async addInteraction(interactionData) {
    if (!interactionData.clientId || !interactionData.date || !interactionData.interactionTypeId) {
      throw new Error("Missing required fields for interaction");
    }

    return await this._interactionsTable.add({
      ...interactionData,
      date: new Date(interactionData.date)
    });
  }

  async getAllInteractionTypes() {
    return this._interactionTypesTable.toArray();
  }

  async getLastInteractionInfo(clientId, recentMonths = 12) {
    // Validate clientId is a number
    if (!clientId || typeof clientId !== 'number' || isNaN(clientId)) {
      console.warn('Invalid clientId provided to getLastInteractionInfo:', clientId);
      return { lastDate: null, recentCount: 0 };
    }

    const now = new Date();
    const pastDate = new Date(now.setMonth(now.getMonth() - recentMonths));

    try {
      const lastInteraction = await this._interactionsTable
        .where('clientId')
        .equals(clientId)
        .reverse()
        .first();

      const recentCount = await this._interactionsTable
        .where('clientId')
        .equals(clientId)
        .filter(interaction => new Date(interaction.date) >= pastDate)
        .count();

      return {
        lastDate: lastInteraction?.date || null,
        recentCount: recentCount || 0
      };
    } catch (error) {
      console.error(`Error getting last interaction info for client ${clientId}:`, error);
      return { lastDate: null, recentCount: 0 };
    }
  }

  async getUpcomingInteractions(fromDate = new Date()) {
    try {
      const interactions = await this._interactionsTable
        .filter(interaction => new Date(interaction.date) >= fromDate)
        .sortBy('date');

      const types = await this._interactionTypesTable.toArray();
      const typeMap = new Map(types.map(type => [type.id, type]));

      return interactions.map(interaction => ({
        ...interaction,
        type: typeMap.get(interaction.interactionTypeId)
      }));
    } catch (error) {
      console.error('Error fetching upcoming interactions:', error);
      return [];
    }
  }
}