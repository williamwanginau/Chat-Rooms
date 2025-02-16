const express = require("express");
const app = express();
const WebSocket = require("ws");
const PORT = 3000;
const WS_PORT = 3001;
const wss = new WebSocket.Server({ port: WS_PORT });

const rooms = new Map();

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.onmessage = (event) => {
    const message = JSON.parse(event.data);

    if (message.type === "ROOM_CHANGE") {
      handleRoomChange(message, ws);
    }

    if (message.type === "message") {
      handleMessage(message, ws);
    }
  };

  ws.on("close", () => {
    console.log("Client disconnected");
    if (ws.roomId && rooms.has(ws.roomId)) {
      rooms.get(ws.roomId).delete(ws);

      if (rooms.get(ws.roomId).size === 0) {
        rooms.delete(ws.roomId);
        messageHistory.delete(ws.roomId);
      }
    }
  });

  if (ws.roomId && messageHistory.has(ws.roomId)) {
    const historyMessages = messageHistory.get(ws.roomId);
    ws.send(
      JSON.stringify({
        type: "history",
        messages: historyMessages,
      })
    );
  }
});

const handleRoomChange = (message, ws) => {
  if (!message.room || !message.room.id) {
    console.error("handleRoomChange: Invalid room data from message:", message);
    return;
  }

  const oldRoomId = ws.roomId;
  const newRoomId = message.room.id;

  if (ws.roomId === newRoomId) {
    console.log("User is already in this room, skip re-join logic.");
    return;
  }

  leaveRoom(ws, oldRoomId);
  joinRoom(ws, newRoomId);
};

const leaveRoom = (ws, roomId) => {
  const roomSet = rooms.get(roomId);

  if (roomId && roomSet) {
    roomSet.delete(ws);
    // roomSet.forEach((client) => {
    //   if (client !== ws) {
    //     client.send(JSON.stringify({ type: "USER_LEFT", user: ws.userId }));
    //   }
    // });
  }

  if (roomSet?.size === 0) {
    rooms.delete(roomId);
  }
};

const joinRoom = (ws, roomId) => {
  let roomSet = rooms.get(roomId);

  if (!roomSet) {
    roomSet = new Set();
    rooms.set(roomId, roomSet);
  }

  roomSet.add(ws);
  // roomSet.forEach((client) => {
  //   if (client !== ws) {
  //     client.send(JSON.stringify({ type: "USER_JOINED", user: ws.userId }));
  //   }
  // });

  ws.roomId = roomId;
};

const handleMessage = (message, ws) => {
  const enrichedMessage = {
    ...message,
    serverTimestamp: new Date().toISOString(),
    status: "delivered",
  };

  const roomClients = rooms.get(ws.roomId);

  roomClients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(enrichedMessage));
    }
  });
};

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
