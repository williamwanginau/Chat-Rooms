const MESSAGE_TYPES = require("../../../shared/messageTypes.json");

class Chatroom {
  constructor(roomId, metadata = {}) {
    this.roomId = roomId;
    this.clients = new Set();
    this.history = [];
    
    // Room metadata
    this.name = metadata.name || roomId;
    this.description = metadata.description || "";
    this.isCustom = metadata.isCustom || false;
    this.createdAt = metadata.createdAt || new Date().toISOString();
  }

  addClient(ws) {
    this.clients.add(ws);
    ws.roomId = this.roomId;

    this.broadcastToOthers(ws, {
      type: MESSAGE_TYPES.USER_JOINED,
      user: ws.userInfo,
      room: { id: this.roomId },
      serverTimestamp: new Date().toISOString(),
    });

    const usersInRoom = Array.from(this.clients).map(
      (client) => client.userInfo
    );
    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPES.ROOM_USERS,
        users: usersInRoom,
        room: { id: this.roomId },
        serverTimestamp: new Date().toISOString(),
      })
    );
  }

  removeClient(ws) {
    this.clients.delete(ws);

    this.broadcastToAll({
      type: MESSAGE_TYPES.USER_LEFT,
      user: ws.userInfo,
      room: { id: this.roomId },
      serverTimestamp: new Date().toISOString(),
    });

    return this.clients.size;
  }

  broadcastToAll(message) {
    const messageString = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(messageString);
      }
    });
  }

  broadcastToOthers(sender, message) {
    const messageString = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client !== sender && client.readyState === 1) {
        client.send(messageString);
      }
    });
  }

  addMessage(message) {
    this.history.push(message);
    this.broadcastToAll(message);
  }

  isEmpty() {
    return this.clients.size === 0;
  }

  getUsers() {
    return Array.from(this.clients).map((client) => client.userInfo);
  }
}

module.exports = Chatroom;