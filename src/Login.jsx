import { toast } from "react-toastify";
import { TextField, Container, Button } from "@mui/material";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
function Login() {
  const [username, setUsername] = useState("");

  const handleLogin = () => {
    if (!username.trim()) {
      toast.error("Please enter a valid username");
      return;
    }

    let users;

    try {
      users = JSON.parse(localStorage.getItem("users")) ?? [];
    } catch (error) {
      console.error("Failed to parse users from localStorage", error);
      users = [];
    }

    const existingUser = users?.find((user) => user.username === username);
    if (existingUser) {
      toast.success("Login successful");
      return;
    }

    const newUser = {
      id: uuidv4(),
      username: username,
      online: true,
      lastSeen: Date.now().toString(),
      chatRooms: [],
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    toast.success("Login successful");
  };

  return (
    <>
      <Container
        maxWidth="lg"
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TextField
          id="outlined-basic"
          label="Username"
          variant="outlined"
          margin="normal"
          size="small"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Button variant="contained" onClick={handleLogin}>
          Login
        </Button>
      </Container>
    </>
  );
}

export default Login;
