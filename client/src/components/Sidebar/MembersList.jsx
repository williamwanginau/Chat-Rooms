import React from "react";
import "./MembersList.css";

// 生成随机颜色的函数
const getRandomColor = (userId) => {
  // 使用用户ID作为种子生成固定颜色，这样同一用户总是有相同颜色
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#FFA07A",
    "#98D8C8",
    "#F06292",
    "#7986CB",
    "#9575CD",
    "#64B5F6",
    "#4DB6AC",
    "#81C784",
    "#FFD54F",
  ];

  // 简单的哈希函数将userId转换为数字
  const hash = userId
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// 在线状态指示器
const StatusIndicator = ({ isOnline }) => (
  <span
    className={`status-indicator ${isOnline ? "online" : "offline"}`}
  ></span>
);

// 用户头像组件
const UserAvatar = ({ user }) => {
  const bgColor = getRandomColor(user.id);
  const initials = user.name ? user.name.charAt(0).toUpperCase() : "?";

  return (
    <div className="user-avatar" style={{ backgroundColor: bgColor }}>
      {initials}
    </div>
  );
};

const MembersList = ({ members = [], currentUserId }) => {
  // 计算成员总数
  const totalMembers = members.length;

  return (
    <div className="members-list-container">
      <div className="members-list-header">
        <h3>所有成员 ({totalMembers})</h3>
      </div>

      <div className="members-list">
        {members.map((member) => (
          <div key={member.id} className="member-item">
            <UserAvatar user={member} />
            <div className="member-details">
              <span className="member-name">
                {member.name}
                {member.id === currentUserId && (
                  <span className="current-user-indicator"> (Me)</span>
                )}
              </span>
            </div>
            <StatusIndicator isOnline={true} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default MembersList;
