import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";
import { 
  getRoomSettings, 
  updateRoomCustomName, 
  updateRoomCustomAvatar,
  resetRoomSettings,
  getRoomDisplayName 
} from "../../utils/roomSettings";
import "./RoomSettingsModal.scss";

const RoomSettingsModal = ({ 
  isOpen, 
  onClose, 
  room, 
  currentUser, 
  onSettingsUpdated 
}) => {
  const [customName, setCustomName] = useState("");
  const [customAvatar, setCustomAvatar] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load current settings when modal opens
  useEffect(() => {
    if (isOpen && room && currentUser) {
      const settings = getRoomSettings(currentUser.id, room.id);
      setCustomName(settings.customName || "");
      setCustomAvatar(settings.customAvatar || "");
    }
  }, [isOpen, room, currentUser]);

  const handleSave = async () => {
    if (!room || !currentUser) return;
    
    setIsLoading(true);
    try {
      // Update custom name if changed
      if (customName.trim() !== getRoomSettings(currentUser.id, room.id).customName) {
        updateRoomCustomName(currentUser.id, room.id, customName.trim());
      }
      
      // Update custom avatar if changed  
      if (customAvatar.trim() !== getRoomSettings(currentUser.id, room.id).customAvatar) {
        updateRoomCustomAvatar(currentUser.id, room.id, customAvatar.trim());
      }
      
      // Notify parent component that settings were updated
      if (onSettingsUpdated) {
        onSettingsUpdated(room.id);
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving room settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (!room || !currentUser) return;
    
    if (window.confirm("Are you sure you want to reset all custom settings for this room?")) {
      resetRoomSettings(currentUser.id, room.id);
      setCustomName("");
      setCustomAvatar("");
      
      if (onSettingsUpdated) {
        onSettingsUpdated(room.id);
      }
      
      onClose();
    }
  };

  const getOriginalName = () => {
    if (!room) return "Unknown";
    
    if (room.type === "private" && room.participants && currentUser) {
      const otherParticipantId = room.participants.find(id => id !== currentUser.id);
      return room.name || `Chat with ${otherParticipantId}`;
    }
    
    return room.name || "Unknown Room";
  };

  const getPreviewName = () => {
    return customName.trim() || getOriginalName();
  };

  const getPreviewAvatar = () => {
    return customAvatar.trim() || room?.avatar || "💬";
  };

  if (!room) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Room Settings">
      <div className="room-settings-modal">
        {/* Room Preview */}
        <div className="room-settings-modal__preview">
          <div className="room-preview">
            <div className="room-preview__avatar">
              {getPreviewAvatar()}
            </div>
            <div className="room-preview__info">
              <div className="room-preview__name">{getPreviewName()}</div>
              <div className="room-preview__type">
                {room.type === "private" ? "Private Chat" : "Group Chat"}
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="room-settings-modal__form">
          {/* Custom Name */}
          <div className="form-group">
            <label htmlFor="customName" className="form-label">
              Custom Name
            </label>
            <input
              id="customName"
              type="text"
              className="form-input"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder={getOriginalName()}
              maxLength={50}
            />
            <div className="form-hint">
              Leave blank to use the default name: "{getOriginalName()}"
            </div>
          </div>

          {/* Custom Avatar */}
          <div className="form-group">
            <label htmlFor="customAvatar" className="form-label">
              Custom Avatar
            </label>
            <input
              id="customAvatar"
              type="text"
              className="form-input"
              value={customAvatar}
              onChange={(e) => setCustomAvatar(e.target.value)}
              placeholder={room.avatar || "💬"}
              maxLength={10}
            />
            <div className="form-hint">
              Use emoji or short text. Leave blank for default: "{room.avatar || "💬"}"
            </div>
          </div>

          {/* Room Info */}
          <div className="room-info">
            <div className="room-info__item">
              <span className="room-info__label">Room ID:</span>
              <span className="room-info__value">{room.id}</span>
            </div>
            <div className="room-info__item">
              <span className="room-info__label">Participants:</span>
              <span className="room-info__value">
                {room.participants?.length || 0} members
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="room-settings-modal__actions">
          <button
            type="button"
            className="btn btn--secondary"
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset to Default
          </button>
          <div className="btn-group">
            <button
              type="button"
              className="btn btn--tertiary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn--primary"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

RoomSettingsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  room: PropTypes.object,
  currentUser: PropTypes.object,
  onSettingsUpdated: PropTypes.func,
};

export default RoomSettingsModal;