import PropTypes from "prop-types";
import "./ChatMainContent.scss";
import ChatComposer from "./ChatComposer";

const ChatMainContent = ({ messages, currentUser }) => {
  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString("zh-TW", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="chat-main-content">
      <div className="message-list">
        {messages.map((message) => {
          const isSelf = currentUser.id === message.sender.id;
          return (
            <div
              key={message.messageId}
              className={`message-row ${isSelf ? "self" : "other"}`}
            >
              <div className="message-list-item-timestamp">
                {formatDate(message.clientTimestamp)}
              </div>
              <div className="message-list-item">
                <div>{message.message}</div>
              </div>
              {!isSelf && (
                <div className="message-list-item-sender">
                  {message.sender.name}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <ChatComposer messages={messages} currentUser={currentUser} />
    </div>
  );
};

ChatMainContent.propTypes = {
  messages: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired,
};

export default ChatMainContent;
