import { useState } from "react";
import {
  FaMicrophone,
  FaPaperclip,
  FaAt,
  FaSmile,
  FaPaperPlane,
} from "react-icons/fa";

import "./ChatComposer.scss";

export default function ChatComposer() {
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setMessage(e.target.value);
  };

  const handleSend = () => {
    if (message.trim()) {
      // 在這裡處理送出邏輯，例如呼叫 API
      console.log("Send message:", message);
      setMessage("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend();
    }
  };

  return (
    <div className="chat-composer">
      <input
        className="chat-composer__input"
        type="text"
        placeholder="Message General"
        value={message}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      <div className="chat-composer__icon-container">
        <FaMicrophone className="chat-composer__icon" />
        <FaPaperclip className="chat-composer__icon" />
        <FaAt className="chat-composer__icon" />
        <FaSmile className="chat-composer__icon" />
        <FaPaperPlane className="chat-composer__icon" onClick={handleSend} />
      </div>
    </div>
  );
}
