import { useState } from "react";
import PropTypes from "prop-types";
import "./RoomForm.scss";

const JoinRoomForm = ({ onJoinRoom, onCancel }) => {
  const [roomId, setRoomId] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!roomId.trim()) {
      alert("Please enter room ID");
      return;
    }

    if (roomId.trim().length !== 6) {
      alert("Room ID must be exactly 6 characters");
      return;
    }

    setIsJoining(true);
    
    try {
      await onJoinRoom(roomId.trim().toUpperCase());
      
      // Reset form and close modal
      setRoomId("");
      onCancel(); // This will close the modal
    } catch (error) {
      console.error("Failed to join room:", error);
      alert("Failed to join room, please check if room ID is correct");
    } finally {
      setIsJoining(false);
    }
  };

  const handleCancel = () => {
    setRoomId("");
    onCancel();
  };

  const handleRoomIdChange = (e) => {
    // Convert to uppercase and limit to 6 characters
    const value = e.target.value.toUpperCase().slice(0, 6);
    setRoomId(value);
  };

  return (
    <form onSubmit={handleSubmit} className="room-form">
      <div className="room-form__group">
        <label htmlFor="roomId" className="room-form__label">
          Room ID *
        </label>
        <input
          id="roomId"
          type="text"
          value={roomId}
          onChange={handleRoomIdChange}
          placeholder="Enter 6-digit room ID"
          maxLength={6}
          disabled={isJoining}
          className="room-form__input room-form__input--code"
          autoFocus
          autoComplete="off"
        />
        <div className="room-form__help">
          Enter the 6-character room ID shared by the room creator
        </div>
      </div>
      
      <div className="room-form__buttons">
        <button 
          type="submit" 
          disabled={isJoining || !roomId.trim() || roomId.length !== 6}
          className="room-form__submit"
        >
          {isJoining ? "Joining..." : "Join Room"}
        </button>
        <button 
          type="button" 
          onClick={handleCancel}
          disabled={isJoining}
          className="room-form__cancel"
        >
          Cancel
        </button>
      </div>

      {isJoining && (
        <div className="room-form__loading">
          <div className="room-form__spinner"></div>
          <span>Joining room...</span>
        </div>
      )}
    </form>
  );
};

JoinRoomForm.propTypes = {
  onJoinRoom: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default JoinRoomForm;