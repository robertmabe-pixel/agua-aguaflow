import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Dashboard from '../../Dashboard/Dashboard';

// Mock recharts components to avoid rendering issues in tests
jest.mock('recharts', () => ({
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  Cell: () => <div data-testid="cell" />
}));

// Mock fetch globally
global.fetch = jest.fn();

// Mock sales data
const mockSalesData = {
  totalSales: [
    { date: '2025-10-21', sales: 25000, orders: 120 },
    { date: '2025-10-22', sales: 30000, orders: 150 }
  ],
  conversionRate: [
    { date: '2025-10-21', rate: 3.2, visitors: 2500, conversions: 80 },
    { date: '2025-10-22', rate: 3.8, visitors: 3000, conversions: 114 }
  ],
  topProducts: [
    { name: 'AquaFlow Pro', sales: 15420, revenue: 308400, growth: 12.5 },
    { name: 'Water Monitor Basic', sales: 12350, revenue: 185250, growth: 8.3 }
  ],
  summary: {
    totalRevenue: 1143950,
    totalOrders: 52410,
    averageOrderValue: 218.35,
    conversionRate: 3.2
  }
};

describe('SalesAnalytics Integration with Dashboard', () => {
  beforeEach(() => {
    fetch.mockClear();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('renders SalesAnalytics component within Dashboard', async () => {
    // Mock all API endpoints
    fetch.mockImplementation((url) => {
      if (url.includes('/api/sales/performance')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSalesData
        });
      }
      if (url.includes('/api/feedback')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ aggregatedData: {} })
        });
      }
      if (url.includes('/api/inventory')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({ items: [] })
        });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    });

    render(
      <Dashboard
        salesApiEndpoint="/api/sales/performance"
        showSalesAnalytics={true}
        salesRefreshInterval={60000}
      />
    );

    // Wait for the dashboard to load
    await waitFor(() => {
      expect(screen.getByText('AguaFlow Dashboard')).toBeInTheDocument();
    });

    // Check that SalesAnalytics component is rendered
    await waitFor(() => {
      expect(screen.getByText('Sales Performance Analytics')).toBeInTheDocument();
    });

    // Check that sales data is displayed
    await waitFor(() => {
      expect(screen.getByText('$1,143,950')).toBeInTheDocument();
      expect(screen.getByText('52,410')).toBeInTheDocument();
    });
  });

  test('hides SalesAnalytics when showSalesAnalytics is false', async () => {
    fetch.mockImplementation(() => Promise.resolve({
      ok: true,
      json: async () => ({})
    }));

    render(
      <Dashboard
        showSalesAnalytics={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('AguaFlow Dashboard')).toBeInTheDocument();
    });

    // SalesAnalytics should not be rendered
    expect(screen.queryByText('Sales Performance Analytics')).not.toBeInTheDocument();
  });

  test('passes correct props to SalesAnalytics component', async () => {
    const mockSalesUpdate = jest.fn();

    fetch.mockImplementation((url) => {
      if (url.includes('/api/custom/sales')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSalesData
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });

    render(
      <Dashboard
        salesApiEndpoint="/api/custom/sales"
        salesRefreshInterval={30000}
        onSalesUpdate={mockSalesUpdate}
        showSalesAnalytics={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sales Performance Analytics')).toBeInTheDocument();
    });

    // Verify the correct API endpoint was called
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/custom/sales?range=7d');
    });

    // Verify callback was called
    await waitFor(() => {
      expect(mockSalesUpdate).toHaveBeenCalledWith(expect.objectContaining({
        totalSales: expect.any(Array),
        summary: expect.any(Object)
      }));
    });
  });

  test('handles SalesAnalytics API errors gracefully', async () => {
    // Mock sales API to fail, but other APIs to succeed
    fetch.mockImplementation((url) => {
      if (url.includes('/api/sales/performance')) {
        return Promise.reject(new Error('Sales API error'));
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });

    // Set NODE_ENV to development to see mock data fallback
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <Dashboard
        salesApiEndpoint="/api/sales/performance"
        showSalesAnalytics={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('AguaFlow Dashboard')).toBeInTheDocument();
    });

    // Should still render SalesAnalytics with mock data in development
    await waitFor(() => {
      expect(screen.getByText('Sales Performance Analytics')).toBeInTheDocument();
      expect(screen.getByText(/Development Mode: Using mock data/)).toBeInTheDocument();
    });

    process.env.NODE_ENV = originalEnv;
  });

  test('auto-refresh functionality works in Dashboard context', async () => {
    let callCount = 0;
    fetch.mockImplementation((url) => {
      if (url.includes('/api/sales/performance')) {
        callCount++;
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ...mockSalesData,
            summary: {
              ...mockSalesData.summary,
              totalRevenue: 1000000 + (callCount * 100000) // Different value each call
            }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });

    render(
      <Dashboard
        salesApiEndpoint="/api/sales/performance"
        salesRefreshInterval={5000}
        showSalesAnalytics={true}
      />
    );

    // Wait for initial load
    await waitFor(() => {
      expect(screen.getByText('Sales Performance Analytics')).toBeInTheDocument();
    });

    // Check initial value
    await waitFor(() => {
      expect(screen.getByText('$1,100,000')).toBeInTheDocument();
    });

    // Fast-forward time to trigger refresh
    jest.advanceTimersByTime(5000);

    // Check updated value
    await waitFor(() => {
      expect(screen.getByText('$1,200,000')).toBeInTheDocument();
    });

    expect(callCount).toBe(2);
  });

  test('SalesAnalytics integrates with Dashboard layout correctly', async () => {
    fetch.mockImplementation((url) => {
      if (url.includes('/api/sales/performance')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockSalesData
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => ({})
      });
    });

    const { container } = render(
      <Dashboard
        showSalesAnalytics={true}
        showInventoryTracker={true}
        showFeedbackWidget={true}
      />
    );

    await waitFor(() => {
      expect(screen.getByText('Sales Performance Analytics')).toBeInTheDocument();
    });

    // Check that the sales analytics section has the correct CSS class
    const salesSection = container.querySelector('.sales-analytics-section');
    expect(salesSection).toBeInTheDocument();

    // Check that the SalesAnalytics component has the dashboard-specific class
    const salesAnalytics = container.querySelector('.dashboard-sales-analytics');
    expect(salesAnalytics).toBeInTheDocument();
  });
});
