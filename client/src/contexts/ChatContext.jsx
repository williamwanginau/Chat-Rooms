import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import useWebSocket from "../hooks/useWebSocket";
import { useFriends } from "../hooks/useFriends";
import useRoomsV2 from "../hooks/useRoomsV2";
import { useRoomNameEditor } from "../hooks/useRoomNameEditor";
import { useUnreadCounts } from "../hooks/useUnreadCounts";

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const navigate = useNavigate();

  // 狀態管理
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [activeSection, setActiveSection] = useState("rooms");
  const [messages, setMessages] = useState([]);

  // 房間名稱編輯狀態
  const [isEditingRoomName, setIsEditingRoomName] = useState(false);
  const [editRoomNameValue, setEditRoomNameValue] = useState("");
  const roomNameInputRef = useRef(null);

  // 使用者管理
  const [currentUser, setCurrentUser] = useState(null);

  // 載入當前使用者 - 修正無限循環問題
  useEffect(() => {
    const loadCurrentUser = () => {
      const savedUser = localStorage.getItem("currentUser");
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
        } catch (error) {
          console.error("Failed to parse current user:", error);
        }
      }
    };

    // 只在 currentUser 為 null 時載入
    if (!currentUser) {
      loadCurrentUser();
    }
  }, []); // 移除 currentUser 依賴，避免無限循環

  // WebSocket 連接
  const { sendMessage, joinRoom } = useWebSocket(currentUser);

  // 好友管理
  const {
    friends,
    receivedInvitations,
    sentInvitations,
    setFriends,
    setReceivedInvitations,
    setSentInvitations,
    handleAcceptInvitation,
    handleDeclineInvitation,
    handleCancelInvitation,
    handleSendInvitation,
  } = useFriends(currentUser, sendMessage);

  // 房間管理 - 使用新的 V2 hook
  const {
    userRooms: customRooms,
    isLoading: roomsLoading,
    handleRoomSelect: baseHandleRoomSelect,
    handleStartChat,
    handleRoomSettingsUpdated,
    refreshRooms,
    dataStats,
  } = useRoomsV2(
    currentUser,
    selectedRoomId,
    messages,
    sendMessage,
    joinRoom,
    setMessages
  );

  // 計算未讀數量
  const unreadCounts = useMemo(() => {
    const counts = {
      friends: 0,
      rooms: 0,
      invitations: receivedInvitations.length,
    };

    // 計算房間未讀數量
    counts.rooms = customRooms.reduce((total, room) => {
      return total + (room.unreadCount || 0);
    }, 0);

    return counts;
  }, [customRooms, receivedInvitations.length]);

  // 調試信息 - 顯示新的資料統計
  useEffect(() => {
    if (dataStats && import.meta.env.DEV) {
      console.log("📊 Room Data Statistics:");
      console.log("  🏠 Total rooms:", dataStats.totalRooms);
      console.log("  👤 User rooms:", dataStats.userRoomsCount);
      console.log("  ⚙️ With settings:", dataStats.userRoomsWithSettings);
      console.log("  🔄 Needs migration:", dataStats.needsMigration);
    }
  }, [dataStats]);

  // 減少調試頻率
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("📊 Data Status:");
      console.log("  🏠 CustomRooms:", customRooms.length);
      console.log("  👥 Friends:", friends.length);
      console.log("  📨 ReceivedInvitations:", receivedInvitations.length);
      console.log("  📤 SentInvitations:", sentInvitations.length);
    }
  }, [
    customRooms.length,
    friends.length,
    receivedInvitations.length,
    sentInvitations.length,
  ]);

  // 選中的房間
  const selectedRoom = useMemo(() => {
    return (
      customRooms.find((room) => room.id === selectedRoomId) || {
        id: selectedRoomId,
        name: selectedRoomId || "No Room Selected",
        description: "Select a room to start chatting",
      }
    );
  }, [customRooms, selectedRoomId]);

  // 房間名稱編輯功能
  const startEditingRoomName = useCallback(() => {
    if (selectedRoom?.name) {
      setEditRoomNameValue(selectedRoom.name);
      setIsEditingRoomName(true);
      setTimeout(() => {
        roomNameInputRef.current?.focus();
      }, 0);
    }
  }, [selectedRoom?.name]);

  const saveRoomNameEdit = useCallback(() => {
    if (editRoomNameValue.trim() && selectedRoom?.id) {
      // TODO: 實作房間名稱更新邏輯
      console.log("Saving room name:", editRoomNameValue);
      setIsEditingRoomName(false);
      setEditRoomNameValue("");
    }
  }, [editRoomNameValue, selectedRoom?.id]);

  const cancelRoomNameEdit = useCallback(() => {
    setIsEditingRoomName(false);
    setEditRoomNameValue("");
  }, []);

  const handleRoomNameKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") {
        saveRoomNameEdit();
      } else if (e.key === "Escape") {
        cancelRoomNameEdit();
      }
    },
    [saveRoomNameEdit, cancelRoomNameEdit]
  );

  // 事件處理
  const handleRoomSelect = useCallback(
    (roomId) => {
      setSelectedRoomId(roomId);
      baseHandleRoomSelect(roomId);
    },
    [baseHandleRoomSelect]
  );

  const handleSectionChange = useCallback((section) => {
    setActiveSection(section);
  }, []);

  const handleSendMessage = useCallback(
    (messageData) => {
      if (sendMessage) {
        sendMessage(messageData);
      }
    },
    [sendMessage]
  );

  const handleStartChatAndSetActive = useCallback(
    async (friend) => {
      const roomId = await handleStartChat(friend);
      if (roomId) {
        setSelectedRoomId(roomId);
        setActiveSection("rooms");
      }
    },
    [handleStartChat]
  );

  // 房間名稱編輯
  const {
    roomNameInputRef: editorRoomNameInputRef,
    startEditingRoomName: editorStartEditingRoomName,
    saveRoomNameEdit: editorSaveRoomNameEdit,
    cancelRoomNameEdit: editorCancelRoomNameEdit,
    handleRoomNameKeyDown: editorHandleRoomNameKeyDown,
  } = useRoomNameEditor(selectedRoom, currentUser, handleRoomSettingsUpdated);

  const value = {
    // 用戶
    currentUser,

    // 狀態
    selectedRoomId,
    activeSection,
    selectedRoom,
    messages,
    roomsLoading,

    // 未讀數量
    unreadCounts,

    // 好友相關
    friends,
    receivedInvitations,
    sentInvitations,

    // 房間相關
    customRooms,
    refreshRooms,
    dataStats,

    // 房間名稱編輯
    isEditingRoomName,
    editRoomNameValue,
    setEditRoomNameValue,
    roomNameInputRef,
    startEditingRoomName,
    saveRoomNameEdit,
    cancelRoomNameEdit,
    handleRoomNameKeyDown,

    // 事件處理
    handleRoomSelect,
    handleSectionChange,
    handleSendMessage,
    handleStartChatAndSetActive,
    handleAcceptInvitation,
    handleDeclineInvitation,
    handleCancelInvitation,
    handleSendInvitation,
    handleRoomSettingsUpdated,

    // 給 DevFunctions 用的 setters
    setMessages,
    sendMessage,
    setFriends,
    setReceivedInvitations,
    setSentInvitations,
    setCustomRooms: refreshRooms, // 改為使用 refreshRooms
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
