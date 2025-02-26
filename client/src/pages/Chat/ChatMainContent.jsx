import PropTypes from "prop-types";
import "./ChatMainContent.scss";
import ChatComposer from "./ChatComposer";
import { useEffect, useRef } from "react";

const ChatMainContent = ({
  messages,
  currentUser,
  selectedRoom,
  onSendMessage,
}) => {
  const messageListRef = useRef(null);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const formatDate = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
      });
    } catch (error) {
      console.error("Error formatting date:", error, timestamp);
      return "Invalid time";
    }
  };

  const formatDay = (timestamp) => {
    try {
      const date = new Date(timestamp);
      const today = new Date();

      if (date.toDateString() === today.toDateString()) {
        return "Today";
      }

      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    } catch (error) {
      console.error("Error formatting day:", error, timestamp);
      return "";
    }
  };

  // 按日期分組消息
  const groupMessagesByDate = (msgs) => {
    const groups = {};

    msgs.forEach((msg) => {
      const date = new Date(msg.clientTimestamp);
      const dateString = date.toDateString();

      if (!groups[dateString]) {
        groups[dateString] = [];
      }

      groups[dateString].push(msg);
    });

    return Object.entries(groups).map(([date, messages]) => ({
      date,
      displayDate: formatDay(date),
      messages,
    }));
  };

  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="chat-main-content">
      <div className="message-list" ref={messageListRef}>
        {messageGroups.map((group, groupIndex) => (
          <div key={group.date} className="message-day-group">
            <div className="date-divider">
              <span className="date-label">{group.displayDate}</span>
            </div>

            {group.messages.map((message, index) => {
              const isSelf = currentUser.id === message.sender.id;
              const showAvatar =
                index === 0 ||
                group.messages[index - 1].sender.id !== message.sender.id;

              return (
                <div
                  key={message.messageId}
                  className={`message-row ${isSelf ? "self" : "other"}`}
                >
                  {!isSelf && (
                    <div className="message-left-container">
                      {showAvatar ? (
                        <div className="message-sender-avatar">
                          {message.sender.name.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="avatar-spacer"></div>
                      )}
                    </div>
                  )}

                  <div className="message-content">
                    {showAvatar && !isSelf && (
                      <div className="message-sender-info">
                        <span className="message-sender-name">
                          {message.sender.name}
                        </span>
                        <span className="message-timestamp">
                          {formatDate(message.clientTimestamp)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`message-bubble ${
                        !showAvatar && !isSelf ? "continuation" : ""
                      } ${isSelf ? "self-bubble" : "other-bubble"}`}
                    >
                      <div className="message-text">{message.message}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div className="typing-indicator">{/* 可以添加正在輸入的指示器 */}</div>
      </div>

      <ChatComposer
        currentUser={currentUser}
        selectedRoom={selectedRoom}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};

ChatMainContent.propTypes = {
  messages: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired,
  selectedRoom: PropTypes.object,
  onSendMessage: PropTypes.func,
};

export default ChatMainContent;
