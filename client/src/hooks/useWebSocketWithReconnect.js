import React, { useState, useCallback } from "react";

const useWebSocketWithReconnect = (currentUser) => {
  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (reconnectAttempts >= maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    // WebSocket 連接邏輯
    // ...
  }, [reconnectAttempts]);

  // 自動重連邏輯
  // ...
};

export default useWebSocketWithReconnect;
