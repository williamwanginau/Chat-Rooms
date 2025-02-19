import { BrowserRouter, Routes, Route } from "react-router-dom";
import DevSidebar from "./DevSidebar.jsx";
import Chat from "./pages/Chat.jsx";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";

function App() {
  return (
    <div>
      <BrowserRouter>
        <DevSidebar />
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
