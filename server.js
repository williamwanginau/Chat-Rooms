const { createApp, createWebSocketServer } = require("./server/src/app");

const PORT = 3000;
const WS_PORT = 8080;

// Create Express app and shared resources
const { app, rooms } = createApp();

// Create WebSocket server
const wss = createWebSocketServer(WS_PORT, rooms);

// Start HTTP server
app.listen(PORT, () => {
  console.log(`HTTP Server is running on port ${PORT}`);
});

console.log(`WebSocket Server is running on port ${WS_PORT}`);