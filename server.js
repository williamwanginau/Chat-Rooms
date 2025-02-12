const express = require("express");
const app = express();
const WebSocket = require("ws");
const PORT = 3000;
const WS_PORT = 3001;
const wss = new WebSocket.Server({ port: WS_PORT });

const rooms = new Map();

const messageHistory = new Map();
const MESSAGE_HISTORY_LIMIT = 100;

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.onmessage = (event) => {
    console.log(`Received message: ${event.data}`);
    const message = JSON.parse(event.data);

    ws.roomId = message.room.id;

    if (!rooms.has(ws.roomId)) {
      rooms.set(ws.roomId, new Set());
    }

    rooms.get(ws.roomId).add(ws);

    const enrichedMessage = {
      ...message,
      serverTimestamp: new Date().toISOString(),
      status: "delivered",
      // sequence: generateSequenceNumber(),
    };

    const roomClients = rooms.get(ws.roomId);

    roomClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(enrichedMessage));
      }
    });
  };

  ws.on("close", () => {
    if (ws.roomId && rooms.has(ws.roomId)) {
      rooms.get(ws.roomId).delete(ws);

      if (rooms.get(ws.roomId).size === 0) {
        rooms.delete(ws.roomId);
      }
    }
  });
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
