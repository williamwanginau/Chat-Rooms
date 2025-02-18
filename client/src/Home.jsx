import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
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
  const [currentRoomId, setCurrentRoomId] = useState("sport");

  const wsRef = useRef(null);

  const handleRoomSelect = useCallback(
    (roomId) => {
      if (currentRoomId === roomId) return;
      setCurrentRoomId(roomId);
      setMessages([]);
    },
    [currentRoomId]
  );

  useEffect(() => {
    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("Connected to server");

      if (currentRoomId) {
        const joinMessage = buildRoomChangeMessage(currentRoomId, currentUser);
        ws.send(JSON.stringify(joinMessage));
      }
    };

    ws.onmessage = (event) => {
      const messageData = JSON.parse(event.data);

      if (messageData.type === "history") {
        setMessages(messageData.messages);
      } else {
        setMessages((prevMessages) => [...prevMessages, messageData]);
      }
    };

    ws.onclose = () => {
      console.log("Disconnected from server");
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    return () => {
      ws.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("WebSocket is not open");
      return;
    }

    if (ws.readyState === WebSocket.OPEN) {
      const joinMessage = buildRoomChangeMessage(currentRoomId, currentUser);
      ws.send(JSON.stringify(joinMessage));
    }
  }, [currentRoomId, currentUser]);

  const handleSendMessage = (e) => {
    const text = e.target.value;
    if (text.trim() === "") return;

    const ws = wsRef.current;
    if (!ws || ws.readyState !== WebSocket.OPEN) {
      console.log("WebSocket is not open");
      return;
    }

    const message = buildMessage(text, currentUser, currentRoomId);

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

function buildRoomChangeMessage(roomId, user) {
  return {
    messageId: uuidv4(),
    type: "ROOM_CHANGE",
    sender: {
      id: user.id,
      name: user.username,
    },
    room: {
      id: roomId,
      type: "group",
    },
    clientTimestamp: new Date().toISOString(),
  };
}

function buildMessage(text, user, roomId) {
  return {
    messageId: uuidv4(),
    message: text,
    sender: user,
    clientTimestamp: new Date().toISOString(),
    status: "sent",
    room: {
      id: roomId,
      type: "group",
    },
    metadata: {
      device: navigator.userAgent,
      clientVersion: "1.0.0",
    },
    type: "message",
  };
}

export default Home;
