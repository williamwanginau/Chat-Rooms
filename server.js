const express = require("express");
const cors = require("cors");
const app = express();
const WebSocket = require("ws");
const PORT = 3000;
const WS_PORT = 3001;
const wss = new WebSocket.Server({ port: WS_PORT });

const MESSAGE_TYPES = require("./messageTypes.json");

app.use(cors());
app.use(express.json());

class Chatroom {
  constructor(roomId) {
    this.roomId = roomId;
    this.clients = new Set();
    this.history = [];
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

  addMessage(message) {
    const enrichedMessage = {
      ...message,
      serverTimestamp: new Date().toISOString(),
      status: "delivered",
    };

    this.history.push(enrichedMessage);
    return enrichedMessage;
  }

  broadcastToAll(message) {
    const messageString = JSON.stringify(message);

    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }

  broadcastToOthers(excludeWs, message) {
    const messageString = JSON.stringify(message);

    this.clients.forEach((client) => {
      if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
        client.send(messageString);
      }
    });
  }

  getUsers() {
    return Array.from(this.clients).map((client) => client.userInfo);
  }

  getHistory() {
    return this.history;
  }

  isEmpty() {
    return this.clients.size === 0;
  }
}

const rooms = new Map();

function getOrCreateRoom(roomId) {
  let room = rooms.get(roomId);

  if (!room) {
    room = new Chatroom(roomId);
    rooms.set(roomId, room);
    console.log("Create new room", roomId);
  }

  return room;
}

app.get("/api/room/:roomId/history", (req, res) => {
  console.log("Room history API called for roomId:", req.params.roomId);
  const roomId = req.params.roomId;
  const room = rooms.get(roomId);

  res.setHeader("Content-Type", "application/json");
  const history = room?.history || [];
  res.json(history);
});
app.get("/api/room/:roomId/users", (req, res) => {
  const roomId = req.params.roomId;
  const room = rooms.get(roomId);

  if (!room) {
    res.status(404).json({ error: "Room not found" });
    return;
  }

  res.json(room.getUsers());
});

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === MESSAGE_TYPES.ROOM_CHANGE) {
      handleRoomChange(message, ws);
    }

    if (message.type === MESSAGE_TYPES.USER_INFO) {
      ws.userInfo = message.user;
      ws.userId = message.user.id;
      console.log(`User identified: ${ws.userId} (${ws.userInfo.username})`);
    }

    if (message.type === MESSAGE_TYPES.MESSAGE) {
      handleMessage(message, ws);
    }
  };

  ws.on("close", () => {
    console.log("Client disconnected");
    if (ws.roomId && rooms.has(ws.roomId)) {
      const room = rooms.get(ws.roomId);

      if (room.isEmpty()) {
        rooms.delete(ws.roomId);
        console.log(`Room ${ws.roomId} is empty, deleted.`);
      }
    }
  });
});

const handleRoomChange = (message, ws) => {
  if (!message.room || !message.room.id) {
    console.error("handleRoomChange: Invalid room data from message:", message);
    return;
  }

  const oldRoomId = ws.roomId;
  const newRoomId = message.room.id;

  if (oldRoomId === newRoomId) {
    console.log("User is already in this room, skip re-join logic.");
    return;
  }

  const newRoom = getOrCreateRoom(newRoomId);
  const oldRoom = getOrCreateRoom(oldRoomId);
  newRoom.addClient(ws);
  oldRoom.removeClient(ws);
  ws.roomId = newRoomId;
  console.log(`User ${ws.userId} joined room ${newRoomId}`);
};

const handleMessage = (message, ws) => {
  if (!message.room || !message.room.id) {
    console.error("handleMessage: Invalid room data from message:", message);
    return;
  }

  if (!ws.roomId || !rooms.has(ws.roomId)) {
    console.error("No valid room for this client. Message ignored.", message);
    return;
  }

  const room = rooms.get(ws.roomId);

  const enrichedMessage = room.addMessage(message);
  room.broadcastToAll(enrichedMessage);
};

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
