import { useState } from "react";
import PropTypes from "prop-types";
import RoomActions from "../../components/RoomActions";
import CopySuccessToast from "../../components/CopySuccessToast";
import "./RoomsList.scss";

const PrimarySidebar = ({ onRoomSelect, currentRoomId, defaultRooms, onCreateRoom, onJoinRoom, customRooms = [] }) => {
  const [copiedId, setCopiedId] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handleCopyRoomId = async (e, roomId) => {
    e.stopPropagation(); // Prevent room selection when clicking ID
    
    try {
      await navigator.clipboard.writeText(roomId);
      setCopiedId(roomId);
      setToastMessage(`Room ID ${roomId} copied to clipboard`);
      setShowToast(true);
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    } catch (error) {
      console.error("Failed to copy room ID:", error);
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = roomId;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        setCopiedId(roomId);
        setToastMessage(`Room ID ${roomId} copied to clipboard`);
        setShowToast(true);
        setTimeout(() => {
          setCopiedId(null);
        }, 2000);
      } catch (fallbackError) {
        console.error("Fallback copy failed:", fallbackError);
        alert(`Room ID: ${roomId}`);
      }
      document.body.removeChild(textArea);
    }
  };

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
                  <span 
                    className={`primary-sidebar__item-id ${copiedId === room.id ? 'primary-sidebar__item-id--copied' : ''}`}
                    onClick={(e) => handleCopyRoomId(e, room.id)}
                    title="Click to copy room ID"
                  >
                    {copiedId === room.id ? '✓ Copied!' : `ID: ${room.id}`}
                  </span>
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
      
      <CopySuccessToast 
        message={toastMessage}
        isVisible={showToast}
        onHide={() => setShowToast(false)}
      />
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
