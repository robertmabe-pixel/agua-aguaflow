import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import WaterUsageWidget from '../WaterUsageWidget';

// Mock recharts to avoid canvas issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
}));

const renderWithTheme = (component, theme = 'light') => {
  // Mock localStorage for theme
  const mockLocalStorage = {
    getItem: jest.fn(() => theme === 'system' ? null : theme),
    setItem: jest.fn(),
    removeItem: jest.fn(),
  };
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  return render(
    <ThemeProvider>
      {component}
    </ThemeProvider>
  );
};

describe('WaterUsageWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset localStorage mock
    localStorage.getItem.mockReturnValue(null);
  });

  it('renders with default props', async () => {
    renderWithTheme(<WaterUsageWidget />);
    
    expect(screen.getByText('Water Usage Monitor')).toBeInTheDocument();
    expect(screen.getByLabelText('Refresh data')).toBeInTheDocument();
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  it('renders with custom title', () => {
    renderWithTheme(<WaterUsageWidget title="Custom Water Monitor" />);
    
    expect(screen.getByText('Custom Water Monitor')).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    renderWithTheme(<WaterUsageWidget />);
    
    expect(screen.getByText('Loading water usage data...')).toBeInTheDocument();
  });

  it('displays statistics when enabled', async () => {
    renderWithTheme(<WaterUsageWidget showStatistics={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Total')).toBeInTheDocument();
      expect(screen.getByText('Average')).toBeInTheDocument();
      expect(screen.getByText('Peak')).toBeInTheDocument();
      expect(screen.getByText('Minimum')).toBeInTheDocument();
    });
  });

  it('hides statistics when disabled', async () => {
    renderWithTheme(<WaterUsageWidget showStatistics={false} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Total')).not.toBeInTheDocument();
    });
  });

  it('shows daily average section when enabled', async () => {
    renderWithTheme(<WaterUsageWidget showDailyAverage={true} />);
    
    await waitFor(() => {
      expect(screen.getByText('Daily Usage Pattern')).toBeInTheDocument();
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });
  });

  it('hides daily average section when disabled', async () => {
    renderWithTheme(<WaterUsageWidget showDailyAverage={false} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Daily Usage Pattern')).not.toBeInTheDocument();
    });
  });

  it('handles refresh button click', async () => {
    renderWithTheme(<WaterUsageWidget />);
    
    const refreshButton = screen.getByLabelText('Refresh data');
    fireEvent.click(refreshButton);
    
    // Should show loading state briefly
    expect(refreshButton).toBeDisabled();
  });

  it('calls onError when provided and error occurs', async () => {
    const mockOnError = jest.fn();
    
    // Mock fetch to throw an error
    global.fetch = jest.fn(() => Promise.reject(new Error('API Error')));
    
    renderWithTheme(
      <WaterUsageWidget 
        apiEndpoint="https://api.example.com/data" 
        onError={mockOnError} 
      />
    );
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  it('displays error state correctly', async () => {
    // Mock fetch to throw an error
    global.fetch = jest.fn(() => Promise.reject(new Error('Network Error')));
    
    renderWithTheme(<WaterUsageWidget apiEndpoint="https://api.example.com/data" />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load water usage data')).toBeInTheDocument();
      expect(screen.getByText('Network Error')).toBeInTheDocument();
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
  });

  it('retries data fetch when retry button is clicked', async () => {
    // Mock fetch to fail first, then succeed
    global.fetch = jest.fn()
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      });
    
    renderWithTheme(<WaterUsageWidget apiEndpoint="https://api.example.com/data" />);
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText('Try Again')).toBeInTheDocument();
    });
    
    // Click retry
    fireEvent.click(screen.getByText('Try Again'));
    
    // Should attempt to fetch again
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  it('applies correct CSS classes', () => {
    renderWithTheme(<WaterUsageWidget className="custom-class" />);
    
    const widget = screen.getByText('Water Usage Monitor').closest('.water-usage-widget');
    expect(widget).toHaveClass('custom-class');
  });

  it('updates last updated time', async () => {
    renderWithTheme(<WaterUsageWidget />);
    
    await waitFor(() => {
      expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    });
  });

  it('works with different themes', async () => {
    const { rerender } = renderWithTheme(<WaterUsageWidget />, 'light');
    
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
    
    // Test with dark theme
    rerender(
      <ThemeProvider>
        <WaterUsageWidget />
      </ThemeProvider>
    );
    
    await waitFor(() => {
      expect(screen.getByTestId('line-chart')).toBeInTheDocument();
    });
  });

  it('handles API endpoint prop correctly', async () => {
    const mockData = [
      { time: '10:00', usage: 12.5, timestamp: Date.now() }
    ];
    
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve(mockData)
    }));
    
    renderWithTheme(<WaterUsageWidget apiEndpoint="https://api.example.com/data" />);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('https://api.example.com/data');
    });
  });

  it('disables auto-refresh when refreshInterval is null', () => {
    jest.useFakeTimers();
    
    renderWithTheme(<WaterUsageWidget refreshInterval={null} />);
    
    // Fast-forward time
    jest.advanceTimersByTime(60000);
    
    // Should not have made additional fetch calls
    expect(global.fetch).not.toHaveBeenCalled();
    
    jest.useRealTimers();
  });

  it('auto-refreshes at specified interval', async () => {
    jest.useFakeTimers();
    
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve([])
    }));
    
    renderWithTheme(<WaterUsageWidget refreshInterval={5000} />);
    
    // Wait for initial load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });
    
    // Fast-forward time
    jest.advanceTimersByTime(5000);
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
    
    jest.useRealTimers();
  });
});
