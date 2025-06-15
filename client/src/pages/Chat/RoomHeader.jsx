import PropTypes from "prop-types";
import "./RoomHeader.scss";

const RoomHeader = ({ className, selectedRoom }) => {
  const getRoomAvatar = (room) => {
    if (room?.type === 'private') {
      return 'person';
    }
    return 'group';
  };

  const getRoomDisplayName = (room) => {
    if (room?.type === 'private' && room?.name) {
      return room.name.replace('Private chat with ', '');
    }
    return room?.name || '選擇一個聊天室';
  };

  const getRoomStatus = (room) => {
    if (!room || !room.id) return '選擇一個聊天開始對話';
    if (room.type === 'private') return '私人聊天';
    return '群組聊天';
  };

  return (
    <div className={`chat-header-container ${className || ''}`}>
      <div className="room-header">
        <div className="room-header__avatar">
          {selectedRoom && <span className="material-icons">{getRoomAvatar(selectedRoom)}</span>}
        </div>
        <div className="room-header__info">
          <h3 className="room-header__name">{getRoomDisplayName(selectedRoom)}</h3>
          <p className="room-header__status">{getRoomStatus(selectedRoom)}</p>
        </div>
      </div>
      
      <div className="room-actions">
        {selectedRoom && selectedRoom.id && (
          <>
            <button title="更多選項">
              <span className="material-icons">more_vert</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
};

RoomHeader.propTypes = {
  className: PropTypes.string,
  selectedRoom: PropTypes.object,
};

export default RoomHeader;
