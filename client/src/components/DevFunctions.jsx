import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./DevFunctions.scss";
import MESSAGE_TYPES from "../../../shared/messageTypes.json";

const DevFunctions = ({ 
  onGenerateTestMessages, 
  onClearMessages,
  onGenerateStressTest,
  onSimulateTyping,
  onGenerateLongMessages,
  onSimulateUserJoinLeave,
  onSimulateGradualUserJoin,
  onRemoveAllVirtualUsers,
  onGenerateFriends,
  onGenerateInvitations,
  onClearFriendsData,
  sendMessage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  // Load users and current user from localStorage
  useEffect(() => {
    const loadUsers = () => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const current = JSON.parse(localStorage.getItem("currentUser") || "null");
      setAvailableUsers(users);
      setCurrentUser(current);
    };

    loadUsers();
    // Refresh when panel opens
    if (isOpen) {
      loadUsers();
    }

    // Listen for localStorage changes to sync user data in real-time
    const handleStorageChange = (e) => {
      if (e.key === 'users' || e.key === 'currentUser') {
        loadUsers();
      }
    };

    // Listen for custom events for same-tab localStorage changes
    const handleCustomStorageChange = (e) => {
      if (e.detail.key === 'users' || e.detail.key === 'currentUser') {
        loadUsers();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageUpdate', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageUpdate', handleCustomStorageChange);
    };
  }, [isOpen]);

  const handleSwitchUser = (selectedUser) => {
    localStorage.setItem("currentUser", JSON.stringify(selectedUser));
    setCurrentUser(selectedUser);
    
    // Trigger custom event for same-tab localStorage update
    window.dispatchEvent(new CustomEvent('localStorageUpdate', {
      detail: { key: 'currentUser', newValue: JSON.stringify(selectedUser) }
    }));
    
    console.log("👤 Switched to user:", selectedUser.username);
  };

  const handleGenerateMessages = () => {
    onGenerateTestMessages();
    console.log("📅 Generated test messages with different dates");
  };

  const handleClearMessages = () => {
    onClearMessages();
    console.log("🗑️ Cleared all messages");
  };

  const handleOverrideUsersFromJson = async () => {
    try {
      const response = await fetch('/dummy data/users.json');
      if (!response.ok) {
        throw new Error('Failed to fetch users.json');
      }
      const jsonUsers = await response.json();
      
      // Convert JSON users to localStorage format
      const formattedUsers = jsonUsers.map(user => ({
        internalId: user.internalId,
        id: user.id,
        username: user.username,
        email: user.email,
        online: user.online,
        lastSeen: user.lastSeen,
        chatRooms: []
      }));
      
      localStorage.setItem("users", JSON.stringify(formattedUsers));
      
      // Trigger custom event for same-tab localStorage update
      window.dispatchEvent(new CustomEvent('localStorageUpdate', {
        detail: { key: 'users', newValue: JSON.stringify(formattedUsers) }
      }));
      
      // Broadcast users data sync to all connected clients via WebSocket
      if (sendMessage) {
        sendMessage({
          type: MESSAGE_TYPES.USERS_DATA_SYNC,
          users: formattedUsers,
          clientTimestamp: new Date().toISOString(),
        });
      }
      
      console.log("👥 Overridden localStorage users with users.json data");
      console.log("📊 Loaded users:", formattedUsers);
      console.log("🔄 Broadcasted users data to all connected clients");
    } catch (error) {
      console.error("❌ Failed to override users:", error);
    }
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
              
              <button 
                className="dev-functions__button"
                onClick={() => onSimulateGradualUserJoin?.()}
                title="Gradually add virtual members to the chat room"
              >
                👥 Add Virtual Members
              </button>
              
              <button 
                className="dev-functions__button dev-functions__button--danger"
                onClick={() => onRemoveAllVirtualUsers?.()}
                title="Remove all virtual members from the chat room"
              >
                🗑️ Remove Virtual Members
              </button>
            </div>

            <div className="dev-functions__section">
              <h4>👨‍👩‍👧‍👦 Friends & Invitations</h4>
              <button 
                className="dev-functions__button"
                onClick={() => onGenerateFriends?.()}
                title="Generate mock friends data for testing"
              >
                👥 Generate Friends
              </button>
              
              <button 
                className="dev-functions__button"
                onClick={() => onGenerateInvitations?.()}
                title="Generate mock invitations data for testing"
              >
                📨 Generate Invitations
              </button>
              
              <button 
                className="dev-functions__button dev-functions__button--danger"
                onClick={() => onClearFriendsData?.()}
                title="Clear all friends and invitations data"
              >
                🗑️ Clear Friends Data
              </button>
            </div>

            <div className="dev-functions__section">
              <h4>👤 User Management</h4>
              <button 
                className="dev-functions__button"
                onClick={handleOverrideUsersFromJson}
                title="Override localStorage users with users.json data"
              >
                📂 Load Users from JSON
              </button>
              
              <div className="dev-functions__user-selector">
                <label htmlFor="user-select">切換用戶身份:</label>
                {currentUser && (
                  <p className="dev-functions__current-user">
                    當前用戶: <strong>{currentUser.username}</strong> (ID: {currentUser.id})
                  </p>
                )}
                <select 
                  id="user-select"
                  className="dev-functions__select"
                  value={currentUser?.id || ""}
                  onChange={(e) => {
                    const selectedUser = availableUsers.find(user => user.id === e.target.value);
                    if (selectedUser) {
                      handleSwitchUser(selectedUser);
                    }
                  }}
                >
                  <option value="">選擇用戶...</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} (ID: {user.id})
                    </option>
                  ))}
                </select>
              </div>
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
  onGenerateLongMessages: PropTypes.func,
  onSimulateUserJoinLeave: PropTypes.func,
  onSimulateGradualUserJoin: PropTypes.func,
  onRemoveAllVirtualUsers: PropTypes.func,
  onGenerateFriends: PropTypes.func,
  onGenerateInvitations: PropTypes.func,
  onClearFriendsData: PropTypes.func,
  sendMessage: PropTypes.func,
};

export default DevFunctions;