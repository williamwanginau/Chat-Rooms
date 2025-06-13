import { useState, useEffect, useRef } from "react";
import MESSAGE_TYPES from "../../../shared/messageTypes.json";

const useWebSocket = (currentUser) => {
  const [messages, setMessages] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const wsRef = useRef(null);

  const buildRoomChangeMessage = (roomId, user) => {
    return {
      type: MESSAGE_TYPES.ROOM_CHANGE,
      room: {
        id: roomId,
      },
      user: {
        id: user.id,
        name: user.username,
      },
      clientTimestamp: new Date().toISOString(),
    };
  };

  const sendMessage = (messageData) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(messageData));
    }
  };

  const joinRoom = (roomId) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const roomChangeMessage = buildRoomChangeMessage(roomId, currentUser);
      wsRef.current.send(JSON.stringify(roomChangeMessage));
    }
  };

  useEffect(() => {
    if (!currentUser) return;

    const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:8080";
    wsRef.current = new WebSocket(WS_URL);

    wsRef.current.onopen = () => {
      console.log("WebSocket connected successfully");

      wsRef.current.send(
        JSON.stringify({
          type: MESSAGE_TYPES.USER_INFO,
          user: currentUser,
        })
      );
    };

    wsRef.current.onmessage = (event) => {
      const messageData = JSON.parse(event.data);
      console.log("Received message:", messageData);

      switch (messageData.type) {
        case MESSAGE_TYPES.MESSAGE:
          setMessages((prevMessages) => [...prevMessages, messageData]);
          break;
        case MESSAGE_TYPES.ROOM_USERS:
          setRoomUsers(messageData.users);
          break;
        case MESSAGE_TYPES.USER_JOINED:
          setRoomUsers((prevUsers) => [...prevUsers, messageData.user]);
          break;
        case MESSAGE_TYPES.USER_LEFT:
          setRoomUsers((prevUsers) =>
            prevUsers.filter((user) => user.id !== messageData.user.id)
          );
          break;
        default:
          console.log("Unknown message type:", messageData.type);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    wsRef.current.onclose = () => {
      console.log("WebSocket connection closed");
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [currentUser]);

  return {
    messages,
    setMessages,
    roomUsers,
    sendMessage,
    joinRoom,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
};

export default useWebSocket;