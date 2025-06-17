import { useState } from "react";
import PropTypes from "prop-types";
import ContactItem from "./ContactItem";
import SearchInput from "./SearchInput";
import "./FriendsTab.scss";

const FriendsTab = ({
  friends = [],
  groups = [],
  onStartChat,
  onStartGroupChat,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [friendsExpanded, setFriendsExpanded] = useState(true);
  const [groupsExpanded, setGroupsExpanded] = useState(true);

  const allFriends = friends;
  const allGroups = groups;

  const filteredFriends = allFriends.filter(
    (friend) =>
      (friend.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (friend.username || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredGroups = allGroups.filter(
    (group) =>
      (group.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (group.description || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="friends-tab">
      {/* Search Header */}
      <div className="friends-tab__header">
        <SearchInput
          placeholder="Search friends and groups"
          value={searchTerm}
          onChange={setSearchTerm}
          showClearButton={true}
        />
      </div>

      {/* User Info - Hidden when searching */}
      {currentUser && !searchTerm && (
        <ContactItem
          user={currentUser}
          size="default"
          showSecondaryText={true}
          onClick={null}
        />
      )}

      {/* Content */}
      <div className="friends-tab__content">
        {/* Friends Section */}
        {filteredFriends.length > 0 && (
          <div className="friends-tab__section">
            <div
              className="friends-tab__section-header"
              onClick={() => setFriendsExpanded(!friendsExpanded)}
            >
              <span className="friends-tab__section-title">
                Friends ({filteredFriends.length})
              </span>
              <span className="material-icons friends-tab__section-arrow">
                {friendsExpanded ? "expand_less" : "expand_more"}
              </span>
            </div>
            {friendsExpanded && (
              <div className="friends-tab__list">
                {filteredFriends.map((friend) => (
                  <ContactItem
                    key={friend.id}
                    user={friend}
                    variant="friend"
                    onClick={onStartChat}
                    showSecondaryText={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Groups Section - Only show if there are groups and filtered results */}
        {allGroups.length > 0 && filteredGroups.length > 0 && (
          <div className="friends-tab__section">
            <div
              className="friends-tab__section-header"
              onClick={() => setGroupsExpanded(!groupsExpanded)}
            >
              <span className="friends-tab__section-title">
                Groups ({filteredGroups.length})
              </span>
              <span className="material-icons friends-tab__section-arrow">
                {groupsExpanded ? "expand_less" : "expand_more"}
              </span>
            </div>

            {groupsExpanded && (
              <div className="friends-tab__list">
                {filteredGroups.map((group) => (
                  <ContactItem
                    key={group.id}
                    user={group}
                    variant="room"
                    onClick={onStartGroupChat}
                    showSecondaryText={true}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

FriendsTab.propTypes = {
  friends: PropTypes.array,
  groups: PropTypes.array,
  onStartChat: PropTypes.func,
  onStartGroupChat: PropTypes.func,
  currentUser: PropTypes.object,
};

export default FriendsTab;
