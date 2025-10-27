import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './DarkModeToggle.css';

/**
 * Dark Mode Toggle Component
 * Provides an accessible toggle button for switching between light and dark themes
 */
const DarkModeToggle = ({ className = '', size = 'medium' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  const handleToggle = () => {
    toggleTheme();
    
    // Announce theme change to screen readers
    const announcement = isDark ? 'Switched to light mode' : 'Switched to dark mode';
    const ariaLiveRegion = document.getElementById('theme-announcement');
    if (ariaLiveRegion) {
      ariaLiveRegion.textContent = announcement;
      // Clear the announcement after a short delay
      setTimeout(() => {
        ariaLiveRegion.textContent = '';
      }, 1000);
    }
  };

  const handleKeyDown = (event) => {
    // Handle Enter and Space key presses
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleToggle();
    }
  };

  return (
    <>
      <button
        className={`dark-mode-toggle ${size} ${className}`}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        aria-pressed={isDark}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        type="button"
      >
        <span className="toggle-icon" aria-hidden="true">
          {isDark ? (
            // Sun icon for light mode
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            // Moon icon for dark mode
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </span>
        <span className="toggle-text">
          {isDark ? 'Light' : 'Dark'}
        </span>
      </button>
      
      {/* Screen reader announcement region */}
      <div
        id="theme-announcement"
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />
    </>
  );
};

export default DarkModeToggle;

