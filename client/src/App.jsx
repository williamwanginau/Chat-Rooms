import { BrowserRouter, Routes, Route } from "react-router-dom";
import Chat from "./pages/Chat/ChatPage.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";

function App() {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
