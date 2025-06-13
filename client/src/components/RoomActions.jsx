import { useState } from "react";
import PropTypes from "prop-types";
import "./RoomActions.scss";

const RoomActions = ({ onCreateRoom, onJoinRoom }) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showJoinForm, setShowJoinForm] = useState(false);
  
  // Create room form state
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  
  // Join room form state
  const [roomIdToJoin, setRoomIdToJoin] = useState("");
  
  // Loading states
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);

  const generateRoomId = () => {
    // Generate a 6-character random ID
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    
    if (!newRoomName.trim()) {
      alert("Please enter room name");
      return;
    }

    setIsCreating(true);
    
    try {
      const roomId = generateRoomId();
      const roomData = {
        id: roomId,
        name: newRoomName.trim(),
        description: newRoomDescription.trim() || "Custom Room",
        isCustom: true,
        creator: true
      };

      await onCreateRoom(roomData);
      
      // Reset form
      setNewRoomName("");
      setNewRoomDescription("");
      setShowCreateForm(false);
    } catch (error) {
      console.error("Failed to create room:", error);
      alert("Failed to create room, please try again");
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e) => {
    e.preventDefault();
    
    if (!roomIdToJoin.trim()) {
      alert("Please enter room ID");
      return;
    }

    setIsJoining(true);
    
    try {
      await onJoinRoom(roomIdToJoin.trim().toUpperCase());
      
      // Reset form
      setRoomIdToJoin("");
      setShowJoinForm(false);
    } catch (error) {
      console.error("Failed to join room:", error);
      alert("Failed to join room, please check if room ID is correct");
    } finally {
      setIsJoining(false);
    }
  };

  const cancelCreate = () => {
    setShowCreateForm(false);
    setNewRoomName("");
    setNewRoomDescription("");
  };

  const cancelJoin = () => {
    setShowJoinForm(false);
    setRoomIdToJoin("");
  };

  return (
    <div className="room-actions">
      {!showCreateForm && !showJoinForm && (
        <div className="room-actions__buttons">
          <button 
            className="room-actions__button room-actions__button--create"
            onClick={() => setShowCreateForm(true)}
          >
            Create Room
          </button>
          <button 
            className="room-actions__button room-actions__button--join"
            onClick={() => setShowJoinForm(true)}
          >
            Join Room
          </button>
        </div>
      )}

      {showCreateForm && (
        <div className="room-actions__form">
          <h3 className="room-actions__form-title">Create New Room</h3>
          <form onSubmit={handleCreateRoom}>
            <div className="room-actions__form-group">
              <label htmlFor="roomName">Room Name *</label>
              <input
                id="roomName"
                type="text"
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                placeholder="Enter room name"
                maxLength={50}
                disabled={isCreating}
              />
            </div>
            
            <div className="room-actions__form-group">
              <label htmlFor="roomDescription">Room Description</label>
              <input
                id="roomDescription"
                type="text"
                value={newRoomDescription}
                onChange={(e) => setNewRoomDescription(e.target.value)}
                placeholder="Enter room description (optional)"
                maxLength={100}
                disabled={isCreating}
              />
            </div>
            
            <div className="room-actions__form-buttons">
              <button 
                type="submit" 
                disabled={isCreating || !newRoomName.trim()}
                className="room-actions__form-submit"
              >
                {isCreating ? "Creating..." : "Create"}
              </button>
              <button 
                type="button" 
                onClick={cancelCreate}
                disabled={isCreating}
                className="room-actions__form-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {showJoinForm && (
        <div className="room-actions__form">
          <h3 className="room-actions__form-title">Join Room</h3>
          <form onSubmit={handleJoinRoom}>
            <div className="room-actions__form-group">
              <label htmlFor="roomId">Room ID *</label>
              <input
                id="roomId"
                type="text"
                value={roomIdToJoin}
                onChange={(e) => setRoomIdToJoin(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit room ID"
                maxLength={6}
                disabled={isJoining}
                style={{ textTransform: 'uppercase' }}
              />
            </div>
            
            <div className="room-actions__form-buttons">
              <button 
                type="submit" 
                disabled={isJoining || !roomIdToJoin.trim()}
                className="room-actions__form-submit"
              >
                {isJoining ? "Joining..." : "Join"}
              </button>
              <button 
                type="button" 
                onClick={cancelJoin}
                disabled={isJoining}
                className="room-actions__form-cancel"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

RoomActions.propTypes = {
  onCreateRoom: PropTypes.func.isRequired,
  onJoinRoom: PropTypes.func.isRequired,
};

export default RoomActions;