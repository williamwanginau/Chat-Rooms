const MESSAGE_TYPES = require("../../../shared/messageTypes.json");
const {
  getIdFromUsername,
  getUserInfoByUsername,
} = require("../utils/userUtils");

const handleUserInfo = async (message, ws) => {
  ws.userInfo = message.user;
  console.log("\n🆔 USER INFO RECEIVED:");
  console.log("📝 User Data:", JSON.stringify(message.user, null, 2));
  console.log("✅ User info stored on WebSocket connection");
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

const getOrCreateRoom = (roomId, rooms, metadata = {}) => {
  const Chatroom = require("../models/Chatroom");

  let room = rooms.get(roomId);
  if (!room) {
    // For dynamic room creation, use minimal metadata
    const roomMetadata = {
      name: metadata.name || roomId,
      description: metadata.description || "",
      isCustom: metadata.isCustom !== undefined ? metadata.isCustom : true,
      createdAt: new Date().toISOString(),
    };

    room = new Chatroom(roomId, roomMetadata);
    rooms.set(roomId, room);
    console.log(`Room ${roomId} created dynamically`);
  }
  return room;
};

const handleUserJoined = (message, ws, rooms) => {
  if (!ws.roomId || !rooms.has(ws.roomId)) {
    console.log("No room found for user joined message");
    return;
  }

  const room = rooms.get(ws.roomId);

  // Broadcast user joined message to all users in the room (including sender for dev tool)
  room.broadcastToAll({
    ...message,
    serverTimestamp: new Date().toISOString(),
  });

  console.log(
    `Virtual user ${message.user?.name} joined room ${ws.roomId} (dev simulation)`
  );
};

const handleUserLeft = (message, ws, rooms) => {
  if (!ws.roomId || !rooms.has(ws.roomId)) {
    console.log("No room found for user left message");
    return;
  }

  const room = rooms.get(ws.roomId);

  // Broadcast user left message to all users in the room (including sender for dev tool)
  room.broadcastToAll({
    ...message,
    serverTimestamp: new Date().toISOString(),
  });

  console.log(
    `Virtual user ${message.user?.name} left room ${ws.roomId} (dev simulation)`
  );
};

const handleUsersDataSync = (message, ws, rooms) => {
  console.log("Received users data sync request, broadcasting to all rooms");

  // Broadcast the users data sync message to all rooms
  const syncMessage = {
    ...message,
    serverTimestamp: new Date().toISOString(),
  };

  rooms.forEach((room) => {
    room.broadcastToAll(syncMessage);
  });

  console.log(
    `Users data sync broadcasted to all ${rooms.size} rooms with ${
      message.users?.length || 0
    } users`
  );
};

const handleFriendInvitationSent = async (
  message,
  ws,
  rooms,
  allClients = null
) => {
  const { toUserId, invitationData } = message;

  try {
    console.log(`\n--- DEBUG: Friend invitation process ---`);
    console.log(`From user: ${ws.userInfo?.username} (ID: ${ws.userInfo?.id})`);
    console.log(`To user: ${toUserId}`);

    // First try to find user in connected clients (for new users)
    let toId = null;
    let targetWs = null;

    console.log(`\n--- DEBUG: Searching in connected clients ---`);
    console.log(`Total rooms: ${rooms.size}`);
    console.log(
      `Total global clients: ${allClients ? allClients.size : "N/A"}`
    );

    // Search in rooms first
    rooms.forEach((room, roomId) => {
      console.log(`Room ${roomId}: ${room.clients.size} clients`);
      room.clients.forEach((client, index) => {
        console.log(
          `  Client ${index}: username="${client.userInfo?.username}", id="${client.userInfo?.id}"`
        );
        if (client.userInfo && client.userInfo.username === toUserId) {
          toId = client.userInfo.id;
          targetWs = client;
          console.log(`  ✓ FOUND target user in room ${roomId}!`);
        }
      });
    });

    // If not found in rooms, search in all global clients
    if (!toId && allClients) {
      console.log(
        `\n--- DEBUG: Searching in global clients (outside rooms) ---`
      );
      let clientIndex = 0;
      for (const client of allClients) {
        console.log(
          `  Global Client ${clientIndex}: username="${client.userInfo?.username}", id="${client.userInfo?.id}"`
        );
        if (client.userInfo && client.userInfo.username === toUserId) {
          toId = client.userInfo.id;
          targetWs = client;
          console.log(`  ✓ FOUND target user in global clients!`);
          break;
        }
        clientIndex++;
      }
    }

    // If not found in connected clients, try dummy data (for existing users)
    if (!toId) {
      console.log(
        `\n--- DEBUG: Not found in connected clients, checking dummy data ---`
      );
      toId = await getIdFromUsername(toUserId);
      console.log(`Dummy data lookup result: ${toId}`);
    }

    if (!toId) {
      throw new Error(`User with username ${toUserId} not found`);
    }

    console.log(`\n--- DEBUG: Target user resolved ---`);
    console.log(`Target ID: ${toId}`);

    // Create invitation object using IDs
    const invitation = {
      id: `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fromUserId: ws.userInfo.id,
      toUserId: toId,
      message: invitationData.message || "",
      timestamp: new Date().toISOString(),
    };

    console.log(`\n--- DEBUG: Sending invitation ---`);

    let sentToClients = 0;

    // If we found the target user directly, send to them
    if (targetWs) {
      console.log(`✓ Sending invitation directly to found user`);
      const invitationMessage = {
        type: MESSAGE_TYPES.FRIEND_INVITATION_RECEIVED,
        invitation: {
          id: invitation.id,
          fromUserId: invitation.fromUserId,
          message: invitation.message,
          timestamp: invitation.timestamp,
        },
        serverTimestamp: new Date().toISOString(),
      };

      targetWs.send(JSON.stringify(invitationMessage));
      sentToClients = 1;
    } else {
      // Fallback: search by ID in all clients (in case there are multiple connections)
      console.log(`Looking for clients with ID ${toId} as fallback ---`);

      rooms.forEach((room, roomId) => {
        room.clients.forEach((client, index) => {
          console.log(
            `Room ${roomId}, Client ${index}: userInfo=${JSON.stringify(
              client.userInfo
            )}`
          );
          console.log(
            `  Comparing: "${client.userInfo?.id}" === "${toId}" ? ${
              client.userInfo?.id === toId
            }`
          );

          if (client.userInfo && client.userInfo.id === toId) {
            console.log(`  ✓ MATCH! Sending invitation to client`);
            const invitationMessage = {
              type: MESSAGE_TYPES.FRIEND_INVITATION_RECEIVED,
              invitation: {
                id: invitation.id,
                fromUserId: invitation.fromUserId,
                message: invitation.message,
                timestamp: invitation.timestamp,
              },
              serverTimestamp: new Date().toISOString(),
            };

            client.send(JSON.stringify(invitationMessage));
            sentToClients++;
          } else {
            console.log(`  ✗ No match`);
          }
        });
      });

      // Also search in global clients if available
      if (sentToClients === 0 && allClients) {
        console.log(`Searching in global clients for ID ${toId}`);
        for (const client of allClients) {
          if (client.userInfo && client.userInfo.id === toId) {
            console.log(`  ✓ MATCH in global clients! Sending invitation`);
            const invitationMessage = {
              type: MESSAGE_TYPES.FRIEND_INVITATION_RECEIVED,
              invitation: {
                id: invitation.id,
                fromUserId: invitation.fromUserId,
                message: invitation.message,
                timestamp: invitation.timestamp,
              },
              serverTimestamp: new Date().toISOString(),
            };

            client.send(JSON.stringify(invitationMessage));
            sentToClients++;
          }
        }
      }
    }

    console.log(`\n--- DEBUG: Final result ---`);
    console.log(
      `Friend invitation sent from ${ws.userInfo?.id} to ${toId} (${sentToClients} clients notified)`
    );

    // Confirm to sender that invitation was sent
    const responseMessage = {
      type: MESSAGE_TYPES.FRIEND_INVITATION_SENT,
      success: true,
      toUserId,
      invitation,
      clientsNotified: sentToClients,
      serverTimestamp: new Date().toISOString(),
    };

    // Add warning if user is offline
    if (sentToClients === 0) {
      responseMessage.warning = `User ${toUserId} is currently offline. They will receive the invitation when they connect.`;
      console.log(
        `⚠️ User ${toUserId} is offline - invitation stored for later delivery`
      );

      // DEBUG: Test broadcast to all connected users for verification
      console.log(
        `\n--- DEBUG: Broadcasting test invitation to ALL connected users ---`
      );
      let testBroadcastCount = 0;
      rooms.forEach((room, roomId) => {
        room.clients.forEach((client, index) => {
          if (client !== ws) {
            // Don't send to sender
            console.log(
              `  Sending test invitation to client in room ${roomId}`
            );
            const testInvitationMessage = {
              type: MESSAGE_TYPES.FRIEND_INVITATION_RECEIVED,
              invitation: {
                id: invitation.id,
                fromUserId: invitation.fromUserId,
                message: `[TEST BROADCAST] ${invitation.message}`,
                timestamp: invitation.timestamp,
              },
              serverTimestamp: new Date().toISOString(),
            };
            client.send(JSON.stringify(testInvitationMessage));
            testBroadcastCount++;
          }
        });
      });
      console.log(`Test broadcast sent to ${testBroadcastCount} clients`);
    }

    ws.send(JSON.stringify(responseMessage));
  } catch (error) {
    console.error("Error handling friend invitation:", error);
    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPES.FRIEND_INVITATION_SENT,
        success: false,
        error: error.message,
        toUserId,
        serverTimestamp: new Date().toISOString(),
      })
    );
  }
};

const handleFriendInvitationAccepted = async (
  message,
  ws,
  rooms,
  allClients = null
) => {
  const { invitationId, fromUserId } = message;

  try {
    console.log(`\n--- DEBUG: Friend invitation acceptance ---`);
    console.log(`Accepter: ${ws.userInfo?.username} (ID: ${ws.userInfo?.id})`);
    console.log(`From user: ${fromUserId}`);

    // Check if fromUserId is already an ID (UUID format) or a username
    let fromId = fromUserId;
    let isAlreadyId =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        fromUserId
      );

    if (!isAlreadyId) {
      // It's a username, convert to ID
      console.log(`Converting username ${fromUserId} to ID...`);
      fromId = await getIdFromUsername(fromUserId);
      if (!fromId) {
        throw new Error(`Sender user with username ${fromUserId} not found`);
      }
    } else {
      console.log(`fromUserId is already an ID: ${fromUserId}`);
    }

    console.log(`Sender ID resolved: ${fromId}`);

    // Find the sender across all rooms using ID
    let senderWs = null;
    rooms.forEach((room) => {
      room.clients.forEach((client) => {
        if (client.userInfo && client.userInfo.id === fromId) {
          senderWs = client;
          console.log(`✓ Found sender in room`);
        }
      });
    });

    // If not found in rooms, search in global clients
    if (!senderWs && allClients) {
      console.log(`Searching for sender in global clients...`);
      for (const client of allClients) {
        if (client.userInfo && client.userInfo.id === fromId) {
          senderWs = client;
          console.log(`✓ Found sender in global clients`);
          break;
        }
      }
    }

    // Send friendship creation data to both users (let frontend handle storage)
    const friendshipData = {
      user1: fromId, // sender
      user2: ws.userInfo.id, // accepter
      initiatedBy: fromId, // initiated by sender
      createdAt: new Date().toISOString(),
      status: "active",
    };

    // Notify sender that invitation was accepted (if online)
    if (senderWs) {
      console.log(`✓ Notifying sender that invitation was accepted`);
      senderWs.send(
        JSON.stringify({
          type: MESSAGE_TYPES.FRIEND_INVITATION_ACCEPTED,
          invitationId,
          acceptedBy: ws.userInfo,
          serverTimestamp: new Date().toISOString(),
        })
      );

      // Send friend added notifications to both users with friendship data
      const friendAddedMessage = {
        type: MESSAGE_TYPES.FRIEND_ADDED,
        friendshipData: friendshipData,
        serverTimestamp: new Date().toISOString(),
      };

      // Notify sender they have a new friend
      console.log(
        `✓ Sending FRIEND_ADDED to sender with new friend:`,
        ws.userInfo
      );
      senderWs.send(
        JSON.stringify({
          ...friendAddedMessage,
          newFriend: ws.userInfo,
        })
      );

      // Notify accepter they have a new friend
      console.log(
        `✓ Sending FRIEND_ADDED to accepter with new friend:`,
        senderWs.userInfo
      );
      ws.send(
        JSON.stringify({
          ...friendAddedMessage,
          newFriend: senderWs.userInfo,
        })
      );

      console.log(
        `✅ Friend invitation accepted: ${fromId} and ${ws.userInfo?.id} are now friends`
      );
    } else {
      console.log(
        `Friend invitation accepted (sender offline): ${fromId} and ${ws.userInfo?.id} are now friends`
      );

      // Still notify the accepter (but need to get sender info)
      const senderInfo = await getUserInfoByUsername(fromUserId);
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPES.FRIEND_ADDED,
          friendshipData: friendshipData,
          newFriend: senderInfo || { id: fromId, username: fromUserId },
          serverTimestamp: new Date().toISOString(),
        })
      );
    }
  } catch (error) {
    console.error("Error handling friend invitation acceptance:", error);
    ws.send(
      JSON.stringify({
        type: MESSAGE_TYPES.FRIEND_INVITATION_ACCEPTED,
        success: false,
        error: error.message,
        invitationId,
        serverTimestamp: new Date().toISOString(),
      })
    );
  }
};

const handleFriendInvitationDeclined = async (message, ws, rooms) => {
  const { invitationId, fromUserId } = message;

  try {
    // Convert username to ID for lookup
    const fromId = await getIdFromUsername(fromUserId);
    if (!fromId) {
      throw new Error(`Sender user with username ${fromUserId} not found`);
    }

    // Find the sender across all rooms using ID
    let senderWs = null;
    rooms.forEach((room) => {
      room.clients.forEach((client) => {
        if (client.userInfo && client.userInfo.id === fromId) {
          senderWs = client;
        }
      });
    });

    // Notify sender that invitation was declined (if online)
    if (senderWs) {
      senderWs.send(
        JSON.stringify({
          type: MESSAGE_TYPES.FRIEND_INVITATION_DECLINED,
          invitationId,
          declinedBy: ws.userInfo,
          serverTimestamp: new Date().toISOString(),
        })
      );

      console.log(
        `Friend invitation declined: ${ws.userInfo?.username} declined invitation from ${fromUserId}`
      );
    } else {
      console.log(
        `Friend invitation declined (sender offline): ${ws.userInfo?.username} declined invitation from ${fromUserId}`
      );
    }
  } catch (error) {
    console.error("Error handling friend invitation decline:", error);
  }
};

const handleFriendInvitationCancelled = async (message, ws, rooms) => {
  const { invitationId, toUserId } = message;

  try {
    // Convert username to ID for lookup
    const toId = await getIdFromUsername(toUserId);
    if (!toId) {
      throw new Error(`Target user with username ${toUserId} not found`);
    }

    // Find the target user across all rooms using ID
    let targetWs = null;
    rooms.forEach((room) => {
      room.clients.forEach((client) => {
        if (client.userInfo && client.userInfo.id === toId) {
          targetWs = client;
        }
      });
    });

    // Notify target user that invitation was cancelled (if online)
    if (targetWs) {
      targetWs.send(
        JSON.stringify({
          type: MESSAGE_TYPES.FRIEND_INVITATION_CANCELLED,
          invitationId,
          cancelledBy: ws.userInfo,
          serverTimestamp: new Date().toISOString(),
        })
      );

      console.log(
        `Friend invitation cancelled: ${ws.userInfo?.username} cancelled invitation to ${toUserId}`
      );
    } else {
      console.log(
        `Friend invitation cancelled (target offline): ${ws.userInfo?.username} cancelled invitation to ${toUserId}`
      );
    }
  } catch (error) {
    console.error("Error handling friend invitation cancellation:", error);
  }
};

const handlePrivateChatCreated = async (
  message,
  ws,
  rooms,
  allClients = null
) => {
  const { roomInfo, targetUserId } = message;

  try {
    console.log(`\n--- DEBUG: Private chat creation notification ---`);
    console.log(`Creator: ${ws.userInfo?.username} (ID: ${ws.userInfo?.id})`);
    console.log(`Target user: ${targetUserId}`);
    console.log(`Room info:`, roomInfo);

    // Check if targetUserId is already an ID (UUID format) or a username
    let targetId = targetUserId;
    let isAlreadyId =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        targetUserId
      );

    if (!isAlreadyId) {
      // It's a username, convert to ID
      console.log(`Converting username ${targetUserId} to ID...`);
      targetId = await getIdFromUsername(targetUserId);
      if (!targetId) {
        console.log(`Target user with username ${targetUserId} not found`);
        return;
      }
    } else {
      console.log(`targetUserId is already an ID: ${targetUserId}`);
    }

    console.log(`Target ID resolved: ${targetId}`);

    // Find the target user across all rooms using ID
    let targetWs = null;

    console.log(`Searching for target user in rooms...`);
    rooms.forEach((room, roomId) => {
      room.clients.forEach((client) => {
        if (client.userInfo && client.userInfo.id === targetId) {
          targetWs = client;
          console.log(`✓ Found target user in room ${roomId}`);
        }
      });
    });

    // If not found in rooms, search in global clients
    if (!targetWs && allClients) {
      console.log(`Searching for target user in global clients...`);
      for (const client of allClients) {
        if (client.userInfo && client.userInfo.id === targetId) {
          targetWs = client;
          console.log(`✓ Found target user in global clients`);
          break;
        }
      }
    }

    // Notify target user about the new private chat room (if online)
    if (targetWs) {
      const notificationMessage = {
        type: MESSAGE_TYPES.PRIVATE_CHAT_CREATED,
        roomInfo,
        serverTimestamp: new Date().toISOString(),
      };

      console.log(`✅ Sending private chat notification to target user`);
      console.log(`Notification message:`, notificationMessage);
      targetWs.send(JSON.stringify(notificationMessage));
      console.log(
        `Private chat room notification sent: ${ws.userInfo?.username} -> target user`
      );
    } else {
      console.log(
        `❌ Private chat room notification not sent - user is offline`
      );
    }
  } catch (error) {
    console.error("Error handling private chat created notification:", error);
  }
};

const validateUserId = (id) => {
  if (!id || typeof id !== "string" || id.trim().length === 0) {
    return "ID cannot be empty";
  }

  const trimmedId = id.trim();

  if (trimmedId.length < 3) {
    return "ID must be at least 3 characters";
  }
  if (trimmedId.length > 20) {
    return "ID must be 20 characters or less";
  }

  // Enhanced character validation
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmedId)) {
    return "ID can only contain letters, numbers, hyphens and underscores";
  }

  // Prevent IDs starting or ending with special characters
  if (
    trimmedId.startsWith("-") ||
    trimmedId.startsWith("_") ||
    trimmedId.endsWith("-") ||
    trimmedId.endsWith("_")
  ) {
    return "ID cannot start or end with hyphens or underscores";
  }

  // Prevent consecutive special characters
  if (
    trimmedId.includes("--") ||
    trimmedId.includes("__") ||
    trimmedId.includes("-_") ||
    trimmedId.includes("_-")
  ) {
    return "ID cannot contain consecutive special characters";
  }

  // Prevent reserved words
  const reservedWords = [
    "admin",
    "system",
    "user",
    "guest",
    "bot",
    "null",
    "undefined",
    "root",
    "test",
    "demo",
  ];
  if (reservedWords.includes(trimmedId.toLowerCase())) {
    return "This ID is reserved and cannot be used";
  }

  // Must contain at least one letter
  if (!/[a-zA-Z]/.test(trimmedId)) {
    return "ID must contain at least one letter";
  }

  return null;
};

const handleUserInfoUpdated = (message, ws, rooms) => {
  // Store the old user info before updating
  const oldUserInfo = ws.userInfo;

  // Validate the new username if it's being changed
  if (message.user && message.user.username) {
    const validationError = validateUserId(message.user.username);
    if (validationError) {
      // Send error back to the client
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPES.USER_INFO_UPDATE_ERROR,
          error: validationError,
          serverTimestamp: new Date().toISOString(),
        })
      );
      console.log(`Username validation failed: ${validationError}`);
      return;
    }

    // Check for username conflicts across all connected users
    const allConnectedUsernames = [];
    rooms.forEach((room) => {
      room.clients.forEach((client) => {
        if (client.userInfo && client.userInfo.username && client !== ws) {
          allConnectedUsernames.push(client.userInfo.username);
        }
      });
    });

    if (allConnectedUsernames.includes(message.user.username)) {
      ws.send(
        JSON.stringify({
          type: MESSAGE_TYPES.USER_INFO_UPDATE_ERROR,
          error: "This username is already taken by another connected user",
          serverTimestamp: new Date().toISOString(),
        })
      );
      console.log(`Username conflict detected: ${message.user.username}`);
      return;
    }
  }

  // Update the user info on the WebSocket connection
  ws.userInfo = message.user;
  console.log("User info updated:", message.user);

  // Broadcast the user info update to all rooms for database synchronization
  const updateMessage = {
    type: MESSAGE_TYPES.USER_INFO_UPDATED,
    oldUser: oldUserInfo,
    newUser: message.user,
    serverTimestamp: new Date().toISOString(),
  };

  rooms.forEach((room) => {
    room.broadcastToAll(updateMessage);
  });

  console.log(
    `User info updated and broadcasted to all rooms: ${oldUserInfo?.name} -> ${message.user?.name}`
  );
};

const handleMessage = (message, ws, rooms, allClients = null) => {
  console.log("\n" + "=".repeat(80));
  console.log("📨 RECEIVED MESSAGE:", JSON.stringify(message, null, 2));
  console.log("👤 FROM USER:", ws.userInfo);
  console.log("🌐 GLOBAL CLIENTS COUNT:", allClients ? allClients.size : "N/A");
  console.log("🏠 ROOMS COUNT:", rooms.size);
  console.log("=".repeat(80));

  switch (message.type) {
    case MESSAGE_TYPES.USER_INFO:
      handleUserInfo(message, ws);
      break;
    case MESSAGE_TYPES.USER_INFO_UPDATED:
      handleUserInfoUpdated(message, ws, rooms);
      break;
    case MESSAGE_TYPES.MESSAGE:
      handleChatMessage(message, ws, rooms);
      break;
    case MESSAGE_TYPES.ROOM_CHANGE:
      handleRoomChange(message, ws, rooms);
      break;
    case MESSAGE_TYPES.USER_JOINED:
      handleUserJoined(message, ws, rooms);
      break;
    case MESSAGE_TYPES.USER_LEFT:
      handleUserLeft(message, ws, rooms);
      break;
    case MESSAGE_TYPES.USERS_DATA_SYNC:
      handleUsersDataSync(message, ws, rooms);
      break;
    case MESSAGE_TYPES.FRIEND_INVITATION_SENT:
      handleFriendInvitationSent(message, ws, rooms, allClients);
      break;
    case MESSAGE_TYPES.FRIEND_INVITATION_ACCEPTED:
      handleFriendInvitationAccepted(message, ws, rooms, allClients);
      break;
    case MESSAGE_TYPES.FRIEND_INVITATION_DECLINED:
      handleFriendInvitationDeclined(message, ws, rooms);
      break;
    case MESSAGE_TYPES.FRIEND_INVITATION_CANCELLED:
      handleFriendInvitationCancelled(message, ws, rooms);
      break;
    case MESSAGE_TYPES.PRIVATE_CHAT_CREATED:
      handlePrivateChatCreated(message, ws, rooms, allClients);
      break;
    default:
      console.log("Unknown message type:", message.type);
  }
};

module.exports = {
  handleMessage,
  getOrCreateRoom,
};
