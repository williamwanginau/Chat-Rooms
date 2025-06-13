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

const getOrCreateRoom = (roomId, rooms) => {
  const Chatroom = require("../models/Chatroom");
  
  let room = rooms.get(roomId);
  if (!room) {
    room = new Chatroom(roomId);
    rooms.set(roomId, room);
    console.log(`Room ${roomId} created`);
  }
  return room;
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
    default:
      console.log("Unknown message type:", message.type);
  }
};

module.exports = {
  handleMessage,
  getOrCreateRoom,
};