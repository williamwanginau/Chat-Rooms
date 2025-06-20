import PropTypes from "prop-types";
import MessagesList from "./MessagesList";
import { getRoomDisplayName } from "../../utils/roomSettings";
import { useChatContext } from "../../contexts/ChatContext";
import "./ChatContainer.scss";

const ChatContainer = () => {
  const {
    selectedRoom,
    messages,
    currentUser,
    isEditingRoomName,
    editRoomNameValue,
    setEditRoomNameValue,
    roomNameInputRef,
    handleSendMessage,
    startEditingRoomName,
    saveRoomNameEdit,
    cancelRoomNameEdit,
    handleRoomNameKeyDown,
    activeSection,
    selectedRoomId,
  } = useChatContext();

  // 歡迎頁面內容
  const renderWelcomeScreen = () => {
    const welcomeConfig = {
      friends: {
        icon: "👤",
        title: "Friends",
        text: "Click on a friend to start private chat",
      },
      rooms: {
        icon: "💬",
        title: "Chat Rooms",
        text: "Select a chat room to start group conversation",
      },
      invitations: {
        icon: "➕",
        title: "Invitations",
        text: "Manage friend invitations",
      },
    };

    const config = welcomeConfig[activeSection] || welcomeConfig.rooms;

    return (
      <div className="chat-container__welcome">
        <div className="chat-container__welcome-content">
          <div className="chat-container__welcome-icon">{config.icon}</div>
          <h2 className="chat-container__welcome-title">{config.title}</h2>
          <p className="chat-container__welcome-text">{config.text}</p>
        </div>
      </div>
    );
  };

  // 聊天標題編輯器
  const renderChatTitle = () => {
    if (!selectedRoom) return "Select a chat room";

    if (isEditingRoomName) {
      return (
        <input
          ref={roomNameInputRef}
          type="text"
          value={editRoomNameValue}
          onChange={(e) => setEditRoomNameValue(e.target.value)}
          onKeyDown={handleRoomNameKeyDown}
          onBlur={saveRoomNameEdit}
          className="chat-container__title-input"
          placeholder="Enter room name"
        />
      );
    }

    return (
      <div className="chat-container__title-content">
        <span className="chat-container__title-text">
          {getRoomDisplayName(selectedRoom, currentUser)}
        </span>
        <button
          className="chat-container__edit-btn"
          onClick={startEditingRoomName}
          title="Edit room name"
          aria-label="Edit room name"
        >
          <span className="material-icons">edit</span>
        </button>
      </div>
    );
  };

  // 判斷是否顯示聊天內容
  const shouldShowChat =
    selectedRoomId &&
    (activeSection === "rooms" ||
      (activeSection === "friends" && selectedRoom));

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-container__header">
        <div className="chat-container__title">{renderChatTitle()}</div>
        <div className="chat-container__actions">
          <div className="action-icon">🔍</div>
          <div className="action-icon">📞</div>
          <div className="action-icon">≡</div>
        </div>
      </div>

      {/* Chat Content */}
      <div className="chat-container__content">
        {shouldShowChat ? (
          <div className="chat-container__messages">
            <MessagesList
              messages={messages}
              currentUser={currentUser}
              selectedRoom={selectedRoom}
              onSendMessage={handleSendMessage}
            />
          </div>
        ) : (
          renderWelcomeScreen()
        )}
      </div>
    </div>
  );
};

export default ChatContainer;
