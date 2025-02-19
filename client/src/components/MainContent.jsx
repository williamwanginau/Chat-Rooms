import PropTypes from "prop-types";

const MainContent = ({ className }) => {
  return <div className={className}>MainContent</div>;
};

MainContent.propTypes = {
  className: PropTypes.string,
};

export default MainContent;
