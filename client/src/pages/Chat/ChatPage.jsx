import RoomsList from "./RoomsList";
import MessagesList from "./MessagesList";
import MembersList from "./MembersList";
import RoomHeader from "./RoomHeader";
import TypingIndicator from "./TypingIndicator";
import "./ChatPage.scss";
import { useState } from "react";
import useWebSocket from "../../hooks/useWebSocket";
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
