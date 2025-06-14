const MESSAGE_TYPES = require("../../../shared/messageTypes.json");
const { getInternalIdFromExternal, getUserInfoWithInternalId } = require('../utils/userUtils');

const handleUserInfo = async (message, ws) => {
  ws.userInfo = message.user;
  console.log("User info received:", message.user);
};

const handleChatMessage = (message, ws, rooms) => {
  if (!ws.roomId || !rooms.has(ws.roomId)) {
    console.log("No room found for message");
    return;
  }

  const room = rooms.get(ws.roomId);
  const fullMessage = {
    ...message,
    serverTimestamp: new Date().toISOString(),
  };

  room.addMessage(fullMessage);
};

const handleRoomChange = (message, ws, rooms) => {
  if (!message.room || !message.room.id) {
    console.log("Invalid room change message");
    return;
  }

  const newRoomId = message.room.id;
  
  if (ws.roomId === newRoomId) {
    console.log(`User ${ws.userInfo?.name} already in room ${newRoomId}`);
    return;
  }

  if (ws.roomId && rooms.has(ws.roomId)) {
    const currentRoom = rooms.get(ws.roomId);
    const remainingClients = currentRoom.removeClient(ws);
    
    if (remainingClients === 0) {
      rooms.delete(ws.roomId);
      console.log(`Room ${ws.roomId} is empty, deleted.`);
    }
  }

  const newRoom = getOrCreateRoom(newRoomId, rooms);
  newRoom.addClient(ws);
  
  console.log(`User ${ws.userInfo?.name} joined room ${newRoomId}`);
};

const getOrCreateRoom = (roomId, rooms, metadata = {}) => {
  const Chatroom = require("../models/Chatroom");
  
  let room = rooms.get(roomId);
  if (!room) {
    // For dynamic room creation, use minimal metadata
    const roomMetadata = {
      name: metadata.name || roomId,
      description: metadata.description || "",
      isCustom: metadata.isCustom !== undefined ? metadata.isCustom : true,
      createdAt: new Date().toISOString()
    };
    
    room = new Chatroom(roomId, roomMetadata);
    rooms.set(roomId, room);
    console.log(`Room ${roomId} created dynamically`);
  }
  return room;
};

const handleTyping = (message, ws, rooms) => {
  if (!ws.roomId || !rooms.has(ws.roomId)) {
    console.log("No room found for typing message");
    return;
  }

  const room = rooms.get(ws.roomId);
  
  // Broadcast typing message to other users in the room
  room.broadcastToOthers(ws, {
    ...message,
    serverTimestamp: new Date().toISOString(),
  });
};

const handleUserJoined = (message, ws, rooms) => {
  if (!ws.roomId || !rooms.has(ws.roomId)) {
    console.log("No room found for user joined message");
    return;
  }

  const room = rooms.get(ws.roomId);
  
  // Broadcast user joined message to all users in the room (including sender for dev tool)
  room.broadcastToAll({
    ...message,
    serverTimestamp: new Date().toISOString(),
  });
  
  console.log(`Virtual user ${message.user?.name} joined room ${ws.roomId} (dev simulation)`);
};

const handleUserLeft = (message, ws, rooms) => {
  if (!ws.roomId || !rooms.has(ws.roomId)) {
    console.log("No room found for user left message");
    return;
  }

  const room = rooms.get(ws.roomId);
  
  // Broadcast user left message to all users in the room (including sender for dev tool)
  room.broadcastToAll({
    ...message,
    serverTimestamp: new Date().toISOString(),
  });
  
  console.log(`Virtual user ${message.user?.name} left room ${ws.roomId} (dev simulation)`);
};

const handleUsersDataSync = (message, ws, rooms) => {
  console.log("Received users data sync request, broadcasting to all rooms");
  
  // Broadcast the users data sync message to all rooms
  const syncMessage = {
    ...message,
    serverTimestamp: new Date().toISOString(),
  };

  rooms.forEach((room) => {
    room.broadcastToAll(syncMessage);
  });

  console.log(`Users data sync broadcasted to all ${rooms.size} rooms with ${message.users?.length || 0} users`);
};

