import PropTypes from "prop-types";
import "./ChatSidebarPrimary.scss";

const PrimarySidebar = ({ onRoomSelect, currentRoomId, defaultRooms }) => {
  return (
    <div className="primary-sidebar">
      <div className="primary-sidebar__header">
        <p className="primary-sidebar__header-title">My Chatroom</p>
      </div>

      <div className="primary-sidebar__body">
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
};

export default PrimarySidebar;
