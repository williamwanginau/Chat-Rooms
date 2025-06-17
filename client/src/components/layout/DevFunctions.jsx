import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./DevFunctions.scss";

const DevFunctions = ({ 
  onGenerateTestMessages, 
  onClearMessages,
  onClearFriendsData
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [hasTestData, setHasTestData] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  // Load users and current user from localStorage
  useEffect(() => {
    const loadUsers = () => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const current = JSON.parse(localStorage.getItem("currentUser") || "null");
      const testDataExists = localStorage.getItem("testFriendsAndGroups") === "true";
      setAvailableUsers(users);
      setCurrentUser(current);
      setHasTestData(testDataExists);
    };

    loadUsers();
    if (isOpen) {
      loadUsers();
    }

    const handleStorageChange = (e) => {
      if (e.key === 'users' || e.key === 'currentUser') {
        loadUsers();
      }
    };

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
    
    window.dispatchEvent(new CustomEvent('localStorageUpdate', {
      detail: { key: 'currentUser', newValue: JSON.stringify(selectedUser) }
    }));
    
    // Refresh page to apply user switch
    window.location.reload();
  };

  const clearAllData = () => {
    if (!confirm('This will clear all chat records, friends, and invitation data. Are you sure you want to continue?')) {
      return;
    }
    
    try {
      // Clear friends and invitations
      localStorage.removeItem('friendships');
      localStorage.removeItem('sentInvitations');
      localStorage.removeItem('receivedInvitations');
      localStorage.removeItem('friends');
      
      // Clear users' friends lists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const updatedUsers = users.map(user => ({
        ...user,
        friends: []
      }));
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Clear messages and rooms
      onClearMessages();
      if (onClearFriendsData) {
        onClearFriendsData();
      }
      
      window.dispatchEvent(new CustomEvent('friendshipsCleared'));
      alert('All data has been cleared');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('Error occurred while clearing data');
    }
  };

  const generateTestFriendsAndGroups = () => {
    try {
      // Generate test friends
      const testFriends = [
        { id: "friend1", name: "Alice Johnson", username: "alice_j", avatar: "👩", status: "Available for chat" },
        { id: "friend2", name: "Bob Smith", username: "bob_smith", avatar: "👨", status: "Working from home" },
        { id: "friend3", name: "Carol Davis", username: "carol_d", avatar: "👩‍💼", status: "In a meeting" },
        { id: "friend4", name: "David Wilson", username: "david_w", avatar: "👨‍💻", status: "Coding away" },
        { id: "friend5", name: "Emma Brown", username: "emma_b", avatar: "👩‍🎨", status: "Designing" },
        { id: "friend6", name: "Frank Miller", username: "frank_m", avatar: "👨‍🔧", status: "Fixing things" },
        { id: "friend7", name: "Grace Lee", username: "grace_l", avatar: "👩‍🏫", status: "Teaching" },
        { id: "friend8", name: "Henry Taylor", username: "henry_t", avatar: "👨‍⚕️", status: "Helping patients" },
        { id: "friend9", name: "Ivy Chen", username: "ivy_c", avatar: "👩‍🔬", status: "In the lab" },
        { id: "friend10", name: "Jack Anderson", username: "jack_a", avatar: "👨‍🚀", status: "Exploring space" }
      ];

      // Generate test groups
      const testGroups = [
        { id: "group1", name: "Frontend Developers", description: "React, Vue, Angular discussions", avatar: "💻", lastMessage: "New component library released!" },
        { id: "group2", name: "Design Team", description: "UI/UX design collaboration", avatar: "🎨", lastMessage: "Please review the new mockups" },
        { id: "group3", name: "Project Alpha", description: "Alpha project coordination", avatar: "🚀", lastMessage: "Sprint planning tomorrow at 10 AM" },
        { id: "group4", name: "Coffee Chat", description: "Casual conversations", avatar: "☕", lastMessage: "Anyone up for coffee break?" },
        { id: "group5", name: "Tech News", description: "Latest technology updates", avatar: "📱", lastMessage: "New JavaScript features announced" },
        { id: "group6", name: "Book Club", description: "Monthly book discussions", avatar: "📚", lastMessage: "Next book: Clean Code" },
        { id: "group7", name: "Gaming Squad", description: "After-work gaming sessions", avatar: "🎮", lastMessage: "Raid tonight at 8 PM?" }
      ];

      // Store test data
      localStorage.setItem("testFriends", JSON.stringify(testFriends));
      localStorage.setItem("testGroups", JSON.stringify(testGroups));
      localStorage.setItem("testFriendsAndGroups", "true");
      setHasTestData(true);
      
      alert(`Generated ${testFriends.length} test friends and ${testGroups.length} test groups!`);
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('testDataGenerated', {
        detail: { friends: testFriends, groups: testGroups }
      }));
      
    } catch (error) {
      console.error('Error generating test data:', error);
      alert('Error occurred while generating test data');
    }
  };

  const removeTestFriendsAndGroups = () => {
    try {
      localStorage.removeItem("testFriends");
      localStorage.removeItem("testGroups");
      localStorage.removeItem("testFriendsAndGroups");
      setHasTestData(false);
      
      alert('Test friends and groups removed!');
      
      // Trigger a custom event to notify other components
      window.dispatchEvent(new CustomEvent('testDataRemoved'));
      
    } catch (error) {
      console.error('Error removing test data:', error);
      alert('Error occurred while removing test data');
    }
  };

  const toggleTestData = () => {
    if (hasTestData) {
      removeTestFriendsAndGroups();
    } else {
      generateTestFriendsAndGroups();
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
              <h4>👤 User Management</h4>
              <div className="dev-functions__user-selector">
                <label htmlFor="user-select">Switch User Identity:</label>
                {currentUser && (
                  <p className="dev-functions__current-user">
                    Current User: <strong>{currentUser.username}</strong> (ID: {currentUser.id})
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
                  <option value="">Select User...</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.username} (ID: {user.id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="dev-functions__section">
              <h4>💬 Testing</h4>
              <button 
                className="dev-functions__button"
                onClick={onGenerateTestMessages}
                title="Generate test messages"
              >
                📝 Generate Test Messages
              </button>
              
              <button 
                className={`dev-functions__button ${hasTestData ? 'dev-functions__button--success' : ''}`}
                onClick={toggleTestData}
                title={hasTestData ? "Remove test friends and groups" : "Generate test friends and groups"}
              >
                {hasTestData ? '🗑️ Remove' : '👥 Generate'} Test Friends & Groups
              </button>
              
              {hasTestData && (
                <p className="dev-functions__info">
                  ✅ Test data is active (10 friends, 7 groups)
                </p>
              )}
            </div>

            <div className="dev-functions__section">
              <h4>🧹 Cleanup</h4>
              <button 
                className="dev-functions__button dev-functions__button--danger"
                onClick={onClearMessages}
                title="Clear all messages in current room"
              >
                🗑️ Clear Messages
              </button>
              
              <button 
                className="dev-functions__button dev-functions__button--danger"
                onClick={clearAllData}
                title="Clear all data including friends and messages"
              >
                🗑️ Clear All Data
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
  onClearFriendsData: PropTypes.func,
};

export default DevFunctions;