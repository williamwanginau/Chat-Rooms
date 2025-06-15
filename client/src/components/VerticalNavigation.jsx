import { useState } from "react";
import PropTypes from "prop-types";
import "./VerticalNavigation.scss";

const VerticalNavigation = ({ currentUser, activeSection, onSectionChange, unreadCounts = {} }) => {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  // 三個主要功能：好友、聊天、加入好友
  const navigationItems = [
    { id: "friends", icon: "person", label: "好友" },
    { id: "rooms", icon: "chat", label: "聊天" },
    { id: "addFriend", icon: "person_add", label: "加入好友" }
  ];

  const handleProfileClick = () => {
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const getUserAvatar = () => {
    // 使用當前用戶的名字首字母作為頭像
    if (currentUser?.name) {
      return currentUser.name.charAt(0).toUpperCase();
    }
    if (currentUser?.username) {
      return currentUser.username.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getTotalUnreadCount = () => {
    return Object.values(unreadCounts).reduce((total, count) => total + (count || 0), 0);
  };

  return (
    <div className="vertical-nav">
      {/* User Profile Avatar at top */}
      <div className="vertical-nav__profile">
        <div 
          className="vertical-nav__profile-avatar"
          onClick={handleProfileClick}
          title={currentUser?.name || currentUser?.username || "用戶"}
        >
          <div className="vertical-nav__profile-image">
            {getUserAvatar()}
          </div>
          {getTotalUnreadCount() > 0 && (
            <div className="vertical-nav__profile-badge">
              {getTotalUnreadCount() > 999 ? "999+" : getTotalUnreadCount()}
            </div>
          )}
        </div>
      </div>

      {/* All Navigation Icons - layout2 style */}
      <nav className="vertical-nav__main">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            className={`vertical-nav__item ${
              activeSection === item.id ? "vertical-nav__item--active" : ""
            }`}
            onClick={() => onSectionChange(item.id)}
            title={item.label}
          >
            <span className="material-icons vertical-nav__item-icon">{item.icon}</span>
            {unreadCounts[item.id] > 0 && (
              <div className="vertical-nav__item-badge">
                {unreadCounts[item.id] > 99 ? "99+" : unreadCounts[item.id]}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Profile Menu */}
      {isProfileMenuOpen && (
        <div className="vertical-nav__profile-menu">
          <div className="vertical-nav__profile-info">
            <h4>{currentUser?.name || currentUser?.username || "用戶"}</h4>
            <p>{currentUser?.email || ""}</p>
          </div>
        </div>
      )}
    </div>
  );
};

VerticalNavigation.propTypes = {
  currentUser: PropTypes.object,
  activeSection: PropTypes.string.isRequired,
  onSectionChange: PropTypes.func.isRequired,
  unreadCounts: PropTypes.object,
};

export default VerticalNavigation;