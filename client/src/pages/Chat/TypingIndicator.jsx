import PropTypes from "prop-types";
import "./TypingIndicator.scss";

const TypingIndicator = ({ typingUsers }) => {
  if (!typingUsers || typingUsers.length === 0) {
    return null;
  }

  const renderTypingText = () => {
    const count = typingUsers.length;
    
    if (count === 1) {
      return `${typingUsers[0]} is typing...`;
    } else if (count === 2) {
      return `${typingUsers[0]} and ${typingUsers[1]} are typing...`;
    } else if (count === 3) {
      return `${typingUsers[0]}, ${typingUsers[1]} and ${typingUsers[2]} are typing...`;
    } else {
      return `${typingUsers[0]}, ${typingUsers[1]} and ${count - 2} others are typing...`;
    }
  };

  return (
    <div className="typing-indicator">
      <div className="typing-indicator__content">
        <div className="typing-indicator__dots">
          <span className="typing-indicator__dot"></span>
          <span className="typing-indicator__dot"></span>
          <span className="typing-indicator__dot"></span>
        </div>
        <span className="typing-indicator__text">
          {renderTypingText()}
        </span>
      </div>
    </div>
  );
};

TypingIndicator.propTypes = {
  typingUsers: PropTypes.arrayOf(PropTypes.string),
};

export default TypingIndicator;