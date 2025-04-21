import Dexie from 'dexie';

export class AuthService {
  constructor(db) {
    console.log('[AuthService] Initializing AuthService');
    this._db = db;
    this._usersTable = db.users;
    this._sessionsTable = db.sessions;
    console.log('[AuthService] AuthService initialized');
  }

  async login(email, password) {
    console.log(`[AuthService] Login attempt for: ${email}`);
    const user = await this._usersTable.where('email').equals(email).first();
    
    if (!user) {
      console.log(`[AuthService] Login failed: User not found for email ${email}`);
      throw new Error('Invalid credentials');
    }
    
    if (user.password !== password) {
      console.log(`[AuthService] Login failed: Invalid password for ${email}`);
      throw new Error('Invalid credentials');
    }
    
    console.log(`[AuthService] Login successful for user ID: ${user.id}`);
    
    // Generate a simple token (in a real app, use JWT or similar)
    const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
    
    // Store session
    await this._sessionsTable.add({
      token,
      userId: user.id,
      createdAt: new Date()
    });

    console.log(`[AuthService] Session created for user ID: ${user.id}`);

    // Return IFA user data (excluding password) and token
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }

  async logout() {
    console.log('[AuthService] Logout called');
    const token = localStorage.getItem('auth_token');
    if (token) {
      console.log('[AuthService] Found auth token, removing session');
      await this._sessionsTable.where('token').equals(token).delete();
      localStorage.removeItem('auth_token');
    } else {
      console.log('[AuthService] No auth token found for logout');
    }
    console.log('[AuthService] Logout complete');
  }

  async getCurrentUser() {
    console.log('[AuthService] Getting current user');
    
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('[AuthService] No auth token found in localStorage');
      return null;
    }
    
    console.log('[AuthService] Auth token found, validating session');
    try {
      const userId = await this.validateSession(token);
      console.log(`[AuthService] Session valid, fetching user ID: ${userId}`);
      
      if (!userId) {
        console.log('[AuthService] No user ID from validated session');
        return null;
      }
      
      const user = await this._usersTable.get(userId);
      if (!user) {
        console.log(`[AuthService] User ID ${userId} not found in database`);
        return null;
      }
      
      console.log(`[AuthService] Returning current user: ${user.email}`);
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    } catch (error) {
      console.error('[AuthService] Error getting current user:', error);
      return null;
    }
  }

  async checkAuth() {
    console.log('[AuthService] Checking auth');
    const user = await this.getCurrentUser();
    return !!user;
  }

  async validateSession(token) {
    console.log('[AuthService] Validating session token');
    const session = await this._sessionsTable.where('token').equals(token).first();
    
    if (!session) {
      console.log('[AuthService] Session not found for token');
      return null;
    }
    
    // Add session expiry check if needed
    
    console.log(`[AuthService] Session found for user ID: ${session.userId}`);
    return session.userId;
  }
}