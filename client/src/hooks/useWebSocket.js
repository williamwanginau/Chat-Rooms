import { useState, useEffect, useRef } from "react";
import MESSAGE_TYPES from "../../../shared/messageTypes.json";

const useWebSocket = (currentUser, initialRoomId = null) => {
  const [messages, setMessages] = useState([]);
  const [roomUsers, setRoomUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const wsRef = useRef(null);
  const [isUserInfoSent, setIsUserInfoSent] = useState(false);

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
      
      // Clear typing users when changing rooms
      setTypingUsers([]);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    
    // Avoid duplicate connections
    if (wsRef.current && wsRef.current.readyState !== WebSocket.CLOSED) {
      return;
    }

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
      
      setIsUserInfoSent(true);
      
      // Join initial room if provided
      if (initialRoomId) {
        setTimeout(() => {
          const roomChangeMessage = buildRoomChangeMessage(initialRoomId, currentUser);
          wsRef.current.send(JSON.stringify(roomChangeMessage));
        }, 100); // Small delay to ensure userInfo is processed
      }
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
        case MESSAGE_TYPES.TYPING_START:
          setTypingUsers((prevTyping) => {
            const userName = messageData.user.name || messageData.user.username;
            if (!prevTyping.includes(userName)) {
              return [...prevTyping, userName];
            }
            return prevTyping;
          });
          break;
        case MESSAGE_TYPES.TYPING_STOP:
          setTypingUsers((prevTyping) => {
            const userName = messageData.user.name || messageData.user.username;
            return prevTyping.filter((name) => name !== userName);
          });
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
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.close();
      }
    };
  }, [currentUser, initialRoomId]);

  return {
    messages,
    setMessages,
    roomUsers,
    typingUsers,
    sendMessage,
    joinRoom,
    isConnected: wsRef.current?.readyState === WebSocket.OPEN,
  };
};

export default useWebSocket;