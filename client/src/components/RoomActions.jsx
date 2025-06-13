import { useState } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";
import CreateRoomForm from "./CreateRoomForm";
import JoinRoomForm from "./JoinRoomForm";
import "./RoomActions.scss";

const RoomActions = ({ onCreateRoom, onJoinRoom }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const handleOpenCreateModal = () => {
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
  };

  const handleOpenJoinModal = () => {
    setShowJoinModal(true);
  };

  const handleCloseJoinModal = () => {
    setShowJoinModal(false);
  };

  return (
    <>
      <div className="room-actions">
        <div className="room-actions__buttons">
          <button 
            className="room-actions__button room-actions__button--create"
            onClick={handleOpenCreateModal}
          >
            Create Room
          </button>
          <button 
            className="room-actions__button room-actions__button--join"
            onClick={handleOpenJoinModal}
          >
            Join Room
          </button>
        </div>
      </div>

      {/* Create Room Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        title="Create New Room"
      >
        <CreateRoomForm
          onCreateRoom={onCreateRoom}
          onCancel={handleCloseCreateModal}
        />
      </Modal>

      {/* Join Room Modal */}
      <Modal
        isOpen={showJoinModal}
        onClose={handleCloseJoinModal}
        title="Join Room"
      >
        <JoinRoomForm
          onJoinRoom={onJoinRoom}
          onCancel={handleCloseJoinModal}
        />
      </Modal>
    </>
  );
};

RoomActions.propTypes = {
  onCreateRoom: PropTypes.func.isRequired,
  onJoinRoom: PropTypes.func.isRequired,
};

export default RoomActions;