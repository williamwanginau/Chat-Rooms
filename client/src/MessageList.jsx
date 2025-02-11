import PropTypes from "prop-types";
import "./MessageList.scss";
import { useEffect, useRef } from "react";

const MessageList = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages[messages.length - 1]?.sender === currentUser.id) {
      scrollToBottom();
    }
  }, [messages, currentUser]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="message-list">
      {messages.map((message) => {
        const isSelf = currentUser.id === message.sender;
        return (
          <div
            key={message.messageId}
            className={`message-row ${isSelf ? "self" : "other"}`}
          >
            <div className="message-list-item-timestamp">
              {formatDate(message.timestamp)}
            </div>
            <div className="message-list-item">
              <div>{message.message}</div>
            </div>
            {!isSelf && (
              <div className="message-list-item-sender">
                {message.senderName}
              </div>
            )}
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired,
};

export default MessageList;
