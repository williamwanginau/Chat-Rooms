import { useState, useEffect, useRef } from "react";
import MESSAGE_TYPES from "../../../shared/messageTypes.json";

const useWebSocket = (currentUser, initialRoomId = null) => {
  const [messages, setMessages] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const wsRef = useRef(null);
  const [isUserInfoSent, setIsUserInfoSent] = useState(false);

  const buildRoomChangeMessage = (roomId, user) => {
    return {
      type: MESSAGE_TYPES.ROOM_CHANGE,
      room: {
        id: roomId,
      },
      user: {
        id: user.id,
        name: user.username,
      },
      clientTimestamp: new Date().toISOString(),
    };
  };

  const sendMessage = (messageData) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageData));
    }
  };

  const joinRoom = (roomId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const roomChangeMessage = buildRoomChangeMessage(roomId, currentUser);
      wsRef.current.send(JSON.stringify(roomChangeMessage));
      
      // Clear typing users when changing rooms
      setTypingUsers([]);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    
    // Avoid duplicate connections
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      return;
    }

    const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected successfully");

      wsRef.current.send(
        JSON.stringify({
          type: MESSAGE_TYPES.USER_INFO,
          user: currentUser,
        })
      );
      
      setIsUserInfoSent(true);
      
      // Join initial room if provided
      if (initialRoomId) {
        setTimeout(() => {
          const roomChangeMessage = buildRoomChangeMessage(initialRoomId, currentUser);
          wsRef.current.send(JSON.stringify(roomChangeMessage));
        }, 100); // Small delay to ensure userInfo is processed
      }
    };

    wsRef.current.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      console.log("Received message:", messageData);

      switch (messageData.type) {
        case MESSAGE_TYPES.MESSAGE:
          setMessages((prevMessages) => [...prevMessages, messageData]);
          break;
        case MESSAGE_TYPES.ROOM_USERS:
          setRoomUsers(messageData.users);
          break;
        case MESSAGE_TYPES.USER_JOINED:
          setRoomUsers((prevUsers) => [...prevUsers, messageData.user]);
          // Add system message for user joining
          const joinUserName = messageData.user.name || messageData.user.username || 'Unknown User';
          setMessages((prevMessages) => [...prevMessages, {
            messageId: `system-join-${Date.now()}`,
            message: `${joinUserName} joined the room`,
            sender: { id: 'system', name: 'System' },
            clientTimestamp: new Date().toISOString(),
            isSystemMessage: true
          }]);
          break;
        case MESSAGE_TYPES.USER_LEFT:
          setRoomUsers((prevUsers) =>
            prevUsers.filter((user) => user.id !== messageData.user.id)
          );
          // Add system message for user leaving
          const leaveUserName = messageData.user.name || messageData.user.username || 'Unknown User';
          setMessages((prevMessages) => [...prevMessages, {
            messageId: `system-leave-${Date.now()}`,
            message: `${leaveUserName} left the room`,
            sender: { id: 'system', name: 'System' },
            clientTimestamp: new Date().toISOString(),
            isSystemMessage: true
          }]);
          break;
        case MESSAGE_TYPES.TYPING_START:
          setTypingUsers((prevTyping) => {
            const userName = messageData.user.name || messageData.user.username;
            if (!prevTyping.includes(userName)) {
              return [...prevTyping, userName];
            }
            return prevTyping;
          });
          break;
        case MESSAGE_TYPES.TYPING_STOP:
          setTypingUsers((prevTyping) => {
            const userName = messageData.user.name || messageData.user.username;
            return prevTyping.filter((name) => name !== userName);
          });
          break;
        case MESSAGE_TYPES.USER_INFO_UPDATED:
          console.log("User info updated:", messageData.oldUser, "->", messageData.newUser);
          // Update room users using internalId to find the user, then update with new info
          setRoomUsers((prevUsers) => 
            prevUsers.map(user => 
              user.internalId === messageData.oldUser?.internalId 
                ? { ...user, ...messageData.newUser }
                : user
            )
          );
          
          // Also update localStorage users array to keep it in sync
          const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
          const updatedUsers = existingUsers.map(user => 
            user.internalId === messageData.oldUser?.internalId
              ? { ...user, ...messageData.newUser }
              : user
          );
          localStorage.setItem('users', JSON.stringify(updatedUsers));
          
          // Trigger custom event for same-tab localStorage update
          window.dispatchEvent(new CustomEvent('localStorageUpdate', {
            detail: { key: 'users', newValue: JSON.stringify(updatedUsers) }
          }));
          break;
        case MESSAGE_TYPES.USER_INFO_UPDATE_ERROR:
          console.error("User info update error:", messageData.error);
          // Trigger custom event to notify components about the error
          window.dispatchEvent(new CustomEvent('userInfoUpdateError', {
            detail: { error: messageData.error }
          }));
          break;
        case MESSAGE_TYPES.USERS_DATA_SYNC:
          console.log("Received users data sync:", messageData.users);
          // Update localStorage with the synced users data
          if (messageData.users) {
            localStorage.setItem('users', JSON.stringify(messageData.users));
            
            // Trigger custom event for same-tab localStorage update
            window.dispatchEvent(new CustomEvent('localStorageUpdate', {
              detail: { key: 'users', newValue: JSON.stringify(messageData.users) }
            }));
            
            console.log("🔄 Synced users data to localStorage");
          }
          break;
        case MESSAGE_TYPES.FRIEND_INVITATION_RECEIVED:
          console.log("Received friend invitation:", messageData.invitation);
          // Store received invitation in localStorage
          const receivedInvitations = JSON.parse(localStorage.getItem('receivedInvitations') || '[]');
          receivedInvitations.push(messageData.invitation);
          localStorage.setItem('receivedInvitations', JSON.stringify(receivedInvitations));
          // Trigger custom event for friend invitation received
          window.dispatchEvent(new CustomEvent('friendInvitationReceived', {
            detail: { invitation: messageData.invitation }
          }));
          break;
        case MESSAGE_TYPES.FRIEND_INVITATION_SENT:
          console.log("Friend invitation sent response:", messageData);
          // Store sent invitation if successful
          if (messageData.success && messageData.invitation) {
            const sentInvitations = JSON.parse(localStorage.getItem('sentInvitations') || '[]');
            sentInvitations.push(messageData.invitation);
            localStorage.setItem('sentInvitations', JSON.stringify(sentInvitations));
          }
          // Trigger custom event for friend invitation sent confirmation
          window.dispatchEvent(new CustomEvent('friendInvitationSent', {
            detail: { success: messageData.success, error: messageData.error, toUserId: messageData.toUserId, invitation: messageData.invitation }
          }));
          break;
        case MESSAGE_TYPES.FRIEND_INVITATION_ACCEPTED:
          console.log("Friend invitation accepted:", messageData);
          // Remove invitation from sent invitations if it exists
          const sentInvitations = JSON.parse(localStorage.getItem('sentInvitations') || '[]');
          const updatedSentInvitations = sentInvitations.filter(inv => inv.id !== messageData.invitationId);
          localStorage.setItem('sentInvitations', JSON.stringify(updatedSentInvitations));
          // Trigger custom event for friend invitation accepted
          window.dispatchEvent(new CustomEvent('friendInvitationAccepted', {
            detail: { invitationId: messageData.invitationId, acceptedBy: messageData.acceptedBy }
          }));
          break;
        case MESSAGE_TYPES.FRIEND_INVITATION_DECLINED:
          console.log("Friend invitation declined:", messageData);
          // Remove invitation from sent invitations if it exists
          const sentInvitations2 = JSON.parse(localStorage.getItem('sentInvitations') || '[]');
          const updatedSentInvitations2 = sentInvitations2.filter(inv => inv.id !== messageData.invitationId);
          localStorage.setItem('sentInvitations', JSON.stringify(updatedSentInvitations2));
          // Trigger custom event for friend invitation declined
          window.dispatchEvent(new CustomEvent('friendInvitationDeclined', {
            detail: { invitationId: messageData.invitationId, declinedBy: messageData.declinedBy }
          }));
          break;
        case MESSAGE_TYPES.FRIEND_INVITATION_CANCELLED:
          console.log("Friend invitation cancelled:", messageData);
          // Remove invitation from received invitations if it exists
          const receivedInvitations2 = JSON.parse(localStorage.getItem('receivedInvitations') || '[]');
          const updatedReceivedInvitations = receivedInvitations2.filter(inv => inv.id !== messageData.invitationId);
          localStorage.setItem('receivedInvitations', JSON.stringify(updatedReceivedInvitations));
          // Trigger custom event for friend invitation cancelled
          window.dispatchEvent(new CustomEvent('friendInvitationCancelled', {
            detail: { invitationId: messageData.invitationId, cancelledBy: messageData.cancelledBy }
          }));
          break;
        case MESSAGE_TYPES.FRIEND_ADDED:
          console.log("Friend added:", messageData.newFriend);
          console.log("Friendship data:", messageData.friendshipData);
          
          // Import friendship utils dynamically
          import('../utils/friendshipUtils.js').then(({ createFriendship }) => {
            // Create friendship using the data from server
            if (messageData.friendshipData) {
              const created = createFriendship(
                messageData.friendshipData.user1,
                messageData.friendshipData.user2,
                messageData.friendshipData.initiatedBy
              );
              
              if (created) {
                // Trigger custom event for friend added
                window.dispatchEvent(new CustomEvent('friendAdded', {
                  detail: { 
                    newFriend: messageData.newFriend,
                    friendshipData: messageData.friendshipData
                  }
                }));
              }
            }
          }).catch(error => {
            console.error('Error importing friendship utils:', error);
          });
          break;
        case MESSAGE_TYPES.FRIENDS_LIST_SYNC:
          console.log("Friends list sync:", messageData.friends);
          // Trigger custom event for friends list sync
          window.dispatchEvent(new CustomEvent('friendsListSync', {
            detail: { friendIds: messageData.friends }
          }));
          break;
        default:
          console.log("Unknown message type:", messageData.type);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [currentUser, initialRoomId]);

  return {
    messages,
    setMessages,
    roomUsers,
    typingUsers,
    sendMessage,
    joinRoom,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
};

export default useWebSocket;