import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import Dashboard from '../Dashboard';

// Mock the CustomerFeedbackWidget component
jest.mock('../../CustomerFeedbackWidget', () => {
  return function MockCustomerFeedbackWidget({ onFeedbackSubmitted, className }) {
    return (
      <div data-testid="customer-feedback-widget" className={className}>
        <button 
          onClick={() => onFeedbackSubmitted?.({ rating: 5, comment: 'Test feedback' })}
        >
          Mock Submit Feedback
        </button>
      </div>
    );
  };
});

// Mock the InventoryTracker component
jest.mock('../../InventoryTracker', () => {
  return function MockInventoryTracker({ onInventoryUpdate, className }) {
    return (
      <div data-testid="inventory-tracker" className={className}>
        <h2>Real-Time Inventory Tracker</h2>
        <button 
          onClick={() => onInventoryUpdate?.([{ id: 1, category: 'Test', items: [] }])}
        >
          Mock Update Inventory
        </button>
      </div>
    );
  };
});

// Mock fetch globally
global.fetch = jest.fn();

describe('Dashboard', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const mockFeedbackData = {
    totalFeedbacks: 150,
    averageRating: 4.2,
    ratingDistribution: {
      1: 5,
      2: 10,
      3: 25,
      4: 60,
      5: 50
    }
  };

  describe('Component Rendering', () => {
    test('renders dashboard with all sections', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('AguaFlow Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        expect(screen.getByText('Active Users')).toBeInTheDocument();
        expect(screen.getByText('System Health')).toBeInTheDocument();
        expect(screen.getByText('Customer Sentiment')).toBeInTheDocument();
        expect(screen.getByText('Water Usage Overview')).toBeInTheDocument();
        expect(screen.getByText('Customer Feedback')).toBeInTheDocument();
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });
    });

    test('displays mock dashboard data', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('1,247')).toBeInTheDocument(); // Total users
        expect(screen.getByText('89')).toBeInTheDocument(); // Active users
        expect(screen.getByText('Good')).toBeInTheDocument(); // System health
      });
    });

    test('displays customer sentiment data', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('4.2 ★')).toBeInTheDocument();
        expect(screen.getByText('Positive')).toBeInTheDocument();
        expect(screen.getByText('150 reviews')).toBeInTheDocument();
      });
    });

    test('shows loading state initially', () => {
      fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<Dashboard />);

      expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    });

    test('applies custom className', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      const { container } = render(<Dashboard className="custom-dashboard" />);

      await waitFor(() => {
        expect(container.firstChild).toHaveClass('dashboard', 'custom-dashboard');
      });
    });
  });

  describe('Error Handling', () => {
    test('shows error state when dashboard data fails to load', async () => {
      // Mock successful feedback fetch but failed dashboard data
      fetch.mockRejectedValue(new Error('Dashboard data failed'));

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard Error')).toBeInTheDocument();
        expect(screen.getByText('Failed to load dashboard data')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
      });
    });

    test('retry button reloads the page', async () => {
      const originalReload = window.location.reload;
      window.location.reload = jest.fn();

      fetch.mockRejectedValue(new Error('Dashboard data failed'));

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard Error')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      await userEvent.click(retryButton);

      expect(window.location.reload).toHaveBeenCalled();

      window.location.reload = originalReload;
    });

    test('handles feedback data fetch failure gracefully', async () => {
      fetch.mockRejectedValue(new Error('Feedback data failed'));

      render(<Dashboard />);

      await waitFor(() => {
        // Dashboard should still render without feedback data
        expect(screen.getByText('AguaFlow Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Total Users')).toBeInTheDocument();
        // But no customer sentiment section
        expect(screen.queryByText('Customer Sentiment')).not.toBeInTheDocument();
      });
    });
  });

  describe('Sentiment Calculation', () => {
    test('shows positive sentiment for high ratings', async () => {
      const highRatingData = { ...mockFeedbackData, averageRating: 4.5 };
      fetch.mockResolvedValue({
        ok: true,
        json: async () => highRatingData
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Positive')).toBeInTheDocument();
      });
    });

    test('shows negative sentiment for low ratings', async () => {
      const lowRatingData = { ...mockFeedbackData, averageRating: 1.8 };
      fetch.mockResolvedValue({
        ok: true,
        json: async () => lowRatingData
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Negative')).toBeInTheDocument();
      });
    });

    test('shows neutral sentiment for medium ratings', async () => {
      const mediumRatingData = { ...mockFeedbackData, averageRating: 3.2 };
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mediumRatingData
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('Neutral')).toBeInTheDocument();
      });
    });
  });

  describe('Feedback Widget Integration', () => {
    test('renders CustomerFeedbackWidget when enabled', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard showFeedbackWidget={true} />);

      await waitFor(() => {
        expect(screen.getByTestId('customer-feedback-widget')).toBeInTheDocument();
      });
    });

    test('hides CustomerFeedbackWidget when disabled', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard showFeedbackWidget={false} />);

      await waitFor(() => {
        expect(screen.queryByTestId('customer-feedback-widget')).not.toBeInTheDocument();
        expect(screen.queryByText('Customer Feedback')).not.toBeInTheDocument();
      });
    });

    test('handles feedback submission callback', async () => {
      const onFeedbackUpdate = jest.fn();
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard onFeedbackUpdate={onFeedbackUpdate} />);

      await waitFor(() => {
        expect(screen.getByTestId('customer-feedback-widget')).toBeInTheDocument();
      });

      // Simulate feedback submission
      const mockSubmitButton = screen.getByText('Mock Submit Feedback');
      await userEvent.click(mockSubmitButton);

      expect(onFeedbackUpdate).toHaveBeenCalledWith({
        rating: 5,
        comment: 'Test feedback'
      });
    });

    test('passes correct props to CustomerFeedbackWidget', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(
        <Dashboard 
          feedbackApiEndpoint="/custom/feedback"
          refreshInterval={60000}
        />
      );

      await waitFor(() => {
        const widget = screen.getByTestId('customer-feedback-widget');
        expect(widget).toHaveClass('dashboard-feedback-widget');
      });
    });
  });

  describe('Auto-refresh Functionality', () => {
    test('auto-refreshes dashboard data', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard refreshInterval={1000} />);

      // Initial fetch (dashboard + feedback)
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      // Advance timer
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      // Should fetch again
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(2);
      });
    });

    test('does not auto-refresh when interval is 0', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard refreshInterval={0} />);

      // Initial fetch
      await waitFor(() => {
        expect(fetch).toHaveBeenCalledTimes(1);
      });

      // Advance timer
      act(() => {
        jest.advanceTimersByTime(5000);
      });

      // Should not fetch again
      expect(fetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('API Integration', () => {
    test('uses custom feedback API endpoint', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard feedbackApiEndpoint="/custom/feedback" />);

      await waitFor(() => {
        expect(fetch).toHaveBeenCalledWith('/custom/feedback/aggregated');
      });
    });

    test('handles API response correctly', async () => {
      const customFeedbackData = {
        totalFeedbacks: 200,
        averageRating: 3.8,
        ratingDistribution: { 1: 10, 2: 20, 3: 30, 4: 70, 5: 70 }
      };

      fetch.mockResolvedValue({
        ok: true,
        json: async () => customFeedbackData
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('3.8 ★')).toBeInTheDocument();
        expect(screen.getByText('200 reviews')).toBeInTheDocument();
        expect(screen.getByText('Neutral')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    test('renders footer with copyright', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText('© 2025 AguaFlow. All rights reserved.')).toBeInTheDocument();
      });
    });

    test('displays last updated timestamp', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    test('has proper heading structure', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { level: 1, name: 'AguaFlow Dashboard' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Water Usage Overview' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Customer Feedback' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Recent Activity' })).toBeInTheDocument();
      });
    });

    test('has proper semantic structure', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByRole('banner')).toBeInTheDocument(); // header
        expect(screen.getByRole('main')).toBeInTheDocument(); // main content
        expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
      });
    });
  });

  describe('Inventory Tracker Integration', () => {
    test('renders inventory tracker by default', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByTestId('inventory-tracker')).toBeInTheDocument();
        expect(screen.getByText('Real-Time Inventory Tracker')).toBeInTheDocument();
      });
    });

    test('hides inventory tracker when showInventoryTracker is false', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard showInventoryTracker={false} />);

      await waitFor(() => {
        expect(screen.getByText('AguaFlow Dashboard')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('inventory-tracker')).not.toBeInTheDocument();
    });

    test('passes correct props to inventory tracker', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      const mockInventoryUpdate = jest.fn();
      render(
        <Dashboard 
          inventoryApiEndpoint="/custom/inventory/endpoint"
          inventoryRefreshInterval={5000}
          onInventoryUpdate={mockInventoryUpdate}
        />
      );

      await waitFor(() => {
        expect(screen.getByTestId('inventory-tracker')).toBeInTheDocument();
      });

      // Test callback functionality
      const updateButton = screen.getByText('Mock Update Inventory');
      await userEvent.click(updateButton);

      expect(mockInventoryUpdate).toHaveBeenCalledWith([
        { id: 1, category: 'Test', items: [] }
      ]);
    });

    test('applies correct CSS classes to inventory tracker', async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      render(<Dashboard />);

      await waitFor(() => {
        const inventoryTracker = screen.getByTestId('inventory-tracker');
        expect(inventoryTracker).toHaveClass('dashboard-inventory-tracker');
      });
    });
  });

  describe('Performance', () => {
    test('cleans up intervals on unmount', async () => {
      const clearIntervalSpy = jest.spyOn(global, 'clearInterval');
      
      fetch.mockResolvedValue({
        ok: true,
        json: async () => mockFeedbackData
      });

      const { unmount } = render(<Dashboard refreshInterval={1000} />);

      await waitFor(() => {
        expect(screen.getByText('AguaFlow Dashboard')).toBeInTheDocument();
      });

      unmount();

      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });
  });
});
