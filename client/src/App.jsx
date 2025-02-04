import { BrowserRouter, Routes, Route } from "react-router-dom";
import DevSidebar from "./DevSidebar.jsx";

import Login from "./Login.jsx";
import Home from "./Home.jsx";

function App() {
  return (
    <div>
      <BrowserRouter>
        <DevSidebar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
