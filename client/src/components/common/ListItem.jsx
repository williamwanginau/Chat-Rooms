import PropTypes from "prop-types";
import { getRandomColor, formatTimestamp } from "../../utils/ui";
import "./ListItem.scss";

const ListItem = ({
  user,
  onClick,
  variant = "default",
  size = "default",
  showSecondaryText = true,
  isActive = false,
  badge = null,
  customAvatar = null,
  className = "",
  timestamp = null,
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick(user);
    }
  };

  const renderAvatar = () => {
    if (customAvatar) {
      return customAvatar;
    }

    const avatarContent =
      user.avatar &&
      user.avatar !== "/default-avatar.png" &&
      user.avatar !== "default-avatar.png" ? (
        user.avatar.startsWith("http") ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="list-item__avatar-img"
          />
        ) : (
          user.avatar
        )
      ) : (
        <span className="material-icons">
          {variant === "room" ? "group" : "person"}
        </span>
      );

    return (
      <div
        className="list-item__avatar-circle"
        style={{
          backgroundColor: user.avatar?.startsWith("http")
            ? "transparent"
            : getRandomColor(user.id),
        }}
      >
        {avatarContent}
      </div>
    );
  };

  const renderSecondaryText = () => {
    if (!showSecondaryText) return null;

    switch (variant) {
      case "friend":
        return user.status || "Click to start chat";
      case "room":
        return user.lastMessage || "No messages";
      case "member":
        return user.isCurrentUser ? "Me" : user.username;
      case "invitation":
        return user.username || user.email;
      default:
        return user.status || user.lastMessage || "";
    }
  };

  return (
    <div
      className={`list-item list-item--${variant} list-item--${size} ${
        isActive ? "list-item--active" : ""
      } ${className}`}
      onClick={handleClick}
    >
      <div className="list-item__avatar">{renderAvatar()}</div>

      <div className="list-item__info">
        <div className="list-item__name">
          {user.name || user.username || user.displayName || "Unknown"}
        </div>
        <div className="list-item__secondary">{renderSecondaryText()}</div>
      </div>

      <div className="list-item__meta">
        {timestamp && variant === "room" && (
          <div className="list-item__time">{formatTimestamp(timestamp)}</div>
        )}
        {badge && <div className="list-item__badge">{badge}</div>}
      </div>
    </div>
  );
};

ListItem.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    username: PropTypes.string,
    displayName: PropTypes.string,
    avatar: PropTypes.string,
    status: PropTypes.string,
    lastMessage: PropTypes.string,
    isCurrentUser: PropTypes.bool,
    email: PropTypes.string,
  }).isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf([
    "default",
    "friend",
    "room",
    "member",
    "invitation",
  ]),
  size: PropTypes.oneOf(["small", "default", "large"]),
  showSecondaryText: PropTypes.bool,
  isActive: PropTypes.bool,
  badge: PropTypes.node,
  customAvatar: PropTypes.node,
  className: PropTypes.string,
  timestamp: PropTypes.string,
};

export default ListItem;
