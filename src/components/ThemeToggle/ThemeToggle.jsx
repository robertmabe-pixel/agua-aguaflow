import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { theme, toggleTheme, setThemePreference, getThemePreference } = useTheme();
  const [showDropdown, setShowDropdown] = useState(false);
  const currentPreference = getThemePreference();

  const handleToggle = () => {
    toggleTheme();
  };

  const handlePreferenceChange = (preference) => {
    setThemePreference(preference);
    setShowDropdown(false);
  };

  const getIcon = () => {
    if (theme === 'dark') {
      return '🌙';
    }
    return '☀️';
  };

  const getLabel = () => {
    if (currentPreference === 'system') {
      return `Auto (${theme === 'dark' ? 'Dark' : 'Light'})`;
    }
    return theme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <div className="theme-toggle-container">
      {/* Simple toggle button */}
      <button
        className="theme-toggle-button"
        onClick={handleToggle}
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        title={`Current: ${getLabel()}. Click to toggle.`}
      >
        <span className="theme-toggle-icon" aria-hidden="true">
          {getIcon()}
        </span>
        <span className="theme-toggle-label">
          {theme === 'dark' ? 'Dark' : 'Light'}
        </span>
      </button>

      {/* Advanced dropdown for theme preferences */}
      <div className="theme-toggle-dropdown-container">
        <button
          className="theme-toggle-dropdown-trigger"
          onClick={() => setShowDropdown(!showDropdown)}
          aria-label="Theme options"
          aria-expanded={showDropdown}
          aria-haspopup="true"
        >
          <span className="theme-toggle-chevron" aria-hidden="true">
            ⚙️
          </span>
        </button>

        {showDropdown && (
          <>
            <div 
              className="theme-toggle-backdrop"
              onClick={() => setShowDropdown(false)}
              aria-hidden="true"
            />
            <div className="theme-toggle-dropdown" role="menu">
              <button
                className={`theme-toggle-option ${currentPreference === 'light' ? 'active' : ''}`}
                onClick={() => handlePreferenceChange('light')}
                role="menuitem"
              >
                <span aria-hidden="true">☀️</span>
                Light
                {currentPreference === 'light' && <span className="checkmark">✓</span>}
              </button>
              
              <button
                className={`theme-toggle-option ${currentPreference === 'dark' ? 'active' : ''}`}
                onClick={() => handlePreferenceChange('dark')}
                role="menuitem"
              >
                <span aria-hidden="true">🌙</span>
                Dark
                {currentPreference === 'dark' && <span className="checkmark">✓</span>}
              </button>
              
              <button
                className={`theme-toggle-option ${currentPreference === 'system' ? 'active' : ''}`}
                onClick={() => handlePreferenceChange('system')}
                role="menuitem"
              >
                <span aria-hidden="true">💻</span>
                System
                {currentPreference === 'system' && <span className="checkmark">✓</span>}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ThemeToggle;
