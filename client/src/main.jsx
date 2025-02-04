import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "./index.css";
import { ToastContainer } from "react-toastify";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ToastContainer
      position="bottom-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick={false}
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme="light"
    />
    <App />
  </StrictMode>
);
