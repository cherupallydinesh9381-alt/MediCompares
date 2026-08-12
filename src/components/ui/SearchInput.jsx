import React from "react";

const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  showClearButton = true,
  showSuggestions = false,
  suggestions = [],
  className = "",
  icon = "fas fa-search",
  onClear,
  ...props
}) => {
  const handleClear = () => {
    if (onClear) {
      onClear();
    } else {
      onChange({ target: { value: "" } });
    }
  };

  return (
    <div className={`surgery-search-container ${className}`}>
      <div className="surgery-search-wrapper">
        <div className="surgery-search-icon">
          <i className={icon}></i>
        </div>
        <input
          type="text"
          className="surgery-search-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
        {showClearButton && value && (
          <button
            className="surgery-search-clear"
            onClick={handleClear}
            aria-label="Clear search"
            type="button"
          >
            <i className="fas fa-times"></i>
          </button>
        )}
        {showSuggestions && suggestions.length > 0 && (
          <div className="surgery-search-suggestions">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="surgery-search-suggestion-item"
                onClick={() => onChange({ target: { value: suggestion } })}
              >
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchInput;

