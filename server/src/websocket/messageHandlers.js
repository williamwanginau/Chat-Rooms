const MESSAGE_TYPES = require("../../../shared/messageTypes.json");

const handleUserInfo = (message, ws) => {
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

const handleMessage = (message, ws, rooms) => {
  console.log("Received message:", message);

  switch (message.type) {
    case MESSAGE_TYPES.USER_INFO:
      handleUserInfo(message, ws);
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
    default:
      console.log("Unknown message type:", message.type);
  }
};

module.exports = {
  handleMessage,
  getOrCreateRoom,
};