const handleFriendInvitationSent = async (message, ws, rooms) => {
  const { toUserId, invitationData } = message;
  
  try {
    // Convert external toUserId to internal ID
    const toInternalId = await getInternalIdFromExternal(toUserId);
    if (!toInternalId) {
      throw new Error(`User with ID ${toUserId} not found`);
    }

    // Create invitation object using only internal IDs
    const invitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId: ws.userInfo.internalId,
      toUserId: toInternalId,
      message: invitationData.message || '',
      timestamp: new Date().toISOString()
    };

    // Find the target user across all rooms (if online) using internal ID
    let targetWs = null;
    rooms.forEach((room) => {
      room.clients.forEach((client) => {
        if (client.userInfo && client.userInfo.internalId === toInternalId) {
          targetWs = client;
        }
      });
    });

    // If user is online, send invitation immediately
    if (targetWs) {
      const invitationMessage = {
        type: MESSAGE_TYPES.FRIEND_INVITATION_RECEIVED,
        invitation: {
          id: invitation.id,
          fromUserId: invitation.fromUserId,
          message: invitation.message,
          timestamp: invitation.timestamp
        },
        serverTimestamp: new Date().toISOString(),
      };
      
      targetWs.send(JSON.stringify(invitationMessage));
      console.log(`Friend invitation sent immediately to online user ${ws.userInfo?.internalId} -> ${toInternalId}`);
    } else {
      console.log(`Friend invitation not sent - user ${toInternalId} is offline`);
    }
    
    // Confirm to sender that invitation was sent
    ws.send(JSON.stringify({
      type: MESSAGE_TYPES.FRIEND_INVITATION_SENT,
      success: true,
      toUserId,
      invitation,
      isOnline: !!targetWs,
      serverTimestamp: new Date().toISOString(),
    }));

  } catch (error) {
    console.error('Error handling friend invitation:', error);
    ws.send(JSON.stringify({
      type: MESSAGE_TYPES.FRIEND_INVITATION_SENT,
      success: false,
      error: error.message,
      toUserId,
      serverTimestamp: new Date().toISOString(),
    }));
  }
};

const handleFriendInvitationAccepted = async (message, ws, rooms) => {
  const { invitationId, fromUserId } = message;
  
  try {
    // Convert external fromUserId to internal ID for lookup
    const fromInternalId = await getInternalIdFromExternal(fromUserId);
    if (!fromInternalId) {
      throw new Error(`Sender user with ID ${fromUserId} not found`);
    }

    // Find the sender across all rooms using internal ID
    let senderWs = null;
    rooms.forEach((room) => {
      room.clients.forEach((client) => {
        if (client.userInfo && client.userInfo.internalId === fromInternalId) {
          senderWs = client;
        }
      });
    });

    // Send friendship creation data to both users (let frontend handle storage)
    const friendshipData = {
      user1: fromInternalId,           // sender
      user2: ws.userInfo.internalId,   // accepter
      initiatedBy: fromInternalId,     // initiated by sender
      createdAt: new Date().toISOString(),
      status: 'active'
    };

    // Notify sender that invitation was accepted (if online)
    if (senderWs) {
      senderWs.send(JSON.stringify({
        type: MESSAGE_TYPES.FRIEND_INVITATION_ACCEPTED,
        invitationId,
        acceptedBy: ws.userInfo,
        serverTimestamp: new Date().toISOString(),
      }));

      // Send friend added notifications to both users with friendship data
      const friendAddedMessage = {
        type: MESSAGE_TYPES.FRIEND_ADDED,
        friendshipData: friendshipData,
        serverTimestamp: new Date().toISOString(),
      };

      // Notify sender they have a new friend
      senderWs.send(JSON.stringify({
        ...friendAddedMessage,
        newFriend: ws.userInfo,
      }));

      // Notify accepter they have a new friend
      ws.send(JSON.stringify({
        ...friendAddedMessage,
        newFriend: senderWs.userInfo,
      }));

      console.log(`Friend invitation accepted: ${fromInternalId} and ${ws.userInfo?.internalId} are now friends`);
    } else {
      console.log(`Friend invitation accepted (sender offline): ${fromInternalId} and ${ws.userInfo?.internalId} are now friends`);
      
      // Still notify the accepter (but need to get sender info)
      const senderInfo = await getUserInfoWithInternalId(fromInternalId);
      ws.send(JSON.stringify({
        type: MESSAGE_TYPES.FRIEND_ADDED,
        friendshipData: friendshipData,
        newFriend: senderInfo || { internalId: fromInternalId, username: "Unknown User" },
        serverTimestamp: new Date().toISOString(),
      }));
    }
  } catch (error) {
    console.error('Error handling friend invitation acceptance:', error);
    ws.send(JSON.stringify({
      type: MESSAGE_TYPES.FRIEND_INVITATION_ACCEPTED,
      success: false,
      error: error.message,
      invitationId,
      serverTimestamp: new Date().toISOString(),
    }));
  }
};

