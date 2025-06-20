// Room user settings management
// Handles personalized room settings for each user

const ROOM_SETTINGS_KEY = "userRoomSettings";

// Default room settings structure
const createDefaultSettings = () => ({
  customName: null,
  customAvatar: null,
  isMuted: false,
  isPinned: false,
  theme: "default",
  unreadCount: 0,
  lastReadMessageId: null,
  joinedAt: null,
  lastUpdated: new Date().toISOString(),
});

// Get all user room settings from localStorage
export const getAllRoomSettings = (userId) => {
  try {
    const allSettings = JSON.parse(
      localStorage.getItem(ROOM_SETTINGS_KEY) || "{}"
    );
    return allSettings[userId] || {};
  } catch (error) {
    console.error("Error reading room settings:", error);
    return {};
  }
};

// Get settings for a specific room for a specific user
export const getRoomSettings = (userId, roomId) => {
  const userSettings = getAllRoomSettings(userId);
  return userSettings[roomId] || createDefaultSettings();
};

// Update settings for a specific room for a specific user
export const updateRoomSettings = (userId, roomId, newSettings) => {
  try {
    const allSettings = JSON.parse(
      localStorage.getItem(ROOM_SETTINGS_KEY) || "{}"
    );

    if (!allSettings[userId]) {
      allSettings[userId] = {};
    }

    if (!allSettings[userId][roomId]) {
      allSettings[userId][roomId] = createDefaultSettings();
    }

    // Merge new settings with existing ones
    allSettings[userId][roomId] = {
      ...allSettings[userId][roomId],
      ...newSettings,
      lastUpdated: new Date().toISOString(),
    };

    localStorage.setItem(ROOM_SETTINGS_KEY, JSON.stringify(allSettings));
    return allSettings[userId][roomId];
  } catch (error) {
    console.error("Error updating room settings:", error);
    return null;
  }
};

// Get the display name for a room from the user's perspective
export const getRoomDisplayName = (room, currentUser) => {
  if (!room || !currentUser?.id) return room?.name || "Unknown";

  // Get user's custom settings for this room
  const settings = getRoomSettings(currentUser.id, room.id);

  // If user has set a custom name, use it
  if (settings.customName && settings.customName.trim()) {
    return settings.customName.trim();
  }

  // For private chats, show the other person's name
  if (room.type === "private" && room.participants) {
    const otherParticipantId = room.participants.find(
      (id) => id !== currentUser.id
    );
    if (otherParticipantId) {
      // Try to get the participant's name from friends list or use fallback
      return room.name || `Chat with ${otherParticipantId}`;
    }
  }

  // For group chats or fallback, use the original room name
  return room.name || "Unknown Room";
};

// Get the display avatar for a room from the user's perspective
export const getRoomDisplayAvatar = (room, currentUser) => {
  if (!room || !currentUser?.id) return room?.avatar || "💬";

  const settings = getRoomSettings(currentUser.id, room.id);

  // If user has set a custom avatar, use it
  if (settings.customAvatar && settings.customAvatar.trim()) {
    return settings.customAvatar.trim();
  }

  // Use the original room avatar
  return room.avatar || "💬";
};

// Update just the custom name for a room
export const updateRoomCustomName = (userId, roomId, customName) => {
  return updateRoomSettings(userId, roomId, { customName });
};

// Update just the custom avatar for a room
export const updateRoomCustomAvatar = (userId, roomId, customAvatar) => {
  return updateRoomSettings(userId, roomId, { customAvatar });
};

// Update unread count for a room
export const updateRoomUnreadCount = (userId, roomId, unreadCount) => {
  return updateRoomSettings(userId, roomId, { unreadCount });
};

// Mark room as read (set unread count to 0 and update last read message)
export const markRoomAsRead = (userId, roomId, lastReadMessageId = null) => {
  const updates = { unreadCount: 0 };
  if (lastReadMessageId) {
    updates.lastReadMessageId = lastReadMessageId;
  }
  return updateRoomSettings(userId, roomId, updates);
};

// Increment unread count for a room
export const incrementUnreadCount = (userId, roomId) => {
  const currentSettings = getRoomSettings(userId, roomId);
  const newCount = (currentSettings.unreadCount || 0) + 1;
  return updateRoomSettings(userId, roomId, { unreadCount: newCount });
};

// Remove all custom settings for a room (reset to defaults)
export const resetRoomSettings = (userId, roomId) => {
  try {
    const allSettings = JSON.parse(
      localStorage.getItem(ROOM_SETTINGS_KEY) || "{}"
    );

    if (allSettings[userId] && allSettings[userId][roomId]) {
      delete allSettings[userId][roomId];
      localStorage.setItem(ROOM_SETTINGS_KEY, JSON.stringify(allSettings));
    }

    return true;
  } catch (error) {
    console.error("Error resetting room settings:", error);
    return false;
  }
};

// Clear all room settings for a user
export const clearAllUserRoomSettings = (userId) => {
  try {
    const allSettings = JSON.parse(
      localStorage.getItem(ROOM_SETTINGS_KEY) || "{}"
    );

    if (allSettings[userId]) {
      delete allSettings[userId];
      localStorage.setItem(ROOM_SETTINGS_KEY, JSON.stringify(allSettings));
    }

    return true;
  } catch (error) {
    console.error("Error clearing user room settings:", error);
    return false;
  }
};

// Export settings structure for reference
export { createDefaultSettings };
