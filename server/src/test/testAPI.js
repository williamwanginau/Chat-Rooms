const axios = require("axios");

const API_BASE = "http://localhost:3001/api/v2";
const USER_ID = "testUser123";

// 設定預設 headers
axios.defaults.headers.common["X-User-Id"] = USER_ID;

async function testAPI() {
  console.log("🧪 開始測試 API...\n");

  try {
    // 1. 建立房間
    console.log("📝 測試 1: 建立房間");
    const createResponse = await axios.post(`${API_BASE}/rooms`, {
      name: "測試聊天室",
      type: "group",
      participants: [USER_ID, "user456", "user789"],
      description: "這是一個測試聊天室",
      avatar: "🧪",
    });
    const roomId = createResponse.data.room.id;
    console.log("✅ 房間建立成功:", roomId);

    // 2. 獲取房間列表
    console.log("\n📝 測試 2: 獲取房間列表");
    const roomsResponse = await axios.get(`${API_BASE}/rooms`);
    console.log("✅ 房間數量:", roomsResponse.data.rooms.length);

    // 3. 更新房間設定
    console.log("\n📝 測試 3: 更新房間設定");
    const settingsResponse = await axios.put(
      `${API_BASE}/rooms/${roomId}/settings`,
      {
        customName: "我的測試房間",
        customAvatar: "🚀",
        isPinned: true,
      }
    );
    console.log("✅ 設定更新成功:", settingsResponse.data.settings);

    // 4. 發送訊息
    console.log("\n📝 測試 4: 發送訊息");
    const messageResponse = await axios.post(
      `${API_BASE}/rooms/${roomId}/messages`,
      {
        content: "這是一個測試訊息",
        senderId: USER_ID,
        senderName: "Test User",
      }
    );
    console.log("✅ 訊息已發送:", messageResponse.data.message.id);

    console.log("\n🎉 所有測試通過！");
  } catch (error) {
    console.error("❌ 測試失敗:", error);
  }
}

// 執行測試
testAPI();
