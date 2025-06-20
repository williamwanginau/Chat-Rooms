import { useMemo } from "react";

export const useUnreadCounts = (customRooms, receivedInvitations) => {
  return useMemo(() => {
    const roomsUnreadCount = customRooms.reduce(
      (total, room) => total + (room.unreadCount || 0),
      0
    );
    const invitationsUnreadCount = receivedInvitations.length;
    const totalUnreadCount = roomsUnreadCount + invitationsUnreadCount;

    return {
      rooms: roomsUnreadCount,
      invitations: invitationsUnreadCount,
      friends: 0,
      total: totalUnreadCount,
    };
  }, [customRooms, receivedInvitations]);
};
