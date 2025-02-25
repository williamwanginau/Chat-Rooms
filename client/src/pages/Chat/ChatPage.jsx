import ChatSidebarPrimary from "./ChatSidebarPrimary";
import ChatMainContent from "./ChatMainContent";
import ChatSidebarSecondary from "./ChatSidebarSecondary";
import ChatHeader from "./ChatHeader";
import "./ChatPage.scss";
import { useState, useEffect } from "react";
import MESSAGE_TYPES from "../../../../messageTypes";
import { v4 as uuidv4 } from "uuid";

const Chat = () => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [messages, setMessages] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
    const roomChangeMessage = buildRoomChangeMessage(roomId, currentUser);
    console.log("roomChangeMessage", roomChangeMessage);
  };

  useEffect(() => {
    const roomChangeMessage = buildRoomChangeMessage(
      selectedRoomId,
      currentUser
    );
    console.log("roomChangeMessage", roomChangeMessage);
  }, [selectedRoomId, currentUser]);

  const DEFAULT_ROOMS = [
    { id: "sport", name: "Sports Room", description: "Discuss sports events" },
    {
      id: "finance",
      name: "Finance Room",
      description: "Share investment topics",
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
      <div className="chat-primary-sidebar">
        <ChatSidebarPrimary
          onRoomSelect={handleRoomSelect}
          currentRoomId={selectedRoomId}
          defaultRooms={DEFAULT_ROOMS}
        />
      </div>
      <div className="chat-content">
        <div className="chat-header">
          <ChatHeader
            selectedRoom={selectedRoom}
            onRoomSelect={handleRoomSelect}
          />
        </div>
        <div className="chat-main-content-container">
          <div className="chat-main-content">
            <ChatMainContent
              selectedRoom={selectedRoom}
              currentUser={currentUser}
              messages={messages}
            />
          </div>
          <div className="chat-secondary-sidebar">
            <ChatSidebarSecondary />
          </div>
        </div>
      </div>
    </div>
  );
};

function buildRoomChangeMessage(roomId, user) {
  return {
    messageId: uuidv4(),
    type: MESSAGE_TYPES.ROOM_CHANGE,
    sender: {
      id: user.id,
      name: user.username,
    },
    room: {
      id: roomId,
      type: "group",
    },
    clientTimestamp: new Date().toISOString(),
  };
}
export default Chat;
