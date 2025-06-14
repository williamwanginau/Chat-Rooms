import { useState } from "react";
import PropTypes from "prop-types";
import "./FriendsTab.scss";

const FriendsTab = ({ friends = [], onStartChat, onRemoveFriend }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const allFriends = friends;

  const filteredFriends = allFriends.filter(friend =>
    friend.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusText = (status, lastSeen) => {
    if (status === "online") return "Online";
    if (status === "away") return "Away";
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffMinutes / 1440)}d ago`;
    }
  };

  return (
    <div className="friends-tab">
      <div className="friends-tab__header">
        <h3 className="friends-tab__title">Friends List</h3>
        <div className="friends-tab__search">
          <input
            type="text"
            placeholder="Search friends..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="friends-tab__search-input"
          />
        </div>
      </div>

      <div className="friends-tab__content">
        {filteredFriends.length === 0 ? (
          <div className="friends-tab__empty">
            <span className="friends-tab__empty-icon">👥</span>
            <p className="friends-tab__empty-text">
              {searchTerm ? "No friends found" : "No friends yet"}
            </p>
          </div>
        ) : (
          <div className="friends-tab__list">
            {filteredFriends.map((friend) => (
              <div key={friend.id} className="friends-tab__item">
                <div className="friends-tab__item-avatar">
                  <span className="friends-tab__avatar">{friend.avatar}</span>
                  <span 
                    className={`friends-tab__status friends-tab__status--${friend.status}`}
                  ></span>
                </div>
                
                <div className="friends-tab__item-info">
                  <h4 className="friends-tab__item-name">{friend.name}</h4>
                  <p className="friends-tab__item-username">@{friend.username}</p>
                  <p className="friends-tab__item-status">
                    {getStatusText(friend.status, friend.lastSeen)}
                  </p>
                </div>
                
                <div className="friends-tab__item-actions">
                  <button
                    className="friends-tab__action-btn friends-tab__action-btn--chat"
                    onClick={() => onStartChat?.(friend)}
                    title="Start Chat"
                  >
                    💬
                  </button>
                  <button
                    className="friends-tab__action-btn friends-tab__action-btn--remove"
                    onClick={() => onRemoveFriend?.(friend)}
                    title="Remove Friend"
                  >
                    ❌
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

FriendsTab.propTypes = {
  friends: PropTypes.array,
  onStartChat: PropTypes.func,
  onRemoveFriend: PropTypes.func,
};

export default FriendsTab;