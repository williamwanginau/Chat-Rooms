import PropTypes from "prop-types";
import RoomActions from "../../components/RoomActions";
import "./RoomsList.scss";

const PrimarySidebar = ({ onRoomSelect, currentRoomId, defaultRooms, onCreateRoom, onJoinRoom, customRooms = [] }) => {
  return (
    <div className="primary-sidebar">
      <div className="primary-sidebar__header">
        <p className="primary-sidebar__header-title">My Chatroom</p>
      </div>

      <div className="primary-sidebar__body">
        {/* Default Rooms Section */}
        {defaultRooms.length > 0 && (
          <div className="primary-sidebar__section">
            <h4 className="primary-sidebar__section-title">Default Rooms</h4>
            {defaultRooms.map((room) => (
              <div
                className={`primary-sidebar__item ${
                  currentRoomId === room.id ? "primary-sidebar__item--active" : ""
                }`}
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
              >
                <h3 className="primary-sidebar__item-name">{room.name}</h3>
                <p className="primary-sidebar__item-description">
                  {room.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Custom Rooms Section */}
        {customRooms.length > 0 && (
          <div className="primary-sidebar__section">
            <h4 className="primary-sidebar__section-title">My Rooms</h4>
            {customRooms.map((room) => (
              <div
                className={`primary-sidebar__item ${
                  currentRoomId === room.id ? "primary-sidebar__item--active" : ""
                } ${room.isCustom ? "primary-sidebar__item--custom" : ""}`}
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
              >
                <div className="primary-sidebar__item-header">
                  <h3 className="primary-sidebar__item-name">{room.name}</h3>
                  <span className="primary-sidebar__item-id">ID: {room.id}</span>
                </div>
                <p className="primary-sidebar__item-description">
                  {room.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <RoomActions onCreateRoom={onCreateRoom} onJoinRoom={onJoinRoom} />
    </div>
  );
};

PrimarySidebar.propTypes = {
  onRoomSelect: PropTypes.func.isRequired,
  currentRoomId: PropTypes.string,
  defaultRooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
    })
  ).isRequired,
  onCreateRoom: PropTypes.func.isRequired,
  onJoinRoom: PropTypes.func.isRequired,
  customRooms: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      isCustom: PropTypes.bool,
    })
  ),
};

export default PrimarySidebar;
