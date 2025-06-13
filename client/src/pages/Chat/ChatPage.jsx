import RoomsList from "./RoomsList";
import MessagesList from "./MessagesList";
import MembersList from "./MembersList";
import RoomHeader from "./RoomHeader";
import TypingIndicator from "./TypingIndicator";
import DevFunctions from "../../components/DevFunctions";
import "./ChatPage.scss";
import { useState, useEffect } from "react";
import useWebSocket from "../../hooks/useWebSocket";
import MESSAGE_TYPES from "../../../../shared/messageTypes.json";
import PropTypes from "prop-types";

const Chat = () => {
  const [selectedRoomId, setSelectedRoomId] = useState("sport");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { messages, setMessages, roomUsers, typingUsers, sendMessage, joinRoom } =
    useWebSocket(currentUser, selectedRoomId);

  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
    joinRoom(roomId);

    const loadRoomHistory = async () => {
      const response = await fetch(
        `http://localhost:3000/api/room/${roomId}/history`
      );
      const data = await response.json();
      setMessages(data);
    };

    loadRoomHistory();
  };

  const handleSendMessage = (messageData) => {
    sendMessage(messageData);
  };

  const handleTypingStart = (typingData) => {
    sendMessage(typingData);
  };

  const handleTypingStop = (typingData) => {
    sendMessage(typingData);
  };

  // Generate test messages with different dates (Dev tool)
  const generateTestMessages = () => {
    const testMessages = [
      // Today
      {
        messageId: "test-1",
        message: "This is a message from today!",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date().toISOString(),
      },
      // Yesterday
      {
        messageId: "test-2", 
        message: "Yesterday's message here",
        sender: { id: "user2", name: "Bob" },
        clientTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      // 3 days ago (this week)
      {
        messageId: "test-3",
        message: "Message from 3 days ago",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // 1 week ago
      {
        messageId: "test-4",
        message: "One week ago message",
        sender: { id: "user3", name: "Charlie" },
        clientTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // 2 weeks ago
      {
        messageId: "test-5",
        message: "Two weeks ago message",
        sender: { id: "user2", name: "Bob" },
        clientTimestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // 1 month ago
      {
        messageId: "test-6",
        message: "Message from last month",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // 3 months ago
      {
        messageId: "test-7",
        message: "Three months ago message",
        sender: { id: "user3", name: "Charlie" },
        clientTimestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // Last year
      {
        messageId: "test-8",
        message: "Message from last year!",
        sender: { id: "user2", name: "Bob" },
        clientTimestamp: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    // Add multiple messages to show time grouping within same day
    const todayMultiple = [
      {
        messageId: "test-today-1",
        message: "Good morning! ☀️",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date(new Date().setHours(9, 0, 0)).toISOString(),
      },
      {
        messageId: "test-today-2", 
        message: "Lunch time! 🍕",
        sender: { id: "user2", name: "Bob" },
        clientTimestamp: new Date(new Date().setHours(12, 30, 0)).toISOString(),
      },
      {
        messageId: "test-today-3",
        message: "Good evening! 🌙",
        sender: { id: "user3", name: "Charlie" },
        clientTimestamp: new Date(new Date().setHours(18, 45, 0)).toISOString(),
      },
    ];

    // Combine and sort by timestamp
    const allTestMessages = [...testMessages, ...todayMultiple].sort(
      (a, b) => new Date(a.clientTimestamp) - new Date(b.clientTimestamp)
    );

    setMessages(allTestMessages);
    console.log("✨ Generated test messages with different dates!");
  };

  const handleClearMessages = () => {
    setMessages([]);
    console.log("🗑️ Cleared all messages");
  };

  const generateLongMessages = () => {
    const longMessages = [
      {
        messageId: "long-1",
        message: "This is a very long message to test how the chat interface handles lengthy text content. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 🚀",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date().toISOString(),
      },
      {
        messageId: "long-2", 
        message: "Testing special characters: 你好世界 🌍 ñáéíóú àèìòù çñ ß µ ∑ ∆ π Ω ≈ ≠ ≤ ≥ ◊ ♠ ♣ ♥ ♦ → ↑ ↓ ← ↔ ↕",
        sender: { id: "user2", name: "Bob" },
        clientTimestamp: new Date(Date.now() + 1000).toISOString(),
      },
      {
        messageId: "long-3",
        message: "Code snippet test:\n```javascript\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}\nconsole.log(fibonacci(10));\n```",
        sender: { id: "user3", name: "Charlie" },
        clientTimestamp: new Date(Date.now() + 2000).toISOString(),
      },
      {
        messageId: "long-4",
        message: "URL test: https://www.example.com/very/long/path/to/some/resource?param1=value1&param2=value2&param3=value3#section",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date(Date.now() + 3000).toISOString(),
      }
    ];
    
    setMessages(prev => [...prev, ...longMessages]);
    console.log("📝 Generated long messages");
  };

  const generateStressTest = () => {
    const stressMessages = Array.from({ length: 100 }, (_, i) => ({
      messageId: `stress-${i}`,
      message: `Stress test message #${i + 1} - Testing performance with many messages`,
      sender: { 
        id: `user${(i % 3) + 1}`, 
        name: ['Alice', 'Bob', 'Charlie'][i % 3] 
      },
      clientTimestamp: new Date(Date.now() + i * 100).toISOString(),
    }));
    
    setMessages(prev => [...prev, ...stressMessages]);
    console.log("⚡ Generated 100 stress test messages");
  };

  const simulateTyping = () => {
    // Simulate multiple users typing
    const typingEvents = [
      {
        type: MESSAGE_TYPES.TYPING_START,
        user: { name: "Alice" },
        room: { id: selectedRoomId },
      },
      {
        type: MESSAGE_TYPES.TYPING_START,
        user: { name: "Bob" },
        room: { id: selectedRoomId },
      },
      {
        type: MESSAGE_TYPES.TYPING_START,
        user: { name: "Charlie" },
        room: { id: selectedRoomId },
      }
    ];

    // Send typing start events
    typingEvents.forEach((event, index) => {
      setTimeout(() => {
        sendMessage(event);
      }, index * 500);
    });

    // Stop typing after 5 seconds
    setTimeout(() => {
      typingEvents.forEach(event => {
        sendMessage({
          ...event,
          type: MESSAGE_TYPES.TYPING_STOP,
        });
      });
    }, 5000);

    console.log("⌨️ Simulated multiple users typing");
  };

  const simulateUserJoinLeave = () => {
    const users = [
      { id: "temp1", name: "David" },
      { id: "temp2", name: "Emma" },
      { id: "temp3", name: "Frank" }
    ];

    users.forEach((user, index) => {
      // Simulate user joining
      setTimeout(() => {
        sendMessage({
          type: MESSAGE_TYPES.USER_JOINED,
          user,
          room: { id: selectedRoomId },
        });
      }, index * 1000);

      // Simulate user leaving after 3 seconds
      setTimeout(() => {
        sendMessage({
          type: MESSAGE_TYPES.USER_LEFT,
          user,
          room: { id: selectedRoomId },
        });
      }, (index * 1000) + 3000);
    });

    console.log("🚪 Simulated users joining and leaving");
  };

  const DEFAULT_ROOMS = [
    { id: "sport", name: "Sports Room", description: "Discuss sports topics" },
    {
      id: "finance",
      name: "Finance Room",
      description: "Share investment insights",
    },
    {
      id: "tech",
      name: "Tech Room",
      description: "Explore latest tech trends",
    },
  ];

  const selectedRoom = DEFAULT_ROOMS.find((room) => room.id === selectedRoomId);

  return (
    <div className="chat">
      <div className="chat__sidebar">
        <RoomsList
          className="chat__rooms"
          onRoomSelect={handleRoomSelect}
          currentRoomId={selectedRoomId}
          defaultRooms={DEFAULT_ROOMS}
        />
      </div>
      <div className="chat__main">
        <RoomHeader className="chat__header" selectedRoom={selectedRoom} />
        <div className="chat__content">
          <div className="chat__messages">
            <MessagesList
              messages={messages}
              currentUser={currentUser}
              selectedRoom={selectedRoom}
              onSendMessage={handleSendMessage}
              typingUsers={typingUsers}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
            />
          </div>
          <div className="chat__members">
            <MembersList
              roomUsers={roomUsers}
              currentUserId={currentUser?.id}
            />
          </div>
        </div>
      </div>
      
      <DevFunctions 
        onGenerateTestMessages={generateTestMessages}
        onClearMessages={handleClearMessages}
        onGenerateStressTest={generateStressTest}
        onSimulateTyping={simulateTyping}
        onGenerateLongMessages={generateLongMessages}
        onSimulateUserJoinLeave={simulateUserJoinLeave}
      />
    </div>
  );
};

Chat.propTypes = {
  messages: PropTypes.array,
  currentUser: PropTypes.object,
  selectedRoom: PropTypes.object,
  onSendMessage: PropTypes.func,
};

export default Chat;
