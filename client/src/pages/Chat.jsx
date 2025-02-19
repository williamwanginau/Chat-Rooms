import PrimarySidebar from "../components/PrimarySidebar";
import MainContent from "../components/MainContent";
import SecondarySidebar from "../components/SecondarySidebar";
import GlobalHeader from "../layout/GlobalHeader";
import "./Chat.scss";

const Chat = () => {
  return (
    <div className="chat-container">
      <div className="chat-primary-sidebar">
        <PrimarySidebar />
      </div>
      <div className="chat-content">
        <div className="chat-header">
          <GlobalHeader />
        </div>
        <div className="chat-main-content-container">
          <div className="chat-main-content">
            <MainContent />
          </div>
          <div className="chat-secondary-sidebar">
            <SecondarySidebar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
