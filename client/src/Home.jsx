import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { TextField } from "@mui/material";
import ResponsiveAppBar from "./AppBar.jsx";
import MessageList from "./MessageList.jsx";
import { v4 as uuidv4 } from "uuid";
const WS_URL = import.meta.env.VITE_WS_URL;

const Home = () => {
  const navigate = useNavigate();
  console.log(import.meta.env.VITE_WS_URL);
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const ws = useMemo(() => new WebSocket(WS_URL), []);

  useEffect(() => {
    ws.onopen = () => {
      console.log("Connected to server");
    };

    ws.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      console.log(messageData);
    };
  }, [ws]);

  const handleSendMessage = (e) => {
    const message = {
      messageId: uuidv4(),
      sender: currentUser.id,
      message: e.target.value,
      timestamp: new Date().toISOString(),
      type: "text",
    };
    ws.send(JSON.stringify(message));
  };

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  return (
    <div>
      <ResponsiveAppBar currentUser={currentUser} />
      <MessageList />
      <TextField
        id="outlined-multiline-static"
        label="Multiline"
        multiline
        rows={4}
        defaultValue="Default Value"
        style={{ height: "10vh", width: "100%" }}
        onKeyDown={handleSendMessage}
      />
    </div>
  );
};

export default Home;
