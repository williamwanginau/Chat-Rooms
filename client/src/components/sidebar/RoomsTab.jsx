import { useState } from "react";
import PropTypes from "prop-types";
import ListItem from "../common/ListItem";
import Badge from "../ui/Badge";
import SearchInput from "../ui/SearchInput";
import {
  getRoomDisplayName,
  getRoomDisplayAvatar,
} from "../../utils/roomSettings";
import "./RoomsTab.scss";

const RoomsTab = ({
  onRoomSelect,
  currentRoomId,
  customRooms = [],
  selectedRoomId,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  // 幫助函數：從 lastMessage 物件中提取顯示文字
  const getLastMessageText = (lastMessage) => {
    if (!lastMessage) return "No messages";

    // 如果是字串，直接返回
    if (typeof lastMessage === "string") {
      return lastMessage;
    }

    // 如果是物件，提取 content
    if (typeof lastMessage === "object" && lastMessage.content) {
      return lastMessage.content;
    }

    return "No messages";
  };

  // 去重並過濾房間
  const uniqueRooms = customRooms.reduce((acc, room) => {
    // 檢查是否已存在相同 ID 的房間
    const existingRoom = acc.find((r) => r.id === room.id);
    if (!existingRoom) {
      acc.push(room);
    } else {
      // 如果存在，保留較新的房間
      const existingIndex = acc.findIndex((r) => r.id === room.id);
      const existingTime = new Date(existingRoom.createdAt || 0).getTime();
      const newTime = new Date(room.createdAt || 0).getTime();
      if (newTime > existingTime) {
        acc[existingIndex] = room;
      }
    }
    return acc;
  }, []);

  // Filter and sort all rooms together
  const filteredAndSortedRooms = uniqueRooms
    .filter((room) => {
      const searchLower = searchTerm.toLowerCase();
      const displayName = getRoomDisplayName(room, currentUser);
      const lastMessageText = getLastMessageText(room.lastMessage);

      return (
        displayName.toLowerCase().includes(searchLower) ||
        (room.description || "").toLowerCase().includes(searchLower) ||
        lastMessageText.toLowerCase().includes(searchLower) ||
        (room.lastMessageSender || "").toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      const timeA = a.lastMessageTime
        ? new Date(a.lastMessageTime).getTime()
        : 0;
      const timeB = b.lastMessageTime
        ? new Date(b.lastMessageTime).getTime()
        : 0;
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
            {filteredAndSortedRooms.map((room, index) => (
              <ListItem
                key={`${room.id}-${index}`}
                user={{
                  ...room,
                  avatar: getRoomDisplayAvatar(room, currentUser),
                  name:
                    getRoomDisplayName(room, currentUser) +
                    (room.type === "group" ? " 📌" : ""),
                  lastMessage: getLastMessageText(room.lastMessage),
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
        {filteredAndSortedRooms.length === 0 && uniqueRooms.length === 0 && (
          <div className="contact-list__empty">
            <div className="empty-icon">💬</div>
            <div className="empty-title">No Chat Rooms</div>
            <div className="empty-subtitle">
              Create a new room or join existing rooms
            </div>
          </div>
        )}

        {/* No search results */}
        {searchTerm &&
          filteredAndSortedRooms.length === 0 &&
          uniqueRooms.length > 0 && (
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
  onRoomSettingsUpdated: PropTypes.func,
};

export default RoomsTab;
