import { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import useWebSocket from '../hooks/useWebSocket';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [customRooms, setCustomRooms] = useState([]);
  const [activeSection, setActiveSection] = useState("rooms");

  // WebSocket connection
  const {
    messages,
    setMessages,
    roomUsers,
    typingUsers,
    sendMessage,
    joinRoom,
    leaveRoom,
    isConnected,
    connectionError,
  } = useWebSocket();

  // Load custom rooms from localStorage
  useEffect(() => {
    const loadCustomRooms = () => {
      try {
        const rooms = JSON.parse(localStorage.getItem('customRooms') || '[]');
        setCustomRooms(rooms);
      } catch (error) {
        console.error('Error loading custom rooms:', error);
        setCustomRooms([]);
      }
    };

    loadCustomRooms();

    // Listen for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'customRooms') {
        loadCustomRooms();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdate', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleStorageChange);
    };
  }, []);

  const selectRoom = (roomId) => {
    if (selectedRoomId && selectedRoomId !== roomId) {
      leaveRoom(selectedRoomId);
    }
    
    setSelectedRoomId(roomId);
    if (roomId) {
      joinRoom(roomId);
    }
  };

  const createRoom = (roomData) => {
    const newRoom = {
      id: Date.now().toString(),
      ...roomData,
      createdAt: new Date().toISOString(),
      participants: [roomData.creatorId],
      messages: [],
      unreadCount: 0,
    };

    const updatedRooms = [...customRooms, newRoom];
    setCustomRooms(updatedRooms);
    localStorage.setItem('customRooms', JSON.stringify(updatedRooms));

    return newRoom;
  };

  const updateRoom = (roomId, updates) => {
    const updatedRooms = customRooms.map(room =>
      room.id === roomId ? { ...room, ...updates } : room
    );
    setCustomRooms(updatedRooms);
    localStorage.setItem('customRooms', JSON.stringify(updatedRooms));
  };

  const deleteRoom = (roomId) => {
    const updatedRooms = customRooms.filter(room => room.id !== roomId);
    setCustomRooms(updatedRooms);
    localStorage.setItem('customRooms', JSON.stringify(updatedRooms));

    if (selectedRoomId === roomId) {
      setSelectedRoomId(null);
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const generateTestMessages = () => {
    const testMessages = [
      {
        id: Date.now() + 1,
        content: "Hey everyone! How's the project going?",
        userId: "user1",
        username: "Alice",
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        roomId: selectedRoomId,
      },
      {
        id: Date.now() + 2,
        content: "Making good progress! The new features are looking great.",
        userId: "user2",
        username: "Bob",
        timestamp: new Date(Date.now() - 3000000).toISOString(), // 50 minutes ago
        roomId: selectedRoomId,
      },
      {
        id: Date.now() + 3,
        content: "Agreed! The UI improvements are really nice. 👍",
        userId: "user3",
        username: "Charlie",
        timestamp: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        roomId: selectedRoomId,
      },
      {
        id: Date.now() + 4,
        content: "Should we schedule a demo for next week?",
        userId: "user1",
        username: "Alice",
        timestamp: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
        roomId: selectedRoomId,
      },
    ];

    setMessages(prev => [...prev, ...testMessages]);
  };

  const getUnreadCounts = () => {
    const total = customRooms.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
    return {
      total,
      rooms: customRooms.reduce((acc, room) => {
        acc[room.id] = room.unreadCount || 0;
        return acc;
      }, {}),
    };
  };

  const value = {
    // Room management
    selectedRoomId,
    customRooms,
    activeSection,
    setActiveSection,
    selectRoom,
    createRoom,
    updateRoom,
    deleteRoom,

    // Messages
    messages,
    setMessages,
    clearMessages,
    generateTestMessages,

    // WebSocket
    roomUsers,
    typingUsers,
    sendMessage,
    isConnected,
    connectionError,

    // Utilities
    getUnreadCounts,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

ChatProvider.propTypes = {
  children: PropTypes.node.isRequired,
};