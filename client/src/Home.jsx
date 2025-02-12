import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState, useCallback } from "react";
import { TextField } from "@mui/material";
import ResponsiveAppBar from "./AppBar.jsx";
import MessageList from "./MessageList.jsx";
import { v4 as uuidv4 } from "uuid";
import RoomList from "./RoomList";
const WS_URL = import.meta.env.VITE_WS_URL;

const Home = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const [messages, setMessages] = useState([]);
  const [currentRoomId, setCurrentRoomId] = useState("sports");

  const ws = useMemo(() => new WebSocket(WS_URL), []);

  const handleRoomSelect = useCallback(
    (roomId) => {
      setCurrentRoomId(roomId);
      setMessages([]);

      const joinMessage = {
        messageId: uuidv4(),
        type: "join",
        sender: {
          id: currentUser.id,
          name: currentUser.username,
        },
        room: {
          id: currentRoomId,
          type: "group",
        },
        clientTimestamp: new Date().toISOString(),
      };

      ws.send(JSON.stringify(joinMessage));
    },
    [currentUser, ws, currentRoomId]
  );

  useEffect(() => {
    ws.onopen = () => {
      console.log("Connected to server");
      handleRoomSelect(currentRoomId);
    };

    ws.onmessage = (event) => {
      const messageData = JSON.parse(event.data);

      if (messageData.type === "history") {
        setMessages(messageData.messages);
      }

      if (messageData.type === "message") {
        setMessages((prevMessages) => [...prevMessages, messageData]);
      }
    };
  }, [ws, currentRoomId, currentUser, handleRoomSelect]);

  const handleSendMessage = (e) => {
    if (e.target.value.trim() === "") return;

    const message = {
      messageId: uuidv4(),
      sender: {
        id: currentUser.id,
        name: currentUser.username,
        avatar: currentUser.avatar || null,
      },
      message: e.target.value,
      clientTimestamp: new Date().toISOString(),
      status: "sent",
      room: {
        id: currentRoomId,
        type: "group",
      },
      metadata: {
        device: navigator.userAgent,
        clientVersion: "1.0.0",
      },
      type: "message",
    };

    e.target.value = "";

    ws.send(JSON.stringify(message));
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  return (
    <div style={{ display: "flex" }}>
      <div style={{ width: "250px", borderRight: "1px solid #ddd" }}>
        <RoomList
          onRoomSelect={handleRoomSelect}
          currentRoomId={currentRoomId}
        />
      </div>
      <div style={{ flex: 1 }}>
        <ResponsiveAppBar currentUser={currentUser} />
        <MessageList messages={messages} currentUser={currentUser} />
        <TextField
          id="outlined-multiline-static"
          label="Multiline"
          multiline
          rows={4}
          style={{ height: "10vh", width: "100%" }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.nativeEvent.isComposing) {
              e.preventDefault();
              handleSendMessage(e);
            }
          }}
        />
      </div>
    </div>
  );
};

export default Home;
