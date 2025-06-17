// 前端好友管理工具函數

// 建立好友關係（雙向）
export const createFriendship = (user1Id, user2Id, initiatedBy) => {
  try {
    // 1. 載入現有資料
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const friendships = JSON.parse(localStorage.getItem("friendships") || "[]");

    // 2. 檢查是否已經是好友
    const existingFriendship = friendships.find(f =>
      (f.user1 === user1Id && f.user2 === user2Id) ||
      (f.user1 === user2Id && f.user2 === user1Id)
    );

    if (existingFriendship) {
      console.log('Friendship already exists');
      return false;
    }

    // 3. 建立好友關係詳情
    const friendship = {
      id: `friendship_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user1: user1Id,
      user2: user2Id,
      createdAt: new Date().toISOString(),
      initiatedBy: initiatedBy,
      status: 'active'
    };

    // 4. 更新用戶的好友列表
    const user1 = users.find(u => u.id === user1Id);
    const user2 = users.find(u => u.id === user2Id);

    if (!user1 || !user2) {
      console.error('One or both users not found');
      return false;
    }

    // 初始化 friends 陣列如果不存在
    if (!user1.friends) user1.friends = [];
    if (!user2.friends) user2.friends = [];

    // 添加彼此為好友
    if (!user1.friends.includes(user2Id)) {
      user1.friends.push(user2Id);
    }
    if (!user2.friends.includes(user1Id)) {
      user2.friends.push(user1Id);
    }

    // 5. 儲存資料到 localStorage
    friendships.push(friendship);
    localStorage.setItem("friendships", JSON.stringify(friendships));
    localStorage.setItem("users", JSON.stringify(users));

    // 6. 觸發自定義事件通知其他組件
    window.dispatchEvent(new CustomEvent('friendshipCreated', {
      detail: { friendship, user1, user2 }
    }));

    console.log(`Friendship created between ${user1.name} and ${user2.name}`);
    return friendship;

  } catch (error) {
    console.error('Error creating friendship:', error);
    return false;
  }
};

// 獲取用戶的所有好友ID
export const getUserFriends = (userId) => {
  try {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const user = users.find(u => u.id === userId);
    return user?.friends || [];
  } catch (error) {
    console.error('Error getting user friends:', error);
    return [];
  }
};

// 獲取用戶的好友完整資訊
export const getUserFriendsInfo = (userId) => {
  try {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const friendIds = getUserFriends(userId);
    
    return friendIds.map(friendId => {
      const friend = users.find(u => u.id === friendId);
      if (!friend) {
        console.warn(`Friend with ID ${friendId} not found in users list`);
        return null;
      }
      return friend;
    }).filter(Boolean); // 過濾掉找不到的用戶
  } catch (error) {
    console.error('Error getting user friends info:', error);
    return [];
  }
};

// 檢查兩個用戶是否為好友
export const areFriends = (user1Id, user2Id) => {
  try {
    const friendIds = getUserFriends(user1Id);
    return friendIds.includes(user2Id);
  } catch (error) {
    console.error('Error checking friendship:', error);
    return false;
  }
};

// 獲取好友關係詳情
export const getFriendshipDetails = (user1Id, user2Id) => {
  try {
    const friendships = JSON.parse(localStorage.getItem("friendships") || "[]");
    return friendships.find(f =>
      (f.user1 === user1Id && f.user2 === user2Id) ||
      (f.user1 === user2Id && f.user2 === user1Id)
    );
  } catch (error) {
    console.error('Error getting friendship details:', error);
    return null;
  }
};

// 移除好友關係
export const removeFriendship = (user1Id, user2Id) => {
  try {
    // 1. 載入現有資料
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const friendships = JSON.parse(localStorage.getItem("friendships") || "[]");

    // 2. 從好友關係表中移除
    const updatedFriendships = friendships.filter(f =>
      !((f.user1 === user1Id && f.user2 === user2Id) ||
        (f.user1 === user2Id && f.user2 === user1Id))
    );

    // 3. 從用戶好友列表中移除
    const user1 = users.find(u => u.internalId === user1Id);
    const user2 = users.find(u => u.internalId === user2Id);

    if (user1?.friends) {
      user1.friends = user1.friends.filter(id => id !== user2Id);
    }
    if (user2?.friends) {
      user2.friends = user2.friends.filter(id => id !== user1Id);
    }

    // 4. 儲存更新的資料
    localStorage.setItem("friendships", JSON.stringify(updatedFriendships));
    localStorage.setItem("users", JSON.stringify(users));

    // 5. 觸發事件
    window.dispatchEvent(new CustomEvent('friendshipRemoved', {
      detail: { user1Id, user2Id }
    }));

    console.log(`Friendship removed between ${user1Id} and ${user2Id}`);
    return true;

  } catch (error) {
    console.error('Error removing friendship:', error);
    return false;
  }
};

// 獲取所有好友關係
export const getAllFriendships = () => {
  try {
    return JSON.parse(localStorage.getItem("friendships") || "[]");
  } catch (error) {
    console.error('Error getting all friendships:', error);
    return [];
  }
};