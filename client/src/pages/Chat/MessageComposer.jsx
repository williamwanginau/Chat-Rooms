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
  onTypingStart,
  onTypingStop,
}) {
  const [message, setMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

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

    // Handle typing indicators
    if (newMessage.trim() && !isTyping) {
      // Start typing
      setIsTyping(true);
      if (onTypingStart) {
        const typingData = {
          type: MESSAGE_TYPES.TYPING_START,
          user: currentUser,
          room: { id: selectedRoom?.id },
          timestamp: new Date().toISOString(),
        };
        onTypingStart(typingData);
      }
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        if (onTypingStop) {
          onTypingStop({
            type: MESSAGE_TYPES.TYPING_STOP,
            user: currentUser,
            room: { id: selectedRoom?.id },
            timestamp: new Date().toISOString(),
          });
        }
      }
    }, 2000);
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

      // Stop typing when message is sent
      if (isTyping) {
        setIsTyping(false);
        if (onTypingStop) {
          onTypingStop({
            type: MESSAGE_TYPES.TYPING_STOP,
            user: currentUser,
            room: { id: selectedRoom?.id },
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Clear timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        
        // Send stop typing when component unmounts
        if (isTyping && onTypingStop) {
          onTypingStop({
            type: MESSAGE_TYPES.TYPING_STOP,
            user: currentUser,
            room: { id: selectedRoom?.id },
            timestamp: new Date().toISOString(),
          });
        }
      }
    };
  }, [isTyping, onTypingStop, currentUser, selectedRoom?.id]);

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
  onTypingStart: PropTypes.func,
  onTypingStop: PropTypes.func,
};
