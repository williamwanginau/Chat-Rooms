import { useState } from "react";
import PropTypes from "prop-types";
import "./FriendsTab.scss";

const FriendsTab = ({ friends = [], onStartChat, onRemoveFriend }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const allFriends = friends;

  const filteredFriends = allFriends.filter(friend =>
    (friend.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (friend.username || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusText = (status, lastSeen) => {
    if (status === "online") return "線上";
    if (status === "away") return "離開";
    
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes}分鐘前`;
    } else if (diffMinutes < 1440) {
      return `${Math.floor(diffMinutes / 60)}小時前`;
    } else {
      return `${Math.floor(diffMinutes / 1440)}天前`;
    }
  };

  return (
    <div className="friends-tab">
      {/* Search Header */}
      <div className="friends-tab__header">
        <div className="friends-tab__search">
          <span className="material-icons friends-tab__search-icon">search</span>
          <input
            type="text"
            placeholder="以姓名搜尋"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="friends-tab__search-input"
          />
        </div>
      </div>

      {/* Content */}
      <div className="friends-tab__content">
        {/* Friends Section */}
        <div className="friends-tab__section">
          <div className="friends-tab__section-header">
            <span className="friends-tab__section-title">好友 ({allFriends.length})</span>
          </div>
          
          {filteredFriends.length === 0 ? (
            <div className="friends-tab__empty">
              <span className="friends-tab__empty-icon">👥</span>
              <p className="friends-tab__empty-text">
                {searchTerm ? "找不到好友" : "還沒有好友"}
              </p>
            </div>
          ) : (
            <div className="friends-tab__list">
              {filteredFriends.map((friend) => (
                <div key={friend.id} className="friends-tab__item" onClick={() => onStartChat?.(friend)}>
                  <div className="friends-tab__item-avatar">
                    <div className="friends-tab__avatar">
                      {friend.avatar && friend.avatar !== "/default-avatar.png" && friend.avatar !== "default-avatar.png" 
                        ? friend.avatar 
                        : (
                          <span className="material-icons">person</span>
                        )}
                    </div>
                    {friend.status === 'online' && (
                      <div className="friends-tab__status friends-tab__status--online"></div>
                    )}
                  </div>
                  
                  <div className="friends-tab__item-info">
                    <h4 className="friends-tab__item-name">{friend.name || friend.username || 'Unknown'}</h4>
                    <p className="friends-tab__item-status">
                      {getStatusText(friend.status, friend.lastSeen)}
                    </p>
                  </div>

                  <div className="friends-tab__item-actions">
                    <button
                      className="friends-tab__action-btn friends-tab__action-btn--more"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle more options
                      }}
                      title="更多選項"
                    >
                      <span className="material-icons">more_vert</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
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