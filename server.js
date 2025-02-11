const express = require("express");
const app = express();
const WebSocket = require("ws");
const PORT = 3000;
const WS_PORT = 3001;
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on("connection", (ws) => {
  console.log("Client connected");

  ws.onmessage = (event) => {
    console.log(`Received message: ${event.data}`);

    const message = JSON.parse(event.data);

    const enrichedMessage = {
      ...message,
      serverTimestamp: new Date().toISOString(),
      status: "delivered",
      // sequence: generateSequenceNumber(),
    };

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(enrichedMessage));
      }
    });
  };

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  if (ws.readyState === WebSocket.OPEN) {
    ws.send("Hello, World!");
  }
});

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
