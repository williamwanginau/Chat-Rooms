import PropTypes from "prop-types";

const GlobalHeader = ({ className }) => {
  return <div className={className}>GlobalHeader</div>;
};

GlobalHeader.propTypes = {
  className: PropTypes.string,
};

export default GlobalHeader;
