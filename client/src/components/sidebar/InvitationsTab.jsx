import { useState } from "react";
import PropTypes from "prop-types";
import ListItem from "../common/ListItem";
import "./InvitationsTab.scss";
import MESSAGE_TYPES from "../../../../shared/messageTypes.json";

const InvitationsTab = ({ 
  receivedInvitations = [], 
  sentInvitations = [], 
  currentUser,
  onAcceptInvitation, 
  onDeclineInvitation,
  onCancelInvitation,
  onSendInvitation,
  sendMessage 
}) => {
  const [activeSection, setActiveSection] = useState("received");
  const [newInviteUsername, setNewInviteUsername] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [isEditingId, setIsEditingId] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [saveError, setSaveError] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Helper function to get user info by ID
  const getUserById = (id) => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    return users.find(user => user.id === id);
  };

  // Helper function to enrich invitations with user info
  const enrichInvitation = (invitation) => {
    const fromUser = getUserById(invitation.fromUserId);
    const toUser = getUserById(invitation.toUserId);
    
    return {
      ...invitation,
      from: fromUser || { username: "unknown", avatar: "👤", name: "Unknown" },
      to: toUser || { username: "unknown", avatar: "👤", name: "Unknown" }
    };
  };

  const allReceivedInvitations = receivedInvitations.map(enrichInvitation);
  const allSentInvitations = sentInvitations.map(enrichInvitation);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    }
  };

  const handleSendInvitation = (targetUser = null) => {
    const username = targetUser ? targetUser.username : newInviteUsername.trim();
    if (username) {
      onSendInvitation?.(username);
      setNewInviteUsername("");
      setSearchQuery("");
      setSearchResults([]);
      setIsSearching(false);
    }
  };

  const performSearch = () => {
    const query = searchQuery.trim();
    if (!query || query.length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const searchTerm = query.toLowerCase();
    
    // Search for exact username match only
    const matches = users.filter(user => {
      if (user.id === currentUser?.id) return false; // Exclude current user
      return user.username === query; // Exact match only
    });
    setSearchResults(matches.slice(0, 10)); // Show up to 10 results
    setIsSearching(false);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  };

  const handleInviteUser = (user) => {
    onSendInvitation?.(user.username);
    // Keep search results visible after sending invitation
  };

  const handleCopyUserId = async (userId) => {
    try {
      await navigator.clipboard.writeText(userId);
      setCopiedId(userId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy user ID:', err);
    }
  };

  const handleEditId = () => {
    setIsEditingId(true);
    setEditingId(currentUser.id);
    setSaveError("");
  };

  const handleCancelEdit = () => {
    setIsEditingId(false);
    setEditingId("");
    setSaveError("");
  };

  const validateId = (id) => {
    if (!id || id.trim().length === 0) {
      return "ID cannot be empty";
    }
    if (id.length < 3) {
      return "ID must be at least 3 characters";
    }
    if (id.length > 20) {
      return "ID must be 20 characters or less";
    }
    
    // Enhanced character validation
    if (!/^[a-zA-Z0-9_-]+$/.test(id)) {
      return "ID can only contain letters, numbers, hyphens and underscores";
    }
    
    // Prevent IDs starting or ending with special characters
    if (id.startsWith('-') || id.startsWith('_') || id.endsWith('-') || id.endsWith('_')) {
      return "ID cannot start or end with hyphens or underscores";
    }
    
    // Prevent consecutive special characters
    if (id.includes('--') || id.includes('__') || id.includes('-_') || id.includes('_-')) {
      return "ID cannot contain consecutive special characters";
    }
    
    // Prevent reserved words
    const reservedWords = ['admin', 'system', 'user', 'guest', 'bot', 'null', 'undefined', 'root', 'test', 'demo'];
    if (reservedWords.includes(id.toLowerCase())) {
      return "This ID is reserved and cannot be used";
    }
    
    // Must contain at least one letter
    if (!/[a-zA-Z]/.test(id)) {
      return "ID must contain at least one letter";
    }
    
    // Check if username is already taken by another user
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const existingUser = users.find(user => user.username === id && user.id !== currentUser.id);
    if (existingUser) {
      return "This username is already taken";
    }
    
    return null;
  };

  const handleSaveId = () => {
    const trimmedId = editingId.trim();
    const error = validateId(trimmedId);
    
    if (error) {
      setSaveError(error);
      return;
    }

    // Send USER_INFO_UPDATED event via WebSocket first for server validation
    if (sendMessage) {
      const updatedUser = { ...currentUser, username: trimmedId };
      const userInfoUpdateMessage = {
        type: MESSAGE_TYPES.USER_INFO_UPDATED,
        user: updatedUser,
        clientTimestamp: new Date().toISOString(),
      };
      
      sendMessage(userInfoUpdateMessage);
      
      // Set up event listener for server validation response
      const handleServerResponse = (event) => {
        if (event.detail.error) {
          setSaveError(event.detail.error);
        } else {
          // Server validation passed, update localStorage
          localStorage.setItem("currentUser", JSON.stringify(updatedUser));
          
          // Update users array in localStorage
          const users = JSON.parse(localStorage.getItem("users") || "[]");
          const userIndex = users.findIndex(user => user.internalId === currentUser.internalId);
          if (userIndex !== -1) {
            users[userIndex] = updatedUser;
            localStorage.setItem("users", JSON.stringify(users));
          }
          
          // Trigger custom events for same-tab localStorage updates
          window.dispatchEvent(new CustomEvent('localStorageUpdate', {
            detail: { key: 'currentUser', newValue: JSON.stringify(updatedUser) }
          }));
          window.dispatchEvent(new CustomEvent('localStorageUpdate', {
            detail: { key: 'users', newValue: JSON.stringify(users) }
          }));
          
          // Reset editing state
          setIsEditingId(false);
          setEditingId("");
          setSaveError("");
        }
        
        // Clean up event listener
        window.removeEventListener('userInfoUpdateError', handleServerResponse);
      };
      
      // Listen for server validation error
      window.addEventListener('userInfoUpdateError', handleServerResponse);
      
      // Set a timeout to clean up the event listener if no response
      setTimeout(() => {
        window.removeEventListener('userInfoUpdateError', handleServerResponse);
      }, 5000);
    } else {
      // Fallback for when WebSocket is not available
      const updatedUser = { ...currentUser, id: trimmedId };
      localStorage.setItem("currentUser", JSON.stringify(updatedUser));
      
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = users.findIndex(user => user.internalId === currentUser.internalId);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem("users", JSON.stringify(users));
      }
      
      window.dispatchEvent(new CustomEvent('localStorageUpdate', {
        detail: { key: 'currentUser', newValue: JSON.stringify(updatedUser) }
      }));
      window.dispatchEvent(new CustomEvent('localStorageUpdate', {
        detail: { key: 'users', newValue: JSON.stringify(users) }
      }));
      
      setIsEditingId(false);
      setEditingId("");
      setSaveError("");
    }
  };

  return (
    <div className="invitations-tab">
      <div className="invitations-tab__header">
        <h3 className="invitations-tab__title">Friend Invitations</h3>
        
        {currentUser && currentUser.id && (
          <div className="invitations-tab__user-info">
            <div className="invitations-tab__current-user">
              <span className="invitations-tab__user-avatar">{currentUser.avatar || '👤'}</span>
              <div className="invitations-tab__user-details">
                <span className="invitations-tab__user-name">{currentUser.name || currentUser.username || 'Unknown User'}</span>
                {!isEditingId ? (
                  <div className="invitations-tab__user-id-display">
                    <div className="invitations-tab__user-id" onClick={() => handleCopyUserId(currentUser.id)}>
                      <span className="invitations-tab__id-label">My ID:</span>
                      <span className="invitations-tab__id-value">{currentUser.id}</span>
                      <span className="invitations-tab__copy-status">
                        {copiedId === currentUser.id ? '✓ Copied!' : '📋 Click to copy'}
                      </span>
                    </div>
                    <button className="invitations-tab__edit-btn" onClick={handleEditId}>
                      ✏️ Edit
                    </button>
                  </div>
                ) : (
                  <div className="invitations-tab__user-id-edit">
                    <div className="invitations-tab__edit-input-group">
                      <span className="invitations-tab__id-label">My ID:</span>
                      <input
                        type="text"
                        value={editingId}
                        onChange={(e) => setEditingId(e.target.value)}
                        className="invitations-tab__id-input"
                        placeholder="Enter new ID"
                        maxLength={20}
                      />
                    </div>
                    {saveError && (
                      <div className="invitations-tab__error">{saveError}</div>
                    )}
                    <div className="invitations-tab__edit-actions">
                      <button className="invitations-tab__save-btn" onClick={handleSaveId}>
                        ✓ Save
                      </button>
                      <button className="invitations-tab__cancel-btn" onClick={handleCancelEdit}>
                        ✕ Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        
        <div className="invitations-tab__sections">
          <button
            className={`invitations-tab__section-btn ${
              activeSection === "received" ? "invitations-tab__section-btn--active" : ""
            }`}
            onClick={() => setActiveSection("received")}
          >
            Received
            {allReceivedInvitations.length > 0 && (
              <span className="invitations-tab__badge">{allReceivedInvitations.length}</span>
            )}
          </button>
          <button
            className={`invitations-tab__section-btn ${
              activeSection === "sent" ? "invitations-tab__section-btn--active" : ""
            }`}
            onClick={() => setActiveSection("sent")}
          >
            Sent
            {allSentInvitations.length > 0 && (
              <span className="invitations-tab__badge">{allSentInvitations.length}</span>
            )}
          </button>
          <button
            className={`invitations-tab__section-btn ${
              activeSection === "send" ? "invitations-tab__section-btn--active" : ""
            }`}
            onClick={() => setActiveSection("send")}
          >
            Send
          </button>
        </div>
      </div>

      <div className="invitations-tab__content">
        {activeSection === "received" && (
          <div className="invitations-tab__received">
            {allReceivedInvitations.length === 0 ? (
              <div className="invitations-tab__empty">
                <span className="invitations-tab__empty-icon">📨</span>
                <p className="invitations-tab__empty-text">No friend invitations received</p>
              </div>
            ) : (
              <div className="invitations-tab__list">
                {allReceivedInvitations.map((invitation) => (
                  <div key={invitation.id} className="invitations-tab__item">
                    <ListItem
                      user={{
                        ...invitation.from,
                        status: invitation.message,
                        secondaryText: `@${invitation.from.username} • ${formatTime(invitation.timestamp)}`
                      }}
                      variant="invitation"
                      onClick={null}
                      showSecondaryText={true}
                    />
                    <div className="invitations-tab__item-actions">
                      <button
                        className="invitations-tab__action-btn invitations-tab__action-btn--accept"
                        onClick={() => onAcceptInvitation?.(invitation)}
                      >
                        Accept
                      </button>
                      <button
                        className="invitations-tab__action-btn invitations-tab__action-btn--decline"
                        onClick={() => onDeclineInvitation?.(invitation)}
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "sent" && (
          <div className="invitations-tab__sent">
            {allSentInvitations.length === 0 ? (
              <div className="invitations-tab__empty">
                <span className="invitations-tab__empty-icon">📤</span>
                <p className="invitations-tab__empty-text">No friend invitations sent</p>
              </div>
            ) : (
              <div className="invitations-tab__list">
                {allSentInvitations.map((invitation) => (
                  <div key={invitation.id} className="invitations-tab__item">
                    <ListItem
                      user={{
                        ...invitation.to,
                        status: invitation.message,
                        secondaryText: `@${invitation.to.username} • ${formatTime(invitation.timestamp)} • Pending`
                      }}
                      variant="invitation"
                      onClick={null}
                      showSecondaryText={true}
                    />
                    <div className="invitations-tab__item-actions">
                      <button
                        className="invitations-tab__action-btn invitations-tab__action-btn--cancel"
                        onClick={() => onCancelInvitation?.(invitation)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === "send" && (
          <div className="invitations-tab__send">
            <div className="invitations-tab__send-form">
              <h4 className="invitations-tab__send-title">Send Friend Invitation</h4>
              <div className="invitations-tab__search-section">
                <div className="invitations-tab__search-input-group">
                  <input
                    type="text"
                    placeholder="Enter exact user ID..."
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                    onKeyPress={handleSearchKeyPress}
                    className="invitations-tab__search-input"
                  />
                  <button
                    className="invitations-tab__search-btn"
                    onClick={performSearch}
                    disabled={!searchQuery.trim()}
                  >
                    🔍 Search
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="invitations-tab__search-results">
                    <div className="invitations-tab__results-header">
                      Found {searchResults.length} contact{searchResults.length > 1 ? 's' : ''}:
                    </div>
                    {searchResults.map((user) => (
                      <div key={user.id} className="invitations-tab__search-item">
                        <ListItem
                          user={{
                            ...user,
                            status: `ID: ${user.id}${user.email ? ` • ${user.email}` : ''}`
                          }}
                          variant="invitation"
                          onClick={null}
                          showSecondaryText={true}
                        />
                        <button
                          className="invitations-tab__invite-btn"
                          onClick={() => handleSendInvitation(user)}
                        >
                          📨 Invite
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {isSearching && (
                  <div className="invitations-tab__searching">
                    <span className="invitations-tab__searching-icon">🔍</span>
                    <span>Searching...</span>
                  </div>
                )}
                
                {!isSearching && searchQuery.trim() && searchResults.length === 0 && (
                  <div className="invitations-tab__no-results">
                    <span className="invitations-tab__no-results-icon">🔍</span>
                    <span className="invitations-tab__no-results-text">No contacts found for "{searchQuery}"</span>
                  </div>
                )}
              </div>
              <p className="invitations-tab__send-hint">
                Enter the exact user ID, then press Enter or click Search to find the contact
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

InvitationsTab.propTypes = {
  receivedInvitations: PropTypes.array,
  sentInvitations: PropTypes.array,
  currentUser: PropTypes.object,
  onAcceptInvitation: PropTypes.func,
  onDeclineInvitation: PropTypes.func,
  onCancelInvitation: PropTypes.func,
  onSendInvitation: PropTypes.func,
  sendMessage: PropTypes.func,
};

export default InvitationsTab;