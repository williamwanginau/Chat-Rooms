import { useChatContext } from "../contexts/ChatContext";
import VerticalNavigation from "../components/layout/VerticalNavigation";
import ContentPanel from "../components/sidebar/ContentPanel";
import ChatContainer from "../components/chat/ChatContainer";
import DevFunctions from "../components/layout/DevFunctions";
import "./ChatDashboard.scss";

const ChatDashboard = () => {
  const { currentUser } = useChatContext();

  // 如果沒有用戶，顯示載入中
  if (!currentUser) {
    return (
      <div className="chat-loading">
        <div className="chat-loading__content">
          <div className="chat-loading__spinner">⏳</div>
          <p>Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chat">
      <VerticalNavigation />
      <ContentPanel />
      <ChatContainer />
      {import.meta.env.DEV && <DevFunctions />}
    </div>
  );
};

export default ChatDashboard;
