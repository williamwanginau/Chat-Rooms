import PropTypes from "prop-types";
import InvitationsTab from "./InvitationsTab";
import FriendsTab from "./FriendsTab";
import RoomsTab from "./RoomsTab";
import "./SidebarContainer.scss";

const SidebarContainer = ({
  activeSection,
  friends,
  groups = [],
  customRooms,
  receivedInvitations,
  sentInvitations,
  selectedRoomId,
  currentUser,
  onRoomSelect,
  onStartChat,
  onAcceptInvitation,
  onDeclineInvitation,
  onCancelInvitation,
  onSendInvitation,
  sendMessage,
}) => {
  const renderSectionContent = () => {
    switch (activeSection) {
      case "friends":
        return (
          <FriendsTab
            friends={friends}
            groups={groups}
            onStartChat={onStartChat}
            onStartGroupChat={onRoomSelect}
            currentUser={currentUser}
          />
        );

      case "rooms":
        return (
          <RoomsTab
            customRooms={customRooms}
            onRoomSelect={onRoomSelect}
            selectedRoomId={selectedRoomId}
            currentUser={currentUser}
          />
        );

      case "invitations":
        return (
          <InvitationsTab
            receivedInvitations={receivedInvitations}
            sentInvitations={sentInvitations}
            currentUser={currentUser}
            onAcceptInvitation={onAcceptInvitation}
            onDeclineInvitation={onDeclineInvitation}
            onCancelInvitation={onCancelInvitation}
            onSendInvitation={onSendInvitation}
            sendMessage={sendMessage}
          />
        );

      default:
        return (
          <div className="contact-list__empty">
            <div className="empty-icon">👥</div>
            <div className="empty-title">Select a category to start</div>
          </div>
        );
    }
  };

  return (
    <div className="sidebar-container">
      <div className="sidebar-container__content">{renderSectionContent()}</div>
    </div>
  );
};

SidebarContainer.propTypes = {
  activeSection: PropTypes.string.isRequired,
  friends: PropTypes.array.isRequired,
  groups: PropTypes.array,
  customRooms: PropTypes.array.isRequired,
  receivedInvitations: PropTypes.array.isRequired,
  sentInvitations: PropTypes.array.isRequired,
  selectedRoomId: PropTypes.string,
  unreadCounts: PropTypes.object.isRequired,
  currentUser: PropTypes.object.isRequired,
  onRoomSelect: PropTypes.func.isRequired,
  onStartChat: PropTypes.func.isRequired,
  onAcceptInvitation: PropTypes.func.isRequired,
  onDeclineInvitation: PropTypes.func.isRequired,
  onCancelInvitation: PropTypes.func.isRequired,
  onSendInvitation: PropTypes.func.isRequired,
  sendMessage: PropTypes.func.isRequired,
};

export default SidebarContainer;
