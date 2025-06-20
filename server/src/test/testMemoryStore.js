const memoryStore = require("../storage/memoryStore");

async function testMemoryStore() {
  console.log("🧪 開始測試 MemoryStore...\n");

  try {
    // 1. 測試建立房間
    console.log("📝 測試 1: 建立房間");
    const room1 = await memoryStore.createRoom({
      name: "Test Room 1",
      type: "group",
      participants: ["user1", "user2", "user3"],
      description: "測試房間 1",
      avatar: "🧪",
      createdBy: "user1",
    });
    console.log("✅ 房間建立成功:", room1.id);

    // 2. 測試獲取使用者房間
    console.log("\n📝 測試 2: 獲取使用者房間");
    const user1Rooms = await memoryStore.getUserRooms("user1");
    console.log("✅ user1 的房間數量:", user1Rooms.length);

    // 3. 測試更新房間設定
    console.log("\n📝 測試 3: 更新使用者房間設定");
    await memoryStore.updateUserRoomSettings("user1", room1.id, {
      customName: "我的測試房間",
      customAvatar: "🚀",
      isPinned: true,
    });
    const settings = await memoryStore.getUserRoomSettings("user1", room1.id);
    console.log("✅ 更新後的設定:", settings);

    // 4. 測試發送訊息
    console.log("\n📝 測試 4: 發送訊息");
    const message1 = await memoryStore.addMessage(room1.id, {
      content: "大家好！",
      senderId: "user1",
      senderName: "User One",
    });
    console.log("✅ 訊息已發送:", message1.id);

    // 5. 測試獲取訊息
    console.log("\n📝 測試 5: 獲取訊息");
    const messages = await memoryStore.getMessages(room1.id);
    console.log("✅ 房間訊息數量:", messages.length);

    // 6. 測試好友功能
    console.log("\n📝 測試 6: 新增好友");
    await memoryStore.addFriend("user1", "user2");
    const friends = await memoryStore.getFriends("user1");
    console.log("✅ user1 的好友:", friends);

    // 7. 測試匯出資料
    console.log("\n📝 測試 7: 匯出所有資料");
    const exportedData = await memoryStore.exportAllData();
    console.log("✅ 匯出的資料包含:", Object.keys(exportedData));

    console.log("\n🎉 所有測試通過！");
  } catch (error) {
    console.error("❌ 測試失敗:", error);
  }
}

// 執行測試
testMemoryStore();
