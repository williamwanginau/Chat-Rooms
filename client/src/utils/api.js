// API and WebSocket utility functions
import MESSAGE_TYPES from "../../../shared/messageTypes.json";

export const createWebSocketMessage = (type, data = {}) => {
  return {
    type,
    ...data,
    clientTimestamp: new Date().toISOString(),
  };
};

export const sendWebSocketMessage = (sendMessage, type, data = {}) => {
  if (!sendMessage) {
    console.warn('SendMessage function not available');
    return false;
  }
  
  try {
    const message = createWebSocketMessage(type, data);
    sendMessage(message);
    return true;
  } catch (error) {
    console.error('Error sending WebSocket message:', error);
    return false;
  }
};

// Common WebSocket message senders
export const sendUserDataSync = (sendMessage, users) => {
  return sendWebSocketMessage(sendMessage, MESSAGE_TYPES.USERS_DATA_SYNC, { users });
};

export const sendFriendshipUpdate = (sendMessage, friendships) => {
  return sendWebSocketMessage(sendMessage, MESSAGE_TYPES.FRIENDSHIP_UPDATE, { friendships });
};

export const sendInvitationUpdate = (sendMessage, invitations) => {
  return sendWebSocketMessage(sendMessage, MESSAGE_TYPES.INVITATION_UPDATE, { invitations });
};

export const sendChatMessage = (sendMessage, roomId, content, userId) => {
  return sendWebSocketMessage(sendMessage, MESSAGE_TYPES.CHAT_MESSAGE, {
    roomId,
    content,
    userId,
  });
};

export const joinChatRoom = (sendMessage, roomId, userId) => {
  return sendWebSocketMessage(sendMessage, MESSAGE_TYPES.JOIN_ROOM, {
    roomId,
    userId,
  });
};

export const leaveChatRoom = (sendMessage, roomId, userId) => {
  return sendWebSocketMessage(sendMessage, MESSAGE_TYPES.LEAVE_ROOM, {
    roomId,
    userId,
  });
};