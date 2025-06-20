import PropTypes from "prop-types";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { useChatContext } from "../../contexts/ChatContext";
import "./VerticalNavigation.scss";

const VerticalNavigation = () => {
  const { activeSection, handleSectionChange, unreadCounts } = useChatContext();

  const sections = [
    {
      id: "friends",
      icon: <PersonOutlineIcon />,
      label: "Friends",
      badge: unreadCounts?.friends || 0,
    },
    {
      id: "rooms",
      icon: <ChatBubbleOutlineIcon />,
      label: "Chat Rooms",
      badge: unreadCounts?.rooms || 0,
    },
    {
      id: "invitations",
      icon: <PersonAddAltIcon />,
      label: "Add Friend",
      badge: unreadCounts?.invitations || 0,
    },
  ];

  return (
    <nav className="vertical-navigation">
      {sections.map((section) => (
        <button
          key={section.id}
          className={`vertical-navigation__item ${
            activeSection === section.id
              ? "vertical-navigation__item--active"
              : ""
          }`}
          onClick={() => handleSectionChange(section.id)}
          title={section.label}
          aria-label={section.label}
        >
          <div className="vertical-navigation__icon">{section.icon}</div>
          {section.badge > 0 && (
            <span className="vertical-navigation__badge">{section.badge}</span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default VerticalNavigation;
