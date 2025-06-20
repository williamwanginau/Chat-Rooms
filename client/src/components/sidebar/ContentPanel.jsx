import PropTypes from "prop-types";
import InvitationsTab from "./InvitationsTab";
import FriendsTab from "./FriendsTab";
import RoomsTab from "./RoomsTab";
import { useChatContext } from "../../contexts/ChatContext";
import "./ContentPanel.scss";

const ContentPanel = () => {
  const {
    activeSection,
    friends,
    customRooms,
    receivedInvitations,
    sentInvitations,
    selectedRoomId,
    unreadCounts,
    currentUser,
    handleRoomSelect,
    handleStartChatAndSetActive,
    handleAcceptInvitation,
    handleDeclineInvitation,
    handleCancelInvitation,
    handleSendInvitation,
    sendMessage,
    handleRoomSettingsUpdated,
  } = useChatContext();

  const renderSectionContent = () => {
    switch (activeSection) {
      case "friends":
        return (
          <FriendsTab
            friends={friends}
            groups={[]}
            onStartChat={handleStartChatAndSetActive}
            currentUser={currentUser}
          />
        );
      case "rooms":
        return (
          <RoomsTab
            customRooms={customRooms}
            selectedRoomId={selectedRoomId}
            onRoomSelect={handleRoomSelect}
            currentUser={currentUser}
            onRoomSettingsUpdated={handleRoomSettingsUpdated}
          />
        );
      case "invitations":
        return (
          <InvitationsTab
            receivedInvitations={receivedInvitations}
            sentInvitations={sentInvitations}
            onAcceptInvitation={handleAcceptInvitation}
            onDeclineInvitation={handleDeclineInvitation}
            onCancelInvitation={handleCancelInvitation}
            onSendInvitation={handleSendInvitation}
            currentUser={currentUser}
            sendMessage={sendMessage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="content-panel">
      <div className="content-panel__content">{renderSectionContent()}</div>
    </div>
  );
};

export default ContentPanel;
