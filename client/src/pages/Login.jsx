import { toast } from "react-toastify";
import { TextField, Container, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  useEffect(() => {
    if (currentUser) {
      navigate("/");
    }
  }, [currentUser, navigate]);

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

    const existingUser = users?.find((user) => user.name === username);
    if (existingUser) {
      localStorage.setItem("currentUser", JSON.stringify(existingUser));
      toast.success("Login successful");
      navigate("/");
      return;
    }

    const newUser = {
      id: uuidv4(),
      username: username, // Use the entered username
      name: username,
      online: true,
      lastSeen: Date.now().toString(),
      chatRooms: [],
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    navigate("/");
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
