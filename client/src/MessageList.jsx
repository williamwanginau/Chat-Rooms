import PropTypes from "prop-types";
import "./MessageList.scss";
const MessageList = ({ messages, currentUser }) => {
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
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired,
};

export default MessageList;
