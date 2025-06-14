import PropTypes from "prop-types";
import "./TabNavigation.scss";

const TabNavigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: "friends", label: "Friends", icon: "👥" },
    { id: "rooms", label: "Rooms", icon: "💬" },
    { id: "invitations", label: "Invites", icon: "📨" }
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
          </button>
        ))}
      </div>
    </div>
  );
};

TabNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired,
};

export default TabNavigation;