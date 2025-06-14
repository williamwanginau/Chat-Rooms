import MessagesList from "./MessagesList";
import MembersList from "./MembersList";
import RoomHeader from "./RoomHeader";
import DevFunctions from "../../components/DevFunctions";
import TabNavigation from "../../components/TabNavigation";
import FriendsTab from "../../components/FriendsTab";
import RoomsTab from "../../components/RoomsTab";
import InvitationsTab from "../../components/InvitationsTab";
import "./ChatPage.scss";
import { useState, useEffect } from "react";
import useWebSocket from "../../hooks/useWebSocket";
import MESSAGE_TYPES from "../../../../shared/messageTypes.json";
import PropTypes from "prop-types";
import { getUserFriendsInfo } from "../../utils/friendshipUtils";

const Chat = () => {
  const [selectedRoomId, setSelectedRoomId] = useState("sport");
  const [customRooms, setCustomRooms] = useState([]);
  const [activeTab, setActiveTab] = useState("rooms");
  const [friends, setFriends] = useState([]);
  const [receivedInvitations, setReceivedInvitations] = useState([]);
  const [sentInvitations, setSentInvitations] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const { messages, setMessages, roomUsers, typingUsers, sendMessage, joinRoom } =
    useWebSocket(currentUser, selectedRoomId);

  // Load invitations from localStorage on component mount
  useEffect(() => {
    const savedReceivedInvitations = localStorage.getItem("receivedInvitations");
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
      const userFriends = getUserFriendsInfo(currentUser.internalId);
      setFriends(userFriends.map(friend => ({
        id: friend.internalId,
        name: friend.username,
        avatar: friend.avatar || "/default-avatar.png",
        status: friend.online ? "online" : "offline",
        statusTimestamp: friend.lastSeen || new Date().toISOString()
      })));
    }
  }, []);

  // Handle friend invitation events
  useEffect(() => {
    const handleFriendInvitationReceived = (event) => {
      const { invitation } = event.detail;
      setReceivedInvitations(prev => {
        const updated = [...prev, invitation];
        localStorage.setItem("receivedInvitations", JSON.stringify(updated));
        return updated;
      });
      console.log("Added received invitation:", invitation);
    };

    const handleFriendInvitationSent = (event) => {
      const { success, error, toUserId, invitation } = event.detail;
      if (success && invitation) {
        setSentInvitations(prev => {
          const updated = [...prev, invitation];
          localStorage.setItem("sentInvitations", JSON.stringify(updated));
          return updated;
        });
        console.log("Friend invitation sent successfully to:", toUserId);
      } else {
        console.error("Failed to send friend invitation:", error);
        alert(`Failed to send invitation: ${error}`);
      }
    };

    const handleFriendInvitationAccepted = (event) => {
      const { invitationId, acceptedBy } = event.detail;
      // Remove from received invitations
      setReceivedInvitations(prev => {
        const updated = prev.filter(inv => inv.id !== invitationId);
        localStorage.setItem("receivedInvitations", JSON.stringify(updated));
        return updated;
      });
      // Also remove from sent invitations (for the sender)
      setSentInvitations(prev => {
        const updated = prev.filter(inv => inv.id !== invitationId);
        localStorage.setItem("sentInvitations", JSON.stringify(updated));
        return updated;
      });
      console.log("Friend invitation was accepted by:", acceptedBy.name);
    };

    const handleFriendInvitationDeclined = (event) => {
      const { invitationId, declinedBy } = event.detail;
      // Remove from sent invitations
      setSentInvitations(prev => {
        const updated = prev.filter(inv => inv.id !== invitationId);
        localStorage.setItem("sentInvitations", JSON.stringify(updated));
        return updated;
      });
      console.log("Friend invitation was declined by:", declinedBy.name);
    };

    const handleFriendInvitationCancelled = (event) => {
      const { invitationId, cancelledBy } = event.detail;
      // Remove from received invitations
      setReceivedInvitations(prev => {
        const updated = prev.filter(inv => inv.id !== invitationId);
        localStorage.setItem("receivedInvitations", JSON.stringify(updated));
        return updated;
      });
      console.log("Friend invitation was cancelled by:", cancelledBy.name);
    };

    const handleFriendAdded = (event) => {
      const { newFriend } = event.detail;
      // Add to friends list
      setFriends(prev => {
        // Friends are now managed by friendshipUtils, just update UI state
        const updated = [...prev, {
          id: newFriend.id,
          name: newFriend.name || newFriend.username,
          username: newFriend.id,
          email: newFriend.email || `${newFriend.id}@example.com`,
          avatar: newFriend.avatar || "/default-avatar.png",
          status: "online",
          statusTimestamp: new Date().toISOString()
        }];
        return updated;
      });
      console.log("New friend added:", newFriend.name);
    };

    const handleFriendsListSync = (event) => {
      const { friendIds } = event.detail;
      console.log("Syncing friends list:", friendIds);
      
      // Convert friend IDs to friend objects
      const syncedFriends = friendIds.map(friendId => ({
        id: friendId,
        name: friendId, // We only have the ID, use it as name for now
        username: friendId,
        email: `${friendId}@example.com`,
        avatar: "/default-avatar.png",
        status: "offline", // Default to offline, will be updated if they're online
        statusTimestamp: new Date().toISOString()
      }));
      
      setFriends(syncedFriends);
      console.log("Friends list synced with server");
    };

    // Add event listeners
    window.addEventListener('friendInvitationReceived', handleFriendInvitationReceived);
    window.addEventListener('friendInvitationSent', handleFriendInvitationSent);
    window.addEventListener('friendInvitationAccepted', handleFriendInvitationAccepted);
    window.addEventListener('friendInvitationDeclined', handleFriendInvitationDeclined);
    window.addEventListener('friendInvitationCancelled', handleFriendInvitationCancelled);
    window.addEventListener('friendAdded', handleFriendAdded);
    window.addEventListener('friendsListSync', handleFriendsListSync);

    // Cleanup event listeners
    return () => {
      window.removeEventListener('friendInvitationReceived', handleFriendInvitationReceived);
      window.removeEventListener('friendInvitationSent', handleFriendInvitationSent);
      window.removeEventListener('friendInvitationAccepted', handleFriendInvitationAccepted);
      window.removeEventListener('friendInvitationDeclined', handleFriendInvitationDeclined);
      window.removeEventListener('friendInvitationCancelled', handleFriendInvitationCancelled);
      window.removeEventListener('friendAdded', handleFriendAdded);
      window.removeEventListener('friendsListSync', handleFriendsListSync);
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
  }, []);

  // Save custom rooms to localStorage whenever customRooms changes
  useEffect(() => {
    if (customRooms.length > 0) {
      localStorage.setItem("customRooms", JSON.stringify(customRooms));
    }
  }, [customRooms]);

  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
    joinRoom(roomId);

    const loadRoomHistory = async () => {
      const response = await fetch(
        `http://localhost:3000/api/room/${roomId}/history`
      );
      const data = await response.json();
      setMessages(data);
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
        clientTimestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      },
      // 3 days ago (this week)
      {
        messageId: "test-3",
        message: "Message from 3 days ago",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // 1 week ago
      {
        messageId: "test-4",
        message: "One week ago message",
        sender: { id: "user3", name: "Charlie" },
        clientTimestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // 2 weeks ago
      {
        messageId: "test-5",
        message: "Two weeks ago message",
        sender: { id: "user2", name: "Bob" },
        clientTimestamp: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // 1 month ago
      {
        messageId: "test-6",
        message: "Message from last month",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // 3 months ago
      {
        messageId: "test-7",
        message: "Three months ago message",
        sender: { id: "user3", name: "Charlie" },
        clientTimestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      },
      // Last year
      {
        messageId: "test-8",
        message: "Message from last year!",
        sender: { id: "user2", name: "Bob" },
        clientTimestamp: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
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
    console.log("✨ Generated test messages with different dates!");
  };

  const handleClearMessages = () => {
    setMessages([]);
    console.log("🗑️ Cleared all messages");
  };

  const generateLongMessages = () => {
    const longMessages = [
      {
        messageId: "long-1",
        message: "This is a very long message to test how the chat interface handles lengthy text content. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 🚀",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date().toISOString(),
      },
      {
        messageId: "long-2", 
        message: "Testing special characters: 你好世界 🌍 ñáéíóú àèìòù çñ ß µ ∑ ∆ π Ω ≈ ≠ ≤ ≥ ◊ ♠ ♣ ♥ ♦ → ↑ ↓ ← ↔ ↕",
        sender: { id: "user2", name: "Bob" },
        clientTimestamp: new Date(Date.now() + 1000).toISOString(),
      },
      {
        messageId: "long-3",
        message: "Code snippet test:\n```javascript\nfunction fibonacci(n) {\n  if (n <= 1) return n;\n  return fibonacci(n-1) + fibonacci(n-2);\n}\nconsole.log(fibonacci(10));\n```",
        sender: { id: "user3", name: "Charlie" },
        clientTimestamp: new Date(Date.now() + 2000).toISOString(),
      },
      {
        messageId: "long-4",
        message: "URL test: https://www.example.com/very/long/path/to/some/resource?param1=value1&param2=value2&param3=value3#section",
        sender: { id: "user1", name: "Alice" },
        clientTimestamp: new Date(Date.now() + 3000).toISOString(),
      }
    ];
    
    setMessages(prev => [...prev, ...longMessages]);
    console.log("📝 Generated long messages");
  };

  const generateStressTest = () => {
    const stressMessages = Array.from({ length: 100 }, (_, i) => ({
      messageId: `stress-${i}`,
      message: `Stress test message #${i + 1} - Testing performance with many messages`,
      sender: { 
        id: `user${(i % 3) + 1}`, 
        name: ['Alice', 'Bob', 'Charlie'][i % 3] 
      },
      clientTimestamp: new Date(Date.now() + i * 100).toISOString(),
    }));
    
    setMessages(prev => [...prev, ...stressMessages]);
    console.log("⚡ Generated 100 stress test messages");
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
      }
    ];

    // Send typing start events
    typingEvents.forEach((event, index) => {
      setTimeout(() => {
        sendMessage(event);
      }, index * 500);
    });

    // Stop typing after 5 seconds
    setTimeout(() => {
      typingEvents.forEach(event => {
        sendMessage({
          ...event,
          type: MESSAGE_TYPES.TYPING_STOP,
        });
      });
    }, 5000);

    console.log("⌨️ Simulated multiple users typing");
  };

  const simulateUserJoinLeave = () => {
    const users = [
      { id: "temp1", name: "David" },
      { id: "temp2", name: "Emma" },
      { id: "temp3", name: "Frank" }
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
      }, (index * 1000) + 3000);
    });

    console.log("🚪 Simulated users joining and leaving");
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
      { id: "virtual8", name: "Amy", username: "Amy" }
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

    console.log("👥 Started gradual virtual user join simulation");
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
      { id: "virtual8", name: "Amy", username: "Amy" }
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

    console.log("🗑️ Removing all virtual users");
  };

  // Handle room creation
  const handleCreateRoom = async (roomData) => {
    try {
      const response = await fetch("http://localhost:3000/api/room/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(roomData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create room");
      }

      const newRoom = await response.json();
      
      // Add to custom rooms list
      setCustomRooms(prev => [...prev, newRoom]);
      
      // Automatically join the new room
      setSelectedRoomId(newRoom.id);
      joinRoom(newRoom.id);
      
      console.log("✅ Room created successfully:", newRoom);
      return newRoom;
    } catch (error) {
      console.error("❌ Failed to create room:", error);
      throw error;
    }
  };

  // Handle joining room by ID
  const handleJoinRoom = async (roomId) => {
    try {
      // First check if room exists
      const existsResponse = await fetch(`http://localhost:3000/api/room/${roomId}/exists`);
      const existsData = await existsResponse.json();
      
      if (!existsData.exists) {
        throw new Error("Room does not exist");
      }

      // Get room info
      const infoResponse = await fetch(`http://localhost:3000/api/room/${roomId}/info`);
      if (!infoResponse.ok) {
        throw new Error("Unable to get room information");
      }
      
      const roomInfo = await infoResponse.json();
      
      // Add to custom rooms if not already present
      setCustomRooms(prev => {
        const exists = prev.some(room => room.id === roomId);
        if (exists) {
          return prev;
        }
        return [...prev, roomInfo];
      });
      
      // Join the room
      setSelectedRoomId(roomId);
      joinRoom(roomId);
      
      console.log("✅ Joined room successfully:", roomInfo);
      return roomInfo;
    } catch (error) {
      console.error("❌ Failed to join room:", error);
      throw error;
    }
  };

  // Friends related handlers
  const handleStartChat = (friend) => {
    // TODO: Implement private chat functionality
    console.log("Starting chat with:", friend);
    alert(`Start chat with ${friend.name} feature not yet implemented`);
  };

  const handleRemoveFriend = (friend) => {
    // TODO: Implement friend removal
    console.log("Removing friend:", friend);
    alert(`Remove friend ${friend.name} feature not yet implemented`);
  };

  const handleAcceptInvitation = (invitation) => {
    console.log("Accepting invitation:", invitation);
    sendMessage({
      type: MESSAGE_TYPES.FRIEND_INVITATION_ACCEPTED,
      invitationId: invitation.id,
      fromUserId: invitation.from.id,
    });
    
    // Remove from received invitations in localStorage
    setReceivedInvitations(prev => {
      const updated = prev.filter(inv => inv.id !== invitation.id);
      localStorage.setItem("receivedInvitations", JSON.stringify(updated));
      return updated;
    });
  };

  const handleDeclineInvitation = (invitation) => {
    console.log("Declining invitation:", invitation);
    sendMessage({
      type: MESSAGE_TYPES.FRIEND_INVITATION_DECLINED,
      invitationId: invitation.id,
      fromUserId: invitation.from.id,
    });
    
    // Remove from received invitations in localStorage
    setReceivedInvitations(prev => {
      const updated = prev.filter(inv => inv.id !== invitation.id);
      localStorage.setItem("receivedInvitations", JSON.stringify(updated));
      return updated;
    });
  };

  const handleCancelInvitation = (invitation) => {
    console.log("Canceling invitation:", invitation);
    sendMessage({
      type: MESSAGE_TYPES.FRIEND_INVITATION_CANCELLED,
      invitationId: invitation.id,
      toUserId: invitation.toUserId,
    });
    
    // Remove from sent invitations in localStorage
    setSentInvitations(prev => {
      const updated = prev.filter(inv => inv.id !== invitation.id);
      localStorage.setItem("sentInvitations", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSendInvitation = (userId, message = "") => {
    console.log("Sending invitation to:", userId);
    sendMessage({
      type: MESSAGE_TYPES.FRIEND_INVITATION_SENT,
      toUserId: userId,
      invitationData: {
        message: message,
      }
    });
  };

  // Dev tools handlers
  const generateFriends = () => {
    const mockFriends = [
      {
        id: "friend1",
        name: "Alice Wang",
        username: "alice_w",
        status: "online",
        avatar: "👩",
        lastSeen: new Date().toISOString()
      },
      {
        id: "friend2", 
        name: "Bob Chen",
        username: "bob_chen",
        status: "away",
        avatar: "👨",
        lastSeen: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: "friend3",
        name: "Carol Li",
        username: "carol_l",
        status: "offline",
        avatar: "👩‍💼",
        lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "friend4",
        name: "David Zhang",
        username: "david_z",
        status: "online",
        avatar: "👨‍💻",
        lastSeen: new Date().toISOString()
      }
    ];

    setFriends(mockFriends);
    console.log("👥 Generated mock friends data");
  };

  const generateInvitations = () => {
    const mockReceivedInvitations = [
      {
        id: "inv1",
        from: {
          id: "user1",
          name: "Emma Liu",
          username: "emma_l",
          avatar: "👩‍🎨"
        },
        message: "Hi! Would you like to be friends?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "inv2",
        from: {
          id: "user2", 
          name: "James Wu",
          username: "james_wu",
          avatar: "👨‍🚀"
        },
        message: "Want to be friends!",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      }
    ];

    const mockSentInvitations = [
      {
        id: "sent1",
        to: {
          id: "user3",
          name: "Sophie Chen",
          username: "sophie_c",
          avatar: "👩‍💼"
        },
        message: "Hello! Would you like to add me as a friend?",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        status: "pending"
      }
    ];

    setReceivedInvitations(mockReceivedInvitations);
    setSentInvitations(mockSentInvitations);
    console.log("📨 Generated mock invitations data");
  };

  const clearFriendsData = () => {
    setFriends([]);
    setReceivedInvitations([]);
    setSentInvitations([]);
    console.log("🗑️ Cleared all friends and invitations data");
  };

  // Tab change handler
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
  };

  const DEFAULT_ROOMS = [
    { id: "sport", name: "Sports Room", description: "Discuss sports topics" },
    {
      id: "finance",
      name: "Finance Room",
      description: "Share investment insights",
    },
    {
      id: "tech",
      name: "Tech Room",
      description: "Explore latest tech trends",
    },
  ];

  const selectedRoom = 
    DEFAULT_ROOMS.find((room) => room.id === selectedRoomId) ||
    customRooms.find((room) => room.id === selectedRoomId) ||
    { id: selectedRoomId, name: selectedRoomId, description: "Unknown Room" };

  // Render tab content based on active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "friends":
        return (
          <FriendsTab
            friends={friends}
            onStartChat={handleStartChat}
            onRemoveFriend={handleRemoveFriend}
          />
        );
      case "rooms":
        return (
          <RoomsTab
            onRoomSelect={handleRoomSelect}
            currentRoomId={selectedRoomId}
            defaultRooms={DEFAULT_ROOMS}
            customRooms={customRooms}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
          />
        );
      case "invitations":
        return (
          <InvitationsTab
            receivedInvitations={receivedInvitations}
            sentInvitations={sentInvitations}
            currentUser={currentUser}
            onAcceptInvitation={handleAcceptInvitation}
            onDeclineInvitation={handleDeclineInvitation}
            onCancelInvitation={handleCancelInvitation}
            onSendInvitation={handleSendInvitation}
            sendMessage={sendMessage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="chat">
      <div className="chat__sidebar">
        <TabNavigation
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
        <div className="chat__tab-content">
          {renderTabContent()}
        </div>
      </div>
      <div className="chat__main">
        <RoomHeader className="chat__header" selectedRoom={selectedRoom} />
        <div className="chat__content">
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
