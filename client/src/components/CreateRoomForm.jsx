import { useState } from "react";
import PropTypes from "prop-types";
import "./RoomForm.scss";

const CreateRoomForm = ({ onCreateRoom, onCancel }) => {
  const [roomName, setRoomName] = useState("");
  const [roomDescription, setRoomDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const generateRoomId = () => {
    // Generate a 6-character random ID
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      alert("Please enter room name");
      return;
    }

    setIsCreating(true);
    
    try {
      const roomId = generateRoomId();
      const roomData = {
        id: roomId,
        name: roomName.trim(),
        description: roomDescription.trim() || "Custom Room",
        isCustom: true,
        creator: true
      };

      await onCreateRoom(roomData);
      
      // Reset form and close modal
      setRoomName("");
      setRoomDescription("");
      onCancel(); // This will close the modal
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Failed to create room, please try again");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancel = () => {
    setRoomName("");
    setRoomDescription("");
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="room-form">
      <div className="room-form__group">
        <label htmlFor="roomName" className="room-form__label">
          Room Name *
        </label>
        <input
          id="roomName"
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          placeholder="Enter room name"
          maxLength={50}
          disabled={isCreating}
          className="room-form__input"
          autoFocus
        />
      </div>
      
      <div className="room-form__group">
        <label htmlFor="roomDescription" className="room-form__label">
          Room Description
        </label>
        <textarea
          id="roomDescription"
          value={roomDescription}
          onChange={(e) => setRoomDescription(e.target.value)}
          placeholder="Enter room description (optional)"
          maxLength={200}
          disabled={isCreating}
          className="room-form__textarea"
          rows={3}
        />
      </div>
      
      <div className="room-form__buttons">
        <button 
          type="submit" 
          disabled={isCreating || !roomName.trim()}
          className="room-form__submit"
        >
          {isCreating ? "Creating..." : "Create Room"}
        </button>
        <button 
          type="button" 
          onClick={handleCancel}
          disabled={isCreating}
          className="room-form__cancel"
        >
          Cancel
        </button>
      </div>

      {isCreating && (
        <div className="room-form__loading">
          <div className="room-form__spinner"></div>
          <span>Creating your room...</span>
        </div>
      )}
    </form>
  );
};

CreateRoomForm.propTypes = {
  onCreateRoom: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default CreateRoomForm;