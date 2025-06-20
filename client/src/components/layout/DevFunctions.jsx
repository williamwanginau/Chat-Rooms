import { useState, useEffect } from "react";
import { useChatContext } from "../../contexts/ChatContext";
import "./DevFunctions.scss";
import MESSAGE_TYPES from "../../../../shared/messageTypes.json";
import { MockManager } from "../../utils/mock";
import RoomManager from "../../utils/roomManager";

// All test utility functions are now integrated directly in this component

const DevFunctions = () => {
  const {
    setMessages,
    selectedRoomId,
    sendMessage,
    currentUser,
    setFriends,
    setReceivedInvitations,
    setSentInvitations,
    setCustomRooms,
    friends,
    refreshRooms,
    dataStats,
  } = useChatContext();

  // 自己管理 open/close 狀態
  const [isOpen, setIsOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [hasTestData, setHasTestData] = useState(false);
  const [hasMockRooms, setHasMockRooms] = useState(false);

  const togglePanel = () => {
    setIsOpen(!isOpen);
  };

  // 新增遷移功能
  const performMigration = () => {
    if (!currentUser?.id) {
      alert("Please login first");
      return;
    }

    try {
      if (RoomManager.needsMigration()) {
        const result = RoomManager.migrateFromLegacyFormat(currentUser.id);
        alert(`Migration completed! ${result.migrated} rooms migrated.`);
        refreshRooms(); // 重新整理房間列表
      } else {
        alert("No migration needed or already completed.");
      }
    } catch (error) {
      alert(`Migration failed: ${error.message}`);
    }
  };

  const showDataStats = () => {
    if (!currentUser?.id) {
      alert("Please login first");
      return;
    }

    const stats = RoomManager.getDataStats(currentUser.id);
    alert(`
Room Data Statistics:
- Total rooms: ${stats.totalRooms}
- User rooms: ${stats.userRoomsCount}  
- With settings: ${stats.userRoomsWithSettings}
- Needs migration: ${stats.needsMigration}

Storage Keys:
- Rooms: ${stats.storageKeys.rooms}
- User Rooms: ${stats.storageKeys.userRooms}
    `);
  };

  // Load users and current user from localStorage
  useEffect(() => {
    const loadUsers = () => {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const testDataExists =
        localStorage.getItem("testFriendsAndGroups") === "true";

      // Check if mock rooms exist
      const storedCustomRooms = JSON.parse(
        localStorage.getItem("customRooms") || "[]"
      );
      const mockRoomIds = [
        "private_alice_mock",
        "private_bob_mock",
        "private_carol_mock",
        "private_david_mock",
        "private_emma_mock",
        "private_frank_mock",
        "private_grace_mock",
        "group_frontend_team",
        "group_design_team",
        "group_project_alpha",
        "group_coffee_chat",
        "group_tech_news",
        "group_book_club",
        "group_gaming_squad",
        "group_workout_buddies",
        "group_travel_plans",
        "group_old_school_friends",
      ];
      const mockRoomsExist = mockRoomIds.some((id) =>
        storedCustomRooms.find((room) => room.id === id)
      );

      setAvailableUsers(users);
      setHasTestData(testDataExists);
      setHasMockRooms(mockRoomsExist);
    };

    loadUsers();
    if (isOpen) {
      loadUsers();
    }

    const handleStorageChange = (e) => {
      if (e.key === "users" || e.key === "currentUser") {
        loadUsers();
      }
    };

    const handleCustomStorageChange = (e) => {
      if (e.detail.key === "users" || e.detail.key === "currentUser") {
        loadUsers();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("localStorageUpdate", handleCustomStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "localStorageUpdate",
        handleCustomStorageChange
      );
    };
  }, [isOpen]);

  const handleSwitchUser = (selectedUser) => {
    localStorage.setItem("currentUser", JSON.stringify(selectedUser));

    window.dispatchEvent(
      new CustomEvent("localStorageUpdate", {
        detail: { key: "currentUser", newValue: JSON.stringify(selectedUser) },
      })
    );

    // Refresh page to apply user switch
    window.location.reload();
  };

  const clearAllData = () => {
    if (
      !confirm(
        "This will clear all chat records, friends, and invitation data. Are you sure you want to continue?"
      )
    ) {
      return;
    }

    try {
      // Clear friends and invitations
      localStorage.removeItem("friendships");
      localStorage.removeItem("sentInvitations");
      localStorage.removeItem("receivedInvitations");
      localStorage.removeItem("friends");

      // Clear users' friends lists
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const updatedUsers = users.map((user) => ({
        ...user,
        friends: [],
      }));
      localStorage.setItem("users", JSON.stringify(updatedUsers));

      // Clear messages and rooms
      setMessages([]);
      setFriends([]);
      setReceivedInvitations([]);
      setSentInvitations([]);
      setCustomRooms([]);

      window.dispatchEvent(new CustomEvent("friendshipsCleared"));
      alert("All data has been cleared");
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("Error occurred while clearing data");
    }
  };

  const handleGenerateMockRooms = () => {
    try {
      const result = MockManager.generateAndAddMockRooms(
        currentUser,
        setCustomRooms
      );
      setHasMockRooms(true);
      alert(
        `Generated ${result.privateCount} private chats and ${result.groupCount} group chats!`
      );
    } catch (error) {
      console.error("Error generating mock rooms:", error);
      alert("Error occurred while generating mock rooms");
    }
  };

  const handleRemoveMockRooms = () => {
    try {
      MockManager.removeMockRooms(setCustomRooms);
      setHasMockRooms(false);
      alert("Mock chat rooms removed!");
    } catch (error) {
      console.error("Error removing mock rooms:", error);
      alert("Error occurred while removing mock rooms");
    }
  };

  const toggleMockRooms = () => {
    if (hasMockRooms) {
      handleRemoveMockRooms();
    } else {
      handleGenerateMockRooms();
    }
  };

  return (
    <div className="dev-functions">
      {/* Toggle Button */}
      <button className="dev-functions__toggle" onClick={togglePanel}>
        🛠️ Dev Tools
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="dev-functions__panel">
          <div className="dev-functions__header">
            <h3>🛠️ Developer Functions</h3>
            <button
              className="dev-functions__close"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="dev-functions__content">
            {/* Room Management Section */}
            <div className="dev-functions__section">
              <h4>🏠 Room Management</h4>
              <button
                onClick={performMigration}
                className="dev-functions__button"
              >
                📦 Migrate to New Format
              </button>
              <button onClick={showDataStats} className="dev-functions__button">
                📊 Show Data Stats
              </button>
              <button onClick={refreshRooms} className="dev-functions__button">
                🔄 Refresh Rooms
              </button>
            </div>

            {/* Mock Data Section */}
            <div className="dev-functions__section">
              <h4>🎭 Mock Data</h4>
              <button
                onClick={toggleMockRooms}
                className={`dev-functions__button ${
                  hasMockRooms ? "dev-functions__button--success" : ""
                }`}
              >
                {hasMockRooms
                  ? "🗑️ Remove Mock Rooms"
                  : "🏠 Generate Mock Rooms"}
              </button>
              <div className="dev-functions__info">
                {hasMockRooms
                  ? "Mock rooms are currently loaded"
                  : "No mock rooms loaded"}
              </div>
            </div>

            {/* Debug Info */}
            {dataStats && import.meta.env.DEV && (
              <div className="dev-functions__section">
                <h4>📊 Debug Stats</h4>
                <div className="dev-functions__info">
                  <div>Total Rooms: {dataStats.totalRooms}</div>
                  <div>User Rooms: {dataStats.userRoomsCount}</div>
                  <div>
                    Needs Migration: {dataStats.needsMigration ? "Yes" : "No"}
                  </div>
                </div>
              </div>
            )}

            {/* User Management */}
            <div className="dev-functions__section">
              <h4>👤 User Management</h4>
              {availableUsers.length > 0 && (
                <div className="dev-functions__user-selector">
                  <label>Switch User:</label>
                  <select
                    className="dev-functions__select"
                    value={currentUser?.id || ""}
                    onChange={(e) => {
                      const selectedUser = availableUsers.find(
                        (user) => user.id === e.target.value
                      );
                      if (selectedUser) {
                        handleSwitchUser(selectedUser);
                      }
                    }}
                  >
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.username} ({user.name})
                      </option>
                    ))}
                  </select>
                  <div className="dev-functions__current-user">
                    Current: <strong>{currentUser?.username}</strong>
                  </div>
                </div>
              )}
              <button
                onClick={clearAllData}
                className="dev-functions__button dev-functions__button--danger"
              >
                🗑️ Clear All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DevFunctions;