const handleFriendInvitationDeclined = async (message, ws, rooms) => {
  const { invitationId, fromUserId } = message;
  
  try {
    // Convert external fromUserId to internal ID for lookup
    const fromInternalId = await getInternalIdFromExternal(fromUserId);
    if (!fromInternalId) {
      throw new Error(`Sender user with ID ${fromUserId} not found`);
    }

    // Find the sender across all rooms using internal ID
    let senderWs = null;
    rooms.forEach((room) => {
      room.clients.forEach((client) => {
        if (client.userInfo && client.userInfo.internalId === fromInternalId) {
          senderWs = client;
        }
      });
    });

    // Notify sender that invitation was declined (if online)
    if (senderWs) {
      senderWs.send(JSON.stringify({
        type: MESSAGE_TYPES.FRIEND_INVITATION_DECLINED,
        invitationId,
        declinedBy: ws.userInfo,
        serverTimestamp: new Date().toISOString(),
      }));

      console.log(`Friend invitation declined: ${ws.userInfo?.id} declined invitation from ${fromUserId}`);
    } else {
      console.log(`Friend invitation declined (sender offline): ${ws.userInfo?.id} declined invitation from ${fromUserId}`);
    }
  } catch (error) {
    console.error('Error handling friend invitation decline:', error);
  }
};

const handleFriendInvitationCancelled = async (message, ws, rooms) => {
  const { invitationId, toUserId } = message;
  
  try {
    // Convert external toUserId to internal ID for lookup
    const toInternalId = await getInternalIdFromExternal(toUserId);
    if (!toInternalId) {
      throw new Error(`Target user with ID ${toUserId} not found`);
    }

    // Find the target user across all rooms using internal ID
    let targetWs = null;
    rooms.forEach((room) => {
      room.clients.forEach((client) => {
        if (client.userInfo && client.userInfo.internalId === toInternalId) {
          targetWs = client;
        }
      });
    });

    // Notify target user that invitation was cancelled (if online)
    if (targetWs) {
      targetWs.send(JSON.stringify({
        type: MESSAGE_TYPES.FRIEND_INVITATION_CANCELLED,
        invitationId,
        cancelledBy: ws.userInfo,
        serverTimestamp: new Date().toISOString(),
      }));

      console.log(`Friend invitation cancelled: ${ws.userInfo?.id} cancelled invitation to ${toUserId}`);
    } else {
      console.log(`Friend invitation cancelled (target offline): ${ws.userInfo?.id} cancelled invitation to ${toUserId}`);
    }
  } catch (error) {
    console.error('Error handling friend invitation cancellation:', error);
  }
};

const validateUserId = (id) => {
  if (!id || typeof id !== 'string' || id.trim().length === 0) {
    return "ID cannot be empty";
  }
  
  const trimmedId = id.trim();
  
  if (trimmedId.length < 3) {
    return "ID must be at least 3 characters";
  }
  if (trimmedId.length > 20) {
    return "ID must be 20 characters or less";
  }
  
  // Enhanced character validation
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedId)) {
    return "ID can only contain letters, numbers, hyphens and underscores";
  }
  
  // Prevent IDs starting or ending with special characters
  if (trimmedId.startsWith('-') || trimmedId.startsWith('_') || trimmedId.endsWith('-') || trimmedId.endsWith('_')) {
    return "ID cannot start or end with hyphens or underscores";
  }
  
  // Prevent consecutive special characters
  if (trimmedId.includes('--') || trimmedId.includes('__') || trimmedId.includes('-_') || trimmedId.includes('_-')) {
    return "ID cannot contain consecutive special characters";
  }
  
  // Prevent reserved words
  const reservedWords = ['admin', 'system', 'user', 'guest', 'bot', 'null', 'undefined', 'root', 'test', 'demo'];
  if (reservedWords.includes(trimmedId.toLowerCase())) {
    return "This ID is reserved and cannot be used";
  }
  
  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmedId)) {
    return "ID must contain at least one letter";
  }
  
  return null;
};

const handleUserInfoUpdated = (message, ws, rooms) => {
  // Store the old user info before updating
  const oldUserInfo = ws.userInfo;
  
  // Validate the new user ID if it's being changed
  if (message.user && message.user.id) {
    const validationError = validateUserId(message.user.id);
    if (validationError) {
      // Send error back to the client
      ws.send(JSON.stringify({
        type: MESSAGE_TYPES.USER_INFO_UPDATE_ERROR,
        error: validationError,
        serverTimestamp: new Date().toISOString(),
      }));
      console.log(`User ID validation failed: ${validationError}`);
      return;
    }
    
    // Check for ID conflicts across all connected users
    const allConnectedUsers = [];
    rooms.forEach((room) => {
      room.clients.forEach((client) => {
        if (client.userInfo && client.userInfo.id && client !== ws) {
          allConnectedUsers.push(client.userInfo.id);
        }
      });
    });
    
    if (allConnectedUsers.includes(message.user.id)) {
      ws.send(JSON.stringify({
        type: MESSAGE_TYPES.USER_INFO_UPDATE_ERROR,
        error: "This ID is already taken by another connected user",
        serverTimestamp: new Date().toISOString(),
      }));
      console.log(`User ID conflict detected: ${message.user.id}`);
      return;
    }
  }
  
  // Update the user info on the WebSocket connection
  ws.userInfo = message.user;
  console.log("User info updated:", message.user);

  // Broadcast the user info update to all rooms for database synchronization
  const updateMessage = {
    type: MESSAGE_TYPES.USER_INFO_UPDATED,
    oldUser: oldUserInfo,
    newUser: message.user,
    serverTimestamp: new Date().toISOString(),
  };

  rooms.forEach((room) => {
    room.broadcastToAll(updateMessage);
  });

  console.log(`User info updated and broadcasted to all rooms: ${oldUserInfo?.name} -> ${message.user?.name}`);
};

const handleMessage = (message, ws, rooms) => {
  console.log("Received message:", message);

  switch (message.type) {
    case MESSAGE_TYPES.USER_INFO:
      handleUserInfo(message, ws);
      break;
    case MESSAGE_TYPES.USER_INFO_UPDATED:
      handleUserInfoUpdated(message, ws, rooms);
      break;
    case MESSAGE_TYPES.MESSAGE:
      handleChatMessage(message, ws, rooms);
      break;
    case MESSAGE_TYPES.ROOM_CHANGE:
      handleRoomChange(message, ws, rooms);
      break;
    case MESSAGE_TYPES.TYPING_START:
    case MESSAGE_TYPES.TYPING_STOP:
      handleTyping(message, ws, rooms);
      break;
    case MESSAGE_TYPES.USER_JOINED:
      handleUserJoined(message, ws, rooms);
      break;
    case MESSAGE_TYPES.USER_LEFT:
      handleUserLeft(message, ws, rooms);
      break;
    case MESSAGE_TYPES.USERS_DATA_SYNC:
      handleUsersDataSync(message, ws, rooms);
      break;
    case MESSAGE_TYPES.FRIEND_INVITATION_SENT:
      handleFriendInvitationSent(message, ws, rooms);
      break;
    case MESSAGE_TYPES.FRIEND_INVITATION_ACCEPTED:
      handleFriendInvitationAccepted(message, ws, rooms);
      break;
    case MESSAGE_TYPES.FRIEND_INVITATION_DECLINED:
      handleFriendInvitationDeclined(message, ws, rooms);
      break;
    case MESSAGE_TYPES.FRIEND_INVITATION_CANCELLED:
      handleFriendInvitationCancelled(message, ws, rooms);
      break;
    default:
      console.log("Unknown message type:", message.type);
  }
};

module.exports = {
  handleMessage,
  getOrCreateRoom,
};