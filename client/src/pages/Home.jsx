import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@mui/material";
import ResponsiveAppBar from "../components/layout/AppBar.jsx";

const Home = () => {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Check if user is logged in, if not redirect to login page
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleGoToChat = () => {
    navigate("/chat");
  };

  if (!currentUser) {
    return null;
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <ResponsiveAppBar currentUser={currentUser} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "20px",
        }}
      >
        <h1>Welcome to Chat Room App</h1>
        <p>Hello, {currentUser.username}!</p>
        <Button
          variant="contained"
          color="primary"
          onClick={handleGoToChat}
          style={{ marginTop: "20px" }}
        >
          Enter Chat Room
        </Button>
      </div>
    </div>
  );
};

export default Home;
