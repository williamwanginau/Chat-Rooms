// Mock data and management for chat rooms

// Mock room IDs for cleanup
export const MOCK_ROOM_IDS = [
  "private_alice_mock", "private_bob_mock", "private_carol_mock", "private_david_mock", 
  "private_emma_mock", "private_frank_mock", "private_grace_mock", "private_old_colleague", "private_college_roommate",
  "group_frontend_team", "group_design_team", "group_project_alpha", 
  "group_coffee_chat", "group_tech_news", "group_book_club", "group_gaming_squad",
  "group_workout_buddies", "group_travel_plans", "group_old_school_friends", "group_class_of_2020", "group_startup_team"
];

// Generate mock private rooms
export const generateMockPrivateRooms = (currentUser) => [
  {
    id: "private_alice_mock",
    name: "Alice Johnson",
    description: "Private chat with Alice",
    type: "private",
    avatar: "👩",
    lastMessage: "Hey! How's your day going?",
    lastMessageTime: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
    lastMessageSender: "Alice Johnson",
    unreadCount: 1500,
    participants: [currentUser?.id, "alice_mock"].filter(Boolean),
  },
  {
    id: "private_bob_mock",
    name: "Bob Chen",
    description: "Private chat with Bob",
    type: "private",
    avatar: "👨",
    lastMessage: "Thanks for the help earlier!",
    lastMessageTime: new Date(Date.now() - 35 * 60 * 1000).toISOString(), // 35 minutes ago
    lastMessageSender: "Bob Chen",
    unreadCount: 0,
    participants: [currentUser?.id, "bob_mock"].filter(Boolean),
  },
  {
    id: "private_carol_mock",
    name: "Carol Davis",
    description: "Private chat with Carol",
    type: "private",
    avatar: "👩‍💼",
    lastMessage: "Let's schedule that meeting for tomorrow",
    lastMessageTime: new Date(new Date().setHours(9, 30, 0, 0)).toISOString(), // Today at 9:30 AM
    lastMessageSender: "Carol Davis",
    unreadCount: 1,
    participants: [currentUser?.id, "carol_mock"].filter(Boolean),
  },
  {
    id: "private_david_mock",
    name: "David Wilson",
    description: "Private chat with David",
    type: "private",
    avatar: "👨‍💻",
    lastMessage: "Can you review my code when you have time?",
    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    lastMessageSender: "David Wilson",
    unreadCount: 456,
    participants: [currentUser?.id, "david_mock"].filter(Boolean),
  },
  {
    id: "private_emma_mock",
    name: "Emma Brown",
    description: "Private chat with Emma",
    type: "private",
    avatar: "👩‍🎨",
    lastMessage: "Love the new design! 🎨",
    lastMessageTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    lastMessageSender: "Emma Brown",
    unreadCount: 0,
    participants: [currentUser?.id, "emma_mock"].filter(Boolean),
  },
  {
    id: "private_frank_mock", 
    name: "Frank Miller",
    description: "Private chat with Frank",
    type: "private",
    avatar: "👨‍🔧",
    lastMessage: "The server issue has been fixed",
    lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago (this week)
    lastMessageSender: "Frank Miller",
    unreadCount: 1,
    participants: [currentUser?.id, "frank_mock"].filter(Boolean),
  },
  {
    id: "private_grace_mock",
    name: "Grace Lee",
    description: "Private chat with Grace",
    type: "private",
    avatar: "👩‍🏫",
    lastMessage: "Training session went well today",
    lastMessageTime: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(), // 8 days ago (last week)
    lastMessageSender: "Grace Lee",
    unreadCount: 0,
    participants: [currentUser?.id, "grace_mock"].filter(Boolean),
  },
  {
    id: "private_old_colleague",
    name: "Mike Johnson",
    description: "Former colleague from previous job",
    type: "private",
    avatar: "👨‍💼",
    lastMessage: "Hope you're doing well at your new job!",
    lastMessageTime: new Date(Date.now() - 500 * 24 * 60 * 60 * 1000).toISOString(), // 1.4 years ago
    lastMessageSender: "Mike Johnson",
    unreadCount: 0,
    participants: [currentUser?.id, "mike_mock"].filter(Boolean),
  },
  {
    id: "private_college_roommate",
    name: "Jessica Wong",
    description: "College roommate from freshman year",
    type: "private",
    avatar: "👩‍🎓",
    lastMessage: "Missing our late night study sessions! 📚",
    lastMessageTime: new Date(Date.now() - 800 * 24 * 60 * 60 * 1000).toISOString(), // 2.2 years ago
    lastMessageSender: "Jessica Wong",
    unreadCount: 1,
    participants: [currentUser?.id, "jessica_mock"].filter(Boolean),
  },
];

// Generate mock group rooms
export const generateMockGroupRooms = (currentUser) => [
  {
    id: "group_frontend_team",
    name: "Frontend Team",
    description: "Frontend development discussions",
    type: "group",
    avatar: "💻",
    lastMessage: "New React 19 features are amazing!",
    lastMessageTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
    lastMessageSender: "David Wilson",
    unreadCount: 2500,
    participants: [currentUser?.id, "alice_mock", "bob_mock", "david_mock"].filter(Boolean),
  },
  {
    id: "group_design_team",
    name: "Design Team",
    description: "UI/UX design collaboration",
    type: "group",
    avatar: "🎨",
    lastMessage: "Please review the new mockups in Figma",
    lastMessageTime: new Date(Date.now() - 90 * 60 * 1000).toISOString(), // 1.5 hours ago
    lastMessageSender: "Emma Brown",
    unreadCount: 3,
    participants: [currentUser?.id, "emma_mock", "grace_mock", "frank_mock"].filter(Boolean),
  },
  {
    id: "group_project_alpha",
    name: "Project Alpha",
    description: "Alpha project coordination",
    type: "group",
    avatar: "🚀",
    lastMessage: "Sprint review meeting at 3 PM today",
    lastMessageTime: new Date(new Date().setHours(14, 15, 0, 0)).toISOString(), // Today at 2:15 PM
    lastMessageSender: "Henry Taylor",
    unreadCount: 0,
    participants: [currentUser?.id, "henry_mock", "ivy_mock", "jack_mock"].filter(Boolean),
  },
  {
    id: "group_coffee_chat",
    name: "Coffee Chat ☕",
    description: "Casual conversations and coffee breaks",
    type: "group",
    avatar: "☕",
    lastMessage: "Anyone free for a coffee break?",
    lastMessageTime: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), // Yesterday (1.5 days ago)
    lastMessageSender: "Grace Lee",
    unreadCount: 1,
    participants: [currentUser?.id, "alice_mock", "bob_mock", "carol_mock", "grace_mock"].filter(Boolean),
  },
  {
    id: "group_tech_news",
    name: "Tech News 📱",
    description: "Latest technology updates and discussions",
    type: "group",
    avatar: "📱",
    lastMessage: "Did you see the new AI announcements?",
    lastMessageTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago (this week)
    lastMessageSender: "Jack Anderson",
    unreadCount: 850,
    participants: [currentUser?.id, "david_mock", "frank_mock", "henry_mock", "jack_mock"].filter(Boolean),
  },
  {
    id: "group_book_club",
    name: "Book Club 📚",
    description: "Monthly book discussions and recommendations",
    type: "group",
    avatar: "📚",
    lastMessage: "Next book: Clean Architecture by Robert Martin",
    lastMessageTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago (last week)
    lastMessageSender: "Carol Davis",
    unreadCount: 2,
    participants: [currentUser?.id, "carol_mock", "david_mock", "emma_mock"].filter(Boolean),
  },
  {
    id: "group_gaming_squad",
    name: "Gaming Squad 🎮",
    description: "After-work gaming sessions and tournaments",
    type: "group",
    avatar: "🎮",
    lastMessage: "Raid tonight at 8 PM? Who's in?",
    lastMessageTime: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago (2 weeks ago)
    lastMessageSender: "Frank Miller",
    unreadCount: 0,
    participants: [currentUser?.id, "bob_mock", "frank_mock", "grace_mock"].filter(Boolean),
  },
  {
    id: "group_workout_buddies",
    name: "Workout Buddies 💪",
    description: "Fitness motivation and workout planning",
    type: "group",
    avatar: "💪",
    lastMessage: "Great gym session today! Thanks for pushing me 💪",
    lastMessageTime: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago (1.5 months ago)
    lastMessageSender: "Alice Johnson",
    unreadCount: 1,
    participants: [currentUser?.id, "alice_mock", "emma_mock", "frank_mock"].filter(Boolean),
  },
  {
    id: "group_travel_plans",
    name: "Travel Plans ✈️",
    description: "Trip planning and travel experiences",
    type: "group",
    avatar: "✈️",
    lastMessage: "Japan trip photos are finally uploaded!",
    lastMessageTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago (3 months ago)
    lastMessageSender: "Emma Brown",
    unreadCount: 0,
    participants: [currentUser?.id, "alice_mock", "carol_mock", "emma_mock", "grace_mock"].filter(Boolean),
  },
  {
    id: "group_old_school_friends",
    name: "Old School Friends 🎓",
    description: "Keeping in touch with university friends",
    type: "group",
    avatar: "🎓",
    lastMessage: "Happy New Year everyone! 🎉",
    lastMessageTime: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year ago
    lastMessageSender: "David Wilson",
    unreadCount: 3,
    participants: [currentUser?.id, "alice_mock", "bob_mock", "carol_mock", "david_mock"].filter(Boolean),
  },
  {
    id: "group_class_of_2020",
    name: "Class of 2020 🎓",
    description: "High school graduation class reunion group",
    type: "group",
    avatar: "🎓",
    lastMessage: "Can't believe it's been 4 years since graduation!",
    lastMessageTime: new Date(Date.now() - 450 * 24 * 60 * 60 * 1000).toISOString(), // 1.2 years ago
    lastMessageSender: "Sarah Kim",
    unreadCount: 1200,
    participants: [currentUser?.id, "alice_mock", "bob_mock", "carol_mock", "emma_mock"].filter(Boolean),
  },
  {
    id: "group_startup_team",
    name: "Startup Team 🚀",
    description: "Old startup team from 2022",
    type: "group",
    avatar: "🚀",
    lastMessage: "Thanks for the amazing journey everyone!",
    lastMessageTime: new Date(Date.now() - 600 * 24 * 60 * 60 * 1000).toISOString(), // 1.6 years ago
    lastMessageSender: "Alex Chen",
    unreadCount: 0,
    participants: [currentUser?.id, "alex_mock", "bob_mock", "carol_mock", "frank_mock"].filter(Boolean),
  },
];

// Generate all mock rooms
export const generateMockRooms = (currentUser) => {
  const mockPrivateRooms = generateMockPrivateRooms(currentUser);
  const mockGroupRooms = generateMockGroupRooms(currentUser);
  return [...mockPrivateRooms, ...mockGroupRooms];
};

// Storage helpers
export const addMockRoomsToStorage = (mockRooms) => {
  const existingRooms = JSON.parse(localStorage.getItem("customRooms") || "[]");
  const existingIds = existingRooms.map(room => room.id);
  const newRooms = mockRooms.filter(room => !existingIds.includes(room.id));
  
  if (newRooms.length > 0) {
    localStorage.setItem("customRooms", JSON.stringify([...existingRooms, ...newRooms]));
  }
  
  return newRooms;
};

export const removeMockRoomsFromStorage = () => {
  const existingRooms = JSON.parse(localStorage.getItem("customRooms") || "[]");
  const filteredRooms = existingRooms.filter(room => !MOCK_ROOM_IDS.includes(room.id));
  localStorage.setItem("customRooms", JSON.stringify(filteredRooms));
  return filteredRooms;
};

// Mock Management Class
export class MockManager {
  static generateAndAddMockRooms(currentUser, setCustomRooms) {
    const mockRooms = generateMockRooms(currentUser);
    
    // Add to state, avoiding duplicates
    setCustomRooms((prev) => {
      const existingIds = prev.map(room => room.id);
      const newRooms = mockRooms.filter(room => !existingIds.includes(room.id));
      return [...prev, ...newRooms];
    });

    // Store in localStorage
    const newRooms = addMockRoomsToStorage(mockRooms);
    
    const privateCount = mockRooms.filter(room => room.type === 'private').length;
    const groupCount = mockRooms.filter(room => room.type === 'group').length;
    
    return { privateCount, groupCount, newRoomsAdded: newRooms.length };
  }

  static removeMockRooms(setCustomRooms) {
    // Remove from state
    setCustomRooms((prev) => prev.filter(room => !MOCK_ROOM_IDS.includes(room.id)));

    // Remove from localStorage
    removeMockRoomsFromStorage();
    
    return { removedCount: MOCK_ROOM_IDS.length };
  }

  static clearAllRooms(setCustomRooms) {
    // Clear all rooms from state
    setCustomRooms([]);
    
    // Clear localStorage
    localStorage.removeItem("customRooms");
    
    return { clearedAll: true };
  }

  static getMockRoomIds() {
    return MOCK_ROOM_IDS;
  }
}