import {
  Button,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import { useState } from "react";

const DevSidebar = () => {
  const [open, setOpen] = useState(false);
  const toggleDrawer = () => setOpen((isOpen) => !isOpen);
  const handleButtonClick = (text) => {
    if (text === "Add Dummy Users") {
      handleAddDummyUsers();
    } else if (text === "Delete Dummy Users") {
      handleDeleteDummyUsers();
    }
  };

  const handleAddDummyUsers = async () => {
    try {
      const res = await fetch("./../dummyData/users.json");
      const users = await res.json();
      localStorage.setItem("users", JSON.stringify(users));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteDummyUsers = () => {
    localStorage.removeItem("users");
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer}>
      <List>
        {["Add Dummy Users", "Delete Dummy Users"].map((text) => (
          <ListItem key={text} disablePadding>
            <ListItemButton
              onClick={() => {
                handleButtonClick(text);
              }}
            >
              <ListItemText primary={text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
    </Box>
  );

  if (import.meta.env.DEV) {
    return (
      <>
        <Drawer anchor="left" open={open} onClose={toggleDrawer}>
          {DrawerList}
        </Drawer>
        <Button
          style={{
            position: "absolute",
            bottom: "10px",
            right: "10px",
          }}
          onClick={toggleDrawer}
        >
          Dev funcs
        </Button>
      </>
    );
  }
};

export default DevSidebar;
