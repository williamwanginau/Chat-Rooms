import PropTypes from "prop-types";
import "./TabNavigation.scss";

const TabNavigation = ({ activeTab, onTabChange, unreadCounts = {} }) => {
  const tabs = [
    { id: "friends", label: "好友", icon: "👥" },
    { id: "rooms", label: "聊天", icon: "💬" },
    { id: "invitations", label: "邀請", icon: "📨" }
  ];

  return (
    <div className="tab-navigation">
      <div className="tab-navigation__tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-navigation__tab ${
              activeTab === tab.id ? "tab-navigation__tab--active" : ""
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="tab-navigation__tab-icon">{tab.icon}</span>
            <span className="tab-navigation__tab-label">{tab.label}</span>
            {unreadCounts[tab.id] > 0 && (
              <span className="tab-navigation__badge">
                {unreadCounts[tab.id] > 99 ? '99+' : unreadCounts[tab.id]}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

TabNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
  unreadCounts: PropTypes.object,
};

export default TabNavigation;