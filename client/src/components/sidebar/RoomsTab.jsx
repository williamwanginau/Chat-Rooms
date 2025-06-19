import { useState } from "react";
import PropTypes from "prop-types";
import ListItem from "../common/ListItem";
import Badge from "../ui/Badge";
import SearchInput from "../ui/SearchInput";
import "./RoomsTab.scss";

const RoomsTab = ({
  onRoomSelect,
  currentRoomId,
  customRooms = [],
  selectedRoomId,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // Filter and sort all rooms together
  const filteredAndSortedRooms = customRooms
    .filter((room) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        (room.name || "").toLowerCase().includes(searchLower) ||
        (room.description || "").toLowerCase().includes(searchLower) ||
        (room.lastMessage || "").toLowerCase().includes(searchLower) ||
        (room.lastMessageSender || "").toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const timeA = a.lastMessageTime ? new Date(a.lastMessageTime).getTime() : 0;
      const timeB = b.lastMessageTime ? new Date(b.lastMessageTime).getTime() : 0;
      return timeB - timeA; // Newest first
    });

  return (
    <div className="friends-tab">
      {/* Search Header */}
      <div className="friends-tab__header">
        <SearchInput
          placeholder="Search rooms and messages"
          value={searchTerm}
          onChange={setSearchTerm}
          showClearButton={true}
        />
      </div>


      {/* Content */}
      <div className="friends-tab__content">
        {/* All Rooms List */}
        {filteredAndSortedRooms.length > 0 && (
          <div className="friends-tab__list">
            {filteredAndSortedRooms.map((room) => (
              <ListItem
                key={room.id}
                user={{
                  ...room,
                  avatar: room.avatar || "💬",
                  name: room.name + (room.type === 'group' ? " 📌" : ""),
                  lastMessage: room.lastMessage || "No messages",
                }}
                variant="room"
                onClick={() => onRoomSelect(room.id)}
                isActive={(selectedRoomId || currentRoomId) === room.id}
                timestamp={room.lastMessageTime}
                badge={
                  room.unreadCount > 0 && (
                    <Badge
                      count={room.unreadCount}
                      maxCount={999}
                      variant="default"
                      size="medium"
                      customColor="#00b046"
                      className="badge--inline"
                    />
                  )
                }
                showSecondaryText={true}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {filteredAndSortedRooms.length === 0 && customRooms.length === 0 && (
          <div className="contact-list__empty">
            <div className="empty-icon">💬</div>
            <div className="empty-title">No Chat Rooms</div>
            <div className="empty-subtitle">
              Create a new room or join existing rooms
            </div>
          </div>
        )}

        {/* No search results */}
        {searchTerm && filteredAndSortedRooms.length === 0 && customRooms.length > 0 && (
          <div className="contact-list__empty">
            <div className="empty-icon">🔍</div>
            <div className="empty-title">No Results Found</div>
            <div className="empty-subtitle">
              Try searching for different room names or messages
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

RoomsTab.propTypes = {
  onRoomSelect: PropTypes.func.isRequired,
  currentRoomId: PropTypes.string,
  customRooms: PropTypes.array,
  selectedRoomId: PropTypes.string,
  currentUser: PropTypes.object,
};

export default RoomsTab;