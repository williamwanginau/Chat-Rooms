const fs = require('fs').promises;
const path = require('path');

class InvitationStorage {
  constructor() {
    this.invitationsPath = path.join(__dirname, '../data/invitations.json');
    this.friendsPath = path.join(__dirname, '../data/friends.json');
    this.ensureDataDirectory();
  }

  async ensureDataDirectory() {
    const dataDir = path.dirname(this.invitationsPath);
    try {
      await fs.access(dataDir);
    } catch (error) {
      await fs.mkdir(dataDir, { recursive: true });
      console.log('Created data directory:', dataDir);
    }
  }

  async loadInvitations() {
    try {
      const data = await fs.readFile(this.invitationsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is invalid, return empty structure
      return {
        pending: [], // Array of pending invitations
        sent: [],    // Array of sent invitation records
      };
    }
  }

  async saveInvitations(invitations) {
    try {
      await fs.writeFile(this.invitationsPath, JSON.stringify(invitations, null, 2));
    } catch (error) {
      console.error('Failed to save invitations:', error);
      throw error;
    }
  }

  async loadFriends() {
    try {
      const data = await fs.readFile(this.friendsPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is invalid, return empty object
      return {}; // { userId: [array of friend userIds] }
    }
  }

  async saveFriends(friends) {
    try {
      await fs.writeFile(this.friendsPath, JSON.stringify(friends, null, 2));
    } catch (error) {
      console.error('Failed to save friends:', error);
      throw error;
    }
  }

  // Add a new invitation
  async addInvitation(invitation) {
    const invitations = await this.loadInvitations();
    
    // Check if invitation already exists
    const existingInvitation = invitations.pending.find(
      inv => inv.fromUserId === invitation.fromUserId && inv.toUserId === invitation.toUserId
    );
    
    if (existingInvitation) {
      throw new Error('Invitation already exists');
    }
    
    invitations.pending.push({
      id: invitation.id,
      fromUserId: invitation.fromUserId,
      toUserId: invitation.toUserId,
      fromUserInfo: invitation.fromUserInfo,
      message: invitation.message || '',
      timestamp: invitation.timestamp,
      status: 'pending'
    });
    
    await this.saveInvitations(invitations);
    return invitation;
  }

  // Get pending invitations for a user
  async getPendingInvitations(userId) {
    const invitations = await this.loadInvitations();
    return invitations.pending.filter(inv => inv.toUserId === userId);
  }

  // Get sent invitations by a user
  async getSentInvitations(userId) {
    const invitations = await this.loadInvitations();
    return invitations.pending.filter(inv => inv.fromUserId === userId);
  }

  // Remove invitation (when accepted, declined, or cancelled)
  async removeInvitation(invitationId) {
    const invitations = await this.loadInvitations();
    const initialLength = invitations.pending.length;
    
    invitations.pending = invitations.pending.filter(inv => inv.id !== invitationId);
    
    if (invitations.pending.length === initialLength) {
      throw new Error('Invitation not found');
    }
    
    await this.saveInvitations(invitations);
  }

  // Add friendship (when invitation is accepted)
  async addFriendship(userId1, userId2) {
    const friends = await this.loadFriends();
    
    // Initialize arrays if they don't exist
    if (!friends[userId1]) friends[userId1] = [];
    if (!friends[userId2]) friends[userId2] = [];
    
    // Add each other as friends (if not already friends)
    if (!friends[userId1].includes(userId2)) {
      friends[userId1].push(userId2);
    }
    if (!friends[userId2].includes(userId1)) {
      friends[userId2].push(userId1);
    }
    
    await this.saveFriends(friends);
  }

  // Get friends list for a user
  async getFriends(userId) {
    const friends = await this.loadFriends();
    return friends[userId] || [];
  }

  // Check if two users are friends
  async areFriends(userId1, userId2) {
    const friends = await this.loadFriends();
    return friends[userId1] && friends[userId1].includes(userId2);
  }

  // Remove friendship
  async removeFriendship(userId1, userId2) {
    const friends = await this.loadFriends();
    
    if (friends[userId1]) {
      friends[userId1] = friends[userId1].filter(id => id !== userId2);
    }
    if (friends[userId2]) {
      friends[userId2] = friends[userId2].filter(id => id !== userId1);
    }
    
    await this.saveFriends(friends);
  }
}

module.exports = InvitationStorage;