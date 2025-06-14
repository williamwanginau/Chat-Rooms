const fs = require('fs').promises;
const path = require('path');

class UserUtils {
  constructor() {
    this.usersPath = path.join(__dirname, '../../../client/dummy data/users.json');
  }

  async loadUsers() {
    try {
      const data = await fs.readFile(this.usersPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      return [];
    }
  }

  // Find user by external ID (like "1", "Charlie")
  async getUserByExternalId(externalId) {
    const users = await this.loadUsers();
    return users.find(user => 
      user.id === externalId || user.username === externalId
    );
  }

  // Find user by internal UUID
  async getUserByInternalId(internalId) {
    const users = await this.loadUsers();
    return users.find(user => user.internalId === internalId);
  }

  // Convert external ID to internal UUID
  async getInternalIdFromExternal(externalId) {
    const user = await this.getUserByExternalId(externalId);
    return user ? user.internalId : null;
  }

  // Convert internal UUID to external ID  
  async getExternalIdFromInternal(internalId) {
    const user = await this.getUserByInternalId(internalId);
    return user ? user.id : null;
  }

  // Get full user info and return it with internal ID structure
  async getUserInfoWithInternalId(externalId) {
    return await this.getUserByExternalId(externalId);
  }
}

const userUtils = new UserUtils();

module.exports = {
  userUtils,
  getUserByExternalId: (externalId) => userUtils.getUserByExternalId(externalId),
  getInternalIdFromExternal: (externalId) => userUtils.getInternalIdFromExternal(externalId),
  getUserInfoWithInternalId: (externalId) => userUtils.getUserInfoWithInternalId(externalId)
};