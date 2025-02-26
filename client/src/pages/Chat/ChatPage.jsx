import ChatSidebarPrimary from "./ChatSidebarPrimary";
import ChatMainContent from "./ChatMainContent";
import ChatSidebarSecondary from "./ChatSidebarSecondary";
import ChatHeader from "./ChatHeader";
import "./ChatPage.scss";
import { useState, useEffect, useRef } from "react";
import MESSAGE_TYPES from "../../../../messageTypes";
import { v4 as uuidv4 } from "uuid";
import PropTypes from "prop-types";

const Chat = () => {
  const [selectedRoomId, setSelectedRoomId] = useState("sport"); // Set default room
  const [messages, setMessages] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const wsRef = useRef(null);

  const buildRoomChangeMessage = (roomId, user) => {
    return {
      type: MESSAGE_TYPES.ROOM_CHANGE,
      roomId: roomId,
      user: {
        id: user.id,
        name: user.username,
      },
      clientTimestamp: new Date().toISOString(),
    };
  };

  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const roomChangeMessage = buildRoomChangeMessage(roomId, currentUser);
      wsRef.current.send(JSON.stringify(roomChangeMessage));
    }
  };

  const handleSendMessage = (messageData) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageData));
    }
  };

  useEffect(() => {
    const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected successfully");
      if (selectedRoomId) {
        const roomChangeMessage = buildRoomChangeMessage(
          selectedRoomId,
          currentUser
        );
        wsRef.current.send(JSON.stringify(roomChangeMessage));
      }
    };

    wsRef.current.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      console.log("Received message:", messageData);

      if (messageData.type === "history") {
        setMessages(messageData.messages);
      } else if (messageData.type === MESSAGE_TYPES.MESSAGE) {
        setMessages((prevMessages) => [...prevMessages, messageData]);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

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
    <div className="chat-container">
      <ChatSidebarPrimary
        className="chat-primary-sidebar"
        onRoomSelect={handleRoomSelect}
        currentRoomId={selectedRoomId}
        defaultRooms={DEFAULT_ROOMS}
      />
      <div className="chat-content">
        <ChatHeader className="chat-header" selectedRoom={selectedRoom} />
        <div className="chat-main-content-container">
          <ChatMainContent
            className="chat-main-content"
            messages={messages}
            currentUser={currentUser}
            selectedRoom={selectedRoom}
            onSendMessage={handleSendMessage}
          />
          <ChatSidebarSecondary className="chat-secondary-sidebar" />
        </div>
      </div>
    </div>
  );
};

Chat.propTypes = {
  messages: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired,
  selectedRoom: PropTypes.object,
  onSendMessage: PropTypes.func,
};

export default Chat;
