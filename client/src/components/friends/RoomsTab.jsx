import PropTypes from "prop-types";
import "./RoomsTab.scss";

const RoomsTab = ({ onRoomSelect, currentRoomId, customRooms = [] }) => {

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    
    const messageDate = new Date(timestamp);
    const now = new Date();
    const diffMs = now - messageDate;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}分鐘前`;
    if (diffHours < 24) return `${diffHours}小時前`;
    if (diffDays < 7) return `${diffDays}天前`;
    
    return messageDate.toLocaleDateString('zh-TW');
  };

  const getRoomAvatar = (room) => {
    if (room.type === 'private') {
      // For private chats, use a person icon
      return 'person';
    }
    // For group chats, use a group icon
    return 'group';
  };

  const getRoomDisplayName = (room) => {
    if (room.type === 'private' && room.name) {
      // For private chats, remove "Private chat with" prefix if it exists
      return room.name.replace('Private chat with ', '');
    }
    return room.name || 'Unknown Room';
  };


  return (
    <div className="rooms-tab">
      <div className="rooms-tab__header">
        <h3 className="rooms-tab__title">Chat Rooms</h3>
      </div>

      <div className="rooms-tab__body">
        {/* Chat List */}
        {customRooms.length > 0 && (
          <div className="rooms-tab__chat-list">
            {customRooms.map((room) => (
              <div
                className={`chat-item ${
                  currentRoomId === room.id ? "chat-item--active" : ""
                }`}
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
              >
                <div className="chat-item__avatar">
                  <span className="chat-item__avatar-icon material-icons">{getRoomAvatar(room)}</span>
                </div>
                
                <div className="chat-item__content">
                  <div className="chat-item__header">
                    <h3 className="chat-item__name">{getRoomDisplayName(room)}</h3>
                    <span className="chat-item__time">
                      {room.lastMessageTime ? formatMessageTime(room.lastMessageTime) : ''}
                    </span>
                  </div>
                  
                  <div className="chat-item__message">
                    {room.lastMessage ? (
                      <p className="chat-item__last-message">
                        <span className="chat-item__sender">{room.lastMessageSender}: </span>
                        <span className="chat-item__text">{room.lastMessage}</span>
                      </p>
                    ) : (
                      <p className="chat-item__description">{room.description || '開始對話'}</p>
                    )}
                  </div>
                </div>
                
                {/* Unread badge */}
                <div className="chat-item__badge">
                  {room.unreadCount > 0 && (
                    <span>{room.unreadCount > 99 ? '99+' : room.unreadCount}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {customRooms.length === 0 && (
          <div className="rooms-tab__empty">
            <span className="rooms-tab__empty-icon">💬</span>
            <p className="rooms-tab__empty-text">還沒有聊天室</p>
            <p className="rooms-tab__empty-hint">與朋友開始聊天來建立私人聊天室</p>
          </div>
        )}
      </div>

    </div>
  );
};

RoomsTab.propTypes = {
  onRoomSelect: PropTypes.func.isRequired,
  currentRoomId: PropTypes.string,
  customRooms: PropTypes.array,
};

export default RoomsTab;