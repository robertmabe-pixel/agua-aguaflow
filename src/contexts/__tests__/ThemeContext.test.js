import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Test component that uses the theme context
const TestComponent = () => {
  const { theme, isDark, isLight, toggleTheme, setThemePreference, getThemePreference } = useTheme();
  
  return (
    <div>
      <div data-testid="current-theme">{theme}</div>
      <div data-testid="is-dark">{isDark.toString()}</div>
      <div data-testid="is-light">{isLight.toString()}</div>
      <div data-testid="preference">{getThemePreference()}</div>
      <button onClick={toggleTheme} data-testid="toggle-theme">
        Toggle Theme
      </button>
      <button onClick={() => setThemePreference('light')} data-testid="set-light">
        Set Light
      </button>
      <button onClick={() => setThemePreference('dark')} data-testid="set-dark">
        Set Dark
      </button>
      <button onClick={() => setThemePreference('system')} data-testid="set-system">
        Set System
      </button>
    </div>
  );
};

const renderWithTheme = (component) => {
  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    localStorage.getItem.mockClear();
    localStorage.setItem.mockClear();
    localStorage.removeItem.mockClear();
    
    // Reset matchMedia mock
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  it('provides default light theme when no preference is set', () => {
    localStorage.getItem.mockReturnValue(null);
    
    renderWithTheme(<TestComponent />);
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('false');
    expect(screen.getByTestId('is-light')).toHaveTextContent('true');
    expect(screen.getByTestId('preference')).toHaveTextContent('system');
  });

  it('uses saved theme preference from localStorage', () => {
    localStorage.getItem.mockReturnValue('dark');
    
    renderWithTheme(<TestComponent />);
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    expect(screen.getByTestId('is-light')).toHaveTextContent('false');
    expect(screen.getByTestId('preference')).toHaveTextContent('dark');
  });

  it('detects system dark mode preference', () => {
    localStorage.getItem.mockReturnValue(null);
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
    
    renderWithTheme(<TestComponent />);
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('is-dark')).toHaveTextContent('true');
    expect(screen.getByTestId('preference')).toHaveTextContent('system');
  });

  it('toggles theme correctly', () => {
    localStorage.getItem.mockReturnValue(null);
    
    renderWithTheme(<TestComponent />);
    
    // Should start with light theme
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    
    // Toggle to dark
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-theme'));
    });
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('aguaflow-theme', 'dark');
    
    // Toggle back to light
    act(() => {
      fireEvent.click(screen.getByTestId('toggle-theme'));
    });
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(localStorage.setItem).toHaveBeenCalledWith('aguaflow-theme', 'light');
  });

  it('sets theme preference to light', () => {
    renderWithTheme(<TestComponent />);
    
    act(() => {
      fireEvent.click(screen.getByTestId('set-light'));
    });
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('preference')).toHaveTextContent('light');
    expect(localStorage.setItem).toHaveBeenCalledWith('aguaflow-theme', 'light');
  });

  it('sets theme preference to dark', () => {
    renderWithTheme(<TestComponent />);
    
    act(() => {
      fireEvent.click(screen.getByTestId('set-dark'));
    });
    
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    expect(screen.getByTestId('preference')).toHaveTextContent('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('aguaflow-theme', 'dark');
  });

  it('sets theme preference to system', () => {
    localStorage.getItem.mockReturnValue('dark');
    
    renderWithTheme(<TestComponent />);
    
    // Should start with saved dark theme
    expect(screen.getByTestId('current-theme')).toHaveTextContent('dark');
    
    act(() => {
      fireEvent.click(screen.getByTestId('set-system'));
    });
    
    expect(screen.getByTestId('preference')).toHaveTextContent('system');
    expect(localStorage.removeItem).toHaveBeenCalledWith('aguaflow-theme');
    // Should fall back to system preference (light in our mock)
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });

  it('applies data-theme attribute to document element', () => {
    const mockSetAttribute = jest.fn();
    const mockRemoveAttribute = jest.fn();
    
    Object.defineProperty(document, 'documentElement', {
      value: {
        setAttribute: mockSetAttribute,
        removeAttribute: mockRemoveAttribute,
      },
      writable: true,
    });
    
    localStorage.getItem.mockReturnValue('dark');
    
    renderWithTheme(<TestComponent />);
    
    expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
    
    // Toggle to light
    act(() => {
      fireEvent.click(screen.getByTestId('set-light'));
    });
    
    expect(mockRemoveAttribute).toHaveBeenCalledWith('data-theme');
  });

  it('listens for system theme changes', () => {
    localStorage.getItem.mockReturnValue(null);
    
    const mockAddEventListener = jest.fn();
    const mockRemoveEventListener = jest.fn();
    
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener,
      dispatchEvent: jest.fn(),
    }));
    
    const { unmount } = renderWithTheme(<TestComponent />);
    
    expect(mockAddEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    
    unmount();
    
    expect(mockRemoveEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('throws error when useTheme is used outside ThemeProvider', () => {
    // Suppress console.error for this test
    const originalError = console.error;
    console.error = jest.fn();
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    console.error = originalError;
  });

  it('handles invalid localStorage values gracefully', () => {
    localStorage.getItem.mockReturnValue('invalid-theme');
    
    renderWithTheme(<TestComponent />);
    
    // Should fall back to system preference (light in our mock)
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
    expect(screen.getByTestId('preference')).toHaveTextContent('system');
  });

  it('handles missing matchMedia gracefully', () => {
    localStorage.getItem.mockReturnValue(null);
    delete window.matchMedia;
    
    renderWithTheme(<TestComponent />);
    
    // Should default to light theme
    expect(screen.getByTestId('current-theme')).toHaveTextContent('light');
  });
});
