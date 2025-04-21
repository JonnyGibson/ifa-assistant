export class UserService {
  constructor(db) {
    this._db = db;
    this._usersTable = db.users;
    this._sessionsTable = db.sessions;
  }

  async getAllUsers() {
    const users = await this._usersTable.toArray();
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  async addUser(userData) {
    // Basic validation
    if (!userData.username || !userData.email || !userData.password) {
      throw new Error('Missing required fields');
    }

    // Check if email already exists
    const existingUser = await this._usersTable.where('email').equals(userData.email).first();
    if (existingUser) {
      throw new Error('Email already exists');
    }

    return await this._usersTable.add({
      ...userData,
      createdAt: new Date()
    });
  }

  async deleteUser(userId) {
    await this._db.transaction('rw', [this._usersTable, this._sessionsTable], async () => {
      await this._usersTable.delete(userId);
      await this._sessionsTable.where('userId').equals(userId).delete();
    });
  }

  async updateUser(userId, updates) {
    // Don't allow email updates if it would create a duplicate
    if (updates.email) {
      const existingUser = await this._usersTable
        .where('email')
        .equals(updates.email)
        .and(user => user.id !== userId)
        .first();
      
      if (existingUser) {
        throw new Error('Email already exists');
      }
    }

    await this._usersTable.update(userId, updates);
  }
}