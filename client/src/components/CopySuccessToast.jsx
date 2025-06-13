import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import "./CopySuccessToast.scss";

const CopySuccessToast = ({ message, isVisible, onHide }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  if (!isVisible) return null;

  return (
    <div className="copy-toast">
      <div className="copy-toast__content">
        <span className="copy-toast__icon">✓</span>
        <span className="copy-toast__message">{message}</span>
      </div>
    </div>
  );
};

CopySuccessToast.propTypes = {
  message: PropTypes.string.isRequired,
  isVisible: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
};

export default CopySuccessToast;