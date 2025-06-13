const express = require("express");
const router = express.Router();

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

  return router;
};

module.exports = setupRoomRoutes;