import { useState, useEffect, useCallback } from "react";
import RoomManager from "../utils/roomManager";
import {
  updateRoomSettings,
  markRoomAsRead,
  incrementUnreadCount,
  getRoomSettings,
} from "../utils/roomSettings";
import MESSAGE_TYPES from "../../../shared/messageTypes.json";

/**
 * 新版本的 useRooms hook - 使用混合架構
 */
export const useRoomsV2 = (
  currentUser,
  selectedRoomId,
  messages,
  sendMessage,
  joinRoom,
  setMessages
) => {
  const [userRooms, setUserRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 載入使用者房間
  const loadUserRooms = useCallback(() => {
    if (!currentUser?.id) {
      setUserRooms([]);
      setIsLoading(false);
      return;
    }

    try {
      console.log("🔄 Loading user rooms...");

      // 檢查是否需要遷移
      if (RoomManager.needsMigration()) {
        console.log("📦 Migration needed, starting...");
        const result = RoomManager.migrateFromLegacyFormat(currentUser.id);
        console.log("✅ Migration result:", result);
      }

      // 載入使用者房間
      const rooms = RoomManager.getUserRooms(currentUser.id);
      console.log(
        `📊 Loaded ${rooms.length} rooms for user ${currentUser.username}`
      );

      setUserRooms(rooms);
      setIsLoading(false);
    } catch (error) {
      console.error("❌ Failed to load user rooms:", error);
      setUserRooms([]);
      setIsLoading(false);
    }
  }, [currentUser?.id, currentUser?.username]);

  // 初始載入
  useEffect(() => {
    loadUserRooms();
  }, [loadUserRooms]);

  // 監聽當前房間的新訊息，更新最後訊息
  useEffect(() => {
    if (messages.length > 0 && selectedRoomId && currentUser?.id) {
      const lastMessage = messages[messages.length - 1];

      if (!lastMessage.isSystemMessage) {
        // 更新全域房間資料
        RoomManager.updateRoomLastMessage(selectedRoomId, lastMessage);

        // 清除當前房間的未讀數量
        markRoomAsRead(currentUser.id, selectedRoomId, lastMessage.messageId);

        // 重新載入房間列表以反映變更
        loadUserRooms();
      }
    }
  }, [messages, selectedRoomId, currentUser?.id, loadUserRooms]);

  // 監聽其他房間的新訊息（未讀數量）
  useEffect(() => {
    const handleNewMessage = (event) => {
      const { roomId, message, timestamp, sender } = event.detail;

      if (roomId !== selectedRoomId && currentUser?.id) {
        // 更新全域房間的最後訊息
        RoomManager.updateRoomLastMessage(roomId, {
          messageId: `msg_${Date.now()}`,
          message,
          clientTimestamp: timestamp,
          sender: { id: sender, name: sender },
        });

        // 增加未讀數量
        incrementUnreadCount(currentUser.id, roomId);

        // 重新載入房間列表
        loadUserRooms();
      }
    };

    window.addEventListener("newMessage", handleNewMessage);
    return () => window.removeEventListener("newMessage", handleNewMessage);
  }, [selectedRoomId, currentUser?.id, loadUserRooms]);

  // 監聽私人聊天創建事件
  useEffect(() => {
    const handlePrivateChatCreated = (event) => {
      const { roomInfo } = event.detail;
      console.log("🆕 Private chat created event:", roomInfo);

      if (currentUser?.id) {
        // 儲存房間資料並加入使用者列表
        RoomManager.saveRoomInfo(roomInfo);
        RoomManager.addRoomToUser(currentUser.id, roomInfo.id);

        // 重新載入房間列表
        loadUserRooms();
      }
    };

    window.addEventListener("privateChatCreated", handlePrivateChatCreated);
    return () =>
      window.removeEventListener(
        "privateChatCreated",
        handlePrivateChatCreated
      );
  }, [currentUser?.id, loadUserRooms]);

  // 房間選擇處理
  const handleRoomSelect = useCallback(
    async (roomId) => {
      if (!currentUser?.id) return;

      try {
        joinRoom(roomId);

        // 清除未讀數量
        markRoomAsRead(currentUser.id, roomId);

        // 重新載入房間列表
        loadUserRooms();

        // 載入房間歷史
        const response = await fetch(
          `http://localhost:3000/api/room/${roomId}/history`
        );
        const data = await response.json();
        setMessages(data);

        // 更新房間最後訊息（如果有歷史訊息）
        if (data.length > 0) {
          const lastMessage = data[data.length - 1];
          if (!lastMessage.isSystemMessage) {
            RoomManager.updateRoomLastMessage(roomId, lastMessage);
            markRoomAsRead(currentUser.id, roomId, lastMessage.messageId);
          }
        }
      } catch (error) {
        console.error("Failed to select room:", error);
      }
    },
    [currentUser?.id, joinRoom, setMessages, loadUserRooms]
  );

  // 開始私人聊天
  const handleStartChat = useCallback(
    async (friend) => {
      if (!currentUser?.id) return;

      try {
        const sortedIds = [currentUser.username, friend.username].sort();
        const privateRoomId = `private_${sortedIds[0]}_${sortedIds[1]}`;

        const roomData = {
          id: privateRoomId,
          name: friend.name,
          description: `Private chat with ${friend.name}`,
          type: "private",
          avatar: friend.avatar || "👤",
          participants: [currentUser.id, friend.id],
        };

        // 檢查房間是否存在
        const existsResponse = await fetch(
          `http://localhost:3000/api/room/${privateRoomId}/exists`
        );
        const existsData = await existsResponse.json();

        if (!existsData.exists) {
          // 創建新房間
          const response = await fetch(
            "http://localhost:3000/api/room/create",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(roomData),
            }
          );

          if (response.ok) {
            const newRoom = await response.json();
            console.log("🆕 New room created:", newRoom);

            // 使用新的房間管理器儲存
            RoomManager.saveRoomInfo(newRoom);
            RoomManager.addRoomToUser(currentUser.id, newRoom.id);

            // 通知對方
            sendMessage({
              type: MESSAGE_TYPES.PRIVATE_CHAT_CREATED,
              roomInfo: roomData,
              targetUserId: friend.username,
            });
          }
        } else {
          // 房間已存在
          const infoResponse = await fetch(
            `http://localhost:3000/api/room/${privateRoomId}/info`
          );
          if (infoResponse.ok) {
            const roomInfo = await infoResponse.json();
            console.log("✅ Existing room found:", roomInfo);

            // 確保房間在使用者列表中
            RoomManager.saveRoomInfo(roomInfo);
            RoomManager.addRoomToUser(currentUser.id, roomInfo.id);
          }
        }

        // 重新載入房間列表
        loadUserRooms();

        // 加入房間
        handleRoomSelect(privateRoomId);

        return privateRoomId;
      } catch (error) {
        console.error("Failed to start chat with friend:", error);
        alert(`Failed to start chat with ${friend.name}. Please try again.`);
      }
    },
    [currentUser, sendMessage, loadUserRooms, handleRoomSelect]
  );

  // 房間設定更新處理
  const handleRoomSettingsUpdated = useCallback(
    (roomId) => {
      console.log("Room settings updated for:", roomId);
      loadUserRooms(); // 重新載入以反映設定變更
    },
    [loadUserRooms]
  );

  return {
    userRooms,
    isLoading,
    handleRoomSelect,
    handleStartChat,
    handleRoomSettingsUpdated,
    refreshRooms: loadUserRooms,

    // 調試資訊
    dataStats: currentUser?.id
      ? RoomManager.getDataStats(currentUser.id)
      : null,
  };
};

export default useRoomsV2;
