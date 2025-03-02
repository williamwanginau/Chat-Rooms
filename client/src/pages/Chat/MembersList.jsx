import "./MembersList.scss";
import PropTypes from "prop-types";

const getRandomColor = (userId) => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F06292",
    "#7986CB",
    "#9575CD",
    "#64B5F6",
    "#4DB6AC",
    "#81C784",
    "#FFD54F",
  ];

  const hash = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

const StatusIndicator = ({ isOnline }) => (
  <span
    className={`members-list__status-indicator ${
      isOnline
        ? "members-list__status-indicator--online"
        : "members-list__status-indicator--offline"
    }`}
  ></span>
);

StatusIndicator.propTypes = {
  isOnline: PropTypes.bool,
};

const UserAvatar = ({ user }) => {
  const bgColor = getRandomColor(user.id);
  const initials = user.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="members-list__avatar" style={{ backgroundColor: bgColor }}>
      {initials}
    </div>
  );
};

UserAvatar.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
  }).isRequired,
};

const MembersList = ({ roomUsers = [], currentUserId }) => {
  const totalMembers = roomUsers.length;

  return (
    <div className="members-list">
      <div className="members-list__header">
        <h3 className="members-list__title">All Members ({totalMembers})</h3>
      </div>

      <div className="members-list__content">
        {roomUsers.map((member) => (
          <div key={member.id} className="members-list__item">
            <UserAvatar user={member} />
            <div className="members-list__details">
              <span className="members-list__name">
                {member.username}
                {member.id === currentUserId && (
                  <span className="members-list__current-indicator"> (Me)</span>
                )}
              </span>
            </div>
            <StatusIndicator isOnline={true} />
          </div>
        ))}
      </div>
    </div>
  );
};

MembersList.propTypes = {
  roomUsers: PropTypes.array,
  currentUserId: PropTypes.string,
};

export default MembersList;
