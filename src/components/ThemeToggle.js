import React from "react";

const ThemeToggle = ({ isDarkMode, toggleTheme }) => {
  return (
    <button 
      className="theme-toggle" 
      onClick={toggleTheme}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {isDarkMode ? '☀️' : '🌙'}
    </button>
  );
};

export default ThemeToggle;