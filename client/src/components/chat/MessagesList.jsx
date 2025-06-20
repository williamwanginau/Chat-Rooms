import PropTypes from "prop-types";
import "./MessagesList.scss";
import MessageComposer from "./MessageComposer";
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
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Today
      if (date.toDateString() === today.toDateString()) {
        return "Today";
      }

      // Yesterday
      if (date.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
      }

      // This week (within last 7 days)
      const diffTime = today - date;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 7) {
        return date.toLocaleDateString("en-US", {
          weekday: "long",
        });
      }

      // This year
      if (date.getFullYear() === today.getFullYear()) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      }

      // Over one year ago - show full date
      const oneYearAgo = new Date(today);
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

      if (date < oneYearAgo) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}/${month}/${day}`;
      }

      // Different year but within one year
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch (error) {
      console.error("Error formatting day:", error, timestamp);
      return "";
    }
  };

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
        {messageGroups.map((group) => (
          <div key={group.date} className="message-day-group">
            <div className="date-divider">
              <span className="date-label">{group.displayDate}</span>
            </div>

            {group.messages.map((message, index) => {
              // Handle system messages differently
              if (message.isSystemMessage) {
                return (
                  <div
                    key={message.messageId}
                    className="message-row system-message"
                  >
                    <div className="system-message-content">
                      <span className="system-message-text">
                        {message.message}
                      </span>
                      <span className="system-message-timestamp">
                        {formatDate(message.clientTimestamp)}
                      </span>
                    </div>
                  </div>
                );
              }

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
      </div>

      <MessageComposer
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
