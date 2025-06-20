import { useState, useEffect, useCallback } from "react";
import { getUserFriendsInfo } from "../utils/friendship";
import MESSAGE_TYPES from "../../../shared/messageTypes.json";

export const useFriends = (currentUser, sendMessage) => {
  const [friends, setFriends] = useState([]);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);

  // 載入好友和邀請數據
  useEffect(() => {
    if (!currentUser) return; // 如果沒有 currentUser，直接返回

    const loadInvitations = () => {
      const savedReceived = localStorage.getItem("receivedInvitations");
      const savedSent = localStorage.getItem("sentInvitations");

      if (savedReceived) {
        try {
          const parsed = JSON.parse(savedReceived);
          setReceivedInvitations(parsed);
        } catch (error) {
          console.error("Failed to parse received invitations:", error);
        }
      }

      if (savedSent) {
        try {
          const parsed = JSON.parse(savedSent);
          setSentInvitations(parsed);
        } catch (error) {
          console.error("Failed to parse sent invitations:", error);
        }
      }
    };

    const loadFriends = () => {
      const userFriends = getUserFriendsInfo(currentUser.id);
      setFriends(
        userFriends.map((friend) => ({
          id: friend.id,
          name: friend.name || friend.username || "Unknown User",
          username: friend.username || "unknown",
          avatar: friend.avatar || "/default-avatar.png",
        }))
      );
    };

    loadInvitations();
    loadFriends();
  }, [currentUser?.id]); // 只依賴 currentUser.id

  // 記憶化更新函數
  const updateReceivedInvitations = useCallback((updater) => {
    setReceivedInvitations((prev) => {
      const updated = updater(prev);
      localStorage.setItem("receivedInvitations", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateSentInvitations = useCallback((updater) => {
    setSentInvitations((prev) => {
      const updated = updater(prev);
      localStorage.setItem("sentInvitations", JSON.stringify(updated));
      return updated;
    });
  }, []);

  // 事件處理
  useEffect(() => {
    const handlers = {
      friendInvitationReceived: (event) => {
        const { invitation } = event.detail;
        updateReceivedInvitations((prev) => [...prev, invitation]);
      },

      friendInvitationSent: (event) => {
        const { success, error, invitation } = event.detail;
        if (success && invitation) {
          updateSentInvitations((prev) => [...prev, invitation]);
        } else {
          console.error("Failed to send friend invitation:", error);
        }
      },

      friendInvitationAccepted: (event) => {
        const { invitationId } = event.detail;
        updateReceivedInvitations((prev) =>
          prev.filter((inv) => inv.id !== invitationId)
        );
        updateSentInvitations((prev) =>
          prev.filter((inv) => inv.id !== invitationId)
        );
      },

      friendInvitationDeclined: (event) => {
        const { invitationId } = event.detail;
        updateSentInvitations((prev) =>
          prev.filter((inv) => inv.id !== invitationId)
        );
      },

      friendInvitationCancelled: (event) => {
        const { invitationId } = event.detail;
        updateReceivedInvitations((prev) =>
          prev.filter((inv) => inv.id !== invitationId)
        );
      },

      friendAdded: (event) => {
        const { newFriend } = event.detail;
        setFriends((prev) => [
          ...prev,
          {
            id: newFriend.id,
            name: newFriend.name || newFriend.username,
            username: newFriend.username,
            email: newFriend.email || `${newFriend.username}@example.com`,
            avatar: newFriend.avatar || "/default-avatar.png",
          },
        ]);
      },

      friendsListSync: (event) => {
        const { friendIds } = event.detail;
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const syncedFriends = friendIds.map((friendId) => {
          const friendUser = users.find((user) => user.id === friendId);
          return friendUser
            ? {
                id: friendUser.id,
                name: friendUser.name,
                username: friendUser.username,
                email: friendUser.email,
                avatar: friendUser.avatar || "/default-avatar.png",
              }
            : {
                id: friendId,
                name: "Unknown User",
                username: "unknown",
                avatar: "/default-avatar.png",
              };
        });
        setFriends(syncedFriends);
      },
    };

    // 註冊所有事件監聽器
    Object.entries(handlers).forEach(([eventName, handler]) => {
      window.addEventListener(eventName, handler);
    });

    // 清理事件監聽器
    return () => {
      Object.entries(handlers).forEach(([eventName, handler]) => {
        window.removeEventListener(eventName, handler);
      });
    };
  }, [updateReceivedInvitations, updateSentInvitations]); // 只依賴更新函數

  // 記憶化操作函數
  const handleAcceptInvitation = useCallback(
    (invitation) => {
      sendMessage({
        type: MESSAGE_TYPES.FRIEND_INVITATION_ACCEPTED,
        invitationId: invitation.id,
        fromUserId: invitation.fromUserId,
      });
    },
    [sendMessage]
  );

  const handleDeclineInvitation = useCallback(
    (invitation) => {
      sendMessage({
        type: MESSAGE_TYPES.FRIEND_INVITATION_DECLINED,
        invitationId: invitation.id,
        fromUserId: invitation.fromUserId,
      });
    },
    [sendMessage]
  );

  const handleCancelInvitation = useCallback(
    (invitation) => {
      sendMessage({
        type: MESSAGE_TYPES.FRIEND_INVITATION_CANCELLED,
        invitationId: invitation.id,
        toUserId: invitation.toUserId,
      });
    },
    [sendMessage]
  );

  const handleSendInvitation = useCallback(
    (userId, message = "") => {
      sendMessage({
        type: MESSAGE_TYPES.FRIEND_INVITATION_SENT,
        toUserId: userId,
        invitationData: { message },
      });
    },
    [sendMessage]
  );

  return {
    friends,
    receivedInvitations,
    sentInvitations,
    setFriends,
    setReceivedInvitations,
    setSentInvitations,
    handleAcceptInvitation,
    handleDeclineInvitation,
    handleCancelInvitation,
    handleSendInvitation,
  };
};
