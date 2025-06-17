import PropTypes from "prop-types";
import Badge from "./Badge";
import InvitationsTab from "./InvitationsTab";
import FriendsTab from "./FriendsTab";
import { formatTimestamp, getRandomColor } from "../utils/uiUtils";
import "./ContactList.scss";

const ContactList = ({
  activeSection,
  friends,
  groups = [],
  customRooms,
  receivedInvitations,
  sentInvitations,
  selectedRoomId,
  unreadCounts,
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
        if (customRooms.length === 0) {
          return (
            <div className="contact-list__empty">
              <div className="empty-icon">💬</div>
              <div className="empty-title">No Chat Rooms</div>
              <div className="empty-subtitle">
                Create a new room or join existing rooms
              </div>
            </div>
          );
        }
        return customRooms.map((room) => (
          <div
            key={room.id}
            className={`contact-item ${
              selectedRoomId === room.id ? "active" : ""
            }`}
            onClick={() => onRoomSelect(room.id)}
          >
            <div
              className="contact-avatar"
              style={{ backgroundColor: getRandomColor(room.id) }}
            >
              {room.avatar || "💬"}
            </div>

            <div className="contact-info">
              <div className="contact-name">
                {room.name}
                {room.participants?.length > 2 && " 📌"}
              </div>
              <div className="contact-message">
                {room.lastMessage || "No messages"}
              </div>
            </div>

            <div className="message-info">
              <div className="time">
                {formatTimestamp(room.lastMessageTime)}
              </div>
              <Badge
                count={room.unreadCount}
                maxCount={99}
                variant="default"
                size="medium"
                customColor="#00b046"
                className="badge--inline"
              />
            </div>
          </div>
        ));

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

  const getSectionTitle = () => {
    switch (activeSection) {
      case "friends":
        return "Friends";
      case "rooms":
        return "Chat";
      case "invitations":
        return "Invitations";
      default:
        return "";
    }
  };

  const getSearchPlaceholder = () => {
    switch (activeSection) {
      case "friends":
        return "Search friends";
      case "rooms":
        return "Search chats and messages";
      case "invitations":
        return "Search invitations";
      default:
        return "Search";
    }
  };

  return (
    <div className="contact-list">
      {/* <div className="contact-list__header">
        <h3>{getSectionTitle()}</h3>
        <div className="header-actions">
          {unreadCounts.total > 0 && `(${unreadCounts.total})`}
        </div>
      </div> */}

      {/* <div className="contact-list__search">
          <input
            type="text"
            placeholder={getSearchPlaceholder()}
          />
        </div> */}

      <div className="contact-list__content">{renderSectionContent()}</div>
    </div>
  );
};

ContactList.propTypes = {
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

export default ContactList;
