import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@mui/material";
function App() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
    }
  }, [currentUser, navigate]);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <div>
      Hello, {currentUser.username}
      <Button onClick={handleLogout}>Logout</Button>
    </div>
  );
}

export default App;
