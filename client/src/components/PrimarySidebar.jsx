import PropTypes from "prop-types";
import "./PrimarySidebar.scss";

const DEFAULT_ROOMS = [
  { id: "sport", name: "Sports Room", description: "Discuss sports events" },
  {
    id: "finance",
    name: "Finance Room",
    description: "Share investment topics",
  },
  {
    id: "tech",
    name: "Tech Room",
    description: "Explore latest tech trends",
  },
];

const PrimarySidebar = ({ onRoomSelect, currentRoomId }) => {
  return (
    <div className="primary-sidebar">
      <div className="primary-sidebar__header">
        <h2 className="primary-sidebar__title">My Chatroom</h2>
      </div>

      <div className="primary-sidebar__body">
        {DEFAULT_ROOMS.map((room) => (
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
};

export default PrimarySidebar;
