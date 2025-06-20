// 混合方案的房間管理器
// 分離核心房間資料和使用者個人化設定

import {
  getRoomSettings,
  updateRoomSettings,
  getRoomDisplayName,
  getRoomDisplayAvatar,
} from "./roomSettings";

// LocalStorage Keys
const ROOMS_KEY = "rooms"; // 全域房間資料
const USER_ROOMS_PREFIX = "user_"; // 使用者房間列表 prefix
const USER_ROOMS_SUFFIX = "_rooms"; // 使用者房間列表 suffix

/**
 * 房間管理器 - 實現混合架構
 */
export class RoomManager {
  // ===== 全域房間資料管理 =====

  /**
   * 獲取所有房間資料
   */
  static getAllRooms() {
    try {
      return JSON.parse(localStorage.getItem(ROOMS_KEY) || "{}");
    } catch (error) {
      console.error("Error reading rooms data:", error);
      return {};
    }
  }

  /**
   * 獲取特定房間資料
   */
  static getRoomInfo(roomId) {
    const rooms = this.getAllRooms();
    return rooms[roomId] || null;
  }

  /**
   * 儲存或更新房間資料
   */
  static saveRoomInfo(roomData) {
    try {
      const rooms = this.getAllRooms();
      rooms[roomData.id] = {
        ...rooms[roomData.id], // 保留現有資料
        ...roomData, // 覆蓋新資料
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
      return rooms[roomData.id];
    } catch (error) {
      console.error("Error saving room info:", error);
      return null;
    }
  }

  /**
   * 創建新房間
   */
  static async createRoom(roomData, creatorUserId) {
    try {
      // 1. 儲存房間基本資料
      const savedRoom = this.saveRoomInfo({
        ...roomData,
        createdBy: creatorUserId,
        createdAt: new Date().toISOString(),
        isActive: true,
      });

      // 2. 將房間加入創建者的房間列表
      this.addRoomToUser(creatorUserId, roomData.id);

      // 3. 如果有其他參與者，也加入他們的房間列表
      if (roomData.participants && Array.isArray(roomData.participants)) {
        roomData.participants.forEach((participantId) => {
          if (participantId !== creatorUserId) {
            this.addRoomToUser(participantId, roomData.id);
          }
        });
      }

      console.log("🆕 Room created:", savedRoom);
      return savedRoom;
    } catch (error) {
      console.error("Error creating room:", error);
      throw error;
    }
  }

  /**
   * 更新房間最後訊息
   */
  static updateRoomLastMessage(roomId, messageData) {
    try {
      const rooms = this.getAllRooms();
      if (rooms[roomId]) {
        rooms[roomId].lastMessage = {
          id: messageData.messageId,
          content: messageData.message,
          senderId: messageData.sender?.id,
          senderName: messageData.sender?.name,
          timestamp: messageData.clientTimestamp,
        };
        rooms[roomId].lastMessageTime = messageData.clientTimestamp;
        localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
      }
    } catch (error) {
      console.error("Error updating room last message:", error);
    }
  }

  // ===== 使用者房間列表管理 =====

  /**
   * 獲取使用者的房間 ID 列表
   */
  static getUserRoomIds(userId) {
    try {
      const key = `${USER_ROOMS_PREFIX}${userId}${USER_ROOMS_SUFFIX}`;
      return JSON.parse(localStorage.getItem(key) || "[]");
    } catch (error) {
      console.error("Error reading user rooms:", error);
      return [];
    }
  }

  /**
   * 將房間加入使用者列表
   */
  static addRoomToUser(userId, roomId) {
    try {
      const userRooms = this.getUserRoomIds(userId);
      if (!userRooms.includes(roomId)) {
        userRooms.push(roomId);
        const key = `${USER_ROOMS_PREFIX}${userId}${USER_ROOMS_SUFFIX}`;
        localStorage.setItem(key, JSON.stringify(userRooms));
      }
    } catch (error) {
      console.error("Error adding room to user:", error);
    }
  }

  /**
   * 從使用者列表移除房間
   */
  static removeRoomFromUser(userId, roomId) {
    try {
      const userRooms = this.getUserRoomIds(userId);
      const filteredRooms = userRooms.filter((id) => id !== roomId);
      const key = `${USER_ROOMS_PREFIX}${userId}${USER_ROOMS_SUFFIX}`;
      localStorage.setItem(key, JSON.stringify(filteredRooms));
    } catch (error) {
      console.error("Error removing room from user:", error);
    }
  }

  // ===== 整合方法 =====

  /**
   * 獲取使用者的完整房間列表（含個人化設定）
   */
  static getUserRooms(userId) {
    try {
      const userRoomIds = this.getUserRoomIds(userId);
      const rooms = this.getAllRooms();

      return userRoomIds
        .map((roomId) => {
          const roomInfo = rooms[roomId];
          if (!roomInfo) {
            console.warn(`Room ${roomId} not found in global rooms data`);
            return null;
          }

          // 獲取個人化設定
          const settings = getRoomSettings(userId, roomId);

          return {
            ...roomInfo,
            // 個人化設定覆蓋
            displayName: settings.customName || roomInfo.name,
            displayAvatar: settings.customAvatar || roomInfo.avatar,
            unreadCount: settings.unreadCount || 0,
            isMuted: settings.isMuted || false,
            isPinned: settings.isPinned || false,
            lastReadMessageId: settings.lastReadMessageId,
            joinedAt: settings.joinedAt,
          };
        })
        .filter(Boolean) // 移除 null 值
        .sort((a, b) => {
          // 置頂房間優先
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;

          // 然後按最後訊息時間排序
          const timeA = a.lastMessageTime
            ? new Date(a.lastMessageTime).getTime()
            : 0;
          const timeB = b.lastMessageTime
            ? new Date(b.lastMessageTime).getTime()
            : 0;
          return timeB - timeA;
        });
    } catch (error) {
      console.error("Error getting user rooms:", error);
      return [];
    }
  }

  // ===== 遷移工具 =====

  /**
   * 從舊的 customRooms 格式遷移到新的混合格式
   */
  static migrateFromLegacyFormat(userId) {
    try {
      console.log("🔄 Starting migration from legacy customRooms format...");

      // 1. 讀取舊的 customRooms 資料
      const legacyRooms = JSON.parse(
        localStorage.getItem("customRooms") || "[]"
      );

      if (legacyRooms.length === 0) {
        console.log("📭 No legacy rooms to migrate");
        return { migrated: 0 };
      }

      console.log(`📦 Found ${legacyRooms.length} legacy rooms to migrate`);

      // 2. 遷移每個房間
      const rooms = this.getAllRooms();
      const userRoomIds = [];

      legacyRooms.forEach((room) => {
        // 儲存到全域房間資料
        rooms[room.id] = {
          id: room.id,
          name: room.name,
          type: room.type || "private",
          avatar: room.avatar,
          description: room.description,
          participants: room.participants || [],
          createdBy: room.createdBy || userId,
          createdAt: room.createdAt || new Date().toISOString(),
          isActive: true,
          lastMessage: room.lastMessage
            ? {
                content: room.lastMessage,
                timestamp: room.lastMessageTime,
                senderName: room.lastMessageSender,
              }
            : null,
          lastMessageTime: room.lastMessageTime,
        };

        // 加入使用者房間列表
        userRoomIds.push(room.id);

        // 遷移個人化設定（如果有的話）
        if (room.unreadCount || room.customName || room.customAvatar) {
          updateRoomSettings(userId, room.id, {
            unreadCount: room.unreadCount || 0,
            customName: room.customName || null,
            customAvatar: room.customAvatar || null,
            isMuted: room.isMuted || false,
            isPinned: room.isPinned || false,
          });
        }
      });

      // 3. 儲存遷移後的資料
      localStorage.setItem(ROOMS_KEY, JSON.stringify(rooms));
      const userRoomsKey = `${USER_ROOMS_PREFIX}${userId}${USER_ROOMS_SUFFIX}`;
      localStorage.setItem(userRoomsKey, JSON.stringify(userRoomIds));

      // 4. 備份並清理舊資料
      localStorage.setItem("customRooms_backup", JSON.stringify(legacyRooms));
      localStorage.removeItem("customRooms");

      console.log(
        `✅ Migration completed: ${legacyRooms.length} rooms migrated`
      );
      console.log("💾 Legacy data backed up as 'customRooms_backup'");

      return { migrated: legacyRooms.length, backup: true };
    } catch (error) {
      console.error("❌ Migration failed:", error);
      throw error;
    }
  }

  /**
   * 檢查是否需要遷移
   */
  static needsMigration() {
    const hasLegacyData = localStorage.getItem("customRooms");
    const hasNewData = localStorage.getItem(ROOMS_KEY);
    return !!hasLegacyData && !hasNewData;
  }

  // ===== 調試工具 =====

  /**
   * 獲取資料統計
   */
  static getDataStats(userId) {
    const rooms = this.getAllRooms();
    const userRoomIds = this.getUserRoomIds(userId);
    const userRooms = this.getUserRooms(userId);

    return {
      totalRooms: Object.keys(rooms).length,
      userRoomsCount: userRoomIds.length,
      userRoomsWithSettings: userRooms.length,
      needsMigration: this.needsMigration(),
      storageKeys: {
        rooms: ROOMS_KEY,
        userRooms: `${USER_ROOMS_PREFIX}${userId}${USER_ROOMS_SUFFIX}`,
      },
    };
  }
}

export default RoomManager;
