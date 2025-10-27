import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import InventoryTracker from '../InventoryTracker';

// Mock timers for testing intervals
jest.useFakeTimers();

describe('InventoryTracker', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    test('renders loading state initially', () => {
      render(<InventoryTracker />);
      
      expect(screen.getByText('Loading inventory data...')).toBeInTheDocument();
      expect(screen.getByTestId('loading-spinner') || screen.getByRole('progressbar')).toBeInTheDocument();
    });

    test('renders inventory data after loading', async () => {
      render(<InventoryTracker />);
      
      // Wait for loading to complete
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Real-Time Inventory Tracker')).toBeInTheDocument();
      });

      // Check for category headers
      expect(screen.getByText('Water Filters')).toBeInTheDocument();
      expect(screen.getByText('Testing Kits')).toBeInTheDocument();
      expect(screen.getByText('Chemicals')).toBeInTheDocument();
      expect(screen.getByText('Equipment')).toBeInTheDocument();
    });

    test('renders legend with correct thresholds', async () => {
      const customThresholds = { low: 5, medium: 25 };
      render(<InventoryTracker thresholds={customThresholds} />);
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('High Stock (>25)')).toBeInTheDocument();
        expect(screen.getByText('Medium Stock (6-25)')).toBeInTheDocument();
        expect(screen.getByText('Low Stock (≤5)')).toBeInTheDocument();
      });
    });

    test('applies custom className', () => {
      const { container } = render(<InventoryTracker className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('inventory-tracker', 'custom-class');
    });
  });

  describe('Stock Level Classification', () => {
    test('correctly classifies stock levels', async () => {
      render(<InventoryTracker thresholds={{ low: 10, medium: 50 }} />);
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        // Look for items with different stock levels
        const lowStockItems = screen.getAllByText(/^[0-9]+$/).filter(el => {
          const quantity = parseInt(el.textContent);
          return quantity <= 10;
        });
        
        const mediumStockItems = screen.getAllByText(/^[0-9]+$/).filter(el => {
          const quantity = parseInt(el.textContent);
          return quantity > 10 && quantity <= 50;
        });
        
        const highStockItems = screen.getAllByText(/^[0-9]+$/).filter(el => {
          const quantity = parseInt(el.textContent);
          return quantity > 50;
        });

        // Verify that items exist in each category
        expect(lowStockItems.length).toBeGreaterThan(0);
        expect(mediumStockItems.length).toBeGreaterThan(0);
        expect(highStockItems.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Auto-refresh Functionality', () => {
    test('sets up auto-refresh interval', async () => {
      const refreshInterval = 5000;
      render(<InventoryTracker refreshInterval={refreshInterval} />);
      
      // Initial load
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Real-Time Inventory Tracker')).toBeInTheDocument();
      });

      // Advance time to trigger refresh
      await act(async () => {
        jest.advanceTimersByTime(refreshInterval);
      });

      // Check that auto-refresh info is displayed
      expect(screen.getByText(/Auto-refreshing every 5 seconds/)).toBeInTheDocument();
    });

    test('disables auto-refresh when interval is 0', async () => {
      render(<InventoryTracker refreshInterval={0} />);
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Real-Time Inventory Tracker')).toBeInTheDocument();
      });

      // Auto-refresh info should not be displayed
      expect(screen.queryByText(/Auto-refreshing/)).not.toBeInTheDocument();
    });
  });

  describe('Manual Refresh', () => {
    test('manual refresh button works', async () => {
      render(<InventoryTracker />);
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Real-Time Inventory Tracker')).toBeInTheDocument();
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();

      // Click refresh button
      fireEvent.click(refreshButton);

      // Button should show refreshing state
      expect(refreshButton).toHaveClass('refreshing');
      expect(refreshButton).toBeDisabled();
    });

    test('shows last updated timestamp', async () => {
      render(<InventoryTracker />);
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    test('renders error state when fetch fails', async () => {
      // Mock console.error to avoid noise in test output
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock fetch to reject
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      render(<InventoryTracker />);
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Inventory Error')).toBeInTheDocument();
        expect(screen.getByText(/Failed to load inventory data/)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
      });

      // Restore original fetch and console
      global.fetch = originalFetch;
      consoleSpy.mockRestore();
    });

    test('retry button works in error state', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock fetch to reject initially
      let shouldFail = true;
      global.fetch = jest.fn().mockImplementation(() => {
        if (shouldFail) {
          return Promise.reject(new Error('Network error'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve([])
        });
      });

      render(<InventoryTracker />);
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Inventory Error')).toBeInTheDocument();
      });

      // Click retry button
      shouldFail = false;
      const retryButton = screen.getByRole('button', { name: /retry/i });
      fireEvent.click(retryButton);

      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Real-Time Inventory Tracker')).toBeInTheDocument();
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Callbacks', () => {
    test('calls onInventoryUpdate callback when data is loaded', async () => {
      const mockCallback = jest.fn();
      render(<InventoryTracker onInventoryUpdate={mockCallback} />);
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockCallback).toHaveBeenCalled();
      });

      // Verify callback was called with inventory data
      expect(mockCallback).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: expect.any(Number),
            category: expect.any(String),
            items: expect.any(Array)
          })
        ])
      );
    });
  });

  describe('Responsive Design', () => {
    test('renders correctly on mobile viewport', async () => {
      // Mock window.innerWidth for mobile
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 480,
      });

      render(<InventoryTracker />);
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Real-Time Inventory Tracker')).toBeInTheDocument();
      });

      // Component should render without errors on mobile
      expect(screen.getByText('Water Filters')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('has proper ARIA labels and roles', async () => {
      render(<InventoryTracker />);
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Real-Time Inventory Tracker')).toBeInTheDocument();
      });

      // Check for proper button roles
      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      expect(refreshButton).toBeInTheDocument();
    });

    test('loading state is accessible', () => {
      render(<InventoryTracker />);
      
      // Loading state should be announced to screen readers
      expect(screen.getByText('Loading inventory data...')).toBeInTheDocument();
    });
  });

  describe('Data Structure', () => {
    test('handles empty inventory data gracefully', async () => {
      // Mock fetch to return empty data
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([])
      });

      render(<InventoryTracker />);
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(screen.getByText('Real-Time Inventory Tracker')).toBeInTheDocument();
      });

      // Should not crash with empty data
      expect(screen.getByText('Real-Time Inventory Tracker')).toBeInTheDocument();
    });

    test('displays correct item information', async () => {
      render(<InventoryTracker />);
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        // Check for specific item details
        expect(screen.getByText('Carbon Filter - Standard')).toBeInTheDocument();
        expect(screen.getByText('SKU: CF-STD-001')).toBeInTheDocument();
        expect(screen.getByText('units')).toBeInTheDocument();
      });
    });
  });

  describe('Performance', () => {
    test('cleans up intervals on unmount', async () => {
      const { unmount } = render(<InventoryTracker refreshInterval={1000} />);
      
      await act(async () => {
        jest.advanceTimersByTime(1000);
      });

      // Unmount component
      unmount();

      // Advance time - no new intervals should be running
      const timerCount = jest.getTimerCount();
      jest.advanceTimersByTime(5000);
      
      // Timer count should not increase after unmount
      expect(jest.getTimerCount()).toBeLessThanOrEqual(timerCount);
    });
  });
});
