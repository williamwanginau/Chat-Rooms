import PropTypes from "prop-types";
import "./Badge.scss";

const Badge = ({ 
  count, 
  maxCount = 99, 
  variant = "default",
  size = "medium",
  className = "",
  customColor = null
}) => {
  if (!count || count <= 0) return null;

  const displayCount = count > maxCount ? `${maxCount}+` : count;

  const badgeStyle = customColor ? { backgroundColor: customColor } : {};

  return (
    <div 
      className={`badge badge--${variant} badge--${size} ${className}`}
      style={badgeStyle}
    >
      {displayCount}
    </div>
  );
};

Badge.propTypes = {
  count: PropTypes.number.isRequired,
  maxCount: PropTypes.number,
  variant: PropTypes.oneOf(["default", "primary", "secondary", "success", "warning", "error"]),
  size: PropTypes.oneOf(["small", "medium", "large"]),
  className: PropTypes.string,
  customColor: PropTypes.string,
};

export default Badge;