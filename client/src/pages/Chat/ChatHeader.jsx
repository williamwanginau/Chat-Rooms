import PropTypes from "prop-types";
import "./ChatHeader.scss";

const ChatHeader = ({ className, selectedRoom }) => {
  return (
    <div className={`chat-header-container ${className}`}>
      <h3>{selectedRoom?.name}</h3>
    </div>
  );
};

ChatHeader.propTypes = {
  className: PropTypes.string,
  selectedRoom: PropTypes.object,
};

export default ChatHeader;
