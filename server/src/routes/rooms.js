const express = require("express");
const router = express.Router();
const Chatroom = require("../models/Chatroom");

const setupRoomRoutes = (rooms) => {
  router.get("/:roomId/history", (req, res) => {
    console.log("Room history API called for roomId:", req.params.roomId);
    const roomId = req.params.roomId;
    const room = rooms.get(roomId);

    res.setHeader("Content-Type", "application/json");
    const history = room?.history || [];
    res.json(history);
  });

  router.get("/:roomId/users", (req, res) => {
    const roomId = req.params.roomId;
    const room = rooms.get(roomId);

    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    const users = room.getUsers();
    res.json(users);
  });

  // Create a new room
  router.post("/create", (req, res) => {
    const { id, name, description } = req.body;

    // Validate input
    if (!id || !name) {
      res.status(400).json({ error: "Room ID and name are required" });
      return;
    }

    // Check if room already exists
    if (rooms.has(id)) {
      res.status(409).json({ error: "Room with this ID already exists" });
      return;
    }

    try {
      // Create the room
      const room = new Chatroom(id, {
        name: name.trim(),
        description: description?.trim() || "",
        isCustom: true,
        createdAt: new Date().toISOString()
      });

      // Add to rooms map
      rooms.set(id, room);

      console.log(`Room ${id} created: ${name}`);

      res.status(201).json({
        id: room.roomId,
        name: room.name,
        description: room.description,
        isCustom: room.isCustom,
        createdAt: room.createdAt
      });
    } catch (error) {
      console.error("Error creating room:", error);
      res.status(500).json({ error: "Failed to create room" });
    }
  });

  // Check if room exists
  router.get("/:roomId/exists", (req, res) => {
    const roomId = req.params.roomId;
    const exists = rooms.has(roomId);
    
    res.json({ exists, roomId });
  });

  // Get room information
  router.get("/:roomId/info", (req, res) => {
    const roomId = req.params.roomId;
    const room = rooms.get(roomId);

    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    res.json({
      id: room.roomId,
      name: room.name || roomId,
      description: room.description || "",
      isCustom: room.isCustom || false,
      createdAt: room.createdAt || null,
      userCount: room.clients.size
    });
  });

  return router;
};

module.exports = setupRoomRoutes;