/**
 * Format timestamp for display in UI components
 * @param {string|Date} timestamp - The timestamp to format
 * @returns {string} Formatted time string
 */
export const formatTimestamp = (timestamp) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;

  if (diff < 60000) return "Just now";

  if (diff < 3600000) {
    const minutes = Math.floor(diff / 60000);
    return `${minutes}m ago`;
  }

  if (date.toDateString() === now.toDateString()) {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  }

  const weekAgo = new Date(now);
  weekAgo.setDate(weekAgo.getDate() - 7);
  if (date > weekAgo) {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
  }

  return date.toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
  });
};

/**
 * Generate a consistent random color based on an ID
 * @param {string|number} id - The ID to generate color for
 * @returns {string} Hex color code
 */
export const getRandomColor = (id) => {
  const colors = [
    "#ff9800",
    "#9c27b0", 
    "#795548",
    "#2196f3",
    "#ffc107",
    "#4caf50",
    "#00bcd4",
    "#673ab7",
    "#ff5722",
    "#607d8b",
    "#e91e63",
    "#3f51b5",
  ];
  if (!id) return colors[0];
  const index =
    id
      .toString()
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  return colors[index];
};