import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  FaMicrophone,
  FaPaperclip,
  FaAt,
  FaSmile,
  FaPaperPlane,
} from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import MESSAGE_TYPES from "../../../../shared/messageTypes.json";

import "./MessageComposer.scss";

export default function MessageComposer({
  currentUser,
  selectedRoom,
  onSendMessage,
}) {
  const [message, setMessage] = useState("");

  const buildChatMessage = (messageText, user, roomId) => {
    return {
      type: MESSAGE_TYPES.MESSAGE,
      messageId: uuidv4(),
      message: messageText,
      sender: {
        id: user.id,
        name: user.username,
      },
      room: {
        id: roomId,
      },
      clientTimestamp: new Date().toISOString(),
    };
  };

  const handleChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
  };

  const handleSend = () => {
    if (message.trim()) {
      const messageData = buildChatMessage(
        message,
        currentUser,
        selectedRoom?.id
      );

      if (onSendMessage) {
        onSendMessage(messageData);
      }

      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-composer">
      <input
        className="chat-composer__input"
        type="text"
        placeholder={`Message ${selectedRoom?.name || "General"}`}
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <div className="chat-composer__icon-container">
        <FaMicrophone className="chat-composer__icon" />
        <FaPaperclip className="chat-composer__icon" />
        <FaAt className="chat-composer__icon" />
        <FaSmile className="chat-composer__icon" />
        <FaPaperPlane className="chat-composer__icon" onClick={handleSend} />
      </div>
    </div>
  );
}

MessageComposer.propTypes = {
  currentUser: PropTypes.object.isRequired,
  selectedRoom: PropTypes.object,
  onSendMessage: PropTypes.func,
};
