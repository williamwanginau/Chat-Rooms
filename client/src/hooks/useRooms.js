import { useState, useEffect } from "react";
import MESSAGE_TYPES from "../../../shared/messageTypes.json";

export const useRooms = (
  currentUser,
  selectedRoomId,
  messages,
  sendMessage,
  joinRoom,
  setMessages
) => {
  const [customRooms, setCustomRooms] = useState([]);

  // 載入房間 - 簡化版本
  useEffect(() => {
    console.log("🔄 Loading rooms from localStorage...");
    const savedCustomRooms = localStorage.getItem("customRooms");

    if (savedCustomRooms) {
      try {
        const parsed = JSON.parse(savedCustomRooms);
        console.log("📊 Raw rooms from localStorage:", parsed.length);

        // 去重邏輯
        const uniqueRooms = parsed.reduce((acc, room) => {
          const exists = acc.find((r) => r.id === room.id);
          if (!exists) {
            acc.push(room);
          }
          return acc;
        }, []);

        console.log("✅ Loading unique rooms:", uniqueRooms.length);
        setCustomRooms(uniqueRooms);

        // 如果去重後數量不同，更新 localStorage
        if (uniqueRooms.length !== parsed.length) {
          localStorage.setItem("customRooms", JSON.stringify(uniqueRooms));
          console.log("💾 Updated localStorage with deduplicated rooms");
        }
      } catch (error) {
        console.error("❌ Failed to parse localStorage rooms:", error);
      }
    } else {
      console.log("📭 No rooms found in localStorage");
    }
  }, []); // 只在初始化時執行一次

  // 更新房間最後訊息
  useEffect(() => {
    if (messages.length > 0 && selectedRoomId) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.isSystemMessage) {
        setCustomRooms((prev) =>
          prev.map((room) =>
            room.id === selectedRoomId
              ? {
                  ...room,
                  lastMessage: lastMessage.message,
                  lastMessageTime: lastMessage.clientTimestamp,
                  lastMessageSender:
                    lastMessage.sender?.name ||
                    lastMessage.sender?.username ||
                    "Unknown",
                  unreadCount: 0,
                }
              : room
          )
        );
      }
    }
  }, [messages, selectedRoomId]);

  // 處理其他房間的新訊息（未讀數量）
  useEffect(() => {
    const handleNewMessage = (event) => {
      const { roomId, message, timestamp, sender } = event.detail;
      if (roomId !== selectedRoomId) {
        setCustomRooms((prev) =>
          prev.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  lastMessage: message,
                  lastMessageTime: timestamp,
                  lastMessageSender: sender,
                  unreadCount: (room.unreadCount || 0) + 1,
                }
              : room
          )
        );
      }
    };

    window.addEventListener("newMessage", handleNewMessage);
    return () => window.removeEventListener("newMessage", handleNewMessage);
  }, [selectedRoomId]);

  // 保存自定義房間
  useEffect(() => {
    if (customRooms.length > 0) {
      console.log("💾 Saving rooms to localStorage:", customRooms.length);
      localStorage.setItem("customRooms", JSON.stringify(customRooms));
    }
  }, [customRooms]);

  // 私人聊天創建事件
  useEffect(() => {
    const handlePrivateChatCreated = (event) => {
      const { roomInfo } = event.detail;
      console.log("🆕 Private chat created event:", roomInfo);
      setCustomRooms((prev) => {
        const exists = prev.some((room) => room.id === roomInfo.id);
        if (exists) return prev;
        return [...prev, roomInfo];
      });
    };

    window.addEventListener("privateChatCreated", handlePrivateChatCreated);
    return () =>
      window.removeEventListener(
        "privateChatCreated",
        handlePrivateChatCreated
      );
  }, []);

  // 房間操作函數
  const handleRoomSelect = (roomId) => {
    joinRoom(roomId);
    setCustomRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      )
    );

    // 載入房間歷史
    const loadRoomHistory = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/room/${roomId}/history`
        );
        const data = await response.json();
        setMessages(data);

        if (data.length > 0) {
          const lastMessage = data[data.length - 1];
          if (!lastMessage.isSystemMessage) {
            setCustomRooms((prev) =>
              prev.map((room) =>
                room.id === roomId
                  ? {
                      ...room,
                      lastMessage: lastMessage.message,
                      lastMessageTime: lastMessage.clientTimestamp,
                      lastMessageSender:
                        lastMessage.sender?.name ||
                        lastMessage.sender?.username ||
                        "Unknown",
                    }
                  : room
              )
            );
          }
        }
      } catch (error) {
        console.error("Failed to load room history:", error);
      }
    };

    loadRoomHistory();
  };

  const handleStartChat = async (friend) => {
    try {
      const sortedIds = [currentUser.username, friend.username].sort();
      const privateRoomId = `private_${sortedIds[0]}_${sortedIds[1]}`;

      const roomData = {
        id: privateRoomId,
        name: `${friend.name}`,
        description: `Private chat with ${friend.name}`,
        type: "private",
        participants: [currentUser.id, friend.id],
      };

      // 檢查房間是否存在
      const existsResponse = await fetch(
        `http://localhost:3000/api/room/${privateRoomId}/exists`
      );
      const existsData = await existsResponse.json();

      if (!existsData.exists) {
        // 創建新房間
        const response = await fetch("http://localhost:3000/api/room/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(roomData),
        });

        if (response.ok) {
          const newRoom = await response.json();
          console.log("🆕 New room created:", newRoom);
          setCustomRooms((prev) => [...prev, newRoom]);

          sendMessage({
            type: MESSAGE_TYPES.PRIVATE_CHAT_CREATED,
            roomInfo: roomData,
            targetUserId: friend.username,
          });
        }
      } else {
        // 房間已存在，加入即可
        const infoResponse = await fetch(
          `http://localhost:3000/api/room/${privateRoomId}/info`
        );
        if (infoResponse.ok) {
          const roomInfo = await infoResponse.json();
          console.log("✅ Existing room found:", roomInfo);
          setCustomRooms((prev) => {
            const exists = prev.some((room) => room.id === privateRoomId);
            return exists ? prev : [...prev, roomInfo];
          });
        }
      }

      joinRoom(privateRoomId);
      return privateRoomId;
    } catch (error) {
      console.error("Failed to start chat with friend:", error);
      alert(`Failed to start chat with ${friend.name}. Please try again.`);
    }
  };

  return {
    customRooms,
    setCustomRooms,
    handleRoomSelect,
    handleStartChat,
  };
};
