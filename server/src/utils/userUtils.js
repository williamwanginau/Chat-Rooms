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

  // Find user by username (external identifier)
  async getUserByUsername(username) {
    const users = await this.loadUsers();
    return users.find(user => user.username === username);
  }

  // Find user by ID (internal UUID)
  async getUserById(id) {
    const users = await this.loadUsers();
    return users.find(user => user.id === id);
  }

  // Convert username to UUID
  async getIdFromUsername(username) {
    const user = await this.getUserByUsername(username);
    return user ? user.id : null;
  }

  // Convert UUID to username
  async getUsernameFromId(id) {
    const user = await this.getUserById(id);
    return user ? user.username : null;
  }

  // Get full user info by username
  async getUserInfoByUsername(username) {
    return await this.getUserByUsername(username);
  }
}

const userUtils = new UserUtils();

module.exports = {
  userUtils,
  getUserByUsername: (username) => userUtils.getUserByUsername(username),
  getIdFromUsername: (username) => userUtils.getIdFromUsername(username),
  getUserInfoByUsername: (username) => userUtils.getUserInfoByUsername(username)
};