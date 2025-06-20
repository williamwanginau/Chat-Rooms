import { useState, useEffect, useRef } from "react";
import {
  getRoomDisplayName,
  updateRoomCustomName,
} from "../utils/roomSettings";

export const useRoomNameEditor = (
  selectedRoom,
  currentUser,
  onRoomSettingsUpdated
) => {
  const [isEditingRoomName, setIsEditingRoomName] = useState(false);
  const [editRoomNameValue, setEditRoomNameValue] = useState("");
  const roomNameInputRef = useRef(null);

  // 當開始編輯時聚焦輸入框
  useEffect(() => {
    if (isEditingRoomName && roomNameInputRef.current) {
      roomNameInputRef.current.focus();
      roomNameInputRef.current.select();
    }
  }, [isEditingRoomName]);

  const startEditingRoomName = () => {
    if (!selectedRoom || !currentUser) return;
    const currentName = getRoomDisplayName(selectedRoom, currentUser);
    setEditRoomNameValue(currentName);
    setIsEditingRoomName(true);
  };

  const saveRoomNameEdit = () => {
    if (!selectedRoom || !currentUser) return;
    const trimmedValue = editRoomNameValue.trim();
    if (trimmedValue !== "") {
      updateRoomCustomName(currentUser.id, selectedRoom.id, trimmedValue);
      onRoomSettingsUpdated?.(selectedRoom.id);
    }
    setIsEditingRoomName(false);
  };

  const cancelRoomNameEdit = () => {
    setIsEditingRoomName(false);
    setEditRoomNameValue("");
  };

  const handleRoomNameKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveRoomNameEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      cancelRoomNameEdit();
    }
  };

  return {
    isEditingRoomName,
    editRoomNameValue,
    setEditRoomNameValue,
    roomNameInputRef,
    startEditingRoomName,
    saveRoomNameEdit,
    cancelRoomNameEdit,
    handleRoomNameKeyDown,
  };
};
