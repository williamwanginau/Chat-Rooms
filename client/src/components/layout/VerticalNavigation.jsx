import PropTypes from "prop-types";
import Badge from "../ui/Badge";
import "./VerticalNavigation.scss";

const VerticalNavigation = ({
  activeSection,
  onSectionChange,
  unreadCounts = {},
}) => {
  const navigationItems = [
    { id: "friends", icon: "person", label: "Friends" },
    { id: "rooms", icon: "chat", label: "Chat" },
    { id: "invitations", icon: "person_add", label: "Add Friend" },
  ];

  return (
    <div className="vertical-nav">
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
            <span
              className={`${
                item.id === "friends"
                  ? "material-symbols-outlined"
                  : "material-icons"
              } vertical-nav__item-icon`}
            >
              {item.icon}
            </span>
            <Badge 
              count={unreadCounts[item.id] || 0} 
              maxCount={99}
              variant="default"
              size="medium"
            />
          </button>
        ))}
      </nav>
    </div>
  );
};

VerticalNavigation.propTypes = {
  activeSection: PropTypes.string.isRequired,
  onSectionChange: PropTypes.func.isRequired,
  unreadCounts: PropTypes.object,
};

export default VerticalNavigation;
