import PropTypes from "prop-types";
import { useState } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Divider,
} from "@mui/material";

const DEFAULT_ROOMS = [
  { id: "sport", name: "Sports Room", description: "Discuss sports events" },
  {
    id: "finance",
    name: "Finance Room",
    description: "Share investment topics",
  },
  {
    id: "tech",
    name: "Tech Room",
    description: "Explore latest tech trends",
  },
];

const RoomList = ({ onRoomSelect, currentRoomId }) => {
  const [customRoomId, setCustomRoomId] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const handleRoomSelect = (roomId) => {
    onRoomSelect(roomId);
  };

  const handleCustomRoomSubmit = () => {
    if (customRoomId.trim()) {
      onRoomSelect(customRoomId.trim());
      setCustomRoomId("");
      setOpenDialog(false);
    }
  };

  return (
    <div className="room-list">
      <List>
        {DEFAULT_ROOMS.map((room) => (
          <ListItem key={room.id} disablePadding>
            <ListItemButton
              selected={currentRoomId === room.id}
              onClick={() => handleRoomSelect(room.id)}
            >
              <ListItemText primary={room.name} secondary={room.description} />
            </ListItemButton>
          </ListItem>
        ))}
        <Divider />
        <ListItem disablePadding>
          <ListItemButton onClick={() => setOpenDialog(true)}>
            <ListItemText primary="Join Custom Room" />
          </ListItemButton>
        </ListItem>
      </List>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Join Custom Room</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Room Code"
            fullWidth
            value={customRoomId}
            onChange={(e) => setCustomRoomId(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCustomRoomSubmit}>Join</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

RoomList.propTypes = {
  onRoomSelect: PropTypes.func.isRequired,
  currentRoomId: PropTypes.string,
};

export default RoomList;
