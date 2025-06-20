import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Home from "./pages/Home.jsx";
import ChatDashboard from "./pages/ChatDashboard.jsx";
import { ChatProvider } from "./contexts/ChatContext.jsx";

function App() {
  return (
    <div className="app">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/chat"
            element={
              <ChatProvider>
                <ChatDashboard />
              </ChatProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
