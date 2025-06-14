import { useState } from "react";
import PropTypes from "prop-types";
import RoomActions from "./RoomActions";
import CopySuccessToast from "./CopySuccessToast";
import "./RoomsTab.scss";

const RoomsTab = ({ onRoomSelect, currentRoomId, defaultRooms, onCreateRoom, onJoinRoom, customRooms = [] }) => {
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
    <div className="rooms-tab">
      <div className="rooms-tab__header">
        <h3 className="rooms-tab__title">Chat Rooms</h3>
        <RoomActions onCreateRoom={onCreateRoom} onJoinRoom={onJoinRoom} />
      </div>

      <div className="rooms-tab__body">
        {/* Default Rooms Section */}
        {defaultRooms.length > 0 && (
          <div className="rooms-tab__section">
            <h4 className="rooms-tab__section-title">Default Rooms</h4>
            {defaultRooms.map((room) => (
              <div
                className={`rooms-tab__item ${
                  currentRoomId === room.id ? "rooms-tab__item--active" : ""
                }`}
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
              >
                <h3 className="rooms-tab__item-name">{room.name}</h3>
                <p className="rooms-tab__item-description">
                  {room.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Custom Rooms Section */}
        {customRooms.length > 0 && (
          <div className="rooms-tab__section">
            <h4 className="rooms-tab__section-title">My Rooms</h4>
            {customRooms.map((room) => (
              <div
                className={`rooms-tab__item ${
                  currentRoomId === room.id ? "rooms-tab__item--active" : ""
                } ${room.isCustom ? "rooms-tab__item--custom" : ""}`}
                key={room.id}
                onClick={() => onRoomSelect(room.id)}
              >
                <div className="rooms-tab__item-header">
                  <h3 className="rooms-tab__item-name">{room.name}</h3>
                  <span 
                    className={`rooms-tab__item-id ${copiedId === room.id ? 'rooms-tab__item-id--copied' : ''}`}
                    onClick={(e) => handleCopyRoomId(e, room.id)}
                    title="Click to copy room ID"
                  >
                    {room.id}
                  </span>
                </div>
                <p className="rooms-tab__item-description">
                  {room.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {defaultRooms.length === 0 && customRooms.length === 0 && (
          <div className="rooms-tab__empty">
            <span className="rooms-tab__empty-icon">💬</span>
            <p className="rooms-tab__empty-text">No chat rooms yet</p>
            <p className="rooms-tab__empty-hint">Click the buttons above to create or join a room</p>
          </div>
        )}
      </div>

      {/* Toast notification */}
      <CopySuccessToast
        isVisible={showToast}
        message={toastMessage}
        onHide={() => setShowToast(false)}
      />
    </div>
  );
};

RoomsTab.propTypes = {
  onRoomSelect: PropTypes.func.isRequired,
  currentRoomId: PropTypes.string,
  defaultRooms: PropTypes.array.isRequired,
  onCreateRoom: PropTypes.func.isRequired,
  onJoinRoom: PropTypes.func.isRequired,
  customRooms: PropTypes.array,
};

export default RoomsTab;