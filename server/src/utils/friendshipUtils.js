const fs = require('fs').promises;
const path = require('path');

class FriendshipUtils {
  constructor() {
    this.usersPath = path.join(__dirname, '../../../client/dummy data/users.json');
    this.friendshipsPath = path.join(__dirname, '../data/friendships.json');
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

  async saveUsers(users) {
    try {
      await fs.writeFile(this.usersPath, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('Failed to save users:', error);
    }
  }

  async loadFriendships() {
    try {
      const data = await fs.readFile(this.friendshipsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.log('Friendships file not found, creating empty array');
      return [];
    }
  }

  async saveFriendships(friendships) {
    try {
      await fs.writeFile(this.friendshipsPath, JSON.stringify(friendships, null, 2));
    } catch (error) {
      console.error('Failed to save friendships:', error);
    }
  }

  // 建立好友關係（雙向）
  async createFriendship(user1Id, user2Id, initiatedBy) {
    try {
      // 1. 載入現有資料
      const users = await this.loadUsers();
      const friendships = await this.loadFriendships();

      // 2. 檢查是否已經是好友
      const existingFriendship = friendships.find(f =>
        (f.user1 === user1Id && f.user2 === user2Id) ||
        (f.user1 === user2Id && f.user2 === user1Id)
      );

      if (existingFriendship) {
        console.log('Friendship already exists');
        return false;
      }

      // 3. 建立好友關係詳情
      const friendship = {
        id: `friendship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user1: user1Id,
        user2: user2Id,
        createdAt: new Date().toISOString(),
        initiatedBy: initiatedBy,
        status: 'active'
      };

      // 4. 更新用戶的好友列表
      const user1 = users.find(u => u.internalId === user1Id);
      const user2 = users.find(u => u.internalId === user2Id);

      if (!user1 || !user2) {
        throw new Error('One or both users not found');
      }

      // 初始化 friends 陣列如果不存在
      if (!user1.friends) user1.friends = [];
      if (!user2.friends) user2.friends = [];

      // 添加彼此為好友
      if (!user1.friends.includes(user2Id)) {
        user1.friends.push(user2Id);
      }
      if (!user2.friends.includes(user1Id)) {
        user2.friends.push(user1Id);
      }

      // 5. 儲存資料
      friendships.push(friendship);
      await this.saveFriendships(friendships);
      await this.saveUsers(users);

      console.log(`Friendship created between ${user1Id} and ${user2Id}`);
      return friendship;

    } catch (error) {
      console.error('Error creating friendship:', error);
      return false;
    }
  }

  // 獲取用戶的所有好友ID
  async getUserFriends(userId) {
    try {
      const users = await this.loadUsers();
      const user = users.find(u => u.internalId === userId);
      return user?.friends || [];
    } catch (error) {
      console.error('Error getting user friends:', error);
      return [];
    }
  }

  // 檢查兩個用戶是否為好友
  async areFriends(user1Id, user2Id) {
    try {
      const friendIds = await this.getUserFriends(user1Id);
      return friendIds.includes(user2Id);
    } catch (error) {
      console.error('Error checking friendship:', error);
      return false;
    }
  }

  // 獲取好友關係詳情
  async getFriendshipDetails(user1Id, user2Id) {
    try {
      const friendships = await this.loadFriendships();
      return friendships.find(f =>
        (f.user1 === user1Id && f.user2 === user2Id) ||
        (f.user1 === user2Id && f.user2 === user1Id)
      );
    } catch (error) {
      console.error('Error getting friendship details:', error);
      return null;
    }
  }
}

const friendshipUtils = new FriendshipUtils();

module.exports = {
  friendshipUtils,
  createFriendship: (user1Id, user2Id, initiatedBy) => friendshipUtils.createFriendship(user1Id, user2Id, initiatedBy),
  getUserFriends: (userId) => friendshipUtils.getUserFriends(userId),
  areFriends: (user1Id, user2Id) => friendshipUtils.areFriends(user1Id, user2Id),
  getFriendshipDetails: (user1Id, user2Id) => friendshipUtils.getFriendshipDetails(user1Id, user2Id)
};