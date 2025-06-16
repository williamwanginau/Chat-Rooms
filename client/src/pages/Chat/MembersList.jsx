import "./MembersList.scss";
import PropTypes from "prop-types";
import { getRandomColor } from "../../utils/uiUtils";



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
