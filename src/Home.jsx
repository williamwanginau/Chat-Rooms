import { useNavigate } from "react-router-dom";

import { useEffect } from "react";
import { TextField } from "@mui/material";
import ResponsiveAppBar from "./AppBar.jsx";
import MessageList from "./MessageList.jsx";
import { v4 as uuidv4 } from "uuid";
const Home = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

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
        //按下enter時的處理
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            console.log(currentUser);
            const newMessage = {
              messageId: uuidv4(),
              sender: currentUser.id,
              message: e.target.value,
              timestamp: new Date().toISOString(),
              type: "text",
            };

            //將這個message加入localStorage
            const messages = JSON.parse(localStorage.getItem("messages")) || [];
            messages.push(newMessage);
            localStorage.setItem("messages", JSON.stringify(messages));
            console.log(newMessage);
          }
        }}
      />
    </div>
  );
};

export default Home;
