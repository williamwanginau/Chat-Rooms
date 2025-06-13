const express = require("express");
const cors = require("cors");
const WebSocket = require("ws");
const { handleMessage } = require("./websocket/messageHandlers");
const setupRoomRoutes = require("./routes/rooms");

const createApp = () => {
  const app = express();
  const rooms = new Map();

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Routes
  app.use("/api/room", setupRoomRoutes(rooms));

  return { app, rooms };
};

const createWebSocketServer = (port, rooms) => {
  const wss = new WebSocket.Server({ port });

  wss.on("connection", (ws) => {
    console.log("Client connected");

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message, ws, rooms);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    ws.on("close", () => {
      console.log("Client disconnected");
      if (ws.roomId && rooms.has(ws.roomId)) {
        const room = rooms.get(ws.roomId);
        const remainingClients = room.removeClient(ws);

        if (remainingClients === 0) {
          rooms.delete(ws.roomId);
          console.log(`Room ${ws.roomId} is empty, deleted.`);
        }
      }
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return wss;
};

module.exports = { createApp, createWebSocketServer };