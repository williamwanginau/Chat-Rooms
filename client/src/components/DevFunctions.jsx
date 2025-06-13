import { useState } from "react";
import PropTypes from "prop-types";
import "./DevFunctions.scss";

const DevFunctions = ({ 
  onGenerateTestMessages, 
  onClearMessages,
  onGenerateStressTest,
  onSimulateTyping,
  onSimulateSlowNetwork,
  onGenerateLongMessages,
  onSimulateUserJoinLeave 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleGenerateMessages = () => {
    onGenerateTestMessages();
    console.log("📅 Generated test messages with different dates");
  };

  const handleClearMessages = () => {
    onClearMessages();
    console.log("🗑️ Cleared all messages");
  };

  return (
    <div className={`dev-functions ${isOpen ? "dev-functions--open" : ""}`}>
      <button 
        className="dev-functions__toggle"
        onClick={togglePanel}
        title="Developer Functions"
      >
        🛠️ Dev
      </button>
      
      {isOpen && (
        <div className="dev-functions__panel">
          <div className="dev-functions__header">
            <h3>Dev Functions</h3>
          </div>
          
          <div className="dev-functions__content">
            <div className="dev-functions__section">
              <h4>📅 Date & Time Testing</h4>
              <button 
                className="dev-functions__button"
                onClick={handleGenerateMessages}
                title="Generate messages from different dates"
              >
                📅 Generate Date Messages
              </button>
            </div>

            <div className="dev-functions__section">
              <h4>💬 Message Testing</h4>
              <button 
                className="dev-functions__button"
                onClick={() => onGenerateLongMessages?.()}
                title="Test with very long messages and special characters"
              >
                📝 Long Messages
              </button>
              
              <button 
                className="dev-functions__button"
                onClick={() => onGenerateStressTest?.()}
                title="Generate many messages quickly for performance testing"
              >
                ⚡ Stress Test (100 msgs)
              </button>
            </div>

            <div className="dev-functions__section">
              <h4>👥 User Simulation</h4>
              <button 
                className="dev-functions__button"
                onClick={() => onSimulateTyping?.()}
                title="Simulate multiple users typing at once"
              >
                ⌨️ Simulate Typing
              </button>
              
              <button 
                className="dev-functions__button"
                onClick={() => onSimulateUserJoinLeave?.()}
                title="Simulate users joining and leaving the room"
              >
                🚪 User Join/Leave
              </button>
            </div>

            <div className="dev-functions__section">
              <h4>🧹 Cleanup</h4>
              <button 
                className="dev-functions__button dev-functions__button--danger"
                onClick={handleClearMessages}
                title="Clear all messages in current room"
              >
                🗑️ Clear Messages
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

DevFunctions.propTypes = {
  onGenerateTestMessages: PropTypes.func.isRequired,
  onClearMessages: PropTypes.func.isRequired,
  onGenerateStressTest: PropTypes.func,
  onSimulateTyping: PropTypes.func,
  onSimulateSlowNetwork: PropTypes.func,
  onGenerateLongMessages: PropTypes.func,
  onSimulateUserJoinLeave: PropTypes.func,
};

export default DevFunctions;