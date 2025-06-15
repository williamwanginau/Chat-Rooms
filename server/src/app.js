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
  const allClients = new Set(); // Track all connected clients globally

  wss.on("connection", (ws) => {
    console.log("\n" + "🟢".repeat(20) + " CLIENT CONNECTED " + "🟢".repeat(20));
    allClients.add(ws); // Add to global client list
    console.log(`📊 Total connected clients: ${allClients.size}`);
    console.log("🟢".repeat(60));

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message, ws, rooms, allClients);
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    ws.on("close", () => {
      console.log("\n" + "🔴".repeat(20) + " CLIENT DISCONNECTED " + "🔴".repeat(20));
      console.log(`👤 Disconnected user:`, ws.userInfo);
      allClients.delete(ws); // Remove from global client list
      console.log(`📊 Remaining connected clients: ${allClients.size}`);
      
      if (ws.roomId && rooms.has(ws.roomId)) {
        const room = rooms.get(ws.roomId);
        const remainingClients = room.removeClient(ws);
        console.log(`🏠 Left room ${ws.roomId}, remaining in room: ${remainingClients}`);

        if (remainingClients === 0) {
          rooms.delete(ws.roomId);
          console.log(`🗑️ Room ${ws.roomId} is empty, deleted.`);
        }
      }
      console.log("🔴".repeat(60));
    });

    ws.on("error", (error) => {
      console.error("WebSocket error:", error);
    });
  });

  return wss;
};

module.exports = { createApp, createWebSocketServer };