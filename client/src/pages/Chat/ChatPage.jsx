import MessagesList from "../../components/chat/MessagesList";
import MembersList from "../../components/chat/MembersList";
import RoomHeader from "../../components/chat/RoomHeader";
import DevFunctions from "../../components/layout/DevFunctions";
import VerticalNavigation from "../../components/layout/VerticalNavigation";
import ContactList from "../../components/friends/ContactList";
import "./ChatPage.scss";
import { useState, useEffect } from "react";
import useWebSocket from "../../hooks/useWebSocket";
import MESSAGE_TYPES from "../../../../shared/messageTypes.json";
import PropTypes from "prop-types";
import { getUserFriendsInfo } from "../../utils/friendship";

const Chat = () => {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [customRooms, setCustomRooms] = useState([]);
  const [activeSection, setActiveSection] = useState("rooms");
  const [friends, setFriends] = useState([]);
  const [testGroups, setTestGroups] = useState([]);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const {
    messages,
    setMessages,
    roomUsers,
    typingUsers,
    sendMessage,
    joinRoom,
  } = useWebSocket(currentUser, selectedRoomId);

  // Update room's last message when messages change
  useEffect(() => {
    if (messages.length > 0 && selectedRoomId) {
      const lastMessage = messages[messages.length - 1];
      if (!lastMessage.isSystemMessage) {
        setCustomRooms((prev) =>
          prev.map((room) =>
            room.id === selectedRoomId
              ? {
                  ...room,
                  lastMessage: lastMessage.message,
                  lastMessageTime: lastMessage.clientTimestamp,
                  lastMessageSender:
                    lastMessage.sender?.name ||
                    lastMessage.sender?.username ||
                    "Unknown",
                  unreadCount: 0, // Reset unread count for current room
                }
              : room
          )
        );
      }
    }
  }, [messages, selectedRoomId]);

  // Handle new messages from other rooms (for unread count)
  useEffect(() => {
    const handleNewMessage = (event) => {
      const { roomId, message, timestamp, sender } = event.detail;

      // Only update unread count if the message is not from the currently selected room
      if (roomId !== selectedRoomId) {
        setCustomRooms((prev) =>
          prev.map((room) =>
            room.id === roomId
              ? {
                  ...room,
                  lastMessage: message,
                  lastMessageTime: timestamp,
                  lastMessageSender: sender,
                  unreadCount: (room.unreadCount || 0) + 1,
                }
              : room
          )
        );
      }
    };

    window.addEventListener("newMessage", handleNewMessage);
    return () => window.removeEventListener("newMessage", handleNewMessage);
  }, [selectedRoomId]);

  // Load invitations from localStorage on component mount
  useEffect(() => {
    const savedReceivedInvitations = localStorage.getItem(
      "receivedInvitations"
    );
    const savedSentInvitations = localStorage.getItem("sentInvitations");

    if (savedReceivedInvitations) {
      try {
        const parsedReceivedInvitations = JSON.parse(savedReceivedInvitations);
        setReceivedInvitations(parsedReceivedInvitations);
      } catch (error) {
        console.error("Failed to parse saved received invitations:", error);
      }
    }

    if (savedSentInvitations) {
      try {
        const parsedSentInvitations = JSON.parse(savedSentInvitations);
        setSentInvitations(parsedSentInvitations);
      } catch (error) {
        console.error("Failed to parse saved sent invitations:", error);
      }
    }

    // Load friends from user object instead of separate localStorage key
    if (currentUser) {
      const userFriends = getUserFriendsInfo(currentUser.id);
      setFriends(
        userFriends.map((friend) => ({
          id: friend.id,
          name: friend.name || friend.username || "Unknown User",
          username: friend.username || "unknown",
          avatar: friend.avatar || "/default-avatar.png",
        }))
      );
    }

    // Load test data if it exists
    const loadTestData = () => {
      const testFriendsData = localStorage.getItem("testFriends");
      const testGroupsData = localStorage.getItem("testGroups");
      
      if (testFriendsData) {
        try {
          const testFriends = JSON.parse(testFriendsData);
          setFriends(prev => [...prev, ...testFriends]);
        } catch (error) {
          console.error("Failed to parse test friends:", error);
        }
      }
      
      if (testGroupsData) {
        try {
          const testGroups = JSON.parse(testGroupsData);
          setTestGroups(testGroups);
        } catch (error) {
          console.error("Failed to parse test groups:", error);
        }
      }
    };

    loadTestData();
  }, []);

  // Handle friend invitation events
  useEffect(() => {
    const handleFriendInvitationReceived = (event) => {
      const { invitation } = event.detail;
      setReceivedInvitations((prev) => {
        const updated = [...prev, invitation];
        localStorage.setItem("receivedInvitations", JSON.stringify(updated));
        return updated;
      });
    };

    const handleFriendInvitationSent = (event) => {
      const { success, error, toUserId, invitation } = event.detail;
      if (success && invitation) {
        setSentInvitations((prev) => {
          const updated = [...prev, invitation];
          localStorage.setItem("sentInvitations", JSON.stringify(updated));
          return updated;
        });
      } else {
        console.error("Failed to send friend invitation:", error);
        alert(`Failed to send invitation: ${error}`);
      }
    };

    const handleFriendInvitationAccepted = (event) => {
      const { invitationId, acceptedBy } = event.detail;
      // Remove from received invitations
      setReceivedInvitations((prev) => {
        const updated = prev.filter((inv) => inv.id !== invitationId);
        localStorage.setItem("receivedInvitations", JSON.stringify(updated));
        return updated;
      });
      // Also remove from sent invitations (for the sender)
      setSentInvitations((prev) => {
        const updated = prev.filter((inv) => inv.id !== invitationId);
        localStorage.setItem("sentInvitations", JSON.stringify(updated));
        return updated;
      });
    };

    const handleFriendInvitationDeclined = (event) => {
      const { invitationId, declinedBy } = event.detail;
      // Remove from sent invitations
      setSentInvitations((prev) => {
        const updated = prev.filter((inv) => inv.id !== invitationId);
        localStorage.setItem("sentInvitations", JSON.stringify(updated));
        return updated;
      });
    };

    const handleFriendInvitationCancelled = (event) => {
      const { invitationId, cancelledBy } = event.detail;
      // Remove from received invitations
      setReceivedInvitations((prev) => {
        const updated = prev.filter((inv) => inv.id !== invitationId);
        localStorage.setItem("receivedInvitations", JSON.stringify(updated));
        return updated;
      });
    };

    const handleFriendAdded = (event) => {
      const { newFriend } = event.detail;
      // Add to friends list
      setFriends((prev) => {
        // Friends are now managed by friendshipUtils, just update UI state
        const updated = [
          ...prev,
          {
            id: newFriend.id,
            name: newFriend.name || newFriend.username,
            username: newFriend.username,
            email: newFriend.email || `${newFriend.username}@example.com`,
            avatar: newFriend.avatar || "/default-avatar.png",
          },
        ];
        return updated;
      });
    };

    const handleFriendsListSync = (event) => {
      const { friendIds } = event.detail;

      // Get full user info for each friend ID
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
    };

    const handlePrivateChatCreated = (event) => {
      const { roomInfo } = event.detail;

      // Add the new private chat room to customRooms if not already present
      setCustomRooms((prev) => {
        const exists = prev.some((room) => room.id === roomInfo.id);
        if (exists) {
          return prev;
        }
        return [...prev, roomInfo];
      });
    };

    const handleTestDataGenerated = (event) => {
      const { friends: testFriends, groups: testGroups } = event.detail;
      setFriends(prev => {
        // Remove existing test data first
        const realFriends = prev.filter(f => !f.id.startsWith('friend'));
        return [...realFriends, ...testFriends];
      });
      setTestGroups(testGroups);
    };

    const handleTestDataRemoved = () => {
      setFriends(prev => prev.filter(f => !f.id.startsWith('friend')));
      setTestGroups([]);
    };

    const handleNewMessage = (event) => {
      const { roomId, message, timestamp, sender } = event.detail;

      // Update room's last message info
      setCustomRooms((prev) =>
        prev.map((room) =>
          room.id === roomId
            ? {
                ...room,
                lastMessage: message,
                lastMessageTime: timestamp,
                lastMessageSender: sender,
              }
            : room
        )
      );
    };

    // Add event listeners
    window.addEventListener(
      "friendInvitationReceived",
      handleFriendInvitationReceived
    );
    window.addEventListener("friendInvitationSent", handleFriendInvitationSent);
    window.addEventListener(
      "friendInvitationAccepted",
      handleFriendInvitationAccepted
    );
    window.addEventListener(
      "friendInvitationDeclined",
      handleFriendInvitationDeclined
    );
    window.addEventListener(
      "friendInvitationCancelled",
      handleFriendInvitationCancelled
    );
    window.addEventListener("friendAdded", handleFriendAdded);
    window.addEventListener("friendsListSync", handleFriendsListSync);
    window.addEventListener("privateChatCreated", handlePrivateChatCreated);
    window.addEventListener("newMessage", handleNewMessage);
    window.addEventListener("testDataGenerated", handleTestDataGenerated);
    window.addEventListener("testDataRemoved", handleTestDataRemoved);

    // Cleanup event listeners
    return () => {
      window.removeEventListener(
        "friendInvitationReceived",
        handleFriendInvitationReceived
      );
      window.removeEventListener(
        "friendInvitationSent",
        handleFriendInvitationSent
      );
      window.removeEventListener(
        "friendInvitationAccepted",
        handleFriendInvitationAccepted
      );
      window.removeEventListener(
        "friendInvitationDeclined",
        handleFriendInvitationDeclined
      );
      window.removeEventListener(
        "friendInvitationCancelled",
        handleFriendInvitationCancelled
      );
      window.removeEventListener("friendAdded", handleFriendAdded);
      window.removeEventListener("friendsListSync", handleFriendsListSync);
      window.removeEventListener(
        "privateChatCreated",
        handlePrivateChatCreated
      );
      window.removeEventListener("testDataGenerated", handleTestDataGenerated);
      window.removeEventListener("testDataRemoved", handleTestDataRemoved);
    };
  }, []);

  // Load custom rooms from localStorage on component mount
  useEffect(() => {
    const savedCustomRooms = localStorage.getItem("customRooms");
    if (savedCustomRooms) {
      try {
        const parsedRooms = JSON.parse(savedCustomRooms);
        setCustomRooms(parsedRooms);
      } catch (error) {
        console.error("Failed to parse saved custom rooms:", error);
      }
    }

    // Load private chat rooms for current user
    loadPrivateChatRooms();
  }, []);

  // Load private chat rooms that the current user is part of
  const loadPrivateChatRooms = async () => {
    if (!currentUser) return;

    try {
      // Check for private rooms with friends
      const userFriends = getUserFriendsInfo(currentUser.id);
      const privateRooms = [];

      for (const friend of userFriends) {
        const sortedIds = [currentUser.username, friend.username].sort();
        const privateRoomId = `private_${sortedIds[0]}_${sortedIds[1]}`;

        // Check if this private room exists
        const existsResponse = await fetch(
          `http://localhost:3000/api/room/${privateRoomId}/exists`
        );
        const existsData = await existsResponse.json();

        if (existsData.exists) {
          // Get room info
          const infoResponse = await fetch(
            `http://localhost:3000/api/room/${privateRoomId}/info`
          );
          if (infoResponse.ok) {
            const roomInfo = await infoResponse.json();
            privateRooms.push(roomInfo);
          }
        }
      }

      // Add private rooms to customRooms if not already present
      if (privateRooms.length > 0) {
        setCustomRooms((prev) => {
          const existingRoomIds = prev.map((room) => room.id);
          const newRooms = privateRooms.filter(
            (room) => !existingRoomIds.includes(room.id)
          );
          return [...prev, ...newRooms];
        });
      }
    } catch (error) {
      console.error("Failed to load private chat rooms:", error);
    }
  };

  // Save custom rooms to localStorage whenever customRooms changes
  useEffect(() => {
    if (customRooms.length > 0) {
      localStorage.setItem("customRooms", JSON.stringify(customRooms));
    }
  }, [customRooms]);

  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
    joinRoom(roomId);

    // Reset unread count for selected room
    setCustomRooms((prev) =>
      prev.map((room) =>
        room.id === roomId ? { ...room, unreadCount: 0 } : room
      )
    );

    const loadRoomHistory = async () => {
      const response = await fetch(
        `http://localhost:3000/api/room/${roomId}/history`
      );
      const data = await response.json();
      setMessages(data);

      // Update room's last message from history
      if (data.length > 0) {
        const lastMessage = data[data.length - 1];
        if (!lastMessage.isSystemMessage) {
          setCustomRooms((prev) =>
            prev.map((room) =>
              room.id === roomId
                ? {
                    ...room,
                    lastMessage: lastMessage.message,
                    lastMessageTime: lastMessage.clientTimestamp,
                    lastMessageSender:
                      lastMessage.sender?.name ||
                      lastMessage.sender?.username ||
                      "Unknown",
                  }
                : room
            )
          );
        }
      }
    };

    loadRoomHistory();
  };

  const handleSendMessage = (messageData) => {
    sendMessage(messageData);
  };

  const handleTypingStart = (typingData) => {
    sendMessage(typingData);
  };

  const handleTypingStop = (typingData) => {
    sendMessage(typingData);
  };

  // Generate test messages with different dates (Dev tool)
  const generateTestMessages = () => {
    const testMessages = [
      // Today
      {
        messageId: "test-1",
        message: "This is a message from today!",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date().toISOString(),
      },
      // Yesterday
      {
        messageId: "test-2",
        message: "Yesterday's message here",
        sender: { id: "user2", name: "Bob" },
        clientTimestamp: new Date(
          Date.now() - 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      // 3 days ago (this week)
      {
        messageId: "test-3",
        message: "Message from 3 days ago",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date(
          Date.now() - 3 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      // 1 week ago
      {
        messageId: "test-4",
        message: "One week ago message",
        sender: { id: "user3", name: "Charlie" },
        clientTimestamp: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      // 2 weeks ago
      {
        messageId: "test-5",
        message: "Two weeks ago message",
        sender: { id: "user2", name: "Bob" },
        clientTimestamp: new Date(
          Date.now() - 14 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      // 1 month ago
      {
        messageId: "test-6",
        message: "Message from last month",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date(
          Date.now() - 30 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      // 3 months ago
      {
        messageId: "test-7",
        message: "Three months ago message",
        sender: { id: "user3", name: "Charlie" },
        clientTimestamp: new Date(
          Date.now() - 90 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
      // Last year
      {
        messageId: "test-8",
        message: "Message from last year!",
        sender: { id: "user2", name: "Bob" },
        clientTimestamp: new Date(
          Date.now() - 365 * 24 * 60 * 60 * 1000
        ).toISOString(),
      },
    ];

    // Add multiple messages to show time grouping within same day
    const todayMultiple = [
      {
        messageId: "test-today-1",
        message: "Good morning! ☀️",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date(new Date().setHours(9, 0, 0)).toISOString(),
      },
      {
        messageId: "test-today-2",
        message: "Lunch time! 🍕",
        sender: { id: "user2", name: "Bob" },
        clientTimestamp: new Date(new Date().setHours(12, 30, 0)).toISOString(),
      },
      {
        messageId: "test-today-3",
        message: "Good evening! 🌙",
        sender: { id: "user3", name: "Charlie" },
        clientTimestamp: new Date(new Date().setHours(18, 45, 0)).toISOString(),
      },
    ];

    // Combine and sort by timestamp
    const allTestMessages = [...testMessages, ...todayMultiple].sort(
      (a, b) => new Date(a.clientTimestamp) - new Date(b.clientTimestamp)
    );

    setMessages(allTestMessages);
  };

  const handleClearMessages = () => {
    setMessages([]);
  };

  const generateLongMessages = () => {
    const longMessages = [
      {
        messageId: "long-1",
        message:
          "This is a very long message to test how the chat interface handles lengthy text content. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 🚀",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date().toISOString(),
      },
      {
        messageId: "long-2",
        message:
          "Testing special characters: 你好世界 🌍 ñáéíóú àèìòù çñ ß µ ∑ ∆ π Ω ≈ ≠ ≤ ≥ ◊ ♠ ♣ ♥ ♦ → ↑ ↓ ← ↔ ↕",
        sender: { id: "user2", name: "Bob" },
        clientTimestamp: new Date(Date.now() + 1000).toISOString(),
      },
      {
        messageId: "long-3",
        message:
          "Code snippet test:\n```javascript\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}\nconsole.log(fibonacci(10));\n```",
        sender: { id: "user3", name: "Charlie" },
        clientTimestamp: new Date(Date.now() + 2000).toISOString(),
      },
      {
        messageId: "long-4",
        message:
          "URL test: https://www.example.com/very/long/path/to/some/resource?param1=value1&param2=value2&param3=value3#section",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date(Date.now() + 3000).toISOString(),
      },
    ];

    setMessages((prev) => [...prev, ...longMessages]);
  };

  const generateStressTest = () => {
    const stressMessages = Array.from({ length: 100 }, (_, i) => ({
      messageId: `stress-${i}`,
      message: `Stress test message #${
        i + 1
      } - Testing performance with many messages`,
      sender: {
        id: `user${(i % 3) + 1}`,
        name: ["Alice", "Bob", "Charlie"][i % 3],
      },
      clientTimestamp: new Date(Date.now() + i * 100).toISOString(),
    }));

    setMessages((prev) => [...prev, ...stressMessages]);
  };

  const simulateTyping = () => {
    // Simulate multiple users typing
    const typingEvents = [
      {
        type: MESSAGE_TYPES.TYPING_START,
        user: { name: "Alice" },
        room: { id: selectedRoomId },
      },
      {
        type: MESSAGE_TYPES.TYPING_START,
        user: { name: "Bob" },
        room: { id: selectedRoomId },
      },
      {
        type: MESSAGE_TYPES.TYPING_START,
        user: { name: "Charlie" },
        room: { id: selectedRoomId },
      },
    ];

    // Send typing start events
    typingEvents.forEach((event, index) => {
      setTimeout(() => {
        sendMessage(event);
      }, index * 500);
    });

    // Stop typing after 5 seconds
    setTimeout(() => {
      typingEvents.forEach((event) => {
        sendMessage({
          ...event,
          type: MESSAGE_TYPES.TYPING_STOP,
        });
      });
    }, 5000);
  };

  const simulateUserJoinLeave = () => {
    const users = [
      { id: "temp1", name: "David" },
      { id: "temp2", name: "Emma" },
      { id: "temp3", name: "Frank" },
    ];

    users.forEach((user, index) => {
      // Simulate user joining
      setTimeout(() => {
        sendMessage({
          type: MESSAGE_TYPES.USER_JOINED,
          user,
          room: { id: selectedRoomId },
        });
      }, index * 1000);

      // Simulate user leaving after 3 seconds
      setTimeout(() => {
        sendMessage({
          type: MESSAGE_TYPES.USER_LEFT,
          user,
          room: { id: selectedRoomId },
        });
      }, index * 1000 + 3000);
    });
  };

  const simulateGradualUserJoin = () => {
    const virtualUsers = [
      { id: "virtual1", name: "Alex", username: "Alex" },
      { id: "virtual2", name: "Sarah", username: "Sarah" },
      { id: "virtual3", name: "Mike", username: "Mike" },
      { id: "virtual4", name: "Lisa", username: "Lisa" },
      { id: "virtual5", name: "Tom", username: "Tom" },
      { id: "virtual6", name: "Kate", username: "Kate" },
      { id: "virtual7", name: "John", username: "John" },
      { id: "virtual8", name: "Amy", username: "Amy" },
    ];

    // Gradually add virtual users with random intervals between 1-3 seconds
    virtualUsers.forEach((user, index) => {
      const randomDelay = Math.random() * 2000 + 1000; // Random delay between 1-3 seconds

      setTimeout(() => {
        sendMessage({
          type: MESSAGE_TYPES.USER_JOINED,
          user,
          room: { id: selectedRoomId },
        });
      }, index * randomDelay);
    });
  };

  const removeAllVirtualUsers = () => {
    const virtualUsers = [
      { id: "virtual1", name: "Alex", username: "Alex" },
      { id: "virtual2", name: "Sarah", username: "Sarah" },
      { id: "virtual3", name: "Mike", username: "Mike" },
      { id: "virtual4", name: "Lisa", username: "Lisa" },
      { id: "virtual5", name: "Tom", username: "Tom" },
      { id: "virtual6", name: "Kate", username: "Kate" },
      { id: "virtual7", name: "John", username: "John" },
      { id: "virtual8", name: "Amy", username: "Amy" },
    ];

    // Remove all virtual users with short intervals
    virtualUsers.forEach((user, index) => {
      setTimeout(() => {
        sendMessage({
          type: MESSAGE_TYPES.USER_LEFT,
          user,
          room: { id: selectedRoomId },
        });
      }, index * 200); // 200ms interval for quick removal
    });
  };

  // Friends related handlers
  const handleStartChat = async (friend) => {
    try {
      // Create a private room ID using sorted usernames to ensure consistency
      const sortedIds = [currentUser.username, friend.username].sort();
      const privateRoomId = `private_${sortedIds[0]}_${sortedIds[1]}`;

      // Create room data for private chat
      const roomData = {
        id: privateRoomId,
        name: `${friend.name}`,
        description: `Private chat with ${friend.name}`,
        type: "private",
        participants: [currentUser.id, friend.id],
      };

      // Try to create the room (if it doesn't exist) or join existing one
      try {
        // First check if room exists
        const existsResponse = await fetch(
          `http://localhost:3000/api/room/${privateRoomId}/exists`
        );
        const existsData = await existsResponse.json();

        if (!existsData.exists) {
          // Create new private room
          const response = await fetch(
            "http://localhost:3000/api/room/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(roomData),
            }
          );

          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || "Failed to create room");
          }

          const newRoom = await response.json();

          // Add to custom rooms list
          setCustomRooms((prev) => [...prev, newRoom]);

          // Automatically select the new room
          setSelectedRoomId(newRoom.id);
          joinRoom(newRoom.id);

          // Notify the friend about the new private chat room
          sendMessage({
            type: MESSAGE_TYPES.PRIVATE_CHAT_CREATED,
            roomInfo: roomData,
            targetUserId: friend.username,
          });
        } else {
          // Room exists, get room info and join it
          const infoResponse = await fetch(
            `http://localhost:3000/api/room/${privateRoomId}/info`
          );
          if (infoResponse.ok) {
            const roomInfo = await infoResponse.json();

            // Add to custom rooms if not already present
            setCustomRooms((prev) => {
              const exists = prev.some((room) => room.id === privateRoomId);
              if (exists) {
                return prev;
              }
              return [...prev, roomInfo];
            });
          }

          // Join the room
          setSelectedRoomId(privateRoomId);
          joinRoom(privateRoomId);
        }
      } catch (error) {
        console.error("Error in room creation/join:", error);
        // If creation fails, try to join existing room anyway
        setSelectedRoomId(privateRoomId);
        joinRoom(privateRoomId);
      }

      // Switch to rooms section to show the private chat
      setActiveSection("rooms");
    } catch (error) {
      console.error("Failed to start chat with friend:", error);
      alert(`Failed to start chat with ${friend.name}. Please try again.`);
    }
  };

  const handleRemoveFriend = (friend) => {
    // TODO: Implement friend removal
    alert(`Remove friend ${friend.name} feature not yet implemented`);
  };

  const handleAcceptInvitation = (invitation) => {
    sendMessage({
      type: MESSAGE_TYPES.FRIEND_INVITATION_ACCEPTED,
      invitationId: invitation.id,
      fromUserId: invitation.fromUserId,
    });

    // Remove from received invitations in localStorage
    setReceivedInvitations((prev) => {
      const updated = prev.filter((inv) => inv.id !== invitation.id);
      localStorage.setItem("receivedInvitations", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeclineInvitation = (invitation) => {
    sendMessage({
      type: MESSAGE_TYPES.FRIEND_INVITATION_DECLINED,
      invitationId: invitation.id,
      fromUserId: invitation.fromUserId,
    });

    // Remove from received invitations in localStorage
    setReceivedInvitations((prev) => {
      const updated = prev.filter((inv) => inv.id !== invitation.id);
      localStorage.setItem("receivedInvitations", JSON.stringify(updated));
      return updated;
    });
  };

  const handleCancelInvitation = (invitation) => {
    sendMessage({
      type: MESSAGE_TYPES.FRIEND_INVITATION_CANCELLED,
      invitationId: invitation.id,
      toUserId: invitation.toUserId,
    });

    // Remove from sent invitations in localStorage
    setSentInvitations((prev) => {
      const updated = prev.filter((inv) => inv.id !== invitation.id);
      localStorage.setItem("sentInvitations", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSendInvitation = (userId, message = "") => {
    sendMessage({
      type: MESSAGE_TYPES.FRIEND_INVITATION_SENT,
      toUserId: userId,
      invitationData: {
        message: message,
      },
    });
  };

  // Dev tools handlers
  const generateFriends = () => {
    const mockFriends = [
      {
        id: "friend1",
        name: "Alice Wang",
        username: "alice_w",
        avatar: "👩",
        lastSeen: new Date().toISOString(),
      },
      {
        id: "friend2",
        name: "Bob Chen",
        username: "bob_chen",
        avatar: "👨",
        lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      },
      {
        id: "friend3",
        name: "Carol Li",
        username: "carol_l",
        avatar: "👩‍💼",
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "friend4",
        name: "David Zhang",
        username: "david_z",
        avatar: "👨‍💻",
        lastSeen: new Date().toISOString(),
      },
    ];

    setFriends(mockFriends);
  };

  const generateInvitations = () => {
    const mockReceivedInvitations = [
      {
        id: "inv1",
        from: {
          id: "user1",
          name: "Emma Liu",
          username: "emma_l",
          avatar: "👩‍🎨",
        },
        message: "Hi! Would you like to be friends?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "inv2",
        from: {
          id: "user2",
          name: "James Wu",
          username: "james_wu",
          avatar: "👨‍🚀",
        },
        message: "Want to be friends!",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      },
    ];

    const mockSentInvitations = [
      {
        id: "sent1",
        to: {
          id: "user3",
          name: "Sophie Chen",
          username: "sophie_c",
          avatar: "👩‍💼",
        },
        message: "Hello! Would you like to add me as a friend?",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        status: "pending",
      },
    ];

    setReceivedInvitations(mockReceivedInvitations);
    setSentInvitations(mockSentInvitations);
  };

  const clearFriendsData = () => {
    setFriends([]);
    setReceivedInvitations([]);
    setSentInvitations([]);
  };

  // Section change handler
  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    // Clear selected room when switching sections
    setSelectedRoomId(null);
  };

  // Calculate unread counts for navigation
  const getUnreadCounts = () => {
    const roomsUnreadCount = customRooms.reduce(
      (total, room) => total + (room.unreadCount || 0),
      0
    );
    const invitationsUnreadCount = receivedInvitations.length;
    const totalUnreadCount = roomsUnreadCount + invitationsUnreadCount;

    return {
      rooms: roomsUnreadCount,
      invitations: invitationsUnreadCount,
      friends: 0, // No unread count for friends tab
      total: totalUnreadCount,
    };
  };

  const selectedRoom = customRooms.find(
    (room) => room.id === selectedRoomId
  ) || {
    id: selectedRoomId,
    name: selectedRoomId,
    description: "Unknown Room",
  };




  return (
    <div className="chat">
      {/* Vertical Navigation */}
      <VerticalNavigation
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        unreadCounts={getUnreadCounts()}
      />

      {/* Contact List */}
      <ContactList
        activeSection={activeSection}
        friends={friends}
        groups={testGroups}
        customRooms={customRooms}
        receivedInvitations={receivedInvitations}
        sentInvitations={sentInvitations}
        selectedRoomId={selectedRoomId}
        unreadCounts={getUnreadCounts()}
        currentUser={currentUser}
        onRoomSelect={handleRoomSelect}
        onStartChat={handleStartChat}
        onAcceptInvitation={handleAcceptInvitation}
        onDeclineInvitation={handleDeclineInvitation}
        onCancelInvitation={handleCancelInvitation}
        onSendInvitation={handleSendInvitation}
        sendMessage={sendMessage}
      />

      {/* Right Chat Area */}
      <div className="chat__main">
        <div className="chat__chat-header">
          <div className="chat-title">
            {selectedRoom ? selectedRoom.name : "Select a chat room"}
          </div>
          <div className="chat-actions">
            <div className="action-icon">🔍</div>
            <div className="action-icon">📞</div>
            <div className="action-icon">≡</div>
          </div>
        </div>

        <div className="chat__content">
          {selectedRoomId &&
          (activeSection === "rooms" ||
            (activeSection === "friends" && selectedRoom)) ? (
            <>
              <div className="chat__messages">
                <MessagesList
                  messages={messages}
                  currentUser={currentUser}
                  selectedRoom={selectedRoom}
                  onSendMessage={handleSendMessage}
                  typingUsers={typingUsers}
                  onTypingStart={handleTypingStart}
                  onTypingStop={handleTypingStop}
                />
              </div>
              <div className="chat__members">
                <MembersList
                  roomUsers={roomUsers}
                  currentUserId={currentUser?.id}
                />
              </div>
            </>
          ) : (
            <div className="chat__welcome">
              <div className="chat__welcome-content">
                <div className="chat__welcome-icon">
                  {activeSection === "friends" && "👤"}
                  {activeSection === "rooms" && "💬"}
                  {activeSection === "invitations" && "➕"}
                </div>
                <h2 className="chat__welcome-title">
                  {activeSection === "friends" && "Friends"}
                  {activeSection === "rooms" && "Chat Rooms"}
                  {activeSection === "invitations" && "Invitations"}
                </h2>
                <p className="chat__welcome-text">
                  {activeSection === "friends" && "Click on a friend to start private chat"}
                  {activeSection === "rooms" && "Select a chat room to start group conversation"}
                  {activeSection === "invitations" && "Manage friend invitations"}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <DevFunctions
        onGenerateTestMessages={generateTestMessages}
        onClearMessages={handleClearMessages}
        onGenerateStressTest={generateStressTest}
        onSimulateTyping={simulateTyping}
        onGenerateLongMessages={generateLongMessages}
        onSimulateUserJoinLeave={simulateUserJoinLeave}
        onSimulateGradualUserJoin={simulateGradualUserJoin}
        onRemoveAllVirtualUsers={removeAllVirtualUsers}
        onGenerateFriends={generateFriends}
        onGenerateInvitations={generateInvitations}
        onClearFriendsData={clearFriendsData}
        sendMessage={sendMessage}
      />
    </div>
  );
};

Chat.propTypes = {
  messages: PropTypes.array,
  currentUser: PropTypes.object,
  selectedRoom: PropTypes.object,
  onSendMessage: PropTypes.func,
};

export default Chat;
