import PropTypes from "prop-types";
import "./RoomHeader.scss";

const RoomHeader = ({ className, selectedRoom }) => {
  return (
    <div className={`chat-header-container ${className}`}>
      <h3>{selectedRoom?.name}</h3>
    </div>
  );
};

RoomHeader.propTypes = {
  className: PropTypes.string,
  selectedRoom: PropTypes.object,
};

export default RoomHeader;
