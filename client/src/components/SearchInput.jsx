import { useState } from "react";
import PropTypes from "prop-types";
import "./SearchInput.scss";

const SearchInput = ({
  placeholder = "Search...",
  value = "",
  onChange,
  onSearch,
  onClear,
  showSearchButton = false,
  showClearButton = true,
  disabled = false,
  loading = false,
  icon = "search",
  className = "",
  size = "default",
}) => {
  const [focused, setFocused] = useState(false);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    if (onChange) {
      onChange(newValue);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && onSearch) {
      onSearch(value);
    }
  };

  const handleClear = () => {
    if (onChange) {
      onChange("");
    }
    if (onClear) {
      onClear();
    }
  };

  const handleSearchClick = () => {
    if (onSearch) {
      onSearch(value);
    }
  };

  return (
    <div className={`search-input search-input--${size} ${className} ${focused ? "search-input--focused" : ""}`}>
      <div className="search-input__container">
        <span className="material-icons search-input__icon">
          {icon}
        </span>
        
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled || loading}
          className="search-input__field"
        />

        {showClearButton && value && (
          <button
            type="button"
            onClick={handleClear}
            className="search-input__clear-btn"
            disabled={disabled || loading}
          >
            <span className="material-icons">close</span>
          </button>
        )}

        {showSearchButton && (
          <button
            type="button"
            onClick={handleSearchClick}
            disabled={disabled || loading || !value.trim()}
            className="search-input__search-btn"
          >
            {loading ? (
              <span className="material-icons search-input__loading">refresh</span>
            ) : (
              <span className="material-icons">search</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

SearchInput.propTypes = {
  placeholder: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  onClear: PropTypes.func,
  showSearchButton: PropTypes.bool,
  showClearButton: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.string,
  className: PropTypes.string,
  size: PropTypes.oneOf(["small", "default", "large"]),
};

export default SearchInput